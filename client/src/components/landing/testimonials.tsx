import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Wedding Photographer",
      initials: "SJ",
      gradient: "from-pink-500 to-purple-600",
      text: "QuoteKit increased our conversion rate by 300%. Clients love getting instant quotes, and I love capturing leads 24/7.",
    },
    {
      name: "Mike Rodriguez",
      role: "Landscaping Services",
      initials: "MR",
      gradient: "from-blue-500 to-cyan-600",
      text: "Setup took 5 minutes. Now I get qualified leads every day without any extra work. Best investment I've made!",
    },
    {
      name: "Lisa Kim",
      role: "Personal Trainer",
      initials: "LK",
      gradient: "from-green-500 to-emerald-600",
      text: "The AI suggestions are spot-on for my fitness coaching packages. My clients are impressed with the professionalism.",
    },
  ];

  const stats = [
    { value: "300%", label: "Average Conversion Increase" },
    { value: "24/7", label: "Lead Generation" },
    { value: "5min", label: "Setup Time" },
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
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Trusted by <span className="text-neon-400">500+</span> Service Businesses
          </h2>
          <p className="text-xl text-gray-300">Join thousands of service professionals growing their business</p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              className="bg-midnight-800 rounded-xl p-6 hover:bg-midnight-700 transition-colors"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center mr-3`}
                >
                  <span className="text-white font-bold text-sm">{testimonial.initials}</span>
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid sm:grid-cols-3 gap-8 mt-16 pt-16 border-t border-midnight-700"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-neon-400 mb-2">{stat.value}</div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
