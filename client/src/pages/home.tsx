import Header from "@/components/landing/header";
import Hero from "@/components/landing/hero";
import HowItWorks from "@/components/landing/how-it-works";
import NichesGrid from "@/components/landing/niches-grid";
import LiveDemo from "@/components/landing/live-demo";
import Testimonials from "@/components/landing/testimonials";
import Pricing from "@/components/landing/pricing";
import Footer from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-midnight-900 text-white overflow-x-hidden">
      <Header />
      <Hero />
      <HowItWorks />
      <NichesGrid />
      <LiveDemo />
      <Testimonials />
      <Pricing />
      <Footer />
      
      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
        <Button className="w-full bg-neon-500 hover:bg-neon-600 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-glow">
          <Rocket className="mr-2 h-5 w-5" />
          Start Free Trial
        </Button>
      </div>
    </div>
  );
}
