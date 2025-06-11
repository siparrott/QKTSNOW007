import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import logoPath from "@assets/ChatGPT Image Jun 11, 2025, 11_57_41 AM_1749637333080.png";

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
            <Link href="/" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Home
            </Link>
            <Link href="/features" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Features
            </Link>
            <Link href="/niches" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Niches
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Login
            </Link>
          </div>

          {/* Right Side - CTA */}
          <div className="flex items-center space-x-3">
            <Link href="/register">
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}