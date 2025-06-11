import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuoteKitHeader } from "@/components/calculator-header";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { TestAuth } from "@/components/test-auth";
import { 
  Settings, 
  BarChart3, 
  ExternalLink, 
  Copy, 
  Eye, 
  Calendar,
  CreditCard,
  Users,
  TrendingUp,
  Calculator,
  Mail,
  Globe,
  Plus,
  X,
  Search,
  Camera,
  Home,
  Wrench,
  Zap,
  Stethoscope,
  Heart,
  Car,
  Code,
  GraduationCap,
  Truck,
  Briefcase,
  Scale,
  Scissors,
  Paintbrush,
  TreePine,
  Shield,
  Droplets,
  Video,
  Edit,
  Monitor,
  Palette,
  Dumbbell,
  Target,
  Building,
  Crown
} from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName: string;
  subscriptionStatus: string;
  quotesUsedThisMonth: number;
  quotesLimit: number;
}

interface UserCalculator {
  id: string;
  embedId: string;
  embedUrl: string;
  adminUrl: string;
  calculatorId: number;
  config: any;
  customBranding: any;
  isActive: boolean;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  

  // Demo data for preview - bypassing auth temporarily
  const [user] = useState<User>({
    id: "demo-123",
    email: "demo@quotekit.ai", 
    fullName: "Demo User",
    subscriptionStatus: "pro",
    quotesUsedThisMonth: 47,
    quotesLimit: 500
  });

  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // All available calculators
  const allCalculators = [
    // Photography & Creative (10 calculators)
    { id: 1, name: "Wedding Photography", icon: Camera, category: "Photography & Creative", slug: "wedding-photography" },
    { id: 2, name: "Boudoir Photography", icon: Heart, category: "Photography & Creative", slug: "boudoir-photography" },
    { id: 3, name: "Corporate Headshots", icon: Briefcase, category: "Photography & Creative", slug: "corporate-headshots" },
    { id: 4, name: "Drone/Aerial Photography", icon: Camera, category: "Photography & Creative", slug: "drone-photography" },
    { id: 5, name: "Event Videography", icon: Video, category: "Photography & Creative", slug: "event-videography" },
    { id: 6, name: "Real Estate Photography", icon: Home, category: "Photography & Creative", slug: "real-estate-photography" },
    { id: 7, name: "Food Photography", icon: Camera, category: "Photography & Creative", slug: "food-photography" },
    { id: 8, name: "Commercial Photography", icon: Camera, category: "Photography & Creative", slug: "commercial-photography" },
    { id: 9, name: "Portrait Photography", icon: Camera, category: "Photography & Creative", slug: "portrait-photography" },
    { id: 10, name: "Lifestyle Influencer", icon: Users, category: "Photography & Creative", slug: "lifestyle-influencer" },

    // Home & Construction (10 calculators)
    { id: 11, name: "Home Renovation", icon: Home, category: "Home & Construction", slug: "home-renovation" },
    { id: 12, name: "Landscaping", icon: TreePine, category: "Home & Construction", slug: "landscaping" },
    { id: 13, name: "Interior Design", icon: Palette, category: "Home & Construction", slug: "interior-design" },
    { id: 14, name: "Painting & Decorating", icon: Paintbrush, category: "Home & Construction", slug: "painting-decorating" },
    { id: 15, name: "Electrical Services", icon: Zap, category: "Home & Construction", slug: "electrical" },
    { id: 16, name: "Plumbing Services", icon: Wrench, category: "Home & Construction", slug: "plumbing" },
    { id: 17, name: "Roofing", icon: Home, category: "Home & Construction", slug: "roofing" },
    { id: 18, name: "Solar Panel Installation", icon: Zap, category: "Home & Construction", slug: "solar" },
    { id: 19, name: "Pest Control", icon: Shield, category: "Home & Construction", slug: "pest-control" },
    { id: 20, name: "Window & Door Installation", icon: Home, category: "Home & Construction", slug: "window-door" },

    // Beauty & Wellness (8 calculators)
    { id: 21, name: "Makeup Artist", icon: Palette, category: "Beauty & Wellness", slug: "makeup-artist" },
    { id: 22, name: "Hair Stylist", icon: Scissors, category: "Beauty & Wellness", slug: "hair-stylist" },
    { id: 23, name: "Tattoo Artist", icon: Palette, category: "Beauty & Wellness", slug: "tattoo-artist" },
    { id: 24, name: "Massage Therapy", icon: Heart, category: "Beauty & Wellness", slug: "massage-therapy" },
    { id: 25, name: "Personal Trainer", icon: Dumbbell, category: "Beauty & Wellness", slug: "personal-training" },
    { id: 26, name: "Nutritionist", icon: Heart, category: "Beauty & Wellness", slug: "nutritionist" },
    { id: 27, name: "Life Coach", icon: Target, category: "Beauty & Wellness", slug: "life-coach" },
    { id: 28, name: "Hypnotherapist", icon: Heart, category: "Beauty & Wellness", slug: "hypnotherapist" },

    // Education & Training (3 calculators)
    { id: 29, name: "Private Tutor", icon: GraduationCap, category: "Education & Training", slug: "private-tutor" },
    { id: 30, name: "Private Schools", icon: GraduationCap, category: "Education & Training", slug: "private-school" },
    { id: 31, name: "Driving Instructor", icon: Car, category: "Education & Training", slug: "driving-instructor" },

    // Healthcare & Medical (5 calculators)
    { id: 32, name: "Dentist & Implant Clinics", icon: Stethoscope, category: "Healthcare & Medical", slug: "dentist" },
    { id: 33, name: "Private Medical Clinics", icon: Stethoscope, category: "Healthcare & Medical", slug: "private-medical" },
    { id: 34, name: "Plastic Surgery", icon: Stethoscope, category: "Healthcare & Medical", slug: "plastic-surgery" },
    { id: 35, name: "Childcare Practitioners", icon: Heart, category: "Healthcare & Medical", slug: "childcare" },
    { id: 36, name: "Childcare Services", icon: Heart, category: "Healthcare & Medical", slug: "childcare-services" },

    // Pet Services (1 calculator)
    { id: 37, name: "Dog Trainer", icon: Heart, category: "Pet Services", slug: "dog-trainer" },

    // Automotive & Transportation (9 calculators)
    { id: 38, name: "Car Detailing", icon: Car, category: "Automotive & Transportation", slug: "car-detailing" },
    { id: 39, name: "Auto Mechanic", icon: Wrench, category: "Automotive & Transportation", slug: "auto-mechanic" },
    { id: 40, name: "Mobile Car Wash", icon: Droplets, category: "Automotive & Transportation", slug: "mobile-car-wash" },
    { id: 41, name: "Moving Services", icon: Truck, category: "Automotive & Transportation", slug: "moving-services" },
    { id: 42, name: "Chauffeur/Limo Services", icon: Car, category: "Automotive & Transportation", slug: "chauffeur-limo" },
    { id: 43, name: "Airport Transfers", icon: Car, category: "Automotive & Transportation", slug: "airport-transfer" },
    { id: 44, name: "Van Rentals", icon: Truck, category: "Automotive & Transportation", slug: "van-rental" },
    { id: 45, name: "Boat Charters", icon: Truck, category: "Automotive & Transportation", slug: "boat-charter" },
    { id: 46, name: "Motorcycle Repair", icon: Wrench, category: "Automotive & Transportation", slug: "motorcycle-repair" },

    // Business & Digital Services (11 calculators)
    { id: 47, name: "Web Designer", icon: Code, category: "Business & Digital Services", slug: "web-designer" },
    { id: 48, name: "Marketing Consultant", icon: BarChart3, category: "Business & Digital Services", slug: "marketing-consultant" },
    { id: 49, name: "SEO Agency", icon: TrendingUp, category: "Business & Digital Services", slug: "seo-agency" },
    { id: 50, name: "Video Editor", icon: Video, category: "Business & Digital Services", slug: "video-editor" },
    { id: 51, name: "Copywriter", icon: Edit, category: "Business & Digital Services", slug: "copywriter" },
    { id: 52, name: "Virtual Assistant", icon: Users, category: "Business & Digital Services", slug: "virtual-assistant" },
    { id: 53, name: "Business Coach", icon: Briefcase, category: "Business & Digital Services", slug: "business-coach" },
    { id: 54, name: "Legal Advisor", icon: Scale, category: "Business & Digital Services", slug: "legal-advisor" },
    { id: 55, name: "Tax Preparer", icon: Calculator, category: "Business & Digital Services", slug: "tax-preparer" },
    { id: 56, name: "Translation Services", icon: Globe, category: "Business & Digital Services", slug: "translation-services" },
    { id: 57, name: "Cleaning Services", icon: Home, category: "Business & Digital Services", slug: "cleaning-services" }
  ];

  const categories = ["All", ...Array.from(new Set(allCalculators.map(calc => calc.category)))];
  
  const filteredCalculators = allCalculators.filter(calc => {
    const matchesSearch = calc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || calc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const demoCalculators: UserCalculator[] = [
    {
      id: "calc-1",
      embedId: "qk-wedding-photo",
      embedUrl: "https://quotekit.ai/embed/qk-wedding-photo",
      adminUrl: "https://quotekit.ai/admin/qk-wedding-photo", 
      calculatorId: 1,
      config: { primaryColor: "#10b981" },
      customBranding: { companyName: "Elite Photography" },
      isActive: true
    },
    {
      id: "calc-2",
      embedId: "qk-home-reno", 
      embedUrl: "https://quotekit.ai/embed/qk-home-reno",
      adminUrl: "https://quotekit.ai/admin/qk-home-reno",
      calculatorId: 2,
      config: { primaryColor: "#3b82f6" },
      customBranding: { companyName: "Premier Renovations" },
      isActive: true
    }
  ];

  useEffect(() => {
    // Demo mode for dashboard preview
    console.log('Dashboard loaded in demo mode');
  }, []);

  // Use demo data for preview
  const userCalculators = demoCalculators;
  const calculatorsLoading = false;
  
  const subscriptionPlans = {
    free: { name: "Free", quotesLimit: 5, price: 0 },
    pro: { name: "Pro", quotesLimit: 500, price: 5 },
    business: { name: "Business", quotesLimit: 2000, price: 35 },
    enterprise: { name: "Enterprise", quotesLimit: 10000, price: 95 }
  };

  const copyEmbedCode = (embedUrl: string) => {
    const embedCode = `<iframe src="${embedUrl}" width="100%" height="600px" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed code copied!",
      description: "Paste this code on your website to add the calculator.",
    });
  };

  const previewCalculator = (calc: UserCalculator) => {
    // Open calculator preview in new tab
    const previewUrl = `/wedding-photography-calculator`; // Route to actual calculator
    window.open(previewUrl, '_blank');
  };

  const customizeCalculator = (calc: UserCalculator) => {
    toast({
      title: "Customization Panel",
      description: "Calculator customization interface will open here.",
    });
  };

  const createNewCalculator = () => {
    setShowCalculatorModal(true);
  };

  const addCalculatorMutation = useMutation({
    mutationFn: async (calculator: any) => {
      // In demo mode, just add to local state
      return {
        id: `calc-${Date.now()}`,
        embedId: `qk-${calculator.slug}`,
        embedUrl: `https://quotekit.ai/embed/qk-${calculator.slug}`,
        adminUrl: `https://quotekit.ai/admin/qk-${calculator.slug}`,
        calculatorId: calculator.id,
        config: { primaryColor: "#10b981" },
        customBranding: { companyName: "Your Business" },
        isActive: true
      };
    },
    onSuccess: (newCalculator) => {
      toast({
        title: "Calculator Added!",
        description: `${newCalculator.embedId} has been added to your dashboard.`,
      });
      setShowCalculatorModal(false);
      // In a real app, invalidate the calculators query
      // queryClient.invalidateQueries({ queryKey: ['/api/user-calculators'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add calculator. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAddCalculator = (calculator: any) => {
    addCalculatorMutation.mutate(calculator);
  };

  const handleUpgrade = async (planId: string) => {
    try {
      const response = await apiRequest('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          calculatorSlug: 'wedding-photography'
        }),
      });

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (error: any) {
      toast({
        title: "Upgrade failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  const quotesPercentage = Math.round((user.quotesUsedThisMonth / user.quotesLimit) * 100);
  const currentPlan = subscriptionPlans?.[user.subscriptionStatus];

  return (
    <div className="min-h-screen bg-midnight-900">
      <QuoteKitHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Test Auth Component - Remove after testing */}
        <TestAuth />
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.fullName?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-400">
            Manage your quote calculators and track your business growth
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-midnight-800 border-midnight-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Quotes This Month</p>
                    <p className="text-2xl font-bold text-white">
                      {user.quotesUsedThisMonth}/{user.quotesLimit}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-neon-400" />
                </div>
                <Progress value={quotesPercentage} className="mt-3" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-midnight-800 border-midnight-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Calculators</p>
                    <p className="text-2xl font-bold text-white">
                      {userCalculators?.length || 0}
                    </p>
                  </div>
                  <Calculator className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-midnight-800 border-midnight-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Current Plan</p>
                    <p className="text-2xl font-bold text-white capitalize">
                      {user.subscriptionStatus}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-midnight-800 border-midnight-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Leads</p>
                    <p className="text-2xl font-bold text-white">0</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Your Calculators */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="bg-midnight-800 border-midnight-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Your Calculators
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={createNewCalculator}
                      className="border-midnight-600 text-gray-300 hover:bg-midnight-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage and customize your quote calculators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {calculatorsLoading ? (
                    <div className="text-center py-8 text-gray-400">Loading calculators...</div>
                  ) : userCalculators?.length > 0 ? (
                    <div className="space-y-4">
                      {userCalculators.map((calc: UserCalculator) => (
                        <div key={calc.id} className="bg-midnight-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-white">Calculator #{calc.calculatorId}</h3>
                            <Badge variant={calc.isActive ? "default" : "secondary"}>
                              {calc.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => previewCalculator(calc)}
                              className="border-midnight-600 text-gray-300 hover:bg-midnight-600"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => customizeCalculator(calc)}
                              className="border-midnight-600 text-gray-300 hover:bg-midnight-600"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Customize
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyEmbedCode(calc.embedUrl)}
                              className="border-midnight-600 text-gray-300 hover:bg-midnight-600"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Embed Code
                            </Button>
                          </div>
                          
                          <p className="text-sm text-gray-400">
                            Embed ID: {calc.embedId}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calculator className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No calculators yet</p>
                      <Button 
                        onClick={createNewCalculator}
                        className="bg-neon-500 hover:bg-neon-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Calculator
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="bg-midnight-800 border-midnight-700">
                <CardHeader>
                  <CardTitle className="text-white">Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <Badge variant="outline" className="text-lg px-3 py-1 capitalize">
                      {user.subscriptionStatus} Plan
                    </Badge>
                  </div>
                  
                  {currentPlan && (
                    <div className="text-center mb-4">
                      <p className="text-gray-400 text-sm">Monthly Price</p>
                      <p className="text-2xl font-bold text-white">
                        €{currentPlan.price}/mo
                      </p>
                    </div>
                  )}

                  {user.subscriptionStatus === 'free' ? (
                    <Button 
                      onClick={() => handleUpgrade('starter')}
                      className="w-full bg-neon-500 hover:bg-neon-600 text-white"
                    >
                      Upgrade to Starter
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full border-midnight-600 text-gray-300">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Billing
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="bg-midnight-800 border-midnight-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/features">
                    <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Features
                    </Button>
                  </Link>
                  
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                    <Globe className="h-4 w-4 mr-2" />
                    Knowledge Base
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}