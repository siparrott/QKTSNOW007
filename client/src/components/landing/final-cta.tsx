import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function FinalCTA() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            💥 You've seen the DMs, ghosted leads, and price hagglers.
          </h2>
          <p className="text-2xl md:text-3xl text-neon-400 font-bold mb-8">
            This is your fix.
          </p>
          
          <div className="bg-midnight-800/50 border border-midnight-700 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-6">
              🙌 Who Is QuoteKit.ai For?
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-gray-300">
              <div className="flex items-center">
                <CheckCircle className="text-neon-400 mr-3 h-5 w-5" />
                <span>🔹 Freelancers</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-neon-400 mr-3 h-5 w-5" />
                <span>🔹 Agencies</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-neon-400 mr-3 h-5 w-5" />
                <span>🔹 Solopreneurs</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-neon-400 mr-3 h-5 w-5" />
                <span>🔹 Local service businesses</span>
              </div>
              <div className="flex items-center md:col-span-2 justify-center">
                <CheckCircle className="text-neon-400 mr-3 h-5 w-5" />
                <span>🔹 Anyone tired of quoting by hand</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xl text-white mb-4 font-semibold">
              👉 Lock in all 50+ calculators now for just €5/month
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-gray-300">
              <div className="flex items-center">
                <CheckCircle className="text-neon-400 mr-2 h-4 w-4" />
                <span>✅ No contracts</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-neon-400 mr-2 h-4 w-4" />
                <span>✅ Full access</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-neon-400 mr-2 h-4 w-4" />
                <span>✅ Cancel anytime</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => scrollToSection("pricing")}
            className="bg-neon-500 hover:bg-neon-600 text-white px-12 py-6 rounded-lg font-bold text-2xl transition-all duration-300 hover:shadow-glow transform hover:scale-105 animate-pulse"
          >
            Get QuoteKit.ai Now →
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            This is your unfair advantage.
          </p>
        </motion.div>
      </div>
    </section>
  );
}