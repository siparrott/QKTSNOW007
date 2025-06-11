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
  Search
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
    setCustomConfig(calc.config || defaultConfig);
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
              <div className="text-2xl font-bold text-white">1,234</div>
              <p className="text-xs text-gray-500">+18% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-neon-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">32.4%</div>
              <p className="text-xs text-gray-500">+2.1% from last month</p>
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

        {/* Calculator List */}
        <Card className="bg-midnight-800 border-midnight-700">
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

                      {/* Styling Options */}
                      <div>
                        <h3 className="text-white font-medium mb-4 flex items-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          Styling
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
                              <option value="Inter">Inter</option>
                              <option value="Arial">Arial</option>
                              <option value="Helvetica">Helvetica</option>
                              <option value="Georgia">Georgia</option>
                              <option value="Times New Roman">Times New Roman</option>
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
                              <option value="0">None</option>
                              <option value="0.25rem">Small</option>
                              <option value="0.5rem">Medium</option>
                              <option value="1rem">Large</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <h3 className="text-white font-medium mb-4 flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          Features
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
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - Live Preview */}
                  <div className="w-1/2 flex flex-col">
                    <div className="p-4 border-b border-midnight-700 bg-midnight-900">
                      <h3 className="text-lg font-medium text-white flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-neon-400" />
                        Live Preview
                      </h3>
                    </div>
                    <div className="flex-1 overflow-hidden bg-white">
                      <div className="h-full overflow-y-auto">
                        <CalculatorPreview 
                          slug={selectedCalculator.slug} 
                          customConfig={customConfig}
                          className="min-h-full"
                        />
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