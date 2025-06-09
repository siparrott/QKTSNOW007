import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Launch Deal",
      description: "Everything you need to dominate",
      price: "€5",
      period: "/month",
      originalPrice: "€49",
      features: [
        "✅ All 50+ Calculators",
        "✅ Unlimited Embeds",
        "✅ Branded Embed Tools", 
        "✅ AI-Powered Pricing Logic",
        "✅ Email Lead Capture + Dashboard",
        "✅ Custom Style Editor",
        "✅ PDF + Quote Lock Tools",
        "✅ Mobile-First Design",
        "✅ Future Tools + Updates",
        "✅ Price Lock Guarantee"
      ],
      bonuses: [
        "🎬 50 Viral TikTok Ad Scripts",
        "📩 10 Email Templates",
        "🔧 Priority Support"
      ],
      cta: "Get QuoteKit.ai Now",
      popular: true,
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
            🚀 The <span className="text-neon-400">Godfather Offer</span>
          </h2>
          <p className="text-xl text-gray-300 mb-4">Make Them an Offer They Can't Refuse</p>
          <div className="bg-gradient-to-r from-neon-500/20 to-neon-600/20 border border-neon-500/30 rounded-lg p-6 max-w-2xl mx-auto mb-8">
            <div className="text-3xl font-bold text-neon-400 mb-2">💣 Launch Deal: €5/month</div>
            <div className="text-gray-300">Paid Annually • Cancel Anytime</div>
          </div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            You're not just buying software. You're unlocking an entire arsenal of quote-to-close power moves for 50+ service-based businesses.
          </p>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              className="bg-gradient-to-b from-neon-500/20 to-midnight-800 border-2 border-neon-500 relative rounded-2xl p-8 md:p-12"
              variants={itemVariants}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neon-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                🔥 LIMITED LAUNCH OFFER
              </div>

              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">{plan.name}</h3>
                <p className="text-xl text-gray-300 mb-6">{plan.description}</p>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-6xl font-bold text-neon-400">{plan.price}</div>
                  <div>
                    <div className="text-xl text-gray-400">{plan.period}</div>
                    <div className="text-sm text-gray-500 line-through">{plan.originalPrice}/month</div>
                  </div>
                </div>
                <p className="text-gray-400">Paid annually • Cancel anytime</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">What You Get:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">🎁 Launch Bonuses:</h4>
                  <ul className="space-y-3">
                    {plan.bonuses.map((bonus, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-gray-300 text-sm">{bonus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Button className="bg-neon-500 hover:bg-neon-600 text-white px-12 py-4 rounded-lg font-bold text-xl transition-all duration-300 hover:shadow-glow transform hover:scale-105">
                  {plan.cta} →
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  ✅ No contracts ✅ Full access ✅ Cancel anytime
                </p>
              </div>
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
