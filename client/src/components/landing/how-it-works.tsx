import { motion } from "framer-motion";
import { Search, Code, TrendingUp } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Search,
      title: "Choose Your Niche",
      description: "Select from 50+ service categories including photography, fitness, home services, and more",
    },
    {
      number: 2,
      icon: Code,
      title: "Embed the Calculator",
      description: "Copy and paste our simple embed code into your website - no technical skills required",
    },
    {
      number: 3,
      icon: TrendingUp,
      title: "Start Converting",
      description: "Watch as your calculator automatically captures leads and converts visitors 24/7",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="features" className="py-20 lg:py-32 bg-midnight-800/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How It <span className="text-neon-400">Works</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get your AI quote calculator up and running in three simple steps
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step) => (
            <motion.div key={step.number} className="text-center group" variants={itemVariants}>
              <div className="relative mb-8">
                <motion.div
                  className="w-24 h-24 mx-auto bg-gradient-to-br from-neon-400 to-neon-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <step.icon className="text-white h-8 w-8" />
                </motion.div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-neon-400 rounded-full flex items-center justify-center text-midnight-900 font-bold text-sm">
                  {step.number}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">{step.title}</h3>
              <p className="text-gray-300 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
