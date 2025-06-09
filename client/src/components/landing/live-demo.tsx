import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function LiveDemo() {
  return (
    <section className="py-20 lg:py-32 bg-midnight-800/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              See QuoteKit <span className="text-neon-400">In Action</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Watch how our AI-powered calculators capture visitor information and generate instant quotes for your services.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <CheckCircle className="text-neon-400 mr-3 h-5 w-5" />
                <span className="text-gray-300">Instant quote generation</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-neon-400 mr-3 h-5 w-5" />
                <span className="text-gray-300">Automatic lead capture</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-neon-400 mr-3 h-5 w-5" />
                <span className="text-gray-300">Mobile-responsive design</span>
              </div>
            </div>

            <Link href="/calculator/wedding-photography">
              <Button className="bg-neon-500 hover:bg-neon-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-glow">
                <Play className="mr-2 h-5 w-5" />
                Try Live Demo
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Calculator Widget Mockup */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto relative">
              <div className="text-gray-800">
                <h3 className="text-2xl font-bold mb-4 text-center">Wedding Photography Quote</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neon-500 focus:border-transparent">
                      <option>Wedding Ceremony + Reception</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input type="range" className="w-full" min="4" max="12" defaultValue="8" />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>4 hours</span>
                      <span className="font-medium">8 hours</span>
                      <span>12 hours</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neon-500 focus:border-transparent"
                      defaultValue="100"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Estimated Price</div>
                    <div className="text-3xl font-bold text-neon-600">$2,850</div>
                  </div>
                </div>

                <button className="w-full mt-4 bg-neon-500 hover:bg-neon-600 text-white py-3 rounded-lg font-semibold transition-colors">
                  Get Detailed Quote
                </button>
              </div>

              {/* Floating Animation Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-neon-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-neon-300 rounded-full"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
