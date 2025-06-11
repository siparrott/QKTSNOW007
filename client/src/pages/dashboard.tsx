import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuoteKitHeader } from "@/components/calculator-header";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import CalculatorPreview from "@/components/calculator-preview";
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
  Phone
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

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
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Demo user for preview
  const [user] = useState<User>({
    id: "demo-123",
    email: "demo@quotekit.ai", 
    fullName: "Demo User",
    subscriptionStatus: "pro",
    quotesUsedThisMonth: 47,
    quotesLimit: 500
  });

  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState<UserCalculator | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userCalculators, setUserCalculators] = useState<UserCalculator[]>([]);
  const [customConfig, setCustomConfig] = useState<any>({});

  // Available calculator templates - matching the actual files we have
  const allCalculators = [
    { id: 1, name: "Electrician Services", category: "Home Services", slug: "electrician" },
    { id: 2, name: "Home Renovation", category: "Home Services", slug: "home-renovation" },
    { id: 3, name: "Landscaping Services", category: "Home Services", slug: "landscaping" },
    { id: 4, name: "Wedding Photography", category: "Photography & Creative", slug: "wedding-photography" },
    { id: 5, name: "Pest Control", category: "Home Services", slug: "pest-control" },
    { id: 6, name: "Roofing Services", category: "Home Services", slug: "roofing" },
    { id: 7, name: "Plumbing Services", category: "Home Services", slug: "plumbing" },
    { id: 8, name: "Cleaning Services", category: "Home Services", slug: "cleaning-services" },
    { id: 9, name: "Personal Training", category: "Health & Beauty", slug: "personal-training" },
    { id: 10, name: "Makeup Artist", category: "Health & Beauty", slug: "makeup-artist" },
    { id: 11, name: "Hair Stylist", category: "Health & Beauty", slug: "hair-stylist" },
    { id: 12, name: "Massage Therapy", category: "Health & Beauty", slug: "massage-therapy" },
    { id: 13, name: "Nutritionist", category: "Health & Beauty", slug: "nutritionist" },
    { id: 14, name: "Life Coach", category: "Professional Services", slug: "life-coach" },
    { id: 15, name: "Business Coach", category: "Professional Services", slug: "business-coach" },
    { id: 16, name: "Legal Advisor", category: "Professional Services", slug: "legal-advisor" },
    { id: 17, name: "Tax Preparer", category: "Professional Services", slug: "tax-preparer" },
    { id: 18, name: "Translation Services", category: "Professional Services", slug: "translation-services" },
    { id: 19, name: "Virtual Assistant", category: "Professional Services", slug: "virtual-assistant" },
    { id: 20, name: "Private School", category: "Education & Training", slug: "private-school" },
    { id: 21, name: "Private Tutor", category: "Education & Training", slug: "private-tutor" },
    { id: 22, name: "Driving Instructor", category: "Education & Training", slug: "driving-instructor" },
    { id: 23, name: "Dentist", category: "Health & Medical", slug: "dentist" },
    { id: 24, name: "Private Medical", category: "Health & Medical", slug: "private-medical" },
    { id: 25, name: "Plastic Surgery", category: "Health & Medical", slug: "plastic-surgery" },
    { id: 26, name: "Childcare", category: "Health & Medical", slug: "childcare" },
    { id: 27, name: "Auto Mechanic", category: "Transportation", slug: "auto-mechanic" },
    { id: 28, name: "Car Detailing", category: "Transportation", slug: "car-detailing" },
    { id: 29, name: "Moving Services", category: "Transportation", slug: "moving-services" },
    { id: 30, name: "Van Rental", category: "Transportation", slug: "van-rental" },
  ];

  // Default configuration for new calculators
  const defaultConfig = {
    companyName: "Your Business",
    primaryColor: "#06D6A0",
    headline: "Get Your Custom Quote",
    description: "Fill out the form below to receive your personalized quote.",
    emailCollection: true,
    phoneCollection: false,
    pdfDownload: true,
    showPoweredBy: true,
    customCSS: ""
  };

  // Load user calculators from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('userCalculators');
    if (saved) {
      setUserCalculators(JSON.parse(saved));
    }
  }, []);

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
      const newCalculator: UserCalculator = {
        id: instanceId,
        name: calculator.name,
        slug: calculator.slug,
        embed_url: `/calculator/${calculator.slug}`,
        admin_url: `/calculator/${calculator.slug}`,
        calculator_id: calculator.id,
        config: defaultConfig,
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

      const updatedCalculators = [...userCalculators, newCalculator];
      setUserCalculators(updatedCalculators);
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

  const customizeCalculator = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    // Initialize with meaningful defaults if no config exists
    const initialConfig = calc.config && Object.keys(calc.config).length > 0 
      ? calc.config 
      : {
          companyBranding: {
            companyName: calc.custom_branding?.companyName || "Your Business"
          },
          brandColors: {
            primary: "#06D6A0",
            secondary: "#2563eb",
            accent: "#f59e0b"
          },
          textCustomization: {
            headline: "Get Your Custom Quote",
            description: "Fill out the form below to receive your personalized quote."
          },
          styling: {
            fontFamily: "Inter",
            borderRadius: "0.5rem"
          },
          features: {
            emailCollection: true,
            phoneCollection: false,
            pdfDownload: true
          }
        };
    setCustomConfig(initialConfig);
    setShowCustomizeModal(true);
  };

  const previewCalculator = (calc: UserCalculator) => {
    window.open(`/calculator/${calc.slug}`, '_blank');
  };

  const showEmbedCode = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    setShowEmbedModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900">
      <QuoteKitHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Manage your quote calculators and track performance</p>
          </div>
          <Button
            onClick={() => setShowCalculatorModal(true)}
            className="bg-neon-500 hover:bg-neon-600 text-black font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Calculator
          </Button>
        </div>

        {/* Your Calculators */}
        <Card className="bg-midnight-800 border-midnight-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Your Calculators</CardTitle>
            <CardDescription className="text-gray-400">
              Manage and customize your quote calculators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userCalculators.length === 0 ? (
              <div className="text-center py-12">
                <Calculator className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No calculators yet</h3>
                <p className="text-gray-500 mb-4">Add your first calculator to get started</p>
                <Button 
                  onClick={() => setShowCalculatorModal(true)}
                  className="bg-neon-500 hover:bg-neon-600 text-black"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Calculator
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userCalculators.map((calc) => (
                  <div key={calc.id} className="flex items-center justify-between p-4 bg-midnight-900 rounded-lg border border-midnight-600">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-neon-500/20 rounded-lg flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-neon-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{calc.name}</h3>
                        <p className="text-gray-400 text-sm">Created {new Date(calc.created_at).toLocaleDateString()}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">Status: {calc.is_active ? 'Active' : 'Inactive'}</span>
                          {calc.is_active && (
                            <span className="text-xs text-neon-400">Ready for embedding</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={calc.is_active ? "default" : "secondary"}>
                        {calc.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => previewCalculator(calc)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => customizeCalculator(calc)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => showEmbedCode(calc)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Calculators</CardTitle>
              <Calculator className="h-4 w-4 text-neon-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{userCalculators.length}</div>
              <p className="text-xs text-gray-500">+2 from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Quotes</CardTitle>
              <BarChart3 className="h-4 w-4 text-neon-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-gray-500">No submissions yet</p>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-neon-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">--</div>
              <p className="text-xs text-gray-500">No data available</p>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Monthly Usage</CardTitle>
              <Users className="h-4 w-4 text-neon-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{user.quotesUsedThisMonth}</div>
              <div className="mt-2">
                <Progress 
                  value={(user.quotesUsedThisMonth / user.quotesLimit) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {user.quotesUsedThisMonth} of {user.quotesLimit} quotes used
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Chart */}
          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-neon-400" />
                Performance Analytics
              </CardTitle>
              <CardDescription className="text-gray-400">
                Monthly conversion trends and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-midnight-900 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-neon-400">
                      {userCalculators.length > 0 ? `${((userCalculators.filter(c => c.is_active).length / userCalculators.length) * 100).toFixed(1)}%` : '0%'}
                    </div>
                    <div className="text-xs text-gray-400">Active Rate</div>
                    <div className="text-xs text-gray-500">Calculator activity</div>
                  </div>
                  <div className="bg-midnight-900 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-400">{userCalculators.length}</div>
                    <div className="text-xs text-gray-400">Total Calcs</div>
                    <div className="text-xs text-gray-500">Your calculators</div>
                  </div>
                  <div className="bg-midnight-900 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-purple-400">{user.quotesUsedThisMonth}</div>
                    <div className="text-xs text-gray-400">Quotes Used</div>
                    <div className="text-xs text-gray-500">This month</div>
                  </div>
                </div>
                
                {/* Calculator Usage Chart */}
                <div className="bg-midnight-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-3">Calculator Usage Distribution</div>
                  {userCalculators.length > 0 ? (
                    <div className="h-32 flex items-end justify-center space-x-2">
                      {userCalculators.slice(0, 8).map((calc, index) => {
                        const height = calc.is_active ? 70 + (index * 5) : 30;
                        return (
                          <div key={calc.id} className="flex flex-col items-center space-y-1">
                            <div
                              className={`w-8 bg-gradient-to-t rounded-sm opacity-80 hover:opacity-100 transition-opacity ${
                                calc.is_active ? 'from-neon-500 to-neon-400' : 'from-gray-600 to-gray-500'
                              }`}
                              style={{ height: `${height}%` }}
                            />
                            <div className="text-xs text-gray-500 text-center w-12 truncate">
                              {calc.name.split(' ')[0]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
                      No calculators to display
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Calculators */}
          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                Top Performing Calculators
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your highest converting calculators this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userCalculators.length > 0 ? (
                  userCalculators
                    .sort((a, b) => Number(b.is_active) - Number(a.is_active))
                    .slice(0, 5)
                    .map((calc, index) => {
                      const colors = ["bg-neon-500", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-red-500"];
                      return (
                        <div key={calc.id} className="flex items-center justify-between p-3 bg-midnight-900 rounded-lg hover:bg-midnight-700 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                              <span className="text-xs text-gray-500">#{index + 1}</span>
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{calc.name}</div>
                              <div className="text-gray-400 text-xs">
                                Created {new Date(calc.created_at).toLocaleDateString()} • 
                                {calc.is_active ? ' Active' : ' Inactive'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-neon-400 font-medium text-sm">
                              {calc.is_active ? 'Live' : 'Draft'}
                            </div>
                            <div className="text-gray-500 text-xs">status</div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No calculators created yet</p>
                    <p className="text-xs">Add your first calculator to see performance data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Management Table */}
        <Card className="bg-midnight-800 border-midnight-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-400" />
              Recent Quote Requests
            </CardTitle>
            <CardDescription className="text-gray-400">
              Latest quotes submitted by potential clients with contact details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-midnight-600">
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider py-3">Client Details</th>
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider py-3">Service Type</th>
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider py-3">Quote Value</th>
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider py-3">Status</th>
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider py-3">Submitted</th>
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-600">
                  <tr>
                    <td colSpan={6} className="py-12">
                      <div className="text-center text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-gray-400 mb-2">No quote requests yet</h3>
                        <p className="text-sm">Quote submissions will appear here when clients use your calculators</p>
                        <p className="text-xs mt-2">
                          {userCalculators.length > 0 
                            ? "Share your calculator embed codes to start receiving quotes"
                            : "Create your first calculator to start collecting quote requests"
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>



        {/* Customization Modal */}
        {showCustomizeModal && selectedCalculator && (
          <Dialog open={showCustomizeModal} onOpenChange={setShowCustomizeModal}>
            <DialogContent className="max-w-7xl w-[95vw] h-[95vh] overflow-hidden bg-midnight-800 border-midnight-700 p-0">
              <div className="flex flex-col h-full">
                <DialogHeader className="px-6 py-4 border-b border-midnight-700">
                  <DialogTitle className="text-white">Customize Calculator</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Personalize your calculator appearance and functionality.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-1 overflow-hidden">
                  {/* Left Panel - Customization Options */}
                  <div className="w-1/2 border-r border-midnight-700 overflow-y-auto">
                    <div className="p-6 space-y-8">
                      {/* Branding */}
                      <div>
                        <h3 className="text-white font-medium mb-4 flex items-center">
                          <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                          Branding
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300 text-sm">Company Name</Label>
                            <Input
                              placeholder="Your Business"
                              value={customConfig?.companyBranding?.companyName || ""}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                companyBranding: {
                                  ...prev?.companyBranding,
                                  companyName: e.target.value
                                }
                              }))}
                              className="bg-midnight-900 border-midnight-600 text-white mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Primary Color</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Input
                                type="color"
                                value={customConfig?.brandColors?.primary || "#06D6A0"}
                                onChange={(e) => setCustomConfig((prev: any) => ({ 
                                  ...prev, 
                                  brandColors: {
                                    ...prev?.brandColors,
                                    primary: e.target.value
                                  }
                                }))}
                                className="w-12 h-10 p-1 bg-midnight-900 border-midnight-600"
                              />
                              <Input
                                value={customConfig?.brandColors?.primary || "#06D6A0"}
                                onChange={(e) => setCustomConfig((prev: any) => ({ 
                                  ...prev, 
                                  brandColors: {
                                    ...prev?.brandColors,
                                    primary: e.target.value
                                  }
                                }))}
                                className="flex-1 bg-midnight-900 border-midnight-600 text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Secondary Color</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Input
                                type="color"
                                value={customConfig?.brandColors?.secondary || "#2563eb"}
                                onChange={(e) => setCustomConfig((prev: any) => ({ 
                                  ...prev, 
                                  brandColors: {
                                    ...prev?.brandColors,
                                    secondary: e.target.value
                                  }
                                }))}
                                className="w-12 h-10 p-1 bg-midnight-900 border-midnight-600"
                              />
                              <Input
                                value={customConfig?.brandColors?.secondary || "#2563eb"}
                                onChange={(e) => setCustomConfig((prev: any) => ({ 
                                  ...prev, 
                                  brandColors: {
                                    ...prev?.brandColors,
                                    secondary: e.target.value
                                  }
                                }))}
                                className="flex-1 bg-midnight-900 border-midnight-600 text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Calculator Text */}
                      <div>
                        <h3 className="text-white font-medium mb-4 flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          Calculator Text
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300 text-sm">Headline</Label>
                            <Input
                              placeholder="Get Your Custom Quote"
                              value={customConfig?.textCustomization?.headline || ""}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                textCustomization: {
                                  ...prev?.textCustomization,
                                  headline: e.target.value
                                }
                              }))}
                              className="bg-midnight-900 border-midnight-600 text-white mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Description</Label>
                            <Textarea
                              placeholder="Fill out the form below to receive your personalized quote."
                              value={customConfig?.textCustomization?.description || ""}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                textCustomization: {
                                  ...prev?.textCustomization,
                                  description: e.target.value
                                }
                              }))}
                              className="bg-midnight-900 border-midnight-600 text-white mt-1"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Advanced Styling Options */}
                      <div>
                        <h3 className="text-white font-medium mb-4 flex items-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          Advanced Styling
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300 text-sm">Font Family</Label>
                            <select
                              value={customConfig?.styling?.fontFamily || "Inter"}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                styling: {
                                  ...prev?.styling,
                                  fontFamily: e.target.value
                                }
                              }))}
                              className="w-full mt-1 bg-midnight-900 border border-midnight-600 text-white rounded-md px-3 py-2"
                            >
                              <option value="Inter">Inter (Modern)</option>
                              <option value="Arial">Arial (Clean)</option>
                              <option value="Helvetica">Helvetica (Professional)</option>
                              <option value="Georgia">Georgia (Elegant)</option>
                              <option value="Times New Roman">Times New Roman (Classic)</option>
                              <option value="Roboto">Roboto (Google)</option>
                              <option value="Open Sans">Open Sans (Friendly)</option>
                              <option value="Lato">Lato (Humanist)</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Border Radius</Label>
                            <select
                              value={customConfig?.styling?.borderRadius || "0.5rem"}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                styling: {
                                  ...prev?.styling,
                                  borderRadius: e.target.value
                                }
                              }))}
                              className="w-full mt-1 bg-midnight-900 border border-midnight-600 text-white rounded-md px-3 py-2"
                            >
                              <option value="0">Sharp (0px)</option>
                              <option value="0.125rem">Minimal (2px)</option>
                              <option value="0.25rem">Small (4px)</option>
                              <option value="0.5rem">Medium (8px)</option>
                              <option value="0.75rem">Large (12px)</option>
                              <option value="1rem">Extra Large (16px)</option>
                              <option value="1.5rem">Rounded (24px)</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Background Style</Label>
                            <select
                              value={customConfig?.styling?.backgroundStyle || "solid"}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                styling: {
                                  ...prev?.styling,
                                  backgroundStyle: e.target.value
                                }
                              }))}
                              className="w-full mt-1 bg-midnight-900 border border-midnight-600 text-white rounded-md px-3 py-2"
                            >
                              <option value="solid">Solid Color</option>
                              <option value="gradient">Gradient</option>
                              <option value="subtle-pattern">Subtle Pattern</option>
                              <option value="minimal">Minimal White</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Button Style</Label>
                            <select
                              value={customConfig?.styling?.buttonStyle || "modern"}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                styling: {
                                  ...prev?.styling,
                                  buttonStyle: e.target.value
                                }
                              }))}
                              className="w-full mt-1 bg-midnight-900 border border-midnight-600 text-white rounded-md px-3 py-2"
                            >
                              <option value="modern">Modern Filled</option>
                              <option value="outline">Outline Style</option>
                              <option value="gradient">Gradient Fill</option>
                              <option value="minimal">Minimal</option>
                              <option value="rounded">Fully Rounded</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Shadow Intensity</Label>
                            <select
                              value={customConfig?.styling?.shadowIntensity || "medium"}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                styling: {
                                  ...prev?.styling,
                                  shadowIntensity: e.target.value
                                }
                              }))}
                              className="w-full mt-1 bg-midnight-900 border border-midnight-600 text-white rounded-md px-3 py-2"
                            >
                              <option value="none">No Shadow</option>
                              <option value="light">Light Shadow</option>
                              <option value="medium">Medium Shadow</option>
                              <option value="strong">Strong Shadow</option>
                              <option value="dramatic">Dramatic Shadow</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Layout & Spacing */}
                      <div>
                        <h3 className="text-white font-medium mb-4 flex items-center">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                          Layout & Spacing
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300 text-sm">Container Width</Label>
                            <select
                              value={customConfig?.layout?.containerWidth || "standard"}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                layout: {
                                  ...prev?.layout,
                                  containerWidth: e.target.value
                                }
                              }))}
                              className="w-full mt-1 bg-midnight-900 border border-midnight-600 text-white rounded-md px-3 py-2"
                            >
                              <option value="narrow">Narrow (600px)</option>
                              <option value="standard">Standard (800px)</option>
                              <option value="wide">Wide (1000px)</option>
                              <option value="full">Full Width</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Form Layout</Label>
                            <select
                              value={customConfig?.layout?.formLayout || "single-column"}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                layout: {
                                  ...prev?.layout,
                                  formLayout: e.target.value
                                }
                              }))}
                              className="w-full mt-1 bg-midnight-900 border border-midnight-600 text-white rounded-md px-3 py-2"
                            >
                              <option value="single-column">Single Column</option>
                              <option value="two-column">Two Column</option>
                              <option value="compact">Compact</option>
                              <option value="spacious">Spacious</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Step Indicator Style</Label>
                            <select
                              value={customConfig?.layout?.stepIndicator || "progress-bar"}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                layout: {
                                  ...prev?.layout,
                                  stepIndicator: e.target.value
                                }
                              }))}
                              className="w-full mt-1 bg-midnight-900 border border-midnight-600 text-white rounded-md px-3 py-2"
                            >
                              <option value="progress-bar">Progress Bar</option>
                              <option value="numbered-steps">Numbered Steps</option>
                              <option value="dots">Dot Indicators</option>
                              <option value="minimal">Minimal</option>
                              <option value="hidden">Hidden</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Advanced Features */}
                      <div>
                        <h3 className="text-white font-medium mb-4 flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          Advanced Features
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300 text-sm">Email Collection</Label>
                              <p className="text-xs text-gray-500">Collect email addresses from users</p>
                            </div>
                            <Switch
                              checked={customConfig?.features?.emailCollection || false}
                              onCheckedChange={(checked) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                features: {
                                  ...prev?.features,
                                  emailCollection: checked
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300 text-sm">Phone Collection</Label>
                              <p className="text-xs text-gray-500">Collect phone numbers from users</p>
                            </div>
                            <Switch
                              checked={customConfig?.features?.phoneCollection || false}
                              onCheckedChange={(checked) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                features: {
                                  ...prev?.features,
                                  phoneCollection: checked
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300 text-sm">PDF Download</Label>
                              <p className="text-xs text-gray-500">Allow users to download quote as PDF</p>
                            </div>
                            <Switch
                              checked={customConfig?.features?.pdfDownload || false}
                              onCheckedChange={(checked) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                features: {
                                  ...prev?.features,
                                  pdfDownload: checked
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300 text-sm">Real-time Updates</Label>
                              <p className="text-xs text-gray-500">Update pricing as user types</p>
                            </div>
                            <Switch
                              checked={customConfig?.features?.realTimeUpdates || true}
                              onCheckedChange={(checked) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                features: {
                                  ...prev?.features,
                                  realTimeUpdates: checked
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300 text-sm">Progress Saving</Label>
                              <p className="text-xs text-gray-500">Save form progress automatically</p>
                            </div>
                            <Switch
                              checked={customConfig?.features?.progressSaving || true}
                              onCheckedChange={(checked) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                features: {
                                  ...prev?.features,
                                  progressSaving: checked
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300 text-sm">Social Sharing</Label>
                              <p className="text-xs text-gray-500">Allow sharing quotes on social media</p>
                            </div>
                            <Switch
                              checked={customConfig?.features?.socialSharing || false}
                              onCheckedChange={(checked) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                features: {
                                  ...prev?.features,
                                  socialSharing: checked
                                }
                              }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Form Behavior */}
                      <div>
                        <h3 className="text-white font-medium mb-4 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Form Behavior
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300 text-sm">Validation Style</Label>
                            <select
                              value={customConfig?.formBehavior?.validationStyle || "on-submit"}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                formBehavior: {
                                  ...prev?.formBehavior,
                                  validationStyle: e.target.value
                                }
                              }))}
                              className="w-full mt-1 bg-midnight-900 border border-midnight-600 text-white rounded-md px-3 py-2"
                            >
                              <option value="on-submit">Validate on Submit</option>
                              <option value="on-blur">Validate on Field Exit</option>
                              <option value="on-change">Validate on Type</option>
                              <option value="disabled">No Validation</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Required Field Style</Label>
                            <select
                              value={customConfig?.formBehavior?.requiredStyle || "asterisk"}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                formBehavior: {
                                  ...prev?.formBehavior,
                                  requiredStyle: e.target.value
                                }
                              }))}
                              className="w-full mt-1 bg-midnight-900 border border-midnight-600 text-white rounded-md px-3 py-2"
                            >
                              <option value="asterisk">Asterisk (*)</option>
                              <option value="required-text">(Required)</option>
                              <option value="red-border">Red Border</option>
                              <option value="none">No Indicator</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300 text-sm">Auto-advance Steps</Label>
                              <p className="text-xs text-gray-500">Move to next step when current is complete</p>
                            </div>
                            <Switch
                              checked={customConfig?.formBehavior?.autoAdvance || false}
                              onCheckedChange={(checked) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                formBehavior: {
                                  ...prev?.formBehavior,
                                  autoAdvance: checked
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300 text-sm">Show Field Tooltips</Label>
                              <p className="text-xs text-gray-500">Display helpful tips on form fields</p>
                            </div>
                            <Switch
                              checked={customConfig?.formBehavior?.showTooltips || true}
                              onCheckedChange={(checked) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                formBehavior: {
                                  ...prev?.formBehavior,
                                  showTooltips: checked
                                }
                              }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notifications & Analytics */}
                      <div>
                        <h3 className="text-white font-medium mb-4 flex items-center">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                          Notifications & Analytics
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300 text-sm">Email Notification Recipients</Label>
                            <Input
                              placeholder="admin@yourcompany.com, sales@yourcompany.com"
                              value={customConfig?.notifications?.emailRecipients || ""}
                              onChange={(e) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                notifications: {
                                  ...prev?.notifications,
                                  emailRecipients: e.target.value
                                }
                              }))}
                              className="bg-midnight-900 border-midnight-600 text-white mt-1"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300 text-sm">Instant Notifications</Label>
                              <p className="text-xs text-gray-500">Send immediate email when quote is submitted</p>
                            </div>
                            <Switch
                              checked={customConfig?.notifications?.instantNotifications || true}
                              onCheckedChange={(checked) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                notifications: {
                                  ...prev?.notifications,
                                  instantNotifications: checked
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300 text-sm">Analytics Tracking</Label>
                              <p className="text-xs text-gray-500">Track form completion and conversion rates</p>
                            </div>
                            <Switch
                              checked={customConfig?.analytics?.tracking || true}
                              onCheckedChange={(checked) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                analytics: {
                                  ...prev?.analytics,
                                  tracking: checked
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300 text-sm">Show Powered By</Label>
                              <p className="text-xs text-gray-500">Display "Powered by QuoteKits" footer</p>
                            </div>
                            <Switch
                              checked={customConfig?.branding?.showPoweredBy !== false}
                              onCheckedChange={(checked) => setCustomConfig((prev: any) => ({ 
                                ...prev, 
                                branding: {
                                  ...prev?.branding,
                                  showPoweredBy: checked
                                }
                              }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - Live Preview */}
                  <div className="w-1/2 flex flex-col">
                    <div className="p-4 border-b border-midnight-700 bg-midnight-900 flex-shrink-0">
                      <h3 className="text-lg font-medium text-white flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-neon-400" />
                        Live Preview
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">Scroll to view the full calculator</p>
                    </div>
                    <div className="flex-1 bg-gray-100 relative">
                      <div className="absolute inset-0 overflow-y-auto">
                        <div className="min-h-full">
                          <CalculatorPreview 
                            slug={selectedCalculator.slug} 
                            customConfig={customConfig}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center px-6 py-4 border-t border-midnight-700 bg-midnight-900">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomizeModal(false)}
                    className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                  >
                    Cancel
                  </Button>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCustomConfig({});
                        toast({
                          title: "Reset Complete",
                          description: "All customizations have been reset to default.",
                        });
                      }}
                      className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                    >
                      Reset to Default
                    </Button>
                    <Button
                      onClick={() => {
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
                      className="bg-neon-500 hover:bg-neon-600 text-black font-medium"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Calculator Selection Modal */}
        {showCalculatorModal && (
          <Dialog open={showCalculatorModal} onOpenChange={setShowCalculatorModal}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-midnight-800 border-midnight-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add Calculator</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Choose from our library of professional calculator templates.
                </DialogDescription>
              </DialogHeader>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search calculators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-midnight-900 border-midnight-600 text-white"
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
                    <SelectItem value="Education & Training">Education & Training</SelectItem>
                    <SelectItem value="Health & Medical">Health & Medical</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Calculator Grid */}
              <div className="overflow-y-auto max-h-[60vh]">
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

              <div className="flex items-center justify-between pt-6 border-t border-midnight-700">
                <p className="text-sm text-gray-400">
                  {filteredCalculators.length} calculators available
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowCalculatorModal(false)}
                  className="border-midnight-600 text-gray-300"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Embed Code Modal */}
        {showEmbedModal && selectedCalculator && (
          <Dialog open={showEmbedModal} onOpenChange={setShowEmbedModal}>
            <DialogContent className="max-w-2xl bg-midnight-800 border-midnight-700">
              <DialogHeader>
                <DialogTitle className="text-white">Embed Code</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Copy this code to embed your calculator on your website.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">HTML Embed Code</Label>
                  <div className="mt-2 p-3 bg-midnight-900 border border-midnight-600 rounded-lg">
                    <code className="text-sm text-gray-300 break-all">
                      {`<iframe src="${window.location.origin}/calculator/${selectedCalculator.slug}" width="100%" height="600" frameborder="0"></iframe>`}
                    </code>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmbedModal(false)}
                    className="border-midnight-600 text-gray-300"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(`<iframe src="${window.location.origin}/calculator/${selectedCalculator.slug}" width="100%" height="600" frameborder="0"></iframe>`);
                      toast({
                        title: "Copied!",
                        description: "Embed code copied to clipboard.",
                      });
                    }}
                    className="bg-neon-500 hover:bg-neon-600 text-black"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}