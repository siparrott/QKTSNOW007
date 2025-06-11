import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Rocket, Zap, Building2, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Pricing() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handlePlanSelection = async (planName: string) => {
    try {
      if (planName === "Starter") {
        // Free plan - redirect to signup
        setLocation("/register");
        return;
      }

      // For paid plans, create Stripe checkout session
      const response = await apiRequest("POST", "/api/create-checkout-session", {
        planName,
        priceId: getPriceId(planName)
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPriceId = (planName: string) => {
    // Real Stripe price IDs - these need to be created in Stripe Dashboard
    const priceIds = {
      "Pro": "price_1QRzCEJNcmPzuSeHYw8rDgQf", // €5/month Pro plan
      "Business": "price_1QRzCFJNcmPzuSeH7KvX2m9w", // €35/month Business plan  
      "Enterprise": "price_1QRzCGJNcmPzuSeHpL3vN8xK" // €95/month Enterprise plan
    };
    return priceIds[planName as keyof typeof priceIds];
  };

  const plans = [
    {
      name: "Starter",
      description: "Free forever",
      price: "€0",
      period: "",
      quotesLimit: "Up to 5 quotes/month",
      icon: <Rocket className="h-6 w-6" />,
      features: [
        "Fully embeddable AI quote widget",
        "Real-time price calculation",
        "Custom branding & styling tools",
        "Email lead capture",
        "Admin dashboard access"
      ],
      cta: "Start Free",
      popular: false,
      bestFor: "New users, testing the waters"
    },
    {
      name: "Pro",
      description: "Launch Offer: €5/month (normally €15/month)",
      price: "€5",
      period: "/month",
      quotesLimit: "6–20 quotes/month",
      icon: <Zap className="h-6 w-6" />,
      features: [
        "Everything in Starter",
        "PDF + Email export",
        "CRM/Webhook integration", 
        "Analytics dashboard",
        "Style configuration JSON editor",
        "Priority support"
      ],
      cta: "Get Pro Deal",
      popular: true,
      bestFor: "Solo professionals ready to grow",
      originalPrice: "€15"
    },
    {
      name: "Business",
      description: "For busy teams",
      price: "€35",
      period: "/month",
      quotesLimit: "21–100 quotes/month",
      icon: <Building2 className="h-6 w-6" />,
      features: [
        "Everything in Pro",
        "Advanced analytics",
        "Team collaboration tools",
        "White-label options",
        "API access",
        "Dedicated support"
      ],
      cta: "Start Business",
      popular: false,
      bestFor: "Busy teams or multi-niche users"
    },
    {
      name: "Enterprise",
      description: "Custom solutions",
      price: "€95",
      period: "/month",
      quotesLimit: "100+ quotes/month",
      icon: <Crown className="h-6 w-6" />,
      features: [
        "Everything in Business",
        "Custom integrations",
        "Dedicated account manager",
        "Custom invoicing available",
        "SLA guarantee",
        "Training & onboarding"
      ],
      cta: "Contact Sales",
      popular: false,
      bestFor: "Agencies, franchises, large teams"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-midnight-800/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-neon-400">QuoteKit Pricing Plans</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            Turn curiosity into clients — without wasting hours on back-and-forth messages.<br/>
            Try free, upgrade when you're ready.
          </p>
          <div className="bg-gradient-to-r from-neon-500/20 to-neon-600/20 border border-neon-500/30 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="text-lg font-bold text-neon-400">Launch Offer: Lock in Pro for only €5/month (normally €15/month)</div>
            <div className="text-sm text-gray-300">Available until launch phase ends</div>
          </div>
        </motion.div>

        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative rounded-2xl p-6 ${
                  plan.popular
                    ? "bg-gradient-to-b from-neon-500/20 to-midnight-800 border-2 border-neon-500 transform scale-105"
                    : "bg-gradient-to-b from-gray-800/50 to-midnight-800 border border-gray-700"
                }`}
                variants={itemVariants}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neon-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-3">
                    <div className={`p-2 rounded-lg ${plan.popular ? "bg-neon-500" : "bg-gray-700"}`}>
                      {plan.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-300 mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400">{plan.period}</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">Was {plan.originalPrice}/month</div>
                    )}
                    <div className="text-sm text-gray-400 mt-1">{plan.quotesLimit}</div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    Best for: {plan.bestFor}
                  </div>
                </div>

                <div className="mb-6">
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-sm">
                        <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-center">
                  <Button 
                    onClick={() => handlePlanSelection(plan.name)}
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "bg-neon-500 hover:bg-neon-600 text-white hover:shadow-glow"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">All Plans Include:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-gray-300 mb-8">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                Fully embeddable AI quote widget
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                Real-time price calculation
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                Custom branding & styling tools
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                Email lead capture
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                Admin dashboard access
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
              <h4 className="text-lg font-semibold text-white mb-4">Pro & Higher Also Get:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-gray-300">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-neon-400 mr-2" />
                  PDF + Email export
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-neon-400 mr-2" />
                  CRM/Webhook integration
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-neon-400 mr-2" />
                  Analytics dashboard
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-neon-400 mr-2" />
                  Style configuration JSON editor
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-neon-400 mr-2" />
                  Priority support
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-400">
            <span className="inline-flex items-center">
              <Check className="text-green-400 mr-2 h-5 w-5" />
              30-day money-back guarantee • No setup fees • Cancel anytime
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
