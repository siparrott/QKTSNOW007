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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Helper function to get actual user ID for temp users
function getActualUserId(userId: string | undefined): string {
  if (!userId) return '';
  
  if (userId.startsWith('temp_')) {
    // Generate consistent UUID for temp users
    const hash = userId.replace('temp_', '');
    return [
      hash.substring(0, 8),
      hash.substring(8, 12),
      hash.substring(12, 16), 
      hash.substring(16, 20),
      hash.substring(20, 32)
    ].join('-');
  }
  
  return userId;
}
import { getCalculatorConfig, generateCustomizationFields } from "@/lib/calculator-config-parser";
import { 
  Settings, 
  ExternalLink, 
  Calendar,
  CreditCard,
  Globe,
  Home,
  Wrench,
  Zap,
  Stethoscope,
  Heart,
  Car,
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
  Monitor,
  Palette,
  Plane,
  Calculator,
  Users,
  TrendingUp,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Code,
  Copy,
  Search,
  X,
  Code2,
  Camera
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
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState<any>(null);
  const [customConfig, setCustomConfig] = useState<any>(null);

  // Debug customConfig changes
  useEffect(() => {
    console.log('customConfig changed:', customConfig);
    console.log('customConfig type:', typeof customConfig);
    console.log('customConfig is array:', Array.isArray(customConfig));
    if (customConfig && typeof customConfig === 'object' && Object.keys(customConfig).length > 100) {
      console.log('customConfig appears corrupted (too many keys)');
    }
  }, [customConfig]);
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [customizationTab, setCustomizationTab] = useState("branding");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSize, setLogoSize] = useState(100);
  const [savingConfig, setSavingConfig] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // Logo upload handler
  const handleLogoUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const logoDataUrl = e.target?.result as string;
      setLogoUrl(logoDataUrl);
      setCustomConfig((prev: any) => ({
        ...prev,
        companyBranding: { 
          ...prev.companyBranding, 
          logoUrl: logoDataUrl,
          logoSize: logoSize 
        }
      }));
    };
    reader.readAsDataURL(file);
  };

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

  const { data: analytics = { 
    totalVisits: 0, 
    totalConversions: 0, 
    conversionRate: 0, 
    totalQuotes: 0,
    chartData: [],
    calculatorPerformance: []
  } } = useQuery({
    queryKey: ['/api/supabase/analytics', currentUser?.id],
    queryFn: async () => {
      const response = await fetch(`/api/supabase/analytics/${getActualUserId(currentUser?.id)}`);
      return response.json();
    },
    enabled: !!currentUser?.id
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['/api/supabase/quotes', currentUser?.id],
    queryFn: async () => {
      const response = await fetch(`/api/supabase/quotes/${getActualUserId(currentUser?.id)}`);
      return response.json();
    },
    enabled: !!currentUser?.id
  });

  const cloneCalculatorMutation = useMutation({
    mutationFn: async ({ templateId }: { templateId: string }) => {
      return apiRequest('/api/supabase/clone-calculator', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: getActualUserId(currentUser?.id), 
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
          userId: getActualUserId(currentUser?.id)
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

  const addCalculatorMutation = useMutation({
    mutationFn: async ({ calculatorId, name }: { calculatorId: number, name: string }) => {
      return apiRequest('/api/supabase/clone-calculator', {
        method: 'POST',
        body: JSON.stringify({ 
          calculatorId,
          name,
          userId: currentUser?.id
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/user-calculators'] });
      toast({
        title: "Calculator Added",
        description: "Your new calculator has been added successfully.",
      });
      setShowCalculatorModal(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add calculator. Please try again.",
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

  const saveConfiguration = () => {
    handleSaveCustomization();
  };

  const sendConfigToIframe = () => {
    if (iframeRef && customConfig) {
      try {
        // Ensure we're sending a proper object, not a corrupted string array
        const configToSend = typeof customConfig === 'string' ? JSON.parse(customConfig) : customConfig;
        console.log('Sending config to iframe (manual refresh):', configToSend);
        iframeRef.contentWindow?.postMessage({
          type: 'APPLY_CONFIG',
          config: configToSend
        }, '*');
      } catch (error) {
        console.error('Error in sendConfigToIframe:', error);
      }
    }
  };

  const addCalculator = (calc: any) => {
    addCalculatorMutation.mutate({
      calculatorId: calc.id,
      name: calc.name
    });
  };

  // Send config updates to iframe when customConfig changes
  useEffect(() => {
    if (iframeRef && customConfig && showCustomizeModal) {
      const sendConfig = () => {
        try {
          // Ensure we're sending a proper object, not a corrupted string array
          const configToSend = typeof customConfig === 'string' ? JSON.parse(customConfig) : customConfig;
          console.log('Sending config to iframe:', configToSend);
          iframeRef.contentWindow?.postMessage({
            type: 'APPLY_CONFIG',
            config: configToSend,
            timestamp: Date.now()
          }, '*');
        } catch (error) {
          console.error('Error sending config to iframe:', error);
        }
      };

      // Send immediately and then with delay to ensure iframe is loaded
      sendConfig();
      setTimeout(sendConfig, 500);
      setTimeout(sendConfig, 1000);
    }
  }, [customConfig, iframeRef, showCustomizeModal]);

  // Auto-refresh preview when config changes
  useEffect(() => {
    const handleCustomConfigChange = () => {
      if (showCustomizeModal && customConfig) {
        sendConfigToIframe();
      }
    };

    const debounceTimer = setTimeout(handleCustomConfigChange, 300);
    return () => clearTimeout(debounceTimer);
  }, [customConfig]);

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

  // Default configuration for customization
  const defaultConfig = {
    primaryColor: "#10b981",
    secondaryColor: "#1f2937",
    accentColor: "#f59e0b",
    fontFamily: "Inter",
    borderRadius: "8px",
    companyName: "",
    logoUrl: "",
    contactInfo: "",
    ctaText: "Get Quote",
    successMessage: "Thanks! We'll send your quote shortly.",
    brandColors: {
      primary: "#10b981",
      secondary: "#1f2937",
      accent: "#f59e0b"
    },
    companyBranding: {
      companyName: "",
      logoUrl: "",
      contactInfo: ""
    },
    callToAction: {
      buttonText: "Get Quote",
      successMessage: "Thanks! We'll send your quote shortly."
    },
    styling: {
      fontFamily: "Inter",
      borderRadius: "8px",
      colorScheme: "modern"
    }
  };

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
    
    // Get the calculator's specific configuration
    const calculatorConfig = getCalculatorConfig(calc.slug);
    const customizationFields = calculatorConfig ? generateCustomizationFields(calculatorConfig) : null;
    
    // Merge existing config with default values and calculator-specific fields
    const mergedConfig = {
      ...defaultConfig,
      ...(calc.config || {}),
      brandColors: {
        ...defaultConfig.brandColors,
        ...(calc.config?.brandColors || {})
      },
      companyBranding: {
        ...defaultConfig.companyBranding,
        ...(calc.config?.companyBranding || {})
      }
    };

    // Add calculator-specific configuration
    if (customizationFields) {
      mergedConfig.calculatorConfig = calculatorConfig;
      mergedConfig.customizationFields = customizationFields;
      
      // Initialize field values from calculator configuration
      customizationFields.fields.forEach(field => {
        if (field.defaultValue !== undefined && !mergedConfig[field.id]) {
          mergedConfig[field.id] = field.defaultValue;
        }
      });
    }

    console.log('Setting custom config:', mergedConfig);
    console.log('Type of mergedConfig:', typeof mergedConfig);
    setCustomConfig(mergedConfig);
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

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-midnight-700">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "overview"
                ? "text-neon-500 border-b-2 border-neon-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "analytics"
                ? "text-neon-500 border-b-2 border-neon-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("quotes")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "quotes"
                ? "text-neon-500 border-b-2 border-neon-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Client Quotes
          </button>
          <button
            onClick={() => setActiveTab("calculators")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "calculators"
                ? "text-neon-500 border-b-2 border-neon-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Calculators
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-midnight-800 border-midnight-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Visits</CardTitle>
                  <Users className="h-4 w-4 text-neon-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics.totalVisits}</div>
                  <p className="text-xs text-gray-400">last 30 days</p>
                </CardContent>
              </Card>

              <Card className="bg-midnight-800 border-midnight-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Quotes</CardTitle>
                  <BarChart3 className="h-4 w-4 text-neon-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics.totalQuotes}</div>
                  <p className="text-xs text-gray-400">quotes generated</p>
                </CardContent>
              </Card>

              <Card className="bg-midnight-800 border-midnight-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-neon-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics.conversionRate}%</div>
                  <p className="text-xs text-gray-400">visitors to quotes</p>
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
            </div>

            {/* Weekly Performance Chart */}
            <Card className="bg-midnight-800 border-midnight-700">
              <CardHeader>
                <CardTitle className="text-white">Weekly Performance</CardTitle>
                <CardDescription className="text-gray-400">Visits, conversions, and quotes over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Line type="monotone" dataKey="visits" stroke="#06D6A0" strokeWidth={2} />
                      <Line type="monotone" dataKey="conversions" stroke="#118AB2" strokeWidth={2} />
                      <Line type="monotone" dataKey="quotes" stroke="#FFD166" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Calculator Performance Chart */}
            <Card className="bg-midnight-800 border-midnight-700">
              <CardHeader>
                <CardTitle className="text-white">Calculator Performance</CardTitle>
                <CardDescription className="text-gray-400">Individual calculator metrics and conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.calculatorPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="visits" fill="#06D6A0" />
                      <Bar dataKey="conversions" fill="#118AB2" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Table */}
            <Card className="bg-midnight-800 border-midnight-700">
              <CardHeader>
                <CardTitle className="text-white">Detailed Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-midnight-600">
                        <th className="pb-3 text-gray-300 font-medium">Calculator</th>
                        <th className="pb-3 text-gray-300 font-medium">Visits</th>
                        <th className="pb-3 text-gray-300 font-medium">Conversions</th>
                        <th className="pb-3 text-gray-300 font-medium">Conversion Rate</th>
                        <th className="pb-3 text-gray-300 font-medium">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.calculatorPerformance.map((calc, index) => (
                        <tr key={index} className="border-b border-midnight-700">
                          <td className="py-3 text-white">{calc.name}</td>
                          <td className="py-3 text-gray-300">{calc.visits}</td>
                          <td className="py-3 text-gray-300">{calc.conversions}</td>
                          <td className="py-3 text-gray-300">{calc.conversionRate}%</td>
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <Progress value={calc.conversionRate} className="w-20 h-2" />
                              <span className={`text-xs ${calc.conversionRate > 50 ? 'text-green-400' : calc.conversionRate > 25 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {calc.conversionRate > 50 ? 'Excellent' : calc.conversionRate > 25 ? 'Good' : 'Needs Improvement'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === "quotes" && (
          <div className="space-y-8">
            <Card className="bg-midnight-800 border-midnight-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Client Quotes & Leads</CardTitle>
                    <CardDescription className="text-gray-400">Manage your generated quotes and client contacts</CardDescription>
                  </div>
                  <Button className="bg-neon-500 hover:bg-neon-600">
                    Download CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-midnight-600">
                        <th className="pb-3 text-gray-300 font-medium">Client</th>
                        <th className="pb-3 text-gray-300 font-medium">Contact</th>
                        <th className="pb-3 text-gray-300 font-medium">Calculator</th>
                        <th className="pb-3 text-gray-300 font-medium">Quote Value</th>
                        <th className="pb-3 text-gray-300 font-medium">Status</th>
                        <th className="pb-3 text-gray-300 font-medium">Date</th>
                        <th className="pb-3 text-gray-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map((quote: any) => (
                        <tr key={quote.id} className="border-b border-midnight-700">
                          <td className="py-3">
                            <div>
                              <div className="text-white font-medium">{quote.clientName}</div>
                              <div className="text-gray-400 text-sm">{quote.clientEmail}</div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="space-y-1">
                              {quote.clientEmail && (
                                <div className="flex items-center space-x-1 text-gray-300 text-sm">
                                  <Mail className="h-3 w-3" />
                                  <span>{quote.clientEmail}</span>
                                </div>
                              )}
                              {quote.clientPhone && (
                                <div className="flex items-center space-x-1 text-gray-300 text-sm">
                                  <Phone className="h-3 w-3" />
                                  <span>{quote.clientPhone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-gray-300">{quote.calculatorName}</td>
                          <td className="py-3 text-white font-medium">{quote.estimatedValue}</td>
                          <td className="py-3">
                            <Badge variant={quote.status === 'new' ? 'default' : quote.status === 'contacted' ? 'secondary' : 'outline'}>
                              {quote.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-gray-300">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedQuote(quote);
                                setShowQuoteModal(true);
                              }}
                              className="border-midnight-600 text-gray-300 hover:text-white"
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calculators Tab */}
        {activeTab === "calculators" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
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
                          <Calculator className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {calc.name || "Calculator"}
                          </h3>
                          <p className="text-gray-400">
                            Custom quote calculator
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
                          <Edit className="h-4 w-4 mr-1" />
                          Customize
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => showEmbedCode(calc)}
                          className="border-midnight-600 text-gray-300 hover:text-white"
                        >
                          <Code className="h-4 w-4 mr-1" />
                          Embed
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

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
                          onClick={() => cloneCalculatorMutation.mutate({ templateId: calculator.id })}
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
            <div className="bg-midnight-800 rounded-lg w-full max-w-7xl h-[95vh] flex">
              {/* Left Panel - Customization Options */}
              <div className="w-2/5 border-r border-midnight-600 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Customize Calculator</h2>
                  <button
                    onClick={() => setShowCustomizeModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Customization Tabs */}
                <div className="flex space-x-1 mb-6 bg-midnight-900 p-1 rounded-lg">
                  {[
                    { id: 'branding', label: 'Branding', icon: Palette },
                    { id: 'pricing', label: 'Pricing', icon: CreditCard },
                    { id: 'content', label: 'Content', icon: Edit },
                    { id: 'services', label: 'Services', icon: Settings }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setCustomizationTab(tab.id)}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded text-sm font-medium transition-colors ${
                        customizationTab === tab.id
                          ? 'bg-neon-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-midnight-700'
                      }`}
                    >
                      <tab.icon className="h-4 w-4 mr-1" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-6">
                  {/* Branding Tab */}
                  {customizationTab === 'branding' && (
                    <>
                      {/* Logo Upload */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Logo & Branding</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Company Logo</label>
                            <div className="flex items-center space-x-4">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setLogoFile(file);
                                    handleLogoUpload(file);
                                  }
                                }}
                                className="hidden"
                                id="logo-upload"
                              />
                              <label
                                htmlFor="logo-upload"
                                className="px-4 py-2 bg-neon-500 hover:bg-neon-600 text-white rounded cursor-pointer flex items-center"
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Upload Logo
                              </label>
                              {logoUrl && (
                                <div className="flex items-center space-x-2">
                                  <img 
                                    src={logoUrl} 
                                    alt="Logo preview" 
                                    className="h-12 w-12 object-contain border border-midnight-600 rounded"
                                    style={{ width: `${logoSize}px`, height: 'auto' }}
                                  />
                                  <Button
                                    onClick={() => {
                                      setLogoUrl("");
                                      setCustomConfig((prev: any) => ({
                                        ...prev,
                                        companyBranding: { ...prev.companyBranding, logoUrl: "" }
                                      }));
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {logoUrl && (
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Logo Size (px)</label>
                              <input
                                type="range"
                                min="50"
                                max="300"
                                value={logoSize}
                                onChange={(e) => {
                                  const size = parseInt(e.target.value);
                                  setLogoSize(size);
                                  setCustomConfig((prev: any) => ({
                                    ...prev,
                                    companyBranding: { ...prev.companyBranding, logoSize: size }
                                  }));
                                }}
                                className="w-full"
                              />
                              <div className="text-xs text-gray-400 mt-1">{logoSize}px</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Brand Colors */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Brand Colors</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
                            <div className="flex items-center space-x-3">
                              <input
                                type="color"
                                value={customConfig?.brandColors?.primary || "#10b981"}
                                onChange={(e) => setCustomConfig((prev: any) => ({ 
                                  ...prev, 
                                  brandColors: { ...prev.brandColors, primary: e.target.value },
                                  primaryColor: e.target.value 
                                }))}
                                className="w-12 h-12 rounded border border-midnight-600"
                              />
                              <input
                                type="text"
                                value={customConfig?.brandColors?.primary || "#10b981"}
                                onChange={(e) => setCustomConfig((prev: any) => ({ 
                                  ...prev, 
                                  brandColors: { ...prev.brandColors, primary: e.target.value },
                                  primaryColor: e.target.value 
                                }))}
                                className="flex-1 px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Color</label>
                            <div className="flex items-center space-x-3">
                              <input
                                type="color"
                                value={customConfig?.brandColors?.secondary || "#1f2937"}
                                onChange={(e) => setCustomConfig((prev: any) => ({ 
                                  ...prev, 
                                  brandColors: { ...prev.brandColors, secondary: e.target.value },
                                  secondaryColor: e.target.value 
                                }))}
                                className="w-12 h-12 rounded border border-midnight-600"
                              />
                              <input
                                type="text"
                                value={customConfig?.brandColors?.secondary || "#1f2937"}
                                onChange={(e) => setCustomConfig((prev: any) => ({ 
                                  ...prev, 
                                  brandColors: { ...prev.brandColors, secondary: e.target.value },
                                  secondaryColor: e.target.value 
                                }))}
                                className="flex-1 px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
                            <div className="flex items-center space-x-3">
                              <input
                                type="color"
                                value={customConfig?.brandColors?.accent || "#f59e0b"}
                                onChange={(e) => setCustomConfig((prev: any) => ({ 
                                  ...prev, 
                                  brandColors: { ...prev.brandColors, accent: e.target.value },
                                  accentColor: e.target.value 
                                }))}
                                className="w-12 h-12 rounded border border-midnight-600"
                              />
                              <input
                                type="text"
                                value={customConfig?.brandColors?.accent || "#f59e0b"}
                                onChange={(e) => setCustomConfig((prev: any) => ({ 
                                  ...prev, 
                                  brandColors: { ...prev.brandColors, accent: e.target.value },
                                  accentColor: e.target.value 
                                }))}
                                className="flex-1 px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Company Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Company Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                            <input
                              type="text"
                              value={customConfig?.companyBranding?.companyName || ""}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                companyBranding: { ...prev.companyBranding, companyName: e.target.value },
                                companyName: e.target.value 
                              }))}
                              placeholder="Enter your company name"
                              className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white placeholder-gray-400"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Contact Information</label>
                            <textarea
                              value={customConfig?.companyBranding?.contactInfo || ""}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                companyBranding: { ...prev.companyBranding, contactInfo: e.target.value },
                                contactInfo: e.target.value 
                              }))}
                              placeholder="Phone, email, or website"
                              className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white placeholder-gray-400 h-20 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Pricing Tab */}
                  {customizationTab === 'pricing' && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Base Pricing Configuration</h3>
                        <div className="space-y-4">
                          <div className="bg-midnight-900 p-4 rounded-lg">
                            <h4 className="text-md font-medium text-white mb-3">Service Pricing</h4>
                            <div className="space-y-3">
                              {[
                                { id: 'basic', label: 'Basic Service', defaultPrice: 50 },
                                { id: 'standard', label: 'Standard Service', defaultPrice: 100 },
                                { id: 'premium', label: 'Premium Service', defaultPrice: 200 },
                                { id: 'enterprise', label: 'Enterprise Service', defaultPrice: 500 }
                              ].map((service) => (
                                <div key={service.id} className="flex items-center space-x-3">
                                  <label className="w-32 text-sm text-gray-300">{service.label}</label>
                                  <span className="text-gray-400">$</span>
                                  <input
                                    type="number"
                                    value={customConfig?.pricing?.[service.id] || service.defaultPrice}
                                    onChange={(e) => setCustomConfig((prev: any) => ({
                                      ...prev,
                                      pricing: { ...prev.pricing, [service.id]: parseInt(e.target.value) || 0 }
                                    }))}
                                    className="flex-1 px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                                    min="0"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-midnight-900 p-4 rounded-lg">
                            <h4 className="text-md font-medium text-white mb-3">Add-on Pricing</h4>
                            <div className="space-y-3">
                              {[
                                { id: 'rush', label: 'Rush Delivery', defaultPrice: 25 },
                                { id: 'consultation', label: 'Initial Consultation', defaultPrice: 75 },
                                { id: 'followup', label: 'Follow-up Support', defaultPrice: 40 },
                                { id: 'warranty', label: 'Extended Warranty', defaultPrice: 60 }
                              ].map((addon) => (
                                <div key={addon.id} className="flex items-center space-x-3">
                                  <label className="w-32 text-sm text-gray-300">{addon.label}</label>
                                  <span className="text-gray-400">$</span>
                                  <input
                                    type="number"
                                    value={customConfig?.addons?.[addon.id] || addon.defaultPrice}
                                    onChange={(e) => setCustomConfig((prev: any) => ({
                                      ...prev,
                                      addons: { ...prev.addons, [addon.id]: parseInt(e.target.value) || 0 }
                                    }))}
                                    className="flex-1 px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                                    min="0"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Content Tab */}
                  {customizationTab === 'content' && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Content Customization</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Calculator Title</label>
                            <input
                              type="text"
                              value={customConfig?.content?.title || "Quote Calculator"}
                              onChange={(e) => setCustomConfig((prev: any) => ({
                                ...prev,
                                content: { ...prev.content, title: e.target.value }
                              }))}
                              className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Welcome Message</label>
                            <textarea
                              value={customConfig?.content?.welcomeMessage || "Get an instant quote for your project"}
                              onChange={(e) => setCustomConfig((prev: any) => ({
                                ...prev,
                                content: { ...prev.content, welcomeMessage: e.target.value }
                              }))}
                              className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white h-20 resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Call-to-Action Button Text</label>
                            <input
                              type="text"
                              value={customConfig?.callToAction?.buttonText || "Get Quote"}
                              onChange={(e) => setCustomConfig((prev: any) => ({
                                ...prev,
                                callToAction: { ...prev.callToAction, buttonText: e.target.value },
                                ctaText: e.target.value
                              }))}
                              className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Success Message</label>
                            <textarea
                              value={customConfig?.callToAction?.successMessage || "Thanks! We'll send your quote shortly."}
                              onChange={(e) => setCustomConfig((prev: any) => ({
                                ...prev,
                                callToAction: { ...prev.callToAction, successMessage: e.target.value },
                                successMessage: e.target.value
                              }))}
                              className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white h-20 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Services Tab */}
                  {customizationTab === 'services' && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Services Configuration</h3>
                        
                        {customConfig?.customizationFields?.services?.length > 0 ? (
                          <div className="space-y-6">
                            {/* Service Type Configuration */}
                            {customConfig.customizationFields.services.map((field: any) => (
                              <div key={field.id} className="bg-midnight-900 p-4 rounded-lg">
                                <h4 className="text-md font-medium text-white mb-3">{field.label}</h4>
                                <p className="text-gray-400 text-sm mb-4">{field.description}</p>
                                
                                <div className="space-y-3">
                                  {field.options?.map((option: any, index: number) => (
                                    <div key={option.value} className="border border-midnight-600 p-3 rounded">
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs text-gray-400 mb-1">Option Label</label>
                                          <input
                                            type="text"
                                            value={customConfig?.fieldOverrides?.[field.id]?.[option.value]?.label || option.label}
                                            onChange={(e) => setCustomConfig((prev: any) => ({
                                              ...prev,
                                              fieldOverrides: {
                                                ...prev.fieldOverrides,
                                                [field.id]: {
                                                  ...prev.fieldOverrides?.[field.id],
                                                  [option.value]: { 
                                                    ...prev.fieldOverrides?.[field.id]?.[option.value], 
                                                    label: e.target.value 
                                                  }
                                                }
                                              }
                                            }))}
                                            className="w-full px-2 py-1 bg-midnight-700 border border-midnight-600 rounded text-white text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-400 mb-1">
                                            {option.price ? 'Price Per Unit' : option.percentage ? 'Percentage' : option.multiplier ? 'Multiplier' : 'Value'}
                                          </label>
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={customConfig?.fieldOverrides?.[field.id]?.[option.value]?.price || 
                                                   customConfig?.fieldOverrides?.[field.id]?.[option.value]?.percentage || 
                                                   customConfig?.fieldOverrides?.[field.id]?.[option.value]?.multiplier || 
                                                   option.price || option.percentage || option.multiplier || 0}
                                            onChange={(e) => {
                                              const valueKey = option.price ? 'price' : option.percentage ? 'percentage' : 'multiplier';
                                              setCustomConfig((prev: any) => ({
                                                ...prev,
                                                fieldOverrides: {
                                                  ...prev.fieldOverrides,
                                                  [field.id]: {
                                                    ...prev.fieldOverrides?.[field.id],
                                                    [option.value]: { 
                                                      ...prev.fieldOverrides?.[field.id]?.[option.value], 
                                                      [valueKey]: parseFloat(e.target.value) || 0
                                                    }
                                                  }
                                                }
                                              }));
                                            }}
                                            className="w-full px-2 py-1 bg-midnight-700 border border-midnight-600 rounded text-white text-sm"
                                          />
                                        </div>
                                      </div>
                                      {option.description && (
                                        <div className="mt-2">
                                          <label className="block text-xs text-gray-400 mb-1">Description</label>
                                          <textarea
                                            value={customConfig?.fieldOverrides?.[field.id]?.[option.value]?.description || option.description}
                                            onChange={(e) => setCustomConfig((prev: any) => ({
                                              ...prev,
                                              fieldOverrides: {
                                                ...prev.fieldOverrides,
                                                [field.id]: {
                                                  ...prev.fieldOverrides?.[field.id],
                                                  [option.value]: { 
                                                    ...prev.fieldOverrides?.[field.id]?.[option.value], 
                                                    description: e.target.value 
                                                  }
                                                }
                                              }
                                            }))}
                                            className="w-full px-2 py-1 bg-midnight-700 border border-midnight-600 rounded text-white text-sm h-16 resize-none"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            
                            {/* All Calculator Fields Configuration */}
                            <div className="bg-midnight-900 p-4 rounded-lg">
                              <h4 className="text-md font-medium text-white mb-3">All Calculator Fields</h4>
                              <div className="space-y-4">
                                {customConfig.customizationFields.fields.map((field: any) => (
                                  <div key={field.id} className="border border-midnight-600 p-3 rounded">
                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                      <div>
                                        <label className="block text-xs text-gray-400 mb-1">Field Label</label>
                                        <input
                                          type="text"
                                          value={customConfig?.fieldLabels?.[field.id] || field.label}
                                          onChange={(e) => setCustomConfig((prev: any) => ({
                                            ...prev,
                                            fieldLabels: {
                                              ...prev.fieldLabels,
                                              [field.id]: e.target.value
                                            }
                                          }))}
                                          className="w-full px-2 py-1 bg-midnight-700 border border-midnight-600 rounded text-white text-sm"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-400 mb-1">Field Type</label>
                                        <input
                                          type="text"
                                          value={field.type}
                                          disabled
                                          className="w-full px-2 py-1 bg-midnight-800 border border-midnight-600 rounded text-gray-500 text-sm"
                                        />
                                      </div>
                                    </div>
                                    {field.description && (
                                      <div>
                                        <label className="block text-xs text-gray-400 mb-1">Field Description</label>
                                        <textarea
                                          value={customConfig?.fieldDescriptions?.[field.id] || field.description}
                                          onChange={(e) => setCustomConfig((prev: any) => ({
                                            ...prev,
                                            fieldDescriptions: {
                                              ...prev.fieldDescriptions,
                                              [field.id]: e.target.value
                                            }
                                          }))}
                                          className="w-full px-2 py-1 bg-midnight-700 border border-midnight-600 rounded text-white text-sm h-12 resize-none"
                                        />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-midnight-900 p-4 rounded-lg">
                            <h4 className="text-md font-medium text-white mb-3">Translation Service Options</h4>
                            <p className="text-gray-400 text-sm mb-4">Customize the translation services offered by your calculator</p>
                            
                            <div className="space-y-3">
                              {[
                                { id: 'translation', label: 'Document Translation', price: 0.12, description: 'Professional document translation services' },
                                { id: 'proofreading', label: 'Proofreading', price: 0.06, description: 'Review and correct existing translations' },
                                { id: 'transcription', label: 'Transcription', price: 0.08, description: 'Audio/video to text conversion' },
                                { id: 'subtitling', label: 'Subtitling', price: 0.15, description: 'Video subtitle creation' },
                                { id: 'certified', label: 'Certified Translation', price: 0.18, description: 'Official certified document translation' }
                              ].map((service) => (
                                <div key={service.id} className="border border-midnight-600 p-3 rounded">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1">Service Name</label>
                                      <input
                                        type="text"
                                        value={customConfig?.translationServices?.[service.id]?.label || service.label}
                                        onChange={(e) => setCustomConfig((prev: any) => ({
                                          ...prev,
                                          translationServices: {
                                            ...prev.translationServices,
                                            [service.id]: { 
                                              ...prev.translationServices?.[service.id], 
                                              label: e.target.value 
                                            }
                                          }
                                        }))}
                                        className="w-full px-2 py-1 bg-midnight-700 border border-midnight-600 rounded text-white text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1">Price per Word</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={customConfig?.translationServices?.[service.id]?.price || service.price}
                                        onChange={(e) => setCustomConfig((prev: any) => ({
                                          ...prev,
                                          translationServices: {
                                            ...prev.translationServices,
                                            [service.id]: { 
                                              ...prev.translationServices?.[service.id], 
                                              price: parseFloat(e.target.value) || 0
                                            }
                                          }
                                        }))}
                                        className="w-full px-2 py-1 bg-midnight-700 border border-midnight-600 rounded text-white text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <label className="block text-xs text-gray-400 mb-1">Description</label>
                                    <textarea
                                      value={customConfig?.translationServices?.[service.id]?.description || service.description}
                                      onChange={(e) => setCustomConfig((prev: any) => ({
                                        ...prev,
                                        translationServices: {
                                          ...prev.translationServices,
                                          [service.id]: { 
                                            ...prev.translationServices?.[service.id], 
                                            description: e.target.value 
                                          }
                                        }
                                      }))}
                                      className="w-full px-2 py-1 bg-midnight-700 border border-midnight-600 rounded text-white text-sm h-12 resize-none"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Legacy Services (for fallback) */}
                  {customizationTab === 'legacy-services' && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Service Configuration</h3>
                        <div className="space-y-4">
                          <div className="bg-midnight-900 p-4 rounded-lg">
                            <h4 className="text-md font-medium text-white mb-3">Available Services</h4>
                            <div className="space-y-3">
                              {[
                                { id: 'service1', defaultName: 'Basic Package', category: 'Standard' },
                                { id: 'service2', defaultName: 'Professional Package', category: 'Premium' },
                                { id: 'service3', defaultName: 'Enterprise Package', category: 'Enterprise' },
                                { id: 'service4', defaultName: 'Custom Solution', category: 'Custom' }
                              ].map((service, index) => (
                                <div key={service.id} className="border border-midnight-600 p-3 rounded">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1">Service Name</label>
                                      <input
                                        type="text"
                                        value={customConfig?.services?.[service.id]?.name || service.defaultName}
                                        onChange={(e) => setCustomConfig((prev: any) => ({
                                          ...prev,
                                          services: {
                                            ...prev.services,
                                            [service.id]: { ...prev.services?.[service.id], name: e.target.value }
                                          }
                                        }))}
                                        className="w-full px-2 py-1 bg-midnight-700 border border-midnight-600 rounded text-white text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1">Category</label>
                                      <input
                                        type="text"
                                        value={customConfig?.services?.[service.id]?.category || service.category}
                                        onChange={(e) => setCustomConfig((prev: any) => ({
                                          ...prev,
                                          services: {
                                            ...prev.services,
                                            [service.id]: { ...prev.services?.[service.id], category: e.target.value }
                                          }
                                        }))}
                                        className="w-full px-2 py-1 bg-midnight-700 border border-midnight-600 rounded text-white text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <label className="block text-xs text-gray-400 mb-1">Description</label>
                                    <textarea
                                      value={customConfig?.services?.[service.id]?.description || `${service.defaultName} with comprehensive features`}
                                      onChange={(e) => setCustomConfig((prev: any) => ({
                                        ...prev,
                                        services: {
                                          ...prev.services,
                                          [service.id]: { ...prev.services?.[service.id], description: e.target.value }
                                        }
                                      }))}
                                      className="w-full px-2 py-1 bg-midnight-700 border border-midnight-600 rounded text-white text-sm h-16 resize-none"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Save Configuration Button */}
                <div className="mt-6 pt-6 border-t border-midnight-600">
                  <Button
                    onClick={saveConfiguration}
                    className="w-full bg-neon-500 hover:bg-neon-600 text-white"
                    disabled={savingConfig}
                  >
                    {savingConfig ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </div>
              </div>

              {/* Right Panel - Live Preview */}
              <div className="flex-1 p-6">
                <div className="h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Live Preview</h3>
                    <Button
                      onClick={() => {
                        if (iframeRef) {
                          sendConfigToIframe();
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="border-neon-500 text-neon-500 hover:bg-neon-500 hover:text-white"
                    >
                      Refresh Preview
                    </Button>
                  </div>
                  
                  <div className="h-[calc(100%-4rem)] bg-midnight-900 rounded-lg overflow-hidden">
                    <iframe
                      ref={setIframeRef}
                      src={selectedCalculator?.embed_url || `/${selectedCalculator?.slug || 'plastic-surgery-calculator'}`}
                      className="w-full h-full border-0"
                      title="Calculator Preview"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Calculator Modal */}
        {showCalculatorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-midnight-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Add New Calculator</h2>
                  <button
                    onClick={() => setShowCalculatorModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Calculator Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCalculators.map((calc) => (
                    <Card key={calc.id} className="bg-midnight-700 border-midnight-600 hover:border-neon-500 transition-colors cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-neon-500 rounded-lg group-hover:bg-neon-600 transition-colors">
                            {getCalculatorIcon(calc.category)}
                          </div>
                          <div>
                            <CardTitle className="text-white text-sm">{calc.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {calc.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 text-sm mb-4">{calc.description}</p>
                        <Button
                          onClick={() => addCalculator(calc)}
                          className="w-full bg-neon-500 hover:bg-neon-600 text-white"
                          disabled={addCalculatorMutation.isPending}
                        >
                          {addCalculatorMutation.isPending ? 'Adding...' : 'Add Calculator'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}