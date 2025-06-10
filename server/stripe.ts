import Stripe from 'stripe';
import { storage } from './storage';
import { authService } from './auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key_here', {
  apiVersion: '2024-06-20',
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  quotesLimit: number;
  features: string[];
  stripePriceId: string;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    quotesLimit: 5,
    features: ['5 quotes/month', 'Basic calculator', 'Email support'],
    stripePriceId: 'free'
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 500, // €5.00 in cents
    quotesLimit: 20,
    features: ['20 quotes/month', 'Custom branding', 'Email integration', 'Priority support'],
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 3500, // €35.00 in cents
    quotesLimit: 100,
    features: ['100 quotes/month', 'Advanced analytics', 'CRM integration', 'Custom domains', 'API access'],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9500, // €95.00 in cents
    quotesLimit: 999999,
    features: ['Unlimited quotes', 'White-label solution', 'Dedicated support', 'Custom features', 'SLA guarantee'],
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise'
  }
};

export class StripeService {
  // Create checkout session for subscription
  async createCheckoutSession(
    userId: string, 
    planId: string, 
    calculatorSlug: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan || planId === 'free') {
      throw new Error('Invalid subscription plan');
    }

    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName || undefined,
        metadata: {
          userId: user.id,
          calculatorSlug
        }
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await storage.updateUserSubscription(userId, {
        stripeCustomerId: customerId
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&calculator=${calculatorSlug}`,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
        calculatorSlug
      },
      subscription_data: {
        metadata: {
          userId,
          planId,
          calculatorSlug
        }
      }
    });

    return session;
  }

  // Handle successful subscription
  async handleSuccessfulSubscription(
    userId: string, 
    planId: string, 
    calculatorSlug: string,
    stripeSubscriptionId: string
  ): Promise<{ user: any; userCalculator: any }> {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    const calculator = await storage.getCalculatorBySlug(calculatorSlug);
    if (!calculator) {
      throw new Error('Calculator not found');
    }

    // Update user subscription
    const user = await storage.updateUserSubscription(userId, {
      subscriptionStatus: planId,
      quotesLimit: plan.quotesLimit,
      subscriptionStartDate: new Date(),
      quotesUsedThisMonth: 0,
      lastQuoteReset: new Date()
    });

    // Create subscription record
    await storage.createSubscription({
      userId,
      stripeSubscriptionId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    // Create user calculator instance
    const embedId = this.generateEmbedId();
    const embedUrl = `${process.env.REPLIT_DEV_DOMAIN || 'https://quotekit.ai'}/embed/${embedId}`;
    const adminUrl = `${process.env.REPLIT_DEV_DOMAIN || 'https://quotekit.ai'}/admin/${embedId}`;

    const userCalculator = await storage.createUserCalculator({
      userId,
      calculatorId: calculator.id,
      embedId,
      embedUrl,
      adminUrl,
      config: calculator.defaultConfig,
      customBranding: {
        logo: null,
        primaryColor: '#10B981',
        secondaryColor: '#059669',
        fontFamily: 'Inter',
        companyName: user.fullName || 'Your Company'
      }
    });

    return { user, userCalculator };
  }

  // Generate unique embed ID
  private generateEmbedId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Handle Stripe webhooks
  async handleWebhook(body: any, signature: string): Promise<void> {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const { userId, planId, calculatorSlug } = session.metadata || {};
    if (!userId || !planId || !calculatorSlug) {
      console.error('Missing metadata in checkout session');
      return;
    }

    if (session.subscription) {
      await this.handleSuccessfulSubscription(
        userId, 
        planId, 
        calculatorSlug,
        session.subscription as string
      );
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const dbSubscription = await storage.getSubscriptionByUserId(userId);
    if (dbSubscription) {
      await storage.updateSubscription(dbSubscription.id, {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });
    }
  }

  private async handleSubscriptionCanceled(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    // Downgrade to free plan
    await storage.updateUserSubscription(userId, {
      subscriptionStatus: 'free',
      quotesLimit: 5
    });

    const dbSubscription = await storage.getSubscriptionByUserId(userId);
    if (dbSubscription) {
      await storage.updateSubscription(dbSubscription.id, {
        status: 'canceled'
      });
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.deleted) return;
    
    const userId = (customer as Stripe.Customer).metadata?.userId;
    if (!userId) return;

    // Mark subscription as past due
    const dbSubscription = await storage.getSubscriptionByUserId(userId);
    if (dbSubscription) {
      await storage.updateSubscription(dbSubscription.id, {
        status: 'past_due'
      });
    }
  }

  // Get customer portal URL
  async createCustomerPortalSession(userId: string, returnUrl: string): Promise<string> {
    const user = await storage.getUser(userId);
    if (!user?.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  }
}

export const stripeService = new StripeService();