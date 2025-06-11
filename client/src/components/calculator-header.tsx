import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function QuoteKitHeader() {
  return (
    <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Company Name or Custom Branding */}
          <div className="flex items-center space-x-6">
            <div className="text-white text-lg font-semibold">
              {/* This will be replaced by custom company name when configured */}
              Quote Calculator
            </div>
          </div>

          {/* Right Side - Powered by link */}
          <div className="flex items-center space-x-3">
            <a 
              href="https://quotekits.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              Powered by QuoteKits.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}