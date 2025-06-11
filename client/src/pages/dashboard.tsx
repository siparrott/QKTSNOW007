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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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
import { getCalculatorConfig, generateCustomizationFields } from "@/lib/calculator-config-parser";
import { 
  Settings, 
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
  Mail,
  Phone,
  Download,
  Camera
} from "lucide-react";

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

// Default calculator configuration
const defaultConfig = {
  text: {
    primaryColor: "#06D6A0",
    backgroundColor: "#0F172A",
    fontFamily: "Inter"
  },
  branding: {
    showLogo: true,
    logoSize: 100,
    logoUrl: ""
  }
};

// Interface for user calculators
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

// All available calculators
const allCalculators = [
  // Photography & Creative (10 calculators)
  { id: 1, name: "Wedding Photography", category: "Photography & Creative", slug: "wedding-photography" },
  { id: 2, name: "Boudoir Photography", category: "Photography & Creative", slug: "boudoir-photography" },
  { id: 3, name: "Corporate Headshots", category: "Photography & Creative", slug: "corporate-headshots" },
  { id: 4, name: "Drone/Aerial Photography", category: "Photography & Creative", slug: "drone-photography" },
  { id: 5, name: "Event Videography", category: "Photography & Creative", slug: "event-videography" },
  { id: 6, name: "Real Estate Photography", category: "Photography & Creative", slug: "real-estate-photography" },
  { id: 7, name: "Food Photography", category: "Photography & Creative", slug: "food-photography" },
  { id: 8, name: "Commercial Photography", category: "Photography & Creative", slug: "commercial-photography" },
  { id: 9, name: "Portrait Photography", category: "Photography & Creative", slug: "portrait-photography" },
  { id: 10, name: "Lifestyle Influencer", category: "Photography & Creative", slug: "lifestyle-influencer" },

  // Home Services (15 calculators)
  { id: 11, name: "Home Renovation AI", category: "Home Services", slug: "home-renovation" },
  { id: 12, name: "Electrician Services", category: "Home Services", slug: "electrician" },
  { id: 13, name: "Pest Control", category: "Home Services", slug: "pest-control" },
  { id: 14, name: "Landscaping Services", category: "Home Services", slug: "landscaping" },
  { id: 15, name: "Roofing Services", category: "Home Services", slug: "roofing" },
  { id: 16, name: "Solar Panel Installation", category: "Home Services", slug: "solar-panels" },
  { id: 17, name: "Window & Door Installation", category: "Home Services", slug: "windows-doors" },
  { id: 18, name: "HVAC Services", category: "Home Services", slug: "hvac" },
  { id: 19, name: "Plumbing Services", category: "Home Services", slug: "plumbing" },
  { id: 20, name: "Cleaning Services", category: "Home Services", slug: "cleaning" },
  { id: 21, name: "Pool Installation", category: "Home Services", slug: "pool-installation" },
  { id: 22, name: "Deck & Patio Construction", category: "Home Services", slug: "deck-patio" },
  { id: 23, name: "Fence Installation", category: "Home Services", slug: "fence-installation" },
  { id: 24, name: "Concrete & Masonry", category: "Home Services", slug: "concrete-masonry" },
  { id: 25, name: "Painting Services", category: "Home Services", slug: "painting" },

  // Professional Services (15 calculators)
  { id: 26, name: "Legal Advisory", category: "Professional Services", slug: "legal-advisory" },
  { id: 27, name: "Tax Preparation", category: "Professional Services", slug: "tax-preparation" },
  { id: 28, name: "Business Coaching", category: "Professional Services", slug: "business-coaching" },
  { id: 29, name: "Virtual Assistant", category: "Professional Services", slug: "virtual-assistant" },
  { id: 30, name: "Translation Services", category: "Professional Services", slug: "translation" },
  { id: 31, name: "Copywriting Services", category: "Professional Services", slug: "copywriting" },
  { id: 32, name: "Accounting Services", category: "Professional Services", slug: "accounting" },
  { id: 33, name: "Marketing Consultation", category: "Professional Services", slug: "marketing-consultation" },
  { id: 34, name: "Web Development", category: "Professional Services", slug: "web-development" },
  { id: 35, name: "Graphic Design", category: "Professional Services", slug: "graphic-design" },
  { id: 36, name: "SEO Services", category: "Professional Services", slug: "seo-services" },
  { id: 37, name: "Social Media Management", category: "Professional Services", slug: "social-media" },
  { id: 38, name: "Content Creation", category: "Professional Services", slug: "content-creation" },
  { id: 39, name: "Financial Planning", category: "Professional Services", slug: "financial-planning" },
  { id: 40, name: "Insurance Consultation", category: "Professional Services", slug: "insurance" },

  // Health & Beauty (10 calculators)
  { id: 41, name: "Personal Training", category: "Health & Beauty", slug: "personal-training" },
  { id: 42, name: "Nutrition Coaching", category: "Health & Beauty", slug: "nutrition-coaching" },
  { id: 43, name: "Hair Styling", category: "Health & Beauty", slug: "hair-styling" },
  { id: 44, name: "Makeup Artist", category: "Health & Beauty", slug: "makeup-artist" },
  { id: 45, name: "Massage Therapy", category: "Health & Beauty", slug: "massage-therapy" },
  { id: 46, name: "Dental Services", category: "Health & Beauty", slug: "dental-services" },
  { id: 47, name: "Plastic Surgery", category: "Health & Beauty", slug: "plastic-surgery" },
  { id: 48, name: "Medical Clinic", category: "Health & Beauty", slug: "medical-clinic" },
  { id: 49, name: "Childcare Services", category: "Health & Beauty", slug: "childcare" },
  { id: 50, name: "Elder Care", category: "Health & Beauty", slug: "elder-care" },

  // Technology (4 calculators)
  { id: 51, name: "IT Support", category: "Technology", slug: "it-support" },
  { id: 52, name: "Software Development", category: "Technology", slug: "software-development" },
  { id: 53, name: "Data Recovery", category: "Technology", slug: "data-recovery" },
  { id: 54, name: "Cybersecurity Consultation", category: "Technology", slug: "cybersecurity" },

  // Transportation (4 calculators)
  { id: 55, name: "Moving Services", category: "Transportation", slug: "moving-services" },
  { id: 56, name: "Auto Repair", category: "Transportation", slug: "auto-repair" },
  { id: 57, name: "Delivery Services", category: "Transportation", slug: "delivery" },
  { id: 58, name: "Rideshare Premium", category: "Transportation", slug: "rideshare" }
];

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State management
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState<any>(null);
  const [customConfig, setCustomConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("calculators");
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  // Analytics data - shows real data when available, otherwise empty states
  const analytics = {
    totalVisits: 0,
    totalQuotes: 0,
    conversionRate: 0,
    chartData: [],
    calculatorPerformance: []
  };

  // Quotes data - empty for new users
  const quotes: any[] = [];

  // State for user calculators
  const [userCalculators, setUserCalculators] = useState<UserCalculator[]>([]);
  const [isLoadingCalculators, setIsLoadingCalculators] = useState(false);

  // Load calculators from localStorage
  useEffect(() => {
    const loadCalculators = () => {
      try {
        const savedCalculators = localStorage.getItem('userCalculators');
        if (savedCalculators) {
          setUserCalculators(JSON.parse(savedCalculators));
        }
      } catch (error) {
        console.error('Error loading calculators:', error);
      }
    };

    if (currentUser) {
      loadCalculators();
    }
  }, [currentUser]);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);



  // Calculator functions
  const customizeCalculator = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    // Initialize with current config or default values
    const initialConfig = {
      companyName: calc.config?.companyName || "Your Business",
      primaryColor: calc.config?.primaryColor || "#06D6A0",
      headline: calc.config?.headline || "Get Your Custom Quote",
      description: calc.config?.description || "Fill out the form below to receive your personalized quote.",
      emailCapture: calc.config?.emailCapture !== undefined ? calc.config.emailCapture : true,
      phoneCapture: calc.config?.phoneCapture || false,
      pdfDownload: calc.config?.pdfDownload !== undefined ? calc.config.pdfDownload : true,
      ...calc.config
    };
    setCustomConfig(initialConfig);
    setShowCustomizeModal(true);
  };

  const previewCalculator = (calc: UserCalculator) => {
    window.open(calc.embed_url, '_blank');
  };

  const showEmbedCode = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    setShowEmbedModal(true);
  };

  // Filter calculators based on search term and category
  const filteredCalculators = allCalculators.filter(calculator => {
    const matchesSearch = calculator.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || calculator.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add calculator function
  const addCalculator = async (calculator: any) => {
    try {
      const instanceId = `calc-${Date.now()}`;
      const newCalculator = {
        id: instanceId,
        name: calculator.name,
        slug: calculator.slug,
        embed_url: `https://quotekit.ai/embed/${instanceId}`,
        admin_url: `https://quotekit.ai/admin/${instanceId}`,
        calculator_id: calculator.id,
        config: {},
        custom_branding: { companyName: "Your Business" },
        is_active: true,
        template_id: calculator.slug,
        layout_json: {},
        logic_json: {},
        style_json: {},
        prompt_md: "",
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      // Update local state immediately
      const updatedCalculators = [...userCalculators, newCalculator];
      setUserCalculators(updatedCalculators);
      
      // Save to localStorage
      localStorage.setItem('userCalculators', JSON.stringify(updatedCalculators));
      
      toast({
        title: "Calculator Added!",
        description: `${calculator.name} has been added to your dashboard.`,
      });
      
      setShowCalculatorModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add calculator. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-neon-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-900">
      <QuoteKitHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* User Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {currentUser?.email}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-midnight-700">
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
                {analytics.calculatorPerformance.length > 0 ? (
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
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No Analytics Data</h3>
                    <p className="text-gray-500">
                      Analytics will appear here once you have active calculators with visitor data.
                    </p>
                  </div>
                )}
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
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {quotes.length > 0 ? (
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
                        {quotes.map((quote) => (
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
                ) : (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No Client Quotes Yet</h3>
                    <p className="text-gray-500 mb-4">
                      Client quotes will appear here when visitors use your calculators to generate estimates.
                    </p>
                    <Button 
                      onClick={() => setActiveTab("calculators")}
                      className="bg-neon-500 hover:bg-neon-600"
                    >
                      Create Your First Calculator
                    </Button>
                  </div>
                )}
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

            {Array.isArray(userCalculators) && userCalculators.length > 0 ? (
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
            ) : (
              <div className="text-center py-12">
                <Calculator className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No Calculators Yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Create your first AI-powered quote calculator to start generating leads and automating your pricing process.
                </p>
                <Button
                  onClick={() => setShowCalculatorModal(true)}
                  className="bg-neon-500 hover:bg-neon-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Calculator
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quote Details Modal */}
        {showQuoteModal && selectedQuote && (
          <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
            <DialogContent className="bg-midnight-800 border-midnight-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Quote Details</DialogTitle>
                <DialogDescription className="text-gray-400">
                  View and manage client quote information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Client Name</Label>
                    <p className="text-white font-medium">{selectedQuote.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Email</Label>
                    <p className="text-white">{selectedQuote.clientEmail}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Phone</Label>
                    <p className="text-white">{selectedQuote.clientPhone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Calculator</Label>
                    <p className="text-white">{selectedQuote.calculatorName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Estimated Value</Label>
                    <p className="text-white font-medium text-lg">{selectedQuote.estimatedValue}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Date</Label>
                    <p className="text-white">{new Date(selectedQuote.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button className="bg-neon-500 hover:bg-neon-600">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="border-midnight-600 text-gray-300">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Client
                  </Button>
                  <Button variant="outline" className="border-midnight-600 text-gray-300">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Details
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Embed Code Modal */}
        {showEmbedModal && selectedCalculator && (
          <Dialog open={showEmbedModal} onOpenChange={setShowEmbedModal}>
            <DialogContent className="bg-midnight-800 border-midnight-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Embed Code</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Copy this code to embed your calculator on any website
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-midnight-900 p-4 rounded-lg border border-midnight-600">
                  <code className="text-green-400 text-sm">
                    {`<iframe src="${selectedCalculator.embed_url}" width="100%" height="600" frameborder="0"></iframe>`}
                  </code>
                </div>
                
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`<iframe src="${selectedCalculator.embed_url}" width="100%" height="600" frameborder="0"></iframe>`);
                    toast({
                      title: "Copied to clipboard",
                      description: "Embed code has been copied to your clipboard.",
                    });
                  }}
                  className="w-full bg-neon-500 hover:bg-neon-600"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Embed Code
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Customize Calculator Modal */}
        {showCustomizeModal && selectedCalculator && (
          <Dialog open={showCustomizeModal} onOpenChange={setShowCustomizeModal}>
            <DialogContent className="bg-midnight-800 border-midnight-700 text-white max-w-7xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Customize Calculator</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Personalize your calculator appearance and functionality
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex gap-6 h-[70vh]">
                {/* Left Panel - Customization Options */}
                <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                {/* Branding Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Branding</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Company Name</Label>
                      <input
                        type="text"
                        value={customConfig?.companyName || "Your Business"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          companyName: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-white"
                        placeholder="Enter your company name"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Primary Color</Label>
                      <input
                        type="color"
                        value={customConfig?.primaryColor || "#06D6A0"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          primaryColor: e.target.value
                        }))}
                        className="w-full mt-1 h-10 bg-midnight-900 border border-midnight-600 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculator Text */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Calculator Text</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-300">Headline</Label>
                      <input
                        type="text"
                        value={customConfig?.headline || "Get Your Custom Quote"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          headline: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-white"
                        placeholder="Enter calculator headline"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Description</Label>
                      <textarea
                        value={customConfig?.description || "Fill out the form below to receive your personalized quote."}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-white h-20"
                        placeholder="Enter calculator description"
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Email Collection</span>
                      <input
                        type="checkbox"
                        checked={customConfig?.emailCapture || true}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          emailCapture: e.target.checked
                        }))}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Phone Collection</span>
                      <input
                        type="checkbox"
                        checked={customConfig?.phoneCapture || false}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          phoneCapture: e.target.checked
                        }))}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">PDF Download</span>
                      <input
                        type="checkbox"
                        checked={customConfig?.pdfDownload || true}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          pdfDownload: e.target.checked
                        }))}
                        className="rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Styling Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Styling</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Button Style</Label>
                      <select
                        value={customConfig?.buttonStyle || "rounded"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          buttonStyle: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-white"
                      >
                        <option value="rounded">Rounded</option>
                        <option value="square">Square</option>
                        <option value="pill">Pill Shape</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Layout Style</Label>
                      <select
                        value={customConfig?.layoutStyle || "single"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          layoutStyle: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-white"
                      >
                        <option value="single">Single Page</option>
                        <option value="multi">Multi-Step</option>
                        <option value="sidebar">Sidebar Layout</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Font Size</Label>
                      <select
                        value={customConfig?.fontSize || "medium"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          fontSize: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-white"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Theme</Label>
                      <select
                        value={customConfig?.theme || "light"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          theme: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-white"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-300">Base Rate</Label>
                      <input
                        type="number"
                        value={customConfig?.baseRate || 100}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          baseRate: parseInt(e.target.value) || 100
                        }))}
                        className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-white"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Currency</Label>
                      <select
                        value={customConfig?.currency || "USD"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          currency: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-white"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD (C$)</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Multiplier Range</Label>
                      <input
                        type="text"
                        value={customConfig?.multiplierRange || "1.0 - 3.5"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          multiplierRange: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-white"
                        placeholder="1.0 - 3.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Advanced Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Show Progress Bar</span>
                      <input
                        type="checkbox"
                        checked={customConfig?.showProgress || true}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          showProgress: e.target.checked
                        }))}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Auto-Save Responses</span>
                      <input
                        type="checkbox"
                        checked={customConfig?.autoSave || false}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          autoSave: e.target.checked
                        }))}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Analytics Tracking</span>
                      <input
                        type="checkbox"
                        checked={customConfig?.analytics || true}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          analytics: e.target.checked
                        }))}
                        className="rounded"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Custom CSS</Label>
                    <textarea
                      value={customConfig?.customCSS || ""}
                      onChange={(e) => setCustomConfig(prev => ({
                        ...prev,
                        customCSS: e.target.value
                      }))}
                      className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-white h-20"
                      placeholder="Add custom CSS styles..."
                    />
                  </div>
                </div>
                </div>

                {/* Right Panel - Live Preview */}
                <div className="w-1/2 overflow-y-auto pl-4">
                  <div className="sticky top-0 bg-midnight-800 pb-4 mb-4 border-b border-midnight-700">
                    <h3 className="text-lg font-medium text-white">Live Preview</h3>
                  </div>
                  <div className="bg-white border rounded-lg p-6 min-h-[500px]">
                    {/* Calculator Header */}
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold mb-2" style={{ color: customConfig?.primaryColor || "#06D6A0" }}>
                        {customConfig?.headline || "Get Your Custom Quote"}
                      </h2>
                      <p className="text-gray-600 mb-4">
                        {customConfig?.description || "Fill out the form below to receive your personalized quote."}
                      </p>
                      <div className="text-xs text-gray-500 mb-4">
                        Powered by {customConfig?.companyName || "Your Business"}
                      </div>
                    </div>

                    {/* Sample Form Fields */}
                    <div className="space-y-4 max-w-md mx-auto">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                        <select className="w-full p-2 border border-gray-300 rounded-md">
                          <option>Select service...</option>
                          <option>Basic Package</option>
                          <option>Premium Package</option>
                          <option>Custom Solution</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Size</label>
                        <input 
                          type="range" 
                          className="w-full" 
                          style={{ accentColor: customConfig?.primaryColor || "#06D6A0" }}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Small</span>
                          <span>Large</span>
                        </div>
                      </div>

                      {customConfig?.emailCapture && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                          <input 
                            type="email" 
                            placeholder="your@email.com"
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      )}

                      {customConfig?.phoneCapture && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input 
                            type="tel" 
                            placeholder="(555) 123-4567"
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      )}

                      {/* Quote Result */}
                      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: `${customConfig?.primaryColor || "#06D6A0"}15` }}>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">Estimated Price</div>
                          <div className="text-2xl font-bold" style={{ color: customConfig?.primaryColor || "#06D6A0" }}>
                            $2,500 - $4,200
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Final price may vary based on requirements
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 mt-4">
                        <button 
                          className="w-full py-2 px-4 rounded-md text-white font-medium"
                          style={{ backgroundColor: customConfig?.primaryColor || "#06D6A0" }}
                        >
                          Get Detailed Quote
                        </button>
                        {customConfig?.pdfDownload && (
                          <button className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                            Download PDF Quote
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-midnight-700">
                <Button
                  variant="outline"
                  onClick={() => setShowCustomizeModal(false)}
                  className="border-midnight-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Save customization
                    const updatedCalculators = userCalculators.map(calc => 
                      calc.id === selectedCalculator.id 
                        ? { ...calc, config: customConfig }
                        : calc
                    );
                    setUserCalculators(updatedCalculators);
                    localStorage.setItem('userCalculators', JSON.stringify(updatedCalculators));
                    
                    toast({
                      title: "Calculator Updated!",
                      description: "Your customizations have been saved.",
                    });
                    
                    setShowCustomizeModal(false);
                  }}
                  className="bg-neon-500 hover:bg-neon-600 text-black"
                >
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Calculator Selection Modal */}
        {showCalculatorModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-midnight-800 rounded-2xl border border-midnight-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="border-b border-midnight-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Add Calculator</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCalculatorModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search calculators..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-midnight-900 border border-midnight-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-neon-500"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48 bg-midnight-900 border-midnight-600 text-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-midnight-800 border-midnight-600">
                      <SelectItem value="All">All Categories</SelectItem>
                      <SelectItem value="Photography & Creative">Photography & Creative</SelectItem>
                      <SelectItem value="Home Services">Home Services</SelectItem>
                      <SelectItem value="Professional Services">Professional Services</SelectItem>
                      <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Calculator Grid */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCalculators.map((calculator) => (
                    <motion.div
                      key={calculator.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-midnight-900 border border-midnight-600 rounded-xl p-4 hover:border-neon-500/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-neon-500/20 rounded-lg flex items-center justify-center">
                            <Calculator className="h-5 w-5 text-neon-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium text-sm">{calculator.name}</h3>
                            <p className="text-gray-400 text-xs">{calculator.category}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addCalculator(calculator)}
                          className="bg-neon-500 hover:bg-neon-600 text-black text-xs h-6 px-2"
                        >
                          Add
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-midnight-700 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    {allCalculators.length} calculators available
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowCalculatorModal(false)}
                    className="border-midnight-600 text-gray-300 hover:bg-midnight-600"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}