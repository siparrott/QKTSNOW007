import { Button } from "@/components/ui/button";
import { Rocket, Play, CheckCircle, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Typewriter } from "@/components/ui/typewriter";

export default function Hero() {
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
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-neon-500/10 rounded-full blur-3xl"
          animate={{
            y: [-20, 20, -20],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-neon-400/5 rounded-full blur-3xl"
          animate={{
            y: [20, -20, 20],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-neon-500/5 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-neon-400">💥 They Don't Want a Chat.</span>
            <br />
            <span className="text-white">
              <Typewriter text="They Want a Price." delay={1000} speed={120} />
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            You're losing leads to silence, second guesses, and service pages that don't convert. 
            But it's not your fault. Here's the real story...
          </motion.p>

          <motion.div
            className="flex flex-col gap-6 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              onClick={() => scrollToSection("pricing")}
              className="bg-neon-500 hover:bg-neon-600 text-white px-8 py-6 rounded-lg font-bold text-xl transition-all duration-300 hover:shadow-glow transform hover:scale-105 min-w-[400px] max-w-lg"
            >
              💥 Get Lifetime Access for Just €5/month
            </Button>
            <p className="text-sm text-gray-400 text-center max-w-md">
              Limited Launch Offer • Renews annually • Cancel anytime
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/niches">
                <Button
                  variant="outline"
                  className="border border-gray-600 hover:border-neon-400 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-transparent"
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  See All 56 Niches
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border border-gray-600 hover:border-neon-400 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-transparent"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="text-neon-400 h-5 w-5" />
              <span>No Coding Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-neon-400 h-5 w-5" />
              <span>5-Minute Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="text-neon-400 h-5 w-5" />
              <span>500+ Businesses</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
