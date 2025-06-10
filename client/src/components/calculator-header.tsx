import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function QuoteKitHeader() {
  return (
    <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo */}
          <div className="flex items-center space-x-6">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-slate-900 font-bold text-lg">Q</span>
                </div>
                <span className="text-white font-bold text-xl">QuoteKit.ai</span>
              </div>
            </Link>
          </div>

          {/* Center - Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                Home
              </a>
            </Link>
            <Link href="/features">
              <a className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                Features
              </a>
            </Link>
            <Link href="/niches">
              <a className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                Niches
              </a>
            </Link>
            <Link href="/pricing">
              <a className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                Pricing
              </a>
            </Link>
            <Link href="/login">
              <a className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                Login
              </a>
            </Link>
          </div>

          {/* Right Side - CTA */}
          <div className="flex items-center space-x-3">
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
              onClick={() => {
                const element = document.getElementById('pricing-sidebar');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}