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
  Utensils,
  Plane,
  Building2,
  PenTool,
  Megaphone,
  FileText,
  Languages,
  Sparkles,
  Baby,
  School,
  MapPin
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
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState<any>(null);
  const [customConfig, setCustomConfig] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Demo user data
  const demoUser: User = {
    id: "demo-user",
    email: "demo@example.com",
    fullName: "Demo User",
    subscriptionStatus: "pro",
    quotesUsedThisMonth: 15,
    quotesLimit: 100
  };

  const [demoCalculators, setDemoCalculators] = useState<UserCalculator[]>([
    {
      id: "wedding-calc-1",
      embedId: "embed-1234",
      embedUrl: "https://yoursite.com/calculator/embed-1234",
      adminUrl: "https://yoursite.com/calculator/admin/embed-1234",
      calculatorId: 1,
      config: {},
      customBranding: {},
      isActive: true
    }
  ]);

  const defaultConfig = {
    userId: "demo-user",
    calculatorId: "wedding-photography",
    instanceId: "",
    branding: {
      primaryColor: "#38bdf8",
      accentColor: "#facc15", 
      fontFamily: "Poppins",
      fontSize: "medium",
      roundedCorners: 12,
      logoUrl: "",
      logoSize: 48
    },
    appearance: {
      background: "gradient",
      darkMode: false,
      backgroundImage: "",
      theme: "modern",
      cardStyle: "elevated",
      layout: "stepped"
    },
    text: {
      headline: "Get Your Wedding Quote",
      subheading: "Tell us about your special day", 
      ctaText: "See My Price",
      thankYouMessage: "Thank you for your request!"
    },
    questions: [
      {
        id: "project-type",
        label: "What type of aerial project?",
        type: "dropdown",
        required: true,
        options: ["Real Estate Shoot", "Event Coverage", "Construction Site", "Agricultural Mapping", "Custom Job"]
      },
      {
        id: "duration",
        label: "How many hours of filming?",
        type: "number",
        required: true,
        min: 1,
        max: 12
      },
      {
        id: "location",
        label: "Project location",
        type: "text",
        required: true
      }
    ],
    functionality: {
      showEmailCapture: true,
      requireEmailConfirmation: false,
      showProgressBar: true,
      allowFileUploads: false,
      enableConditionalLogic: true
    }
  };

  const subscriptionPlans = {
    free: { name: "Free", quotesLimit: 10, price: 0 },
    pro: { name: "Pro", quotesLimit: 100, price: 5 },
    business: { name: "Business", quotesLimit: 500, price: 35 },
    enterprise: { name: "Enterprise", quotesLimit: 2000, price: 95 }
  };

  const currentPlan = subscriptionPlans[demoUser.subscriptionStatus as keyof typeof subscriptionPlans];

  const customizeCalculator = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    setCustomConfig(calc.config || defaultConfig);
    setShowCustomizeModal(true);
  };

  const previewCalculator = (calc: UserCalculator) => {
    window.open(calc.embedUrl, '_blank');
  };

  const resetToDefaults = () => {
    setCustomConfig(defaultConfig);
  };

  return (
    <div className="min-h-screen bg-midnight-900">
      <QuoteKitHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TestAuth />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Manage your calculators and track performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Quotes</CardTitle>
              <BarChart3 className="h-4 w-4 text-neon-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{demoUser.quotesUsedThisMonth}</div>
              <p className="text-xs text-gray-400">of {demoUser.quotesLimit} this month</p>
              <Progress 
                value={(demoUser.quotesUsedThisMonth / demoUser.quotesLimit) * 100} 
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
              <div className="text-2xl font-bold text-white">{demoCalculators.length}</div>
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
            {demoCalculators.map((calc: UserCalculator) => (
              <Card key={calc.id} className="bg-midnight-800 border-midnight-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-neon-500 rounded-lg flex items-center justify-center">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Wedding Photography Calculator</h3>
                        <p className="text-gray-400">Custom quote calculator for wedding photography services</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={calc.isActive ? "default" : "secondary"}>
                        {calc.isActive ? "Active" : "Inactive"}
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Customize Calculator Modal */}
        {showCustomizeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-midnight-800 rounded-lg w-full max-w-7xl h-[90vh] flex">
              {/* Settings Panel */}
              <div className="w-1/2 p-6 overflow-y-auto border-r border-midnight-700">
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
                  {/* Branding Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Branding
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-300 block mb-2">Primary Color</label>
                        <input
                          type="color"
                          value={customConfig?.branding?.primaryColor || "#38bdf8"}
                          onChange={(e) => setCustomConfig(prev => ({
                            ...prev,
                            branding: { ...prev.branding, primaryColor: e.target.value }
                          }))}
                          className="w-full h-10 rounded border-0 bg-transparent cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-300 block mb-2">Accent Color</label>
                        <input
                          type="color"
                          value={customConfig?.branding?.accentColor || "#facc15"}
                          onChange={(e) => setCustomConfig(prev => ({
                            ...prev,
                            branding: { ...prev.branding, accentColor: e.target.value }
                          }))}
                          className="w-full h-10 rounded border-0 bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 block mb-2">Logo Upload</label>
                      <div className="space-y-3">
                        {customConfig?.branding?.logoUrl ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={customConfig.branding.logoUrl} 
                                alt="Logo" 
                                className="object-contain bg-white rounded border"
                                style={{ 
                                  height: `${customConfig?.branding?.logoSize || 48}px`,
                                  width: 'auto',
                                  maxWidth: '120px'
                                }}
                              />
                              <button
                                onClick={() => setCustomConfig(prev => ({
                                  ...prev,
                                  branding: { ...prev.branding, logoUrl: "" }
                                }))}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                Remove
                              </button>
                            </div>
                            
                            <div>
                              <label className="text-xs text-gray-400 block mb-2">
                                Logo Size: {customConfig?.branding?.logoSize || 48}px
                              </label>
                              <input
                                type="range"
                                min="24"
                                max="120"
                                step="4"
                                value={customConfig?.branding?.logoSize || 48}
                                onChange={(e) => setCustomConfig(prev => ({
                                  ...prev,
                                  branding: { ...prev.branding, logoSize: parseInt(e.target.value) }
                                }))}
                                className="w-full accent-neon-500"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Small</span>
                                <span>Large</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setCustomConfig(prev => ({
                                    ...prev,
                                    branding: { ...prev.branding, logoUrl: event.target?.result as string }
                                  }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white text-sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Theme & Layout Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Theme & Layout
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-300 block mb-2">Theme Design</label>
                        <select
                          value={customConfig?.appearance?.theme || "modern"}
                          onChange={(e) => setCustomConfig(prev => ({
                            ...prev,
                            appearance: { ...prev.appearance, theme: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="modern">Modern Dark</option>
                          <option value="minimal">Clean Minimal</option>
                          <option value="gradient">Gradient Blue</option>
                          <option value="professional">Professional</option>
                          <option value="creative">Creative Bright</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-300 block mb-2">Card Style</label>
                        <select
                          value={customConfig?.appearance?.cardStyle || "elevated"}
                          onChange={(e) => setCustomConfig(prev => ({
                            ...prev,
                            appearance: { ...prev.appearance, cardStyle: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="elevated">Elevated Shadow</option>
                          <option value="outlined">Outlined Border</option>
                          <option value="filled">Filled Background</option>
                          <option value="glass">Glass Effect</option>
                          <option value="minimal">Minimal Lines</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">Layout Style</label>
                      <select
                        value={customConfig?.appearance?.layout || "stepped"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, layout: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                      >
                        <option value="stepped">Step Progress</option>
                        <option value="single">Single Page</option>
                        <option value="sidebar">Side Navigation</option>
                        <option value="wizard">Wizard Flow</option>
                        <option value="accordion">Accordion Style</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Panel */}
              <div className="w-1/2 p-6 bg-midnight-900">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Live Preview
                </h3>
                
                <div className="rounded-lg h-[calc(100%-60px)] overflow-auto">
                  {(() => {
                    const theme = customConfig?.appearance?.theme || 'modern';
                    const cardStyle = customConfig?.appearance?.cardStyle || 'elevated';
                    const layout = customConfig?.appearance?.layout || 'stepped';
                    
                    const getThemeStyles = () => {
                      switch(theme) {
                        case 'modern':
                          return {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            containerClass: 'bg-gray-800 text-white',
                            cardClass: cardStyle === 'elevated' ? 'bg-gray-700 shadow-xl' : 
                                       cardStyle === 'glass' ? 'bg-white/10 backdrop-blur-md border border-white/20' :
                                       cardStyle === 'outlined' ? 'bg-transparent border-2 border-gray-600' :
                                       cardStyle === 'filled' ? 'bg-gray-600' : 'bg-gray-700 border border-gray-600'
                          };
                        case 'minimal':
                          return {
                            background: '#f8fafc',
                            containerClass: 'bg-white text-gray-900',
                            cardClass: cardStyle === 'elevated' ? 'bg-white shadow-lg border' : 
                                       cardStyle === 'glass' ? 'bg-gray-50/80 border' :
                                       cardStyle === 'outlined' ? 'bg-transparent border-2 border-gray-200' :
                                       cardStyle === 'filled' ? 'bg-gray-50' : 'bg-white border border-gray-200'
                          };
                        case 'gradient':
                          return {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            containerClass: 'text-white',
                            cardClass: cardStyle === 'elevated' ? 'bg-white/15 backdrop-blur-md shadow-2xl border border-white/20' : 
                                       cardStyle === 'glass' ? 'bg-white/10 backdrop-blur-lg border border-white/30' :
                                       cardStyle === 'outlined' ? 'bg-transparent border-2 border-white/40' :
                                       cardStyle === 'filled' ? 'bg-white/20' : 'bg-white/15 border border-white/30'
                          };
                        case 'professional':
                          return {
                            background: '#1e293b',
                            containerClass: 'bg-slate-800 text-white',
                            cardClass: cardStyle === 'elevated' ? 'bg-slate-700 shadow-xl border border-slate-600' : 
                                       cardStyle === 'glass' ? 'bg-white/5 backdrop-blur-sm border border-slate-600' :
                                       cardStyle === 'outlined' ? 'bg-transparent border-2 border-slate-500' :
                                       cardStyle === 'filled' ? 'bg-slate-600' : 'bg-slate-700 border border-slate-600'
                          };
                        case 'creative':
                          return {
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
                            containerClass: 'text-white',
                            cardClass: cardStyle === 'elevated' ? 'bg-white/20 backdrop-blur-md shadow-2xl border border-white/30' : 
                                       cardStyle === 'glass' ? 'bg-white/15 backdrop-blur-lg border border-white/40' :
                                       cardStyle === 'outlined' ? 'bg-transparent border-2 border-white/50' :
                                       cardStyle === 'filled' ? 'bg-white/25' : 'bg-white/20 border border-white/40'
                          };
                        default:
                          return {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            containerClass: 'bg-gray-800 text-white',
                            cardClass: 'bg-gray-700 shadow-xl'
                          };
                      }
                    };
                    
                    const themeStyles = getThemeStyles();
                    
                    return (
                      <div 
                        className="h-full rounded-lg p-6"
                        style={{ 
                          background: themeStyles.background,
                          fontFamily: customConfig?.branding?.fontFamily || 'Poppins'
                        }}
                      >
                        <div className={`max-w-2xl mx-auto h-full ${themeStyles.containerClass} rounded-xl p-6`}>
                          {layout === 'stepped' && (
                            <div className="flex items-center justify-center mb-8">
                              <div className="flex items-center space-x-4">
                                {[1, 2, 3, 4].map((step, index) => (
                                  <div key={step} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      index === 0 ? 'bg-cyan-500 text-white' : 
                                      theme === 'minimal' ? 'bg-gray-200 text-gray-600' : 'bg-white/20 text-white/60'
                                    }`}>
                                      {step}
                                    </div>
                                    {index < 3 && (
                                      <div className={`w-8 h-0.5 ${theme === 'minimal' ? 'bg-gray-300' : 'bg-white/30'}`} />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {customConfig?.branding?.logoUrl && (
                            <div className="flex justify-center mb-6">
                              <img 
                                src={customConfig.branding.logoUrl} 
                                alt="Company Logo" 
                                className="object-contain"
                                style={{
                                  height: `${customConfig?.branding?.logoSize || 48}px`,
                                  width: 'auto',
                                  maxWidth: '200px'
                                }}
                              />
                            </div>
                          )}
                          
                          <div className="text-center mb-8">
                            <h1 
                              className="text-3xl font-bold mb-3"
                              style={{ color: customConfig?.branding?.primaryColor || (theme === 'minimal' ? '#1f2937' : '#ffffff') }}
                            >
                              {customConfig?.text?.headline || "Your Drone Quote"}
                            </h1>
                            <p className={`text-lg ${theme === 'minimal' ? 'text-gray-600' : 'text-white/80'}`}>
                              {customConfig?.text?.subheading || "Get a custom quote based on your project requirements"}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                              {customConfig?.questions?.slice(0, 3).map((question, index) => (
                                <div key={question.id} className={`p-6 rounded-xl ${themeStyles.cardClass}`}>
                                  <label className={`block text-sm font-semibold mb-3 ${theme === 'minimal' ? 'text-gray-700' : 'text-white/90'}`}>
                                    {question.label} {question.required && <span className="text-red-400">*</span>}
                                  </label>
                                  
                                  {question.type === 'dropdown' && (
                                    <>
                                      {layout === 'stepped' && question.options ? (
                                        <div className="grid grid-cols-2 gap-3">
                                          {question.options.slice(0, 4).map((option, optIndex) => (
                                            <button
                                              key={optIndex}
                                              className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                optIndex === 0 ? 
                                                  'border-cyan-400 bg-cyan-400/10' : 
                                                  theme === 'minimal' ? 'border-gray-200 hover:border-gray-400' : 'border-white/20 hover:border-white/40'
                                              }`}
                                            >
                                              <div className="flex items-center justify-between">
                                                <span className={`font-medium ${theme === 'minimal' ? 'text-gray-800' : 'text-white'}`}>
                                                  {option}
                                                </span>
                                                {optIndex === 0 && <span className="text-cyan-400 text-xs">Popular</span>}
                                              </div>
                                            </button>
                                          ))}
                                        </div>
                                      ) : (
                                        <select className={`w-full p-3 rounded-lg border ${
                                          theme === 'minimal' ? 'border-gray-300 bg-white text-gray-900' : 'border-white/20 bg-white/10 text-white'
                                        }`}>
                                          <option>Select an option...</option>
                                          {question.options?.map((option, optIndex) => (
                                            <option key={optIndex} value={option}>{option}</option>
                                          ))}
                                        </select>
                                      )}
                                    </>
                                  )}
                                  
                                  {question.type === 'number' && (
                                    <input 
                                      type="number"
                                      min={question.min || 0}
                                      max={question.max || 1000}
                                      placeholder="Enter amount"
                                      className={`w-full p-3 rounded-lg border ${
                                        theme === 'minimal' ? 'border-gray-300 bg-white text-gray-900' : 'border-white/20 bg-white/10 text-white placeholder-white/60'
                                      }`}
                                    />
                                  )}
                                  
                                  {question.type === 'text' && (
                                    <textarea 
                                      placeholder="Describe your project in detail..."
                                      rows={3}
                                      className={`w-full p-3 rounded-lg border resize-none ${
                                        theme === 'minimal' ? 'border-gray-300 bg-white text-gray-900' : 'border-white/20 bg-white/10 text-white placeholder-white/60'
                                      }`}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            <div className={`p-6 rounded-xl ${themeStyles.cardClass} h-fit`}>
                              <h3 className={`text-xl font-bold mb-4 ${theme === 'minimal' ? 'text-gray-800' : 'text-white'}`}>
                                Your Quote Summary
                              </h3>
                              
                              <div className="space-y-3 mb-6">
                                <div className={`flex justify-between ${theme === 'minimal' ? 'text-gray-600' : 'text-white/80'}`}>
                                  <span>Base service</span>
                                  <span>€500</span>
                                </div>
                                <div className={`flex justify-between ${theme === 'minimal' ? 'text-gray-600' : 'text-white/80'}`}>
                                  <span>Additional options</span>
                                  <span>€200</span>
                                </div>
                                <hr className={theme === 'minimal' ? 'border-gray-200' : 'border-white/20'} />
                                <div className={`flex justify-between text-xl font-bold ${theme === 'minimal' ? 'text-gray-900' : 'text-white'}`}>
                                  <span>Total</span>
                                  <span style={{ color: customConfig?.branding?.primaryColor || '#22d3ee' }}>€700.00</span>
                                </div>
                              </div>
                              
                              <button 
                                className="w-full py-4 rounded-lg font-bold text-white transition-all transform hover:scale-105"
                                style={{ 
                                  backgroundColor: customConfig?.branding?.primaryColor || '#22d3ee',
                                  boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
                                }}
                              >
                                {customConfig?.text?.ctaText || "Book My Flight"}
                              </button>
                              
                              <p className={`text-xs text-center mt-3 ${theme === 'minimal' ? 'text-gray-500' : 'text-white/60'}`}>
                                This quote is valid for 72 hours
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}