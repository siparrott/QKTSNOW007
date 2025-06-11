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

  // Query for user calculators
  const { data: userCalculators = [], isLoading: isLoadingCalculators } = useQuery({
    queryKey: ['/api/supabase/user-calculators'],
    enabled: !!currentUser?.id,
  });

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
    setCustomConfig(calc.config || defaultConfig);
    setShowCustomizeModal(true);
  };

  const previewCalculator = (calc: UserCalculator) => {
    window.open(calc.embed_url, '_blank');
  };

  const showEmbedCode = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    setShowEmbedModal(true);
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
      </div>
    </div>
  );
}