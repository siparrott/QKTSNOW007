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
import { getCurrentUser, getCurrentSession, logout } from "@/lib/supabase";
import type { CalculatorTemplate, UserCalculator as SupabaseUserCalculator } from "@shared/supabase";
import { 
  Settings, 
  BarChart3, 
  ExternalLink, 
  Copy, 
  Eye, 
  Calendar,
  Calculator,
  CreditCard,
  Users,
  TrendingUp,
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
  Code2,
  Plane
} from "lucide-react";

// Default calculator configuration
const defaultConfig = {
  text: {
    headline: "Get Your Quote",
    subheading: "Tell us about your project requirements",
    ctaText: "Get Quote",
    thankYouMessage: "Thank you for your request! We'll be in touch soon.",
    footerText: "Powered by QuoteKits"
  },
  branding: {
    primaryColor: "#38bdf8",
    accentColor: "#facc15",
    backgroundColor: "#0f172a",
    textColor: "#ffffff",
    logoUrl: ""
  },
  questions: [
    {
      id: "project-type",
      label: "What type of project do you need?",
      type: "dropdown",
      required: true,
      options: ["Standard", "Premium", "Enterprise"]
    }
  ]
};

interface UserCalculator {
  id: string;
  name: string;
  slug: string;
  embed_url: string;
  admin_url: string;
  calculator_id: number;
  config: any;
  custom_branding: any;
  is_active: boolean;
  template_id: string;
  layout_json: any;
  logic_json: any;
  style_json: any;
  prompt_md: string;
  created_at: string;
  last_updated: string;
}

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // ALL STATE DECLARATIONS AT TOP LEVEL
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState<any>(null);
  const [customConfig, setCustomConfig] = useState<any>(null);
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ALL HOOKS AT TOP LEVEL BEFORE ANY CONDITIONAL LOGIC
  // Helper function to generate UUID for temporary users (matching backend logic)
  const generateUuidForTempUser = (tempUserId: string): string => {
    let hash = 0;
    for (let i = 0; i < tempUserId.length; i++) {
      const char = tempUserId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to positive number and pad with zeros
    const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
    // Use deterministic suffix based on the hash instead of random
    const deterministicSuffix = Math.abs(hash * 31).toString(16).padStart(8, '0');
    
    // Format as UUID v4
    return [
      hashStr.substring(0, 8),
      hashStr.substring(0, 4),
      '4' + hashStr.substring(1, 4),
      '8' + deterministicSuffix.substring(0, 3),
      deterministicSuffix + hashStr.substring(4, 8)
    ].join('-');
  };

  const getActualUserId = (userId: string): string => {
    if (userId?.startsWith('temp_')) {
      return generateUuidForTempUser(userId);
    }
    return userId;
  };

  const { data: userCalculators = [], isLoading: isLoadingCalculators } = useQuery<UserCalculator[]>({
    queryKey: ['/api/supabase/user-calculators', currentUser?.id],
    queryFn: async () => {
      const response = await fetch(`/api/supabase/user-calculators/${getActualUserId(currentUser?.id)}`);
      return response.json();
    },
    enabled: !!currentUser?.id
  });

  const { data: calculatorTemplates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['/api/supabase/templates']
  });

  const cloneCalculatorMutation = useMutation({
    mutationFn: async ({ templateId }: { templateId: string }) => {
      return apiRequest('/api/supabase/clone-calculator', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: currentUser?.id, 
          templateId 
        })
      });
    },
    onSuccess: (data) => {
      // Invalidate both the original user ID and the converted UUID
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/user-calculators'] });
      toast({
        title: "Calculator Cloned",
        description: "Your new calculator has been created successfully.",
      });
      setShowCalculatorModal(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clone calculator. Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveCustomizationMutation = useMutation({
    mutationFn: async ({ calculatorId, config }: { calculatorId: string, config: any }) => {
      return apiRequest('/api/supabase/update-calculator-config', {
        method: 'POST',
        body: JSON.stringify({ 
          calculatorId,
          config,
          userId: currentUser?.id
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/user-calculators'] });
      toast({
        title: "Customization Saved",
        description: "Your calculator customization has been saved successfully.",
      });
      setShowCustomizeModal(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save customization. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSaveCustomization = () => {
    if (selectedCalculator && customConfig) {
      saveCustomizationMutation.mutate({
        calculatorId: selectedCalculator.id,
        config: customConfig
      });
    }
  };

  // Send config updates to iframe when customConfig changes
  useEffect(() => {
    if (iframeRef && customConfig && showCustomizeModal) {
      iframeRef.contentWindow?.postMessage({
        type: 'APPLY_CONFIG',
        config: customConfig
      }, '*');
    }
  }, [customConfig, iframeRef, showCustomizeModal]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await getCurrentUser();
        const { session } = await getCurrentSession();
        
        if (user && session) {
          setCurrentUser(user);
          setIsLoading(false);
          return;
        }
        
        const storedUser = localStorage.getItem('user');
        const storedSession = localStorage.getItem('supabase_session');
        
        if (storedUser && storedSession) {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
          setIsLoading(false);
          return;
        }
        
        setLocation('/login');
      } catch (error) {
        console.error('Auth check failed:', error);
        setLocation('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [setLocation]);

  // Early returns after all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  // Icon mapping for calculator categories
  const getCalculatorIcon = (slug: string) => {
    const iconMap: { [key: string]: any } = {
      'wedding-photography': <Camera className="h-5 w-5 text-white" />,
      'boudoir-photography': <Camera className="h-5 w-5 text-white" />,
      'real-estate-photography': <Home className="h-5 w-5 text-white" />,
      'drone-photography': <Plane className="h-5 w-5 text-white" />,
      'event-videography': <Video className="h-5 w-5 text-white" />,
      'electrician-services': <Zap className="h-5 w-5 text-white" />,
      'home-renovation': <Home className="h-5 w-5 text-white" />,
      'plumbing-services': <Wrench className="h-5 w-5 text-white" />
    };
    return iconMap[slug] || <Calculator className="h-5 w-5 text-white" />;
  };

  // Transform fetched calculator templates to display format
  const allCalculators = (calculatorTemplates as CalculatorTemplate[] || []).map((template) => ({
    id: template.slug, // Use slug as ID for consistency
    name: template.name,
    category: template.category || "Professional",
    slug: template.slug,
    icon: getCalculatorIcon(template.slug),
    description: template.description || `Professional ${template.name.toLowerCase()} quote calculator`
  }));

  const categories = [
    { name: "All", count: allCalculators.length },
    { name: "Photography", count: allCalculators.filter((c: any) => c.category === "Photography").length },
    { name: "Home Services", count: allCalculators.filter((c: any) => c.category === "Home Services").length },
    { name: "Health & Wellness", count: allCalculators.filter((c: any) => c.category === "Health & Wellness").length },
    { name: "Transportation", count: allCalculators.filter((c: any) => c.category === "Transportation").length },
    { name: "Professional", count: allCalculators.filter((c: any) => c.category === "Professional").length },
    { name: "Technology", count: allCalculators.filter((c: any) => c.category === "Technology").length },
    { name: "Business", count: allCalculators.filter((c: any) => c.category === "Business").length },
    { name: "Education", count: allCalculators.filter((c: any) => c.category === "Education").length }
  ];

  const filteredCalculators = allCalculators.filter(calculator => {
    const matchesSearch = calculator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calculator.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || calculator.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentPlan = { name: "Free", price: 0 };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('user');
      localStorage.removeItem('supabase_session');
      setLocation('/');
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const customizeCalculator = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    setCustomConfig(calc.config || defaultConfig);
    setShowCustomizeModal(true);
  };

  const previewCalculator = (calc: UserCalculator) => {
    const calculatorType = allCalculators.find((c: any) => c.slug === calc.slug);
    
    if (calculatorType?.slug) {
      window.open(`/${calculatorType.slug}`, '_blank');
    } else {
      window.open(calc.embed_url, '_blank');
    }
  };

  const showEmbedCode = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    setShowEmbedModal(true);
  };

  const copyEmbedCode = async (calc: UserCalculator) => {
    const embedCode = `<iframe src="${calc.embed_url}" width="100%" height="600" frameborder="0" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`;
    
    try {
      await navigator.clipboard.writeText(embedCode);
      toast({
        title: "Embed Code Copied!",
        description: "The embed code has been copied to your clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Copy Failed", 
        description: "Please copy the embed code manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-midnight-900">
      <QuoteKitHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* User Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {currentUser?.email}</p>
            <p className="text-xs text-gray-500">User ID: {currentUser?.id}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-midnight-600 text-gray-300 hover:text-white"
          >
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Quotes</CardTitle>
              <BarChart3 className="h-4 w-4 text-neon-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-gray-400">of 100 this month</p>
              <Progress 
                value={0} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Calculators</CardTitle>
              <Calculator className="h-4 w-4 text-neon-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{userCalculators.length}</div>
              <p className="text-xs text-gray-400">calculators deployed</p>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-neon-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">87%</div>
              <p className="text-xs text-gray-400">visitors to quotes</p>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Plan</CardTitle>
              <CreditCard className="h-4 w-4 text-neon-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentPlan.name}</div>
              <p className="text-xs text-gray-400">€{currentPlan.price}/month</p>
            </CardContent>
          </Card>
        </div>

        {/* Calculators List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Your Calculators</h2>
            <Button
              onClick={() => setShowCalculatorModal(true)}
              className="bg-neon-500 hover:bg-neon-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Calculator
            </Button>
          </div>

          <div className="grid gap-4">
            {userCalculators.map((calc: UserCalculator) => (
              <Card key={calc.id} className="bg-midnight-800 border-midnight-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-neon-500 rounded-lg flex items-center justify-center">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {allCalculators.find((c: any) => c.slug === calc.slug)?.name || calc.name || "Calculator"}
                        </h3>
                        <p className="text-gray-400">
                          {allCalculators.find((c: any) => c.slug === calc.slug)?.description || "Custom quote calculator"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={calc.is_active ? "default" : "secondary"}>
                        {calc.is_active ? "Active" : "Inactive"}
                      </Badge>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => previewCalculator(calc)}
                        className="border-midnight-600 text-gray-300 hover:text-white"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => customizeCalculator(calc)}
                        className="border-midnight-600 text-gray-300 hover:text-white"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Customize
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => showEmbedCode(calc)}
                        className="border-midnight-600 text-gray-300 hover:text-white"
                      >
                        <Code2 className="h-4 w-4 mr-1" />
                        Embed
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Add Calculator Modal */}
        {showCalculatorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-midnight-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-midnight-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Choose Calculator Template</h2>
                  <button
                    onClick={() => setShowCalculatorModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Search and Filter */}
                <div className="mt-4 flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search calculators..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-midnight-700 border border-midnight-600 rounded-lg text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-midnight-700 border border-midnight-600 rounded-lg text-white"
                  >
                    {categories.map(category => (
                      <option key={category.name} value={category.name}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCalculators.map((calculator) => (
                    <Card key={calculator.id} className="bg-midnight-700 border-midnight-600 cursor-pointer hover:border-neon-500 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-neon-500 rounded-lg flex items-center justify-center">
                            {calculator.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-sm">{calculator.name}</h3>
                            <p className="text-xs text-gray-400">{calculator.category}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 mb-3">{calculator.description}</p>
                        <Button
                          onClick={() => cloneCalculatorMutation.mutate({ templateId: calculator.slug })}
                          disabled={cloneCalculatorMutation.isPending}
                          className="w-full bg-neon-500 hover:bg-neon-600 text-white text-sm"
                          size="sm"
                        >
                          {cloneCalculatorMutation.isPending ? "Adding..." : "Add Calculator"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Embed Code Modal */}
        {showEmbedModal && selectedCalculator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-midnight-800 rounded-lg w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">Embed Calculator</h2>
                  <button
                    onClick={() => setShowEmbedModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <p className="text-gray-300 mb-4">
                  Copy this code and paste it into your website where you want the calculator to appear:
                </p>
                
                <div className="bg-midnight-900 p-4 rounded-lg border border-midnight-600">
                  <code className="text-sm text-green-400 whitespace-pre-wrap break-all">
                    {`<iframe src="${selectedCalculator.embed_url}" width="100%" height="600" frameborder="0" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`}
                  </code>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={() => copyEmbedCode(selectedCalculator)}
                    className="bg-neon-500 hover:bg-neon-600 text-white"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                  
                  <Button
                    onClick={() => window.open(selectedCalculator.embed_url, '_blank')}
                    variant="outline"
                    className="border-midnight-600 text-gray-300 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customize Calculator Modal */}
        {showCustomizeModal && selectedCalculator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-midnight-800 rounded-lg w-full max-w-6xl h-[90vh] flex">
              {/* Left Panel - Customization Options */}
              <div className="w-1/3 border-r border-midnight-600 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Customize Calculator</h2>
                  <button
                    onClick={() => setShowCustomizeModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Brand Colors */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Brand Colors</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={customConfig.primaryColor || "#10b981"}
                            onChange={(e) => setCustomConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-12 h-12 rounded border border-midnight-600"
                          />
                          <input
                            type="text"
                            value={customConfig.primaryColor || "#10b981"}
                            onChange={(e) => setCustomConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="flex-1 px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Color</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={customConfig.secondaryColor || "#1f2937"}
                            onChange={(e) => setCustomConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="w-12 h-12 rounded border border-midnight-600"
                          />
                          <input
                            type="text"
                            value={customConfig.secondaryColor || "#1f2937"}
                            onChange={(e) => setCustomConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="flex-1 px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Typography</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Font Family</label>
                        <select
                          value={customConfig.fontFamily || "Inter"}
                          onChange={(e) => setCustomConfig(prev => ({ ...prev, fontFamily: e.target.value }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Times New Roman">Times New Roman</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Border Radius</label>
                        <select
                          value={customConfig.borderRadius || "8px"}
                          onChange={(e) => setCustomConfig(prev => ({ ...prev, borderRadius: e.target.value }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="0px">Sharp (0px)</option>
                          <option value="4px">Small (4px)</option>
                          <option value="8px">Medium (8px)</option>
                          <option value="12px">Large (12px)</option>
                          <option value="20px">Extra Large (20px)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Branding */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Company Branding</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                        <input
                          type="text"
                          value={customConfig.companyName || ""}
                          onChange={(e) => setCustomConfig(prev => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Enter your company name"
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Logo URL (optional)</label>
                        <input
                          type="url"
                          value={customConfig.logoUrl || ""}
                          onChange={(e) => setCustomConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
                          placeholder="https://example.com/logo.png"
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Contact Information</label>
                        <textarea
                          value={customConfig.contactInfo || ""}
                          onChange={(e) => setCustomConfig(prev => ({ ...prev, contactInfo: e.target.value }))}
                          placeholder="Phone, email, or website"
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white placeholder-gray-400 h-20 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Call-to-Action */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Call-to-Action</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Button Text</label>
                        <input
                          type="text"
                          value={customConfig.ctaText || "Get Quote"}
                          onChange={(e) => setCustomConfig(prev => ({ ...prev, ctaText: e.target.value }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Success Message</label>
                        <textarea
                          value={customConfig.successMessage || "Thanks! We'll send your quote shortly."}
                          onChange={(e) => setCustomConfig(prev => ({ ...prev, successMessage: e.target.value }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white h-20 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveCustomization}
                    disabled={saveCustomizationMutation.isPending}
                    className="w-full bg-neon-500 hover:bg-neon-600 text-white"
                  >
                    {saveCustomizationMutation.isPending ? "Saving..." : "Save Customization"}
                  </Button>
                </div>
              </div>

              {/* Right Panel - Live Preview */}
              <div className="flex-1 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Live Preview</h3>
                <div className="bg-white rounded-lg h-full overflow-hidden">
                  <iframe
                    ref={(iframe) => {
                      if (iframe && customConfig) {
                        iframe.onload = () => {
                          iframe.contentWindow?.postMessage({
                            type: 'APPLY_CONFIG',
                            config: customConfig
                          }, '*');
                        };
                      }
                    }}
                    src={selectedCalculator.embed_url}
                    className="w-full h-full border-0"
                    title="Calculator Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}