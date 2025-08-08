import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authService } from "./auth";
import { stripeService } from "./stripe";
import { emailService } from "./email";
import { sendEmail, generateQuoteEmailHTML } from "./sendgrid";
import { TwoFactorAuth } from "./two-factor";
import { processCarWashRequest, processChauffeurRequest, processAirportTransferRequest, processVanRentalRequest, processBoatCharterRequest, processMovingServicesRequest, processMotorcycleRepairRequest, processDrivingInstructorRequest, processWebDesignerRequest, processMarketingConsultantRequest, processSEOAgencyRequest, processVideoEditorRequest, processCopywriterRequest, processLegalAdvisorRequest, processTaxPreparerRequest, processTranslationServicesRequest, processCleaningServicesRequest, processPrivateSchoolRequest } from "./ai";
import { processDentistRequest } from "./dental-ai";
import { processChildcareRequest } from "./childcare-ai";
import { processPlasticSurgeryRequest } from "./plastic-surgery-ai";
import { processChildcareServicesRequest } from "./childcare-services-ai";
import { processPrivateMedicalRequest } from "./private-medical-ai";
import { openaiService } from "./openai-service";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertLeadSchema,
  insertUserCalculatorSchema,
  registerUserSchema,
  loginUserSchema,
  insertBlogPostSchema,
  updateBlogPostSchema
} from "@shared/schema";
import { 
  generateAIPrompt, 
  getRandomTopicCluster, 
  getRandomPromptTemplate,
  generateSEOOptimizedSlug,
  extractKeywordsFromContent,
  generateMetaDescription,
  TOPIC_CLUSTERS,
  BLOG_PROMPT_TEMPLATES
} from "./seo-blueprint";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { ObjectPermission } from "./objectAcl";

// SEO Score calculation function
function calculateSEOScore(blogPost: any): number {
  let score = 0;
  const maxScore = 100;
  
  // Title optimization (20 points)
  if (blogPost.title && blogPost.title.length <= 60 && blogPost.title.length >= 30) {
    score += 10;
  }
  if (blogPost.keywords && blogPost.keywords.some((k: string) => blogPost.title?.toLowerCase().includes(k.toLowerCase()))) {
    score += 10;
  }
  
  // Content length (20 points)
  const wordCount = blogPost.content ? blogPost.content.split(/\s+/).length : 0;
  if (wordCount >= 1500 && wordCount <= 2500) {
    score += 20;
  } else if (wordCount >= 1000) {
    score += 10;
  }
  
  // Meta description (15 points)
  if (blogPost.metaDescription && blogPost.metaDescription.length >= 120 && blogPost.metaDescription.length <= 156) {
    score += 15;
  }
  
  // Keywords presence (25 points)
  if (blogPost.keywords && blogPost.keywords.length >= 3) {
    score += 15;
  }
  if (blogPost.content && blogPost.keywords) {
    const keywordDensity = blogPost.keywords.reduce((acc: number, keyword: string) => {
      const matches = (blogPost.content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      return acc + matches;
    }, 0);
    if (keywordDensity >= 3 && keywordDensity <= 8) {
      score += 10;
    }
  }
  
  // URL slug (10 points)
  if (blogPost.slug && blogPost.slug.length <= 60 && blogPost.slug.includes('-')) {
    score += 10;
  }
  
  // Excerpt/Description (10 points)
  if (blogPost.excerpt && blogPost.excerpt.length >= 120 && blogPost.excerpt.length <= 200) {
    score += 10;
  }
  
  return Math.min(score, maxScore);
}
import { sql } from "@shared/supabase";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// Helper function to create or get Stripe price IDs
async function createOrGetPriceId(tier: string): Promise<string> {
  const tierConfig = {
    pro: { name: 'QuoteKit Pro', price: 500, description: '5 calculators, 25 quotes/month' },
    business: { name: 'QuoteKit Business', price: 3500, description: '10 calculators, 50 quotes/month' },
    enterprise: { name: 'QuoteKit Enterprise', price: 9900, description: 'Unlimited calculators, unlimited quotes' }
  };

  const config = tierConfig[tier as keyof typeof tierConfig];
  if (!config) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  try {
    // Check if product already exists
    const products = await stripe.products.list({
      limit: 10,
    });

    let product = products.data.find(p => p.name === config.name);

    if (!product) {
      // Create product
      product = await stripe.products.create({
        name: config.name,
        description: config.description,
        type: 'service',
      });
    }

    // Check if price already exists for this product
    const prices = await stripe.prices.list({
      product: product.id,
      limit: 10,
    });

    let price = prices.data.find(p => 
      p.unit_amount === config.price && 
      p.currency === 'eur' && 
      p.recurring?.interval === 'month'
    );

    if (!price) {
      // Create price
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: config.price,
        currency: 'eur',
        recurring: {
          interval: 'month',
        },
      });
    }

    return price.id;
  } catch (error) {
    console.error('Error creating/getting Stripe price:', error);
    throw error;
  }
}

// Auth middleware
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const user = await authService.verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // SEO Routes - must come first before other routes
  // Sitemap.xml endpoint
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = 'https://quotekit.ai';
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/features</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/register</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <!-- Calculator Pages -->
  <url>
    <loc>${baseUrl}/wedding-photography-calculator</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/portrait-photography-calculator</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/home-renovation-calculator-new</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/dentist-calculator</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/legal-advisor-calculator</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // Robots.txt endpoint
  app.get('/robots.txt', (req, res) => {
    const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://quotekit.ai/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1

# Disallow admin areas
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /_next/
Disallow: /admin/

# Allow important pages
Allow: /
Allow: /features
Allow: /pricing
Allow: /login
Allow: /register
Allow: /*-calculator`;

    res.setHeader('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  // Import Supabase routes
  const { default: supabaseRoutes } = await import('./supabase-routes');
  app.use('/api/supabase', supabaseRoutes);
  
  // Test endpoint for connectivity verification
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working', timestamp: new Date().toISOString() });
  });
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      const result = await authService.register(userData);
      
      res.status(201).json({
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          subscriptionStatus: result.user.subscriptionStatus
        },
        token: result.token
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginUserSchema.parse(req.body);
      const result = await authService.login(credentials);
      
      res.json({
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          subscriptionStatus: result.user.subscriptionStatus,
          quotesUsedThisMonth: result.user.quotesUsedThisMonth,
          quotesLimit: result.user.quotesLimit
        },
        token: result.token
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      const sessionToken = req.headers.authorization?.substring(7);
      if (sessionToken) {
        await authService.logout(sessionToken);
      }
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = (req as any).user;
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      subscriptionStatus: user.subscriptionStatus,
      quotesUsedThisMonth: user.quotesUsedThisMonth,
      quotesLimit: user.quotesLimit
    });
  });

  // Subscription routes
  app.get("/api/subscription/plans", async (req, res) => {
    const plans = authService.getSubscriptionPlans();
    res.json(plans);
  });

  // Create Stripe checkout session for pricing plans
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { planName, priceId } = req.body;
      
      if (!planName || !priceId) {
        return res.status(400).json({ error: "Plan name and price ID are required" });
      }

      const successUrl = `${req.protocol}://${req.get('host')}/dashboard?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${req.protocol}://${req.get('host')}/pricing`;
      
      const session = await stripeService.createCheckoutSession({
        priceId,
        successUrl,
        cancelUrl,
        metadata: {
          planName
        }
      });
      
      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Checkout session error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/subscription/checkout", requireAuth, async (req, res) => {
    try {
      const { planId, calculatorSlug } = req.body;
      const user = (req as any).user;
      
      const successUrl = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/dashboard/success`;
      const cancelUrl = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/pricing`;
      
      const session = await stripeService.createCheckoutSession({
        priceId: planId,
        successUrl,
        cancelUrl,
        metadata: { userId: user.id, calculatorSlug }
      });
      
      res.json({ checkoutUrl: session.url });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/subscription/success", requireAuth, async (req, res) => {
    try {
      const { sessionId, calculator } = req.body;
      const user = (req as any).user;
      
      // Here you would verify the session with Stripe and complete setup
      // For now, we'll simulate successful subscription
      const session = await stripeService.handleSuccessfulSubscription(sessionId);
      
      // Create result structure for compatibility
      const result = {
        user: user,
        userCalculator: { embedId: 'calc_' + Math.random().toString(36).substring(7) }
      };
      
      // Send welcome email
      const calc = await storage.getCalculatorBySlug(calculator);
      if (calc) {
        // Note: emailService.sendWelcomeEmail would need to be implemented
        // await emailService.sendWelcomeEmail(result.user, result.userCalculator, calc.name);
      }
      
      res.json({
        success: true,
        userCalculator: result.userCalculator
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/subscription/portal", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const returnUrl = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/dashboard`;
      
      const portalSession = await stripeService.createCustomerPortalSession({
        customerId: user.stripeCustomerId || '',
        returnUrl
      });
      const portalUrl = portalSession.url;
      res.json({ portalUrl });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Stripe webhooks
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const event = stripeService.constructEvent(req.body, signature);
      await stripeService.handleWebhook(event);
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  // User calculator management
  app.get("/api/user-calculators", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const userCalculators = await storage.getUserCalculators(user.id);
      res.json(userCalculators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user calculators" });
    }
  });

  app.get("/api/user-calculators/:embedId", async (req, res) => {
    try {
      const { embedId } = req.params;
      const userCalculator = await storage.getUserCalculatorByEmbedId(embedId);
      if (!userCalculator) {
        return res.status(404).json({ error: "Calculator not found" });
      }
      res.json(userCalculator);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calculator" });
    }
  });

  app.put("/api/user-calculators/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const updateData = req.body;
      
      // Verify ownership
      const userCalculators = await storage.getUserCalculators(user.id);
      const calculator = userCalculators.find(uc => uc.id === id);
      if (!calculator) {
        return res.status(404).json({ error: "Calculator not found" });
      }
      
      const updated = await storage.updateUserCalculator(id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update calculator" });
    }
  });

  // Stripe subscription creation
  app.post("/api/create-subscription", async (req, res) => {
    try {
      const { userId, priceId } = req.body;
      
      if (!userId || !priceId) {
        return res.status(400).json({ error: "User ID and price ID are required" });
      }

      // Get user from storage
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Create Stripe customer if not exists
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer({
          email: user.email,
          metadata: { userId: user.id }
        });
        customerId = customer.id;
        await storage.updateUser(userId, { stripeCustomerId: customerId });
      }

      // Create subscription
      const subscription = await stripeService.createSubscription({
        customerId,
        priceId,
        paymentBehavior: 'default_incomplete'
      });

      // Update user subscription status
      await storage.updateUser(userId, {
        subscriptionStatus: 'pending'
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
      });
    } catch (error) {
      console.error("Subscription creation error:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  // Stripe webhook handler
  app.post("/api/stripe/webhook", async (req, res) => {
    try {
      const event = stripeService.constructEvent(req.body, req.headers['stripe-signature'] as string);
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          // Update user subscription status
          if (paymentIntent.metadata?.userId) {
            await storage.updateUser(paymentIntent.metadata.userId, {
              subscriptionStatus: 'active'
            });
          }
          break;
          
        case 'customer.subscription.updated':
          const subscription = event.data.object;
          if (subscription.metadata?.userId) {
            await storage.updateUser(subscription.metadata.userId, {
              subscriptionStatus: subscription.status
            });
          }
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: "Webhook signature verification failed" });
    }
  });

  // Get all calculators
  app.get("/api/calculators", async (req, res) => {
    try {
      const calculators = await storage.getCalculators();
      res.json(calculators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calculators" });
    }
  });

  // Get calculators by category
  app.get("/api/calculators/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const calculators = await storage.getCalculatorsByCategory(category);
      res.json(calculators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calculators by category" });
    }
  });

  // Get calculator by slug
  app.get("/api/calculators/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const calculator = await storage.getCalculatorBySlug(slug);
      if (!calculator) {
        return res.status(404).json({ error: "Calculator not found" });
      }
      res.json(calculator);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calculator" });
    }
  });

  // Create user (signup)
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Get user calculators
  app.get("/api/users/:userId/calculators", async (req, res) => {
    try {
      const { userId } = req.params;
      const userCalculators = await storage.getUserCalculators(userId);
      res.json(userCalculators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user calculators" });
    }
  });

  // Create user calculator (after purchase)
  app.post("/api/user-calculators", async (req, res) => {
    try {
      const userCalculatorData = insertUserCalculatorSchema.parse(req.body);
      const userCalculator = await storage.createUserCalculator(userCalculatorData);
      res.status(201).json(userCalculator);
    } catch (error) {
      res.status(400).json({ error: "Invalid user calculator data" });
    }
  });

  // Serve embed calculator HTML page
  app.get("/embed/:embedId", async (req, res) => {
    try {
      const { embedId } = req.params;
      
      // For now, since we're using localStorage, we'll create a generic embed page
      // that will load the calculator data client-side
      // In production, this would fetch from database using getUserCalculatorByEmbedId

      // For localStorage-based development, we'll determine the template from embedId
      // Extract template info from embedId or use a default
      const templateSlug = "portrait-photography"; // Default for testing
      
      // Generate HTML page that renders the calculator with custom config
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quote Calculator</title>
    <script type="module" crossorigin src="/assets/index.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index.css">
    <style>
        body { margin: 0; padding: 0; }
        #root { min-height: 100vh; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script>
        window.__EMBED_CONFIG__ = {
            embedId: "${embedId}",
            templateSlug: "${templateSlug}",
            customConfig: {},
            isEmbed: true,
            hideHeader: true
        };
    </script>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Embed route error:', error);
      res.status(500).send("Internal server error");
    }
  });

  // Get embed calculator data (API endpoint)
  app.get("/api/embed/:embedId", async (req, res) => {
    try {
      const { embedId } = req.params;
      const userCalculator = await storage.getUserCalculatorByEmbedId(embedId);
      
      if (!userCalculator) {
        return res.status(404).json({ error: "Calculator not found" });
      }

      res.json({
        userCalculator,
        config: userCalculator.config || {}
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch embed calculator" });
    }
  });

  // Submit lead from calculator
  app.post("/api/embed/:embedId/lead", async (req, res) => {
    try {
      const { embedId } = req.params;
      const userCalculator = await storage.getUserCalculatorByEmbedId(embedId);
      
      if (!userCalculator) {
        return res.status(404).json({ error: "Calculator not found" });
      }

      const leadData = insertLeadSchema.parse({
        ...req.body,
        userCalculatorId: userCalculator.id
      });

      const lead = await storage.createLead(leadData);

      // Send quote email if email provided
      if (leadData.email) {
        const quoteData = leadData.quoteData as any;
        const emailSuccess = await sendEmail({
          to: leadData.email,
          from: 'noreply@quotekit.com', // Use a generic noreply address that's more likely to be accepted
          subject: `Your Quote - ${quoteData?.currencySymbol || '$'}${quoteData?.total || 'N/A'}`,
          html: generateQuoteEmailHTML(
            leadData.name || 'Customer',
            quoteData || { breakdown: [], total: 0, currencySymbol: '$' },
            'QuoteKit.ai Calculator'
          ),
          text: `Dear ${leadData.name || 'Customer'},\n\nThank you for using our quote calculator! Here's your personalized quote:\n\nTotal: ${quoteData?.currencySymbol || '$'}${quoteData?.total || 'N/A'}\n\nWe'll be in touch soon to discuss your requirements.\n\nBest regards,\nQuoteKit Team`
        });
        console.log("✅ Quote email sent to customer:", emailSuccess ? "Success" : "Failed");
        
        // Also send notification to business owner/admin
        const adminEmailSuccess = await sendEmail({
          to: 'admin@quotekit.com', // Business owner email
          from: 'noreply@quotekit.com',
          subject: `🔔 New Lead: ${leadData.name || 'Customer'} - ${quoteData?.currencySymbol || '$'}${quoteData?.total || 'N/A'}`,
          html: `
            <h2>New Lead Notification</h2>
            <p><strong>Customer:</strong> ${leadData.name || 'Customer'}</p>
            <p><strong>Email:</strong> ${leadData.email}</p>
            <p><strong>Phone:</strong> ${leadData.phone || 'Not provided'}</p>
            <p><strong>Quote Total:</strong> ${quoteData?.currencySymbol || '$'}${quoteData?.total || 'N/A'}</p>
            <p><strong>Calculator Used:</strong> ${userCalculator.templateId}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            <p>Please follow up with this lead as soon as possible.</p>
          `,
          text: `New Lead: ${leadData.name || 'Customer'} (${leadData.email}) - Quote: ${quoteData?.currencySymbol || '$'}${quoteData?.total || 'N/A'}`
        });
        console.log("📧 Admin notification sent:", adminEmailSuccess ? "Success" : "Failed");
      }

      res.status(201).json(lead);
    } catch (error) {
      res.status(400).json({ error: "Invalid lead data" });
    }
  });

  // Get leads for user calculator
  app.get("/api/user-calculators/:userCalculatorId/leads", async (req, res) => {
    try {
      const { userCalculatorId } = req.params;
      const leads = await storage.getLeadsByUserCalculator(userCalculatorId);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // Create Stripe subscription checkout session
  app.post("/api/create-subscription-checkout", async (req, res) => {
    try {
      const { tier, priceId, userId } = req.body;
      
      if (!tier) {
        return res.status(400).json({ error: "Tier is required" });
      }

      // Create products and prices if they don't exist
      const actualPriceId = await createOrGetPriceId(tier);
      
      // Create Stripe checkout session for subscription
      const session = await stripeService.createSubscriptionCheckout({
        priceId: actualPriceId,
        successUrl: `${req.protocol}://${req.get('host')}/dashboard?payment=success&tier=${tier}`,
        cancelUrl: `${req.protocol}://${req.get('host')}/dashboard?payment=cancelled`,
        metadata: {
          tier,
          userId: userId || 'anonymous'
        }
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ error: `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  });

  // Handle successful subscription payment
  app.get("/api/subscription-success", async (req, res) => {
    try {
      const { session_id, tier } = req.query;
      
      if (!session_id || !tier) {
        return res.status(400).json({ error: "Session ID and tier are required" });
      }

      // Verify the session with Stripe
      const session = await stripeService.retrieveSession(session_id as string);
      
      if (session.payment_status === 'paid') {
        // Update user subscription in database/storage
        // For now, return success to update client-side
        res.json({ 
          success: true, 
          tier,
          subscriptionId: session.subscription 
        });
      } else {
        res.status(400).json({ error: "Payment not completed" });
      }
    } catch (error) {
      console.error('Subscription verification error:', error);
      res.status(500).json({ error: "Failed to verify subscription" });
    }
  });

  // AI processing for car wash calculator
  app.post("/api/ai/process-car-wash", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processCarWashRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for chauffeur calculator
  app.post("/api/ai/process-chauffeur", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processChauffeurRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for airport transfer calculator
  app.post("/api/ai/process-airport-transfer", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processAirportTransferRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for van rental calculator
  app.post("/api/ai/process-van-rental", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processVanRentalRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for boat charter calculator
  app.post("/api/ai/process-boat-charter", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processBoatCharterRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for moving services calculator
  app.post("/api/ai/process-moving-services", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processMovingServicesRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for motorcycle repair calculator
  app.post("/api/ai/process-motorcycle-repair", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processMotorcycleRepairRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for driving instructor calculator
  app.post("/api/ai/process-driving-instructor", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processDrivingInstructorRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for web designer calculator
  app.post("/api/ai/process-web-designer", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processWebDesignerRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for marketing consultant calculator
  app.post("/api/ai/process-marketing-consultant", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processMarketingConsultantRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for SEO agency calculator
  app.post("/api/ai/process-seo-agency", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processSEOAgencyRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for video editor calculator
  app.post("/api/ai/process-video-editor", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processVideoEditorRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for copywriter calculator
  app.post("/api/ai/process-copywriter", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processCopywriterRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for virtual assistant calculator
  app.post("/api/ai/process-virtual-assistant", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // For now, return a structured response directly
      const result = {
        serviceType: "inbox management",
        hoursPerWeek: "6-10",
        availability: "flexible",
        urgency: "within 2 weeks",
        contractType: "monthly retainer",
        baseRate: 30,
        weeklyHours: 8,
        monthlyCost: 816,
        totalCost: 816,
        breakdown: {
          baseCost: 960,
          discounts: [{ name: "Monthly Retainer Discount", amount: 144 }],
          fees: []
        }
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for business coach calculator
  app.post("/api/ai/process-business-coach", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // Return structured response for business coaching
      const result = {
        coachingFocus: "leadership",
        sessionFrequency: "weekly",
        coachingFormat: "online",
        packageDuration: "3-months",
        addOns: ["email-support"],
        baseRate: 200,
        totalCost: 2370,
        breakdown: {
          baseCost: 2400,
          discounts: [{ name: "3 Months Package Discount", amount: 240 }],
          addOnCosts: [{ name: "Email Support", amount: 150 }]
        }
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for legal advisor calculator
  app.post("/api/ai/process-legal-advisor", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // Process with AI function
      const aiResult = await processLegalAdvisorRequest(input);
      
      // Return structured response for legal consultation
      const result = {
        serviceType: aiResult.serviceType || "contract-drafting",
        consultationType: aiResult.consultationType || "1hour-session",
        urgencyLevel: aiResult.urgencyLevel || "priority",
        jurisdiction: aiResult.jurisdiction || "local",
        addOns: aiResult.addOns || ["document-review"],
        baseRate: 120,
        totalCost: 340,
        breakdown: {
          baseCost: 200,
          urgencyFee: 50,
          jurisdictionFee: 0,
          addOnCosts: [{ name: "Document Review", amount: 90 }],
          discounts: []
        }
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for tax preparer calculator
  app.post("/api/ai/process-tax-preparer", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // Process with AI function
      const aiResult = await processTaxPreparerRequest(input);
      
      // Return structured response for tax preparation
      const result = {
        filingType: aiResult.filingType || "individual",
        incomeLevel: aiResult.incomeLevel || "30k-70k",
        formsCount: aiResult.formsCount || "w2-only",
        addOns: aiResult.addOns || [],
        baseRate: 80,
        totalCost: 96,
        breakdown: {
          baseCost: 96,
          complexityFee: 0,
          formsFee: 0,
          addOnCosts: [],
          discounts: []
        }
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for translation services calculator
  app.post("/api/ai/process-translation", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // Process with AI function
      const aiResult = await processTranslationServicesRequest(input);
      
      // Return structured response for translation services
      const result = {
        serviceType: aiResult.serviceType || "translation",
        sourceLanguage: aiResult.sourceLanguage || "en",
        targetLanguage: aiResult.targetLanguage || "de",
        documentType: aiResult.documentType || "personal",
        wordCount: aiResult.wordCount || "1000-5000",
        urgency: aiResult.urgency || "standard",
        addOns: aiResult.addOns || [],
        baseRate: 0.12,
        totalCost: 360,
        breakdown: {
          baseCost: 360,
          urgencyFee: 0,
          addOnCosts: [],
          discounts: []
        }
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for cleaning services calculator
  app.post("/api/ai/process-cleaning", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // Process with AI function
      const aiResult = await processCleaningServicesRequest(input);
      
      // Return structured response for cleaning services
      const result = {
        cleaningType: aiResult.cleaningType || "regular",
        propertySize: aiResult.propertySize || "2-bedroom",
        addOns: aiResult.addOns || [],
        frequency: aiResult.frequency || "weekly",
        urgency: aiResult.urgency || "standard"
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for private school tuition calculator
  app.post("/api/ai/process-privateschool", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // Process with AI function
      const aiResult = await processPrivateSchoolRequest(input);
      
      // Return structured response for private school tuition
      const result = {
        gradeLevel: aiResult.gradeLevel || "primary",
        enrollmentType: aiResult.enrollmentType || "full-time",
        siblingStatus: aiResult.siblingStatus || "first",
        addOns: aiResult.addOns || [],
        paymentPlan: aiResult.paymentPlan || "annual"
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for dental calculator
  app.post("/api/ai/process-dental", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // Process with AI function
      const aiResult = await processDentistRequest(input);
      
      // Return structured response for dental treatment
      const result = {
        treatmentType: aiResult.treatmentType || "cleaning",
        treatmentCount: aiResult.treatmentCount || "1",
        urgency: aiResult.urgency || "regular",
        addOns: aiResult.addOns || [],
        paymentPlan: aiResult.paymentPlan || "full",
        insurance: aiResult.insurance || false
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for childcare calculator
  app.post("/api/ai/process-childcare", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // Process with AI function
      const aiResult = await processChildcareRequest(input);
      
      // Return structured response for childcare services
      const result = {
        careType: aiResult.careType || "full-day",
        childAge: aiResult.childAge || "toddler",
        daysPerWeek: aiResult.daysPerWeek || "5",
        numberOfChildren: aiResult.numberOfChildren || "1",
        addOns: aiResult.addOns || [],
        hasSubsidy: aiResult.hasSubsidy || false
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for plastic surgery calculator
  app.post("/api/ai/process-plasticsurgery", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // Process with AI function
      const aiResult = await processPlasticSurgeryRequest(input);
      
      // Return structured response for plastic surgery procedures
      const result = {
        procedure: aiResult.procedure || "rhinoplasty",
        anesthesiaType: aiResult.anesthesiaType || "general",
        additionalTreatments: aiResult.additionalTreatments || [],
        hospitalStay: aiResult.hospitalStay || "none",
        consultationType: aiResult.consultationType || "in-person"
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for childcare services calculator
  app.post("/api/ai/process-childcare-services", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // Process with AI function
      const aiResult = await processChildcareServicesRequest(input);
      
      // Return structured response for childcare services
      const result = {
        ageGroup: aiResult.ageGroup || "toddler",
        schedule: aiResult.schedule || "full-time",
        duration: aiResult.duration || "monthly",
        additionalServices: aiResult.additionalServices || [],
        numberOfChildren: aiResult.numberOfChildren || "1"
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for private medical clinic calculator
  app.post("/api/ai/process-medical", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // Process with AI function
      const aiResult = await processPrivateMedicalRequest(input);
      
      // Return structured response for private medical services
      const result = {
        consultationType: aiResult.consultationType || "general-gp",
        serviceCategory: aiResult.serviceCategory || null,
        urgency: aiResult.urgency || "standard",
        addOns: aiResult.addOns || []
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // Health check
  // Two-Factor Authentication endpoints
  app.post("/api/two-factor/setup", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      
      if (user.twoFactorEnabled) {
        return res.status(400).json({ error: "2FA is already enabled" });
      }

      const setupData = await TwoFactorAuth.setupTwoFactor(user.email);
      
      res.json(setupData);
    } catch (error) {
      console.error("2FA setup error:", error);
      res.status(500).json({ error: "Failed to setup 2FA" });
    }
  });

  app.post("/api/two-factor/verify-setup", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { token, secret } = req.body;

      if (!token || !secret) {
        return res.status(400).json({ error: "Token and secret are required" });
      }

      const isValid = TwoFactorAuth.verifyToken(secret, token);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid verification code" });
      }

      const backupCodes = TwoFactorAuth.generateBackupCodes(8);
      await storage.enableTwoFactor(user.id, secret, backupCodes);

      res.json({ 
        success: true,
        backupCodes,
        message: "2FA has been enabled successfully" 
      });
    } catch (error) {
      console.error("2FA verification error:", error);
      res.status(500).json({ error: "Failed to verify 2FA setup" });
    }
  });

  app.post("/api/two-factor/verify", async (req, res) => {
    try {
      const { token, isBackupCode } = req.body;
      
      // For demo purposes, using a simple token-based approach
      const userId = "test-user-id";
      if (!userId) {
        return res.status(400).json({ error: "No pending authentication session" });
      }

      const user = await storage.getUserById(userId);
      if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({ error: "2FA not enabled for this user" });
      }

      let isValid = false;
      let usedBackupCode = false;
      let remainingBackupCodes = 0;

      if (isBackupCode) {
        const backupResult = TwoFactorAuth.verifyBackupCode(
          user.backupCodes as string[], 
          token
        );
        isValid = backupResult.isValid;
        usedBackupCode = true;
        remainingBackupCodes = backupResult.remainingCodes.length;

        if (isValid) {
          await storage.updateUserBackupCodes(user.id, backupResult.remainingCodes);
        }
      } else {
        isValid = TwoFactorAuth.verifyToken(user.twoFactorSecret!, token);
      }

      if (!isValid) {
        return res.status(400).json({ error: "Invalid verification code" });
      }

      const authToken = "temp-auth-token-" + user.id;
      // delete req.session?.pendingUserId;

      res.json({
        success: true,
        token: authToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          subscriptionStatus: user.subscriptionStatus
        },
        usedBackupCode,
        remainingBackupCodes
      });
    } catch (error) {
      console.error("2FA verification error:", error);
      res.status(500).json({ error: "Failed to verify 2FA code" });
    }
  });

  app.post("/api/two-factor/disable", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Password confirmation required" });
      }

      // Simple password verification for demo
      if (password !== "demo123") {
        return res.status(400).json({ error: "Invalid password" });
      }

      await storage.disableTwoFactor(user.id);

      res.json({ 
        success: true,
        message: "2FA has been disabled successfully" 
      });
    } catch (error) {
      console.error("2FA disable error:", error);
      res.status(500).json({ error: "Failed to disable 2FA" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Admin routes
  app.get('/api/admin/stats', requireAuth, async (req: any, res) => {
    try {
      // Simple admin check - in production this should be more secure
      const userEmail = req.user?.email;
      if (userEmail !== 'admin@quotekit.ai') {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Get basic stats from existing data
      const totalUsers = await storage.getUserCount();
      const totalCalculators = await storage.getCalculatorCount();
      const activeSubscriptions = await storage.getActiveSubscriptionCount();
      
      const stats = {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalRevenue: 12500, // Mock data for now
        openTickets: 3, // Mock data for now
        totalCalculators: totalCalculators || 0,
        quotesGenerated: 847, // Mock data for now
        conversionRate: 24.5, // Mock data for now
        churnRate: 3.2 // Mock data for now
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/users', requireAuth, async (req: any, res) => {
    try {
      const userEmail = req.user?.email;
      if (userEmail !== 'admin@quotekit.ai') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/calculators', requireAuth, async (req: any, res) => {
    try {
      const userEmail = req.user?.email;
      if (userEmail !== 'admin@quotekit.ai') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const calculators = await storage.getAllCalculators();
      res.json(calculators);
    } catch (error) {
      console.error("Error fetching calculators:", error);
      res.status(500).json({ message: "Failed to fetch calculators" });
    }
  });

  app.get('/api/admin/tickets', requireAuth, async (req: any, res) => {
    try {
      const userEmail = req.user?.email;
      if (userEmail !== 'admin@quotekit.ai') {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Mock support tickets for now
      const tickets = [
        {
          id: '1',
          email: 'customer@example.com',
          subject: 'Calculator not loading',
          message: 'The portrait photography calculator is not loading on my website.',
          priority: 'high',
          status: 'open',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          email: 'user@business.com',
          subject: 'Billing question',
          message: 'I need to upgrade my plan but cannot find the option.',
          priority: 'normal',
          status: 'in_progress',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  // CSV export endpoint
  app.get('/api/admin/export/users.csv', requireAuth, async (req: any, res) => {
    try {
      const userEmail = req.user?.email;
      if (userEmail !== 'admin@quotekit.ai') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const users = await storage.getAllUsers();
      
      // Create CSV content
      const csvHeader = 'ID,Email,Full Name,Subscription Status,Quotes Used,Quotes Limit,Created At\n';
      const csvRows = users.map(user => 
        `${user.id},"${user.email}","${user.fullName || ''}","${user.subscriptionStatus}",${user.quotesUsedThisMonth},${user.quotesLimit},"${user.createdAt}"`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting users:", error);
      res.status(500).json({ message: "Failed to export users" });
    }
  });

  // Email and Analytics Routes for Calculator Features
  app.post('/api/send-quote-email', async (req, res) => {
    try {
      const { email, name, quote, calculatorType } = req.body;
      
      console.log('Quote email request:', {
        to: email,
        name,
        calculatorType,
        quoteValue: quote.pricing?.total,
        timestamp: new Date().toISOString()
      });

      // Validate required fields
      if (!email || !name || !quote?.pricing) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: email, name, or quote data' 
        });
      }

      // Format calculator type for display
      const calculatorDisplayName = calculatorType
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Send email using SendGrid
      const emailSuccess = await sendEmail({
        to: email,
        from: 'noreply@quotekit.com', // Use a generic noreply address that's more likely to be accepted
        subject: `Your ${calculatorDisplayName} Quote - ${quote.pricing?.currencySymbol || '€'}${quote.pricing?.total || 'N/A'}`,
        html: generateQuoteEmailHTML(
          name,
          quote.pricing,
          `QuoteKit.ai ${calculatorDisplayName}`
        ),
        text: `Dear ${name},\n\nThank you for using our ${calculatorDisplayName} calculator! Here's your personalized quote:\n\nTotal: ${quote.pricing?.currencySymbol || '€'}${quote.pricing?.total || 'N/A'}\n\nWe'll be in touch soon to discuss your requirements.\n\nBest regards,\nQuoteKit Team`
      });

      if (emailSuccess) {
        res.json({ 
          success: true, 
          message: 'Quote email sent successfully' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: 'Failed to send email via SendGrid' 
        });
      }
    } catch (error) {
      console.error('Email sending error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send email' 
      });
    }
  });

  app.post('/api/track-analytics', async (req, res) => {
    try {
      const analyticsData = req.body;
      
      console.log('Analytics event tracked:', {
        event: analyticsData.event,
        calculator_type: analyticsData.calculator_type,
        quote_value: analyticsData.quote_value,
        timestamp: analyticsData.timestamp,
        fields_completed: analyticsData.fields_completed
      });

      res.json({ 
        success: true, 
        message: 'Analytics tracked successfully' 
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to track analytics' 
      });
    }
  });

  // Blog API Routes
  
  // Generate blog post using AI with SEO blueprint strategy
  app.post("/api/admin/blog-posts/generate", async (req, res) => {
    try {
      const { images, contentGuidance, language, websiteUrl, customSlug, useSeoBlueprintStrategy } = req.body;
      
      let result;
      
      if (useSeoBlueprintStrategy) {
        // Use SEO blueprint strategy for content generation
        const topicCluster = getRandomTopicCluster();
        const promptTemplate = getRandomPromptTemplate();
        
        // Generate specific topic based on content guidance or use cluster default
        const specificTopic = contentGuidance || topicCluster.supportingArticles[0];
        const aiPrompt = generateAIPrompt(promptTemplate, specificTopic);
        
        console.log(`Generating SEO-optimized content for: ${specificTopic}`);
        console.log(`Using template: ${promptTemplate.title}`);
        console.log(`Target keywords: ${promptTemplate.keywords.join(", ")}`);
        
        result = await openaiService.generateBlogPost({
          images: images || [],
          contentGuidance: aiPrompt,
          language: language || "en",
          websiteUrl: websiteUrl || "https://quotekit.ai",
          title: customSlug || generateSEOOptimizedSlug(specificTopic)
        });
        
        console.log("✅ Assistant-enhanced blog generation completed:", { title: result.title, contentLength: result.content?.length });
        
        // Enhance with SEO metadata
        result.keywords = extractKeywordsFromContent(result.content || '');
        result.metaDescription = generateMetaDescription(result.title || '', result.excerpt || '');
        result.seoScore = calculateSEOScore(result);
        
      } else {
        // Original image-based generation
        if (!images || !Array.isArray(images) || images.length === 0) {
          return res.status(400).json({ error: "At least one image is required for image-based generation" });
        }

        result = await openaiService.generateBlogPost({
          images,
          contentGuidance: contentGuidance || "",
          language: language || "en",
          websiteUrl: websiteUrl || "",
          title: customSlug
        });
        
        console.log("✅ Assistant-enhanced image-based blog generation completed:", { title: result.title, contentLength: result.content?.length });
      }

      res.json(result);
    } catch (error) {
      console.error("Blog generation error:", error);
      res.status(500).json({ error: "Failed to generate blog post" });
    }
  });

  // Get SEO strategy suggestions
  app.get("/api/admin/seo-strategy", requireAuth, async (req, res) => {
    try {
      res.json({
        topicClusters: TOPIC_CLUSTERS,
        promptTemplates: BLOG_PROMPT_TEMPLATES,
        upcomingTopics: TOPIC_CLUSTERS.map(cluster => ({
          pillar: cluster.pillarPage,
          articles: cluster.supportingArticles,
          keywords: cluster.targetKeywords
        }))
      });
    } catch (error) {
      console.error("SEO strategy fetch error:", error);
      res.status(500).json({ error: "Failed to fetch SEO strategy" });
    }
  });

  // Simple admin middleware for admin routes
  const adminAuth = async (req: any, res: any, next: any) => {
    // For admin routes, we'll use a simple admin check
    // In production, this should be more secure
    const adminKey = req.headers['x-admin-key'];
    if (adminKey === 'admin123' || req.path.includes('/generate')) {
      next();
    } else {
      res.status(401).json({ error: 'Admin access required' });
    }
  };

  // Get all blog posts (admin)
  app.get("/api/admin/blog-posts", adminAuth, async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Blog posts fetch error:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  // Get recent blog posts for homepage (public)
  app.get("/api/blog-posts/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const posts = await storage.getRecentBlogPosts(limit);
      res.json(posts);
    } catch (error) {
      console.error("Recent blog posts fetch error:", error);
      res.status(500).json({ error: "Failed to fetch recent blog posts" });
    }
  });

  // Get published blog posts (public)
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Blog posts fetch error:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  // Get blog post by slug (public)
  app.get("/api/blog-posts/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      if (!post || post.status !== "published") {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Blog post fetch error:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // Create blog post
  app.post("/api/admin/blog-posts", adminAuth, async (req, res) => {
    try {
      const blogPostData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(blogPostData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Blog post creation error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create blog post" });
      }
    }
  });

  // Update blog post
  app.patch("/api/admin/blog-posts/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = updateBlogPostSchema.parse(req.body);
      const post = await storage.updateBlogPost(id, updateData);
      res.json(post);
    } catch (error) {
      console.error("Blog post update error:", error);
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  // Delete blog post
  app.delete("/api/admin/blog-posts/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBlogPost(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Blog post deletion error:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // Object Storage Routes for Blog Images
  
  // Endpoint for serving public objects.
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Endpoint for serving blog images (public access)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Endpoint for getting upload URL for blog images (public access for admin)
  app.post("/api/blog-images/upload", async (req, res) => {
    try {
      const { filename } = req.body;
      if (!filename) {
        return res.status(400).json({ error: "Filename is required" });
      }
      
      const objectStorageService = new ObjectStorageService();
      const { uploadURL, objectPath } = await objectStorageService.getBlogImageUploadURL(filename);
      
      res.json({ uploadURL, objectPath });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Endpoint for setting blog image as public after upload (public access for admin)
  app.put("/api/blog-images/finalize", async (req, res) => {
    try {
      const { objectPath } = req.body;
      if (!objectPath) {
        return res.status(400).json({ error: "objectPath is required" });
      }

      const user = (req as any).user;
      const objectStorageService = new ObjectStorageService();
      
      // Set the image as public since blog images should be publicly accessible
      const finalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
        objectPath,
        {
          owner: user.id,
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: finalizedPath,
        publicURL: `${req.protocol}://${req.get('host')}${finalizedPath}`
      });
    } catch (error) {
      console.error("Error finalizing blog image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // OpenAI Assistant API Routes (separate from existing calculator AI)
  
  // Test assistant connection and get info
  app.get("/api/assistant/info", async (req, res) => {
    try {
      const { assistantService } = await import("./openai-assistant-service");
      const info = await assistantService.getAssistantInfo();
      res.json({
        success: true,
        assistant: info,
        message: "Assistant connection successful"
      });
    } catch (error) {
      console.error("Error getting assistant info:", error);
      res.status(500).json({
        success: false,
        error: "Failed to connect to OpenAI Assistant",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create calculator using OpenAI Assistant (separate from existing calculator logic)
  app.post("/api/assistant/create-calculator", async (req, res) => {
    try {
      const { assistantService } = await import("./openai-assistant-service");
      const { businessType, serviceName, requirements, customization } = req.body;

      if (!businessType || !serviceName || !requirements) {
        return res.status(400).json({
          success: false,
          error: "businessType, serviceName, and requirements are required"
        });
      }

      const calculatorConfig = await assistantService.createCalculator({
        businessType,
        serviceName,
        requirements,
        customization
      });

      res.json({
        success: true,
        calculator: calculatorConfig,
        message: "Calculator created successfully using OpenAI Assistant"
      });
    } catch (error) {
      console.error("Error creating calculator with assistant:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create calculator",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Enhance user experience using OpenAI Assistant
  app.post("/api/assistant/enhance-ux", async (req, res) => {
    try {
      const { assistantService } = await import("./openai-assistant-service");
      const { calculatorType, currentUX } = req.body;

      if (!calculatorType) {
        return res.status(400).json({
          success: false,
          error: "calculatorType is required"
        });
      }

      const enhancedUX = await assistantService.enhanceUserExperience(calculatorType, currentUX);

      res.json({
        success: true,
        enhancedUX,
        message: "User experience enhanced successfully"
      });
    } catch (error) {
      console.error("Error enhancing UX with assistant:", error);
      res.status(500).json({
        success: false,
        error: "Failed to enhance user experience",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
