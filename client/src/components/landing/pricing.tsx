import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for getting started",
      price: "Free",
      period: "Forever",
      features: [
        "1 Calculator",
        "100 Monthly Quotes",
        "Basic Analytics",
        "Email Support",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Pro",
      description: "For growing businesses",
      price: "$49",
      period: "/mo",
      features: [
        "10 Calculators",
        "Unlimited Quotes",
        "Advanced Analytics",
        "Custom Branding",
        "Priority Support",
        "API Access",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Studio",
      description: "For large operations",
      price: "$149",
      period: "/mo",
      features: [
        "Unlimited Calculators",
        "Unlimited Quotes",
        "Advanced Analytics",
        "White Label Solution",
        "Dedicated Support",
        "Custom Integrations",
      ],
      cta: "Contact Sales",
      popular: false,
    },
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
            Simple, <span className="text-neon-400">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-gray-300 mb-8">Start free, scale as you grow. No hidden fees, cancel anytime.</p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className="text-gray-300 mr-3">Monthly</span>
            <button className="relative w-14 h-8 bg-midnight-600 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-neon-400">
              <div className="w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform translate-x-0" />
            </button>
            <span className="text-gray-300 ml-3">Yearly</span>
            <span className="bg-neon-500 text-white text-xs px-2 py-1 rounded-full ml-2">Save 20%</span>
          </div>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              className={`rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-b from-neon-500/20 to-midnight-800 border-2 border-neon-500 relative transform scale-105"
                  : "bg-midnight-800 border border-midnight-700 hover:border-midnight-600"
              }`}
              variants={itemVariants}
              whileHover={{ y: plan.popular ? 0 : -5 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neon-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6">{plan.description}</p>
                <div className="text-4xl font-bold text-white mb-2">
                  {plan.price}
                  {plan.period !== "Forever" && <span className="text-xl text-gray-400">{plan.period}</span>}
                </div>
                <p className="text-gray-400">{plan.period === "Forever" ? plan.period : "Billed monthly"}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="text-neon-400 mr-3 h-5 w-5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-neon-500 hover:bg-neon-600 text-white hover:shadow-glow"
                    : "bg-midnight-600 hover:bg-midnight-500 text-white"
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 mb-4">
            <span className="inline-flex items-center">
              <Check className="text-neon-400 mr-2 h-5 w-5" />
              30-day money-back guarantee • No setup fees • Cancel anytime
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
