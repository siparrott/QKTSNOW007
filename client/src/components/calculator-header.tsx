import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, Calculator, Zap } from "lucide-react";
import { Link } from "wouter";

interface CalculatorHeaderProps {
  title: string;
  subtitle: string;
  category: string;
  accentColor?: string;
}

export function CalculatorHeader({ 
  title, 
  subtitle, 
  category,
  accentColor = "blue" 
}: CalculatorHeaderProps) {
  const getAccentClasses = (color: string) => {
    switch (color) {
      case "green":
        return {
          badge: "bg-green-600 text-white",
          button: "bg-green-600 hover:bg-green-700 text-white",
          text: "text-green-700"
        };
      case "purple":
        return {
          badge: "bg-purple-600 text-white",
          button: "bg-purple-600 hover:bg-purple-700 text-white",
          text: "text-purple-700"
        };
      case "teal":
        return {
          badge: "bg-teal-600 text-white",
          button: "bg-teal-600 hover:bg-teal-700 text-white",
          text: "text-teal-700"
        };
      case "indigo":
        return {
          badge: "bg-indigo-600 text-white",
          button: "bg-indigo-600 hover:bg-indigo-700 text-white",
          text: "text-indigo-700"
        };
      case "rose":
        return {
          badge: "bg-rose-600 text-white",
          button: "bg-rose-600 hover:bg-rose-700 text-white",
          text: "text-rose-700"
        };
      case "amber":
        return {
          badge: "bg-amber-600 text-white",
          button: "bg-amber-600 hover:bg-amber-700 text-white",
          text: "text-amber-700"
        };
      case "slate":
        return {
          badge: "bg-slate-600 text-white",
          button: "bg-slate-600 hover:bg-slate-700 text-white",
          text: "text-slate-700"
        };
      default:
        return {
          badge: "bg-blue-600 text-white",
          button: "bg-blue-600 hover:bg-blue-700 text-white",
          text: "text-blue-700"
        };
    }
  };

  const colors = getAccentClasses(accentColor);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/niches">
              <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                <Calculator className="h-4 w-4 mr-2" />
                All Calculators
              </Button>
            </Link>
            <Badge variant="secondary" className={colors.badge}>
              {category}
            </Badge>
          </div>

          {/* Center - Title */}
          <div className="flex-1 text-center max-w-2xl mx-8">
            <h1 className="text-xl font-bold text-gray-800 truncate">
              {title}
            </h1>
            <p className="text-sm text-gray-600 truncate">
              {subtitle}
            </p>
          </div>

          {/* Right Side - CTA */}
          <div className="flex items-center space-x-3">
            <Button 
              size="sm" 
              className={`${colors.button} font-bold`}
              onClick={() => {
                const element = document.getElementById('pricing-sidebar');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Get Quote
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}