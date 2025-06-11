import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calculator, Plus, Settings, Eye, Copy, ExternalLink, BarChart3, Users, TrendingUp, Activity, Calendar, DollarSign, Palette, Type, Layout, Zap, Bell, Smartphone, Monitor, Tablet } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from "recharts";

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

interface CalculatorTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  template_id: string;
  slug: string;
}

const mockUser: User = {
  id: "1",
  email: "user@example.com",
  fullName: "John Doe",
  subscriptionStatus: "Pro",
  quotesUsedThisMonth: 245,
  quotesLimit: 1000
};

const calculatorTemplates: CalculatorTemplate[] = [
  // Photography Services
  { id: "1", name: "Wedding Photography Calculator", category: "Photography", description: "Comprehensive wedding photography with venue types, packages, and AI pricing", template_id: "wedding-photography", slug: "wedding-photography" },
  { id: "2", name: "Portrait Photography Calculator", category: "Photography", description: "Professional portrait sessions with advanced booking system", template_id: "portrait-photography", slug: "portrait-photography" },
  { id: "3", name: "Boudoir Photography Calculator", category: "Photography", description: "Intimate photography sessions with privacy options", template_id: "boudoir-photography", slug: "boudoir-photography" },
  { id: "4", name: "Commercial Photography Calculator", category: "Photography", description: "Business photography with usage rights and licensing", template_id: "commercial-photography", slug: "commercial-photography" },
  { id: "5", name: "Real Estate Photography Calculator", category: "Photography", description: "Property photography with drone and virtual tour options", template_id: "real-estate-photography", slug: "real-estate-photography" },
  { id: "6", name: "Event Videography Calculator", category: "Photography", description: "Professional event videography with editing packages", template_id: "event-videography", slug: "event-videography" },
  { id: "7", name: "Drone Photography Calculator", category: "Photography", description: "Aerial photography with flight permits and equipment", template_id: "drone-photography", slug: "drone-photography" },
  { id: "8", name: "Food Photography Calculator", category: "Photography", description: "Culinary photography for restaurants and brands", template_id: "food-photography", slug: "food-photography" },
  { id: "9", name: "Newborn Photography Calculator", category: "Photography", description: "Specialized newborn sessions with safety protocols", template_id: "newborn-photography", slug: "newborn-photography" },
  { id: "10", name: "Maternity Photography Calculator", category: "Photography", description: "Pregnancy photography with wardrobe and locations", template_id: "maternity-photography", slug: "maternity-photography" },
  
  // Construction & Home Services
  { id: "11", name: "Home Renovation Calculator", category: "Construction", description: "Complete renovation planning with materials and labor", template_id: "home-renovation", slug: "home-renovation-calculator-new" },
  { id: "12", name: "Roofing Services Calculator", category: "Construction", description: "Roofing installation with material options and warranties", template_id: "roofing-services", slug: "roofing-calculator" },
  { id: "13", name: "Electrician Services Calculator", category: "Construction", description: "Electrical work with safety certifications and permits", template_id: "electrician", slug: "electrician-calculator" },
  { id: "14", name: "Plumbing Services Calculator", category: "Construction", description: "Plumbing repairs and installations with emergency rates", template_id: "plumbing", slug: "plumbing-calculator" },
  { id: "15", name: "Solar Panel Installation Calculator", category: "Construction", description: "Solar energy systems with financing and incentives", template_id: "solar", slug: "solar-calculator" },
  { id: "16", name: "Window & Door Installation Calculator", category: "Construction", description: "Custom windows and doors with energy efficiency ratings", template_id: "window-door", slug: "window-door-calculator" },
  { id: "17", name: "Landscaping Services Calculator", category: "Construction", description: "Garden design and maintenance with seasonal planning", template_id: "landscaping", slug: "landscaping-calculator" },
  { id: "18", name: "Painting & Decorating Calculator", category: "Construction", description: "Interior and exterior painting with premium finishes", template_id: "painting-decorating", slug: "painting-decorating-calculator" },
  
  // Health & Beauty Services
  { id: "19", name: "Makeup Artist Calculator", category: "Beauty", description: "Professional makeup for weddings and events", template_id: "makeup-artist", slug: "makeup-artist-calculator" },
  { id: "20", name: "Hair Stylist Calculator", category: "Beauty", description: "Hair styling services with product recommendations", template_id: "hair-stylist", slug: "hair-stylist-calculator" },
  { id: "21", name: "Tattoo Artist Calculator", category: "Beauty", description: "Custom tattoo pricing with design complexity", template_id: "tattoo-artist", slug: "tattoo-artist-calculator" },
  { id: "22", name: "Massage Therapy Calculator", category: "Beauty", description: "Therapeutic massage with specialized techniques", template_id: "massage-therapy", slug: "massage-therapy-calculator" },
  { id: "23", name: "Personal Training Calculator", category: "Beauty", description: "Fitness coaching with nutrition and workout plans", template_id: "personal-training", slug: "personal-training-calculator" },
  { id: "24", name: "Nutritionist Calculator", category: "Beauty", description: "Dietary consultation with meal planning", template_id: "nutritionist", slug: "nutritionist-calculator" },
  
  // Professional Services
  { id: "25", name: "Legal Services Calculator", category: "Legal", description: "Legal consultation with case complexity assessment", template_id: "legal-services", slug: "legal-advisor-calculator" },
  { id: "26", name: "Tax Preparation Calculator", category: "Legal", description: "Tax filing services with audit protection", template_id: "tax-preparer", slug: "tax-preparer-calculator" },
  { id: "27", name: "Business Coach Calculator", category: "Professional", description: "Business consulting with strategic planning", template_id: "business-coach", slug: "business-coach-calculator" },
  { id: "28", name: "Life Coach Calculator", category: "Professional", description: "Personal development coaching with goal setting", template_id: "life-coach", slug: "life-coach-calculator" },
  { id: "29", name: "Virtual Assistant Calculator", category: "Professional", description: "Administrative support with task specialization", template_id: "virtual-assistant", slug: "virtual-assistant-calculator" },
  { id: "30", name: "Translation Services Calculator", category: "Professional", description: "Document translation with certification options", template_id: "translation-services", slug: "translation-services-calculator" },
  
  // Technology Services
  { id: "31", name: "Web Designer Calculator", category: "Technology", description: "Website design with responsive and e-commerce options", template_id: "web-designer", slug: "web-designer-calculator" },
  { id: "32", name: "SEO Agency Calculator", category: "Technology", description: "Search optimization with analytics and reporting", template_id: "seo-agency", slug: "seo-agency-calculator" },
  { id: "33", name: "Video Editor Calculator", category: "Technology", description: "Video editing with motion graphics and effects", template_id: "video-editor", slug: "video-editor-calculator" },
  { id: "34", name: "Marketing Consultant Calculator", category: "Technology", description: "Digital marketing strategy with campaign management", template_id: "marketing-consultant", slug: "marketing-consultant-calculator" },
  { id: "35", name: "Copywriter Calculator", category: "Technology", description: "Content writing with SEO optimization", template_id: "copywriter", slug: "copywriter-calculator" },
  
  // Automotive Services
  { id: "36", name: "Auto Mechanic Calculator", category: "Automotive", description: "Vehicle repairs with diagnostic and parts", template_id: "auto-mechanic", slug: "auto-mechanic-calculator" },
  { id: "37", name: "Car Detailing Calculator", category: "Automotive", description: "Vehicle cleaning with paint protection services", template_id: "car-detailing", slug: "car-detailing-calculator" },
  { id: "38", name: "Mobile Car Wash Calculator", category: "Automotive", description: "On-location vehicle cleaning services", template_id: "mobile-car-wash", slug: "mobile-car-wash-calculator" },
  { id: "39", name: "Motorcycle Repair Calculator", category: "Automotive", description: "Motorcycle maintenance and customization", template_id: "motorcycle-repair", slug: "motorcycle-repair-calculator" },
  { id: "40", name: "Driving Instructor Calculator", category: "Automotive", description: "Driving lessons with test preparation", template_id: "driving-instructor", slug: "driving-instructor-calculator" },
  
  // Transportation Services
  { id: "41", name: "Airport Transfer Calculator", category: "Transportation", description: "Airport shuttle with flight tracking", template_id: "airport-transfer", slug: "airport-transfer-calculator" },
  { id: "42", name: "Chauffeur & Limo Calculator", category: "Transportation", description: "Luxury transportation with event packages", template_id: "chauffeur-limo", slug: "chauffeur-limo-calculator" },
  { id: "43", name: "Van Rental Calculator", category: "Transportation", description: "Commercial vehicle rental with insurance", template_id: "van-rental", slug: "van-rental-calculator" },
  { id: "44", name: "Moving Services Calculator", category: "Transportation", description: "Relocation services with packing and storage", template_id: "moving-services", slug: "moving-services-calculator" },
  { id: "45", name: "Boat Charter Calculator", category: "Transportation", description: "Marine vessel rental with crew and catering", template_id: "boat-charter", slug: "boat-charter-calculator" },
  
  // Cleaning & Maintenance
  { id: "46", name: "Cleaning Services Calculator", category: "Professional", description: "Residential and commercial cleaning with eco options", template_id: "cleaning-services", slug: "cleaning-services-calculator" },
  { id: "47", name: "Pest Control Calculator", category: "Professional", description: "Pest elimination with prevention and warranties", template_id: "pest-control", slug: "pest-control-calculator" },
  { id: "48", name: "Interior Design Calculator", category: "Professional", description: "Space design with furniture and decoration", template_id: "interior-design", slug: "interior-design-calculator" },
  
  // Medical & Educational Services
  { id: "49", name: "Dentist Services Calculator", category: "Medical", description: "Dental procedures with insurance coordination", template_id: "dentist", slug: "dentist-calculator" },
  { id: "50", name: "Plastic Surgery Calculator", category: "Medical", description: "Cosmetic procedures with recovery planning", template_id: "plastic-surgery", slug: "plastic-surgery-calculator" },
  { id: "51", name: "Private Medical Calculator", category: "Medical", description: "Private healthcare with specialist consultations", template_id: "private-medical", slug: "private-medical-calculator" },
  { id: "52", name: "Childcare Services Calculator", category: "Education", description: "Daycare and nanny services with educational programs", template_id: "childcare-services", slug: "childcare-services-calculator" },
  { id: "53", name: "Private School Calculator", category: "Education", description: "Private education with extracurricular activities", template_id: "private-school", slug: "private-school-calculator" },
  { id: "54", name: "Private Tutor Calculator", category: "Education", description: "Personal tutoring with subject specialization", template_id: "private-tutor", slug: "private-tutor-calculator" },
  
  // Specialized Services
  { id: "55", name: "Hypnotherapist Calculator", category: "Professional", description: "Hypnotherapy sessions with treatment programs", template_id: "hypnotherapist", slug: "hypnotherapist-calculator" },
  { id: "56", name: "Dog Trainer Calculator", category: "Professional", description: "Pet training with behavioral modification", template_id: "dog-trainer", slug: "dog-trainer-calculator" }
];

const performanceData = [
  { name: 'Jan', quotes: 65, conversions: 45 },
  { name: 'Feb', quotes: 78, conversions: 52 },
  { name: 'Mar', quotes: 90, conversions: 61 },
  { name: 'Apr', quotes: 85, conversions: 58 },
  { name: 'May', quotes: 105, conversions: 72 },
  { name: 'Jun', quotes: 120, conversions: 84 }
];

const clientData = [
  { id: 1, name: "Sarah Johnson", email: "sarah@email.com", project: "Wedding Photography", quote: "$2,500", status: "Accepted", date: "2024-06-10" },
  { id: 2, name: "Michael Chen", email: "mike@email.com", project: "Home Renovation", quote: "$15,000", status: "Pending", date: "2024-06-09" },
  { id: 3, name: "Emily Davis", email: "emily@email.com", project: "Legal Consultation", quote: "$350", status: "Accepted", date: "2024-06-08" },
  { id: 4, name: "Robert Wilson", email: "robert@email.com", project: "Pest Control", quote: "$180", status: "Declined", date: "2024-06-07" },
  { id: 5, name: "Lisa Anderson", email: "lisa@email.com", project: "Portrait Session", quote: "$450", status: "Accepted", date: "2024-06-06" }
];

export default function Dashboard() {
  const [user] = useState<User>(mockUser);
  const [userCalculators, setUserCalculators] = useState<UserCalculator[]>([]);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState<UserCalculator | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customConfig, setCustomConfig] = useState<any>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('userCalculators');
    if (saved) {
      setUserCalculators(JSON.parse(saved));
    }
  }, []);

  const filteredCalculators = calculatorTemplates.filter(calc => {
    const matchesSearch = calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || calc.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const addCalculator = (template: CalculatorTemplate) => {
    // Map template IDs to actual calculator routes for embed URLs
    const calculatorRoutes: { [key: string]: string } = {
      'wedding-photography': '/wedding-photography-calculator',
      'home-renovation': '/home-renovation-calculator-new',
      'legal-services': '/legal-advisor-calculator',
      'pest-control': '/pest-control-calculator',
      'portrait-photography': '/portrait-photography-calculator',
      'roofing-services': '/roofing-calculator',
      'electrician': '/electrician-calculator',
      'drone-photography': '/drone-photography-calculator',
      'event-videography': '/event-videography-calculator',
      'real-estate-photography': '/real-estate-photography-calculator',
      'commercial-photography': '/commercial-photography-calculator',
      'food-photography': '/food-photography-calculator',
      'landscaping': '/landscaping-calculator',
      'solar': '/solar-calculator',
      'window-door': '/window-door-calculator',
      'makeup-artist': '/makeup-artist-calculator',
      'hair-stylist': '/hair-stylist-calculator',
      'cleaning-services': '/cleaning-services-calculator',
      'virtual-assistant': '/virtual-assistant-calculator',
      'business-coach': '/business-coach-calculator',
      'tax-preparer': '/tax-preparer-calculator',
      'translation-services': '/translation-services-calculator',
      'dentist': '/dentist-calculator',
      'childcare': '/childcare-calculator',
      'plastic-surgery': '/plastic-surgery-calculator',
      'private-medical': '/private-medical-calculator'
    };

    const calculatorRoute = calculatorRoutes[template.template_id] || `/calculator/${template.template_id}`;
    
    const newCalculator: UserCalculator = {
      id: `calc_${Date.now()}`,
      name: template.name,
      slug: `${template.slug}-${Date.now()}`,
      embed_url: `${window.location.origin}${calculatorRoute}`,
      admin_url: `${window.location.origin}/dashboard`,
      calculator_id: parseInt(template.id),
      config: {},
      custom_branding: {},
      is_active: true,
      template_id: template.template_id,
      layout_json: {},
      logic_json: {},
      style_json: {},
      prompt_md: "",
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };

    const updated = [...userCalculators, newCalculator];
    setUserCalculators(updated);
    localStorage.setItem('userCalculators', JSON.stringify(updated));
    setShowCalculatorModal(false);
    
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const customizeCalculator = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    setCustomConfig(calc.config || {});
    setShowCustomizeModal(true);
  };

  const previewCalculator = (calc: UserCalculator) => {
    // Map template IDs to actual calculator routes
    const calculatorRoutes: { [key: string]: string } = {
      'wedding-photography': '/wedding-photography-calculator',
      'boudoir-photography': '/boudoir-photography-calculator',
      'portrait-photography': '/portrait-photography-calculator',
      'commercial-photography': '/commercial-photography-calculator',
      'real-estate-photography': '/real-estate-photography-calculator',
      'event-videography': '/event-videography-calculator',
      'drone-photography': '/drone-photography-calculator',
      'food-photography': '/food-photography-calculator',
      'newborn-photography': '/newborn-photography-calculator',
      'maternity-photography': '/maternity-photography-calculator',
      'home-renovation': '/home-renovation-calculator-new',
      'roofing-services': '/roofing-calculator',
      'electrician': '/electrician-calculator',
      'plumbing': '/plumbing-calculator',
      'solar': '/solar-calculator',
      'window-door': '/window-door-calculator',
      'landscaping': '/landscaping-calculator',
      'painting-decorating': '/painting-decorating-calculator',
      'makeup-artist': '/makeup-artist-calculator',
      'hair-stylist': '/hair-stylist-calculator',
      'tattoo-artist': '/tattoo-artist-calculator',
      'massage-therapy': '/massage-therapy-calculator',
      'personal-training': '/personal-training-calculator',
      'nutritionist': '/nutritionist-calculator',
      'legal-services': '/legal-advisor-calculator',
      'tax-preparer': '/tax-preparer-calculator',
      'business-coach': '/business-coach-calculator',
      'life-coach': '/life-coach-calculator',
      'virtual-assistant': '/virtual-assistant-calculator',
      'translation-services': '/translation-services-calculator',
      'web-designer': '/web-designer-calculator',
      'seo-agency': '/seo-agency-calculator',
      'video-editor': '/video-editor-calculator',
      'marketing-consultant': '/marketing-consultant-calculator',
      'copywriter': '/copywriter-calculator',
      'auto-mechanic': '/auto-mechanic-calculator',
      'car-detailing': '/car-detailing-calculator',
      'mobile-car-wash': '/mobile-car-wash-calculator',
      'motorcycle-repair': '/motorcycle-repair-calculator',
      'driving-instructor': '/driving-instructor-calculator',
      'airport-transfer': '/airport-transfer-calculator',
      'chauffeur-limo': '/chauffeur-limo-calculator',
      'van-rental': '/van-rental-calculator',
      'moving-services': '/moving-services-calculator',
      'boat-charter': '/boat-charter-calculator',
      'cleaning-services': '/cleaning-services-calculator',
      'pest-control': '/pest-control-calculator',
      'interior-design': '/interior-design-calculator',
      'dentist': '/dentist-calculator',
      'plastic-surgery': '/plastic-surgery-calculator',
      'private-medical': '/private-medical-calculator',
      'childcare-services': '/childcare-services-calculator',
      'private-school': '/private-school-calculator',
      'private-tutor': '/private-tutor-calculator',
      'hypnotherapist': '/hypnotherapist-calculator',
      'dog-trainer': '/dog-trainer-calculator'
    };
    
    const route = calculatorRoutes[calc.template_id] || `/calculator/${calc.template_id}`;
    
    // Pass configuration as URL parameters for dynamic customization
    const configParams = new URLSearchParams();
    if (calc.config) {
      Object.keys(calc.config).forEach(key => {
        if (calc.config[key] !== undefined && calc.config[key] !== null) {
          configParams.append(key, String(calc.config[key]));
        }
      });
    }
    
    const finalUrl = configParams.toString() ? `${route}?${configParams.toString()}` : route;
    window.open(finalUrl, '_blank');
  };

  const showEmbedCode = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    setShowEmbedModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-800">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Manage your quote calculators and track performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-midnight-800 border-midnight-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Calculators</p>
                  <p className="text-2xl font-bold text-white">{userCalculators.length}</p>
                </div>
                <Calculator className="h-8 w-8 text-neon-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Quotes This Month</p>
                  <p className="text-2xl font-bold text-white">{user.quotesUsedThisMonth}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-neon-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Conversion Rate</p>
                  <p className="text-2xl font-bold text-white">68%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-neon-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Revenue Generated</p>
                  <p className="text-2xl font-bold text-white">$23,450</p>
                </div>
                <DollarSign className="h-8 w-8 text-neon-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Calculators */}
        <Card className="bg-midnight-800 border-midnight-700 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-neon-400" />
                Your Calculators
              </CardTitle>
              <Button
                onClick={() => setShowCalculatorModal(true)}
                className="bg-neon-500 hover:bg-neon-600 text-black font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Calculator
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {userCalculators.length === 0 ? (
              <div className="text-center py-12">
                <Calculator className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No calculators yet</h3>
                <p className="text-gray-400 mb-4">Create your first calculator to start generating quotes</p>
                <Button
                  onClick={() => setShowCalculatorModal(true)}
                  className="bg-neon-500 hover:bg-neon-600 text-black font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Calculator
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userCalculators.map((calc) => (
                  <Card key={calc.id} className="bg-midnight-900 border-midnight-700 hover:border-neon-500/50 transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-white truncate">{calc.name}</h3>
                        <Badge 
                          variant={calc.is_active ? "default" : "secondary"}
                          className={calc.is_active ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"}
                        >
                          {calc.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-4">
                        Created {new Date(calc.created_at).toLocaleDateString()}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => customizeCalculator(calc)}
                          className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => previewCalculator(calc)}
                          className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => showEmbedCode(calc)}
                          className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Chart */}
          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-neon-400" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }} 
                  />
                  <Line type="monotone" dataKey="quotes" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="conversions" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="h-5 w-5 mr-2 text-neon-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-midnight-900 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">New quote generated</p>
                    <p className="text-xs text-gray-400">Wedding Photography - $2,500</p>
                  </div>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-midnight-900 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Calculator customized</p>
                    <p className="text-xs text-gray-400">Home Renovation Calculator</p>
                  </div>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-midnight-900 rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Quote accepted</p>
                    <p className="text-xs text-gray-400">Legal Services - $350</p>
                  </div>
                  <span className="text-xs text-gray-500">3 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Management */}
        <Card className="bg-midnight-800 border-midnight-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-neon-400" />
              Recent Client Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-midnight-700">
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Client</th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Project</th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Quote</th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Status</th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.map((client) => (
                    <tr key={client.id} className="border-b border-midnight-700/50">
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium text-white">{client.name}</p>
                          <p className="text-xs text-gray-400">{client.email}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="text-sm text-gray-300">{client.project}</p>
                      </td>
                      <td className="py-3">
                        <p className="text-sm font-medium text-white">{client.quote}</p>
                      </td>
                      <td className="py-3">
                        <Badge 
                          variant={
                            client.status === 'Accepted' ? 'default' : 
                            client.status === 'Pending' ? 'secondary' : 
                            'destructive'
                          }
                          className={
                            client.status === 'Accepted' ? 'bg-green-500 text-white' :
                            client.status === 'Pending' ? 'bg-yellow-500 text-black' :
                            'bg-red-500 text-white'
                          }
                        >
                          {client.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <p className="text-sm text-gray-400">{client.date}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Customization Modal */}
        {showCustomizeModal && selectedCalculator && (
          <Dialog open={showCustomizeModal} onOpenChange={setShowCustomizeModal}>
            <DialogContent className="max-w-7xl w-[95vw] h-[95vh] bg-midnight-800 border-midnight-700 p-0 flex flex-col">
              <DialogHeader className="px-6 py-4 border-b border-midnight-700 flex-shrink-0">
                <DialogTitle className="text-white">Customize Calculator</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Personalize your calculator appearance and functionality.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-1 min-h-0">
                {/* Left Panel - Customization Options */}
                <div className="w-1/2 border-r border-midnight-700 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
                    
                    {/* Branding */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Palette className="h-4 w-4 mr-2" />
                        Branding
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Business Name</Label>
                          <Input
                            value={customConfig.businessName || ''}
                            onChange={(e) => setCustomConfig({...customConfig, businessName: e.target.value})}
                            placeholder="Your Business Name"
                            className="bg-midnight-900 border-midnight-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Logo URL</Label>
                          <Input
                            value={customConfig.logoUrl || ''}
                            onChange={(e) => setCustomConfig({...customConfig, logoUrl: e.target.value})}
                            placeholder="https://yoursite.com/logo.png"
                            className="bg-midnight-900 border-midnight-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Primary Color</Label>
                          <Input
                            type="color"
                            value={customConfig.primaryColor || '#10B981'}
                            onChange={(e) => setCustomConfig({...customConfig, primaryColor: e.target.value})}
                            className="h-12 bg-midnight-900 border-midnight-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Calculator Text */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Type className="h-4 w-4 mr-2" />
                        Calculator Text
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Calculator Title</Label>
                          <Input
                            value={customConfig.title || selectedCalculator.name}
                            onChange={(e) => setCustomConfig({...customConfig, title: e.target.value})}
                            className="bg-midnight-900 border-midnight-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Description</Label>
                          <Textarea
                            value={customConfig.description || ''}
                            onChange={(e) => setCustomConfig({...customConfig, description: e.target.value})}
                            placeholder="Brief description of your service"
                            className="bg-midnight-900 border-midnight-600 text-white"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Submit Button Text</Label>
                          <Input
                            value={customConfig.submitText || 'Get My Quote'}
                            onChange={(e) => setCustomConfig({...customConfig, submitText: e.target.value})}
                            className="bg-midnight-900 border-midnight-600 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Layout & Spacing */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Layout className="h-4 w-4 mr-2" />
                        Layout & Spacing
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Layout Style</Label>
                          <Select value={customConfig.layout || 'vertical'} onValueChange={(value) => setCustomConfig({...customConfig, layout: value})}>
                            <SelectTrigger className="bg-midnight-900 border-midnight-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vertical">Vertical (Single Column)</SelectItem>
                              <SelectItem value="horizontal">Horizontal (Multi-Column)</SelectItem>
                              <SelectItem value="wizard">Step-by-Step Wizard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-300">Padding: {customConfig.padding || 20}px</Label>
                          <Slider
                            value={[customConfig.padding || 20]}
                            onValueChange={(value) => setCustomConfig({...customConfig, padding: value[0]})}
                            max={60}
                            min={0}
                            step={5}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Border Radius: {customConfig.borderRadius || 8}px</Label>
                          <Slider
                            value={[customConfig.borderRadius || 8]}
                            onValueChange={(value) => setCustomConfig({...customConfig, borderRadius: value[0]})}
                            max={24}
                            min={0}
                            step={2}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Behavior */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Zap className="h-4 w-4 mr-2" />
                        Form Behavior
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-300">Real-time Updates</Label>
                          <Switch
                            checked={customConfig.realTimeUpdates !== false}
                            onCheckedChange={(checked) => setCustomConfig({...customConfig, realTimeUpdates: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-300">Show Progress Bar</Label>
                          <Switch
                            checked={customConfig.showProgress || false}
                            onCheckedChange={(checked) => setCustomConfig({...customConfig, showProgress: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-300">Required Field Validation</Label>
                          <Switch
                            checked={customConfig.validation !== false}
                            onCheckedChange={(checked) => setCustomConfig({...customConfig, validation: checked})}
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Animation Speed</Label>
                          <Select value={customConfig.animationSpeed || 'normal'} onValueChange={(value) => setCustomConfig({...customConfig, animationSpeed: value})}>
                            <SelectTrigger className="bg-midnight-900 border-midnight-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="slow">Slow</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="fast">Fast</SelectItem>
                              <SelectItem value="none">No Animation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Notifications & Analytics */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications & Analytics
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Email Notifications</Label>
                          <Input
                            value={customConfig.notificationEmail || ''}
                            onChange={(e) => setCustomConfig({...customConfig, notificationEmail: e.target.value})}
                            placeholder="your@email.com"
                            type="email"
                            className="bg-midnight-900 border-midnight-600 text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-300">Track Conversions</Label>
                          <Switch
                            checked={customConfig.trackConversions !== false}
                            onCheckedChange={(checked) => setCustomConfig({...customConfig, trackConversions: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-300">Capture Lead Info</Label>
                          <Switch
                            checked={customConfig.captureLeads || false}
                            onCheckedChange={(checked) => setCustomConfig({...customConfig, captureLeads: checked})}
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Google Analytics ID</Label>
                          <Input
                            value={customConfig.googleAnalytics || ''}
                            onChange={(e) => setCustomConfig({...customConfig, googleAnalytics: e.target.value})}
                            placeholder="GA4-XXXXXXXXXX"
                            className="bg-midnight-900 border-midnight-600 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Device Optimization */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Smartphone className="h-4 w-4 mr-2" />
                        Device Optimization
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-300">Mobile Optimized</Label>
                          <Switch
                            checked={customConfig.mobileOptimized !== false}
                            onCheckedChange={(checked) => setCustomConfig({...customConfig, mobileOptimized: checked})}
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Responsive Breakpoint</Label>
                          <Select value={customConfig.breakpoint || 'md'} onValueChange={(value) => setCustomConfig({...customConfig, breakpoint: value})}>
                            <SelectTrigger className="bg-midnight-900 border-midnight-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sm">Small (640px)</SelectItem>
                              <SelectItem value="md">Medium (768px)</SelectItem>
                              <SelectItem value="lg">Large (1024px)</SelectItem>
                              <SelectItem value="xl">Extra Large (1280px)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-300">Font Size: {customConfig.fontSize || 16}px</Label>
                          <Slider
                            value={[customConfig.fontSize || 16]}
                            onValueChange={(value) => setCustomConfig({...customConfig, fontSize: value[0]})}
                            max={24}
                            min={12}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Advanced Styling */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Palette className="h-4 w-4 mr-2" />
                        Advanced Styling
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Background Color</Label>
                          <Input
                            type="color"
                            value={customConfig.backgroundColor || '#ffffff'}
                            onChange={(e) => setCustomConfig({...customConfig, backgroundColor: e.target.value})}
                            className="h-12 bg-midnight-900 border-midnight-600"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Text Color</Label>
                          <Input
                            type="color"
                            value={customConfig.textColor || '#000000'}
                            onChange={(e) => setCustomConfig({...customConfig, textColor: e.target.value})}
                            className="h-12 bg-midnight-900 border-midnight-600"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Custom CSS</Label>
                          <Textarea
                            value={customConfig.customCSS || ''}
                            onChange={(e) => setCustomConfig({...customConfig, customCSS: e.target.value})}
                            placeholder="/* Custom CSS styles */\n.calculator-form {\n  /* your styles here */\n}"
                            className="bg-midnight-900 border-midnight-600 text-white font-mono text-sm"
                            rows={6}
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
                    <p className="text-sm text-gray-400 mt-1">See changes in real-time</p>
                  </div>
                  
                  <div className="flex-1 overflow-hidden bg-gray-100 relative">
                    <div 
                      className="w-full h-full overflow-y-auto p-6"
                      style={{
                        backgroundColor: customConfig.backgroundColor || '#ffffff',
                        color: customConfig.textColor || '#000000',
                        fontSize: `${customConfig.fontSize || 16}px`,
                        padding: `${customConfig.padding || 20}px`
                      }}
                    >
                      <div 
                        className="max-w-md mx-auto bg-white rounded-lg shadow-lg"
                        style={{
                          borderRadius: `${customConfig.borderRadius || 8}px`,
                          borderColor: customConfig.primaryColor || '#10B981',
                          borderWidth: '2px',
                          borderStyle: 'solid'
                        }}
                      >
                        <div className="p-6">
                          {customConfig.logoUrl && (
                            <img 
                              src={customConfig.logoUrl} 
                              alt="Logo" 
                              className="h-12 mx-auto mb-4"
                            />
                          )}
                          
                          <h2 className="text-2xl font-bold text-center mb-2">
                            {customConfig.title || selectedCalculator.name}
                          </h2>
                          
                          {customConfig.description && (
                            <p className="text-gray-600 text-center mb-6">
                              {customConfig.description}
                            </p>
                          )}
                          
                          {customConfig.businessName && (
                            <div className="text-center mb-4">
                              <span className="text-sm text-gray-500">by </span>
                              <span className="font-medium">{customConfig.businessName}</span>
                            </div>
                          )}
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Service Type</label>
                              <select className="w-full p-2 border rounded">
                                <option>Select service...</option>
                                <option>Basic Package</option>
                                <option>Premium Package</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">Project Size</label>
                              <input 
                                type="range" 
                                className="w-full"
                                style={{ accentColor: customConfig.primaryColor || '#10B981' }}
                              />
                            </div>
                            
                            {customConfig.showProgress && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full" 
                                  style={{ 
                                    width: '60%',
                                    backgroundColor: customConfig.primaryColor || '#10B981'
                                  }}
                                ></div>
                              </div>
                            )}
                            
                            <button 
                              className="w-full py-3 rounded font-medium text-white"
                              style={{ backgroundColor: customConfig.primaryColor || '#10B981' }}
                            >
                              {customConfig.submitText || 'Get My Quote'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center px-6 py-4 border-t border-midnight-700 bg-midnight-900 flex-shrink-0">
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

              <div className="flex flex-col space-y-4 p-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    placeholder="Search calculators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-midnight-900 border-midnight-600 text-white placeholder-gray-400"
                  />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="sm:w-48 bg-midnight-900 border-midnight-600 text-white">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-midnight-900 border-midnight-600">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                      <SelectItem value="professional">Professional Services</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Calculator Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredCalculators.map((calculator) => (
                    <Card 
                      key={calculator.id} 
                      className="bg-midnight-900 border-midnight-700 hover:border-neon-500/50 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-neon-500/20"
                      onClick={() => addCalculator(calculator)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-neon-400 to-neon-600 rounded-lg flex items-center justify-center">
                            <Calculator className="h-5 w-5 text-black" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white text-sm">{calculator.name}</h3>
                            <p className="text-xs text-gray-400">{calculator.category}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{calculator.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredCalculators.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-400">No calculators found matching your criteria.</p>
                      <Button
                        variant="outline"
                        onClick={() => setShowCalculatorModal(false)}
                        className="mt-2 border-midnight-600 text-gray-300 hover:bg-midnight-800"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
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
                  Copy and paste this code into your website to embed the calculator.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Preview URL */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Direct Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-sm text-gray-300 font-mono">
                      {selectedCalculator.embed_url}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedCalculator.embed_url);
                        toast({
                          title: "Copied!",
                          description: "Direct link copied to clipboard.",
                        });
                      }}
                      className="bg-neon-500 hover:bg-neon-600 text-black"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Embed Code */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Embed Code
                  </label>
                  <div className="flex items-start space-x-2">
                    <code className="flex-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-sm text-gray-300 font-mono whitespace-pre-wrap">
{`<iframe 
  src="${selectedCalculator.embed_url}" 
  width="100%" 
  height="600" 
  frameborder="0">
</iframe>`}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => {
                        const embedCode = `<iframe src="${selectedCalculator.embed_url}" width="100%" height="600" frameborder="0"></iframe>`;
                        navigator.clipboard.writeText(embedCode);
                        toast({
                          title: "Copied!",
                          description: "Embed code copied to clipboard.",
                        });
                      }}
                      className="bg-neon-500 hover:bg-neon-600 text-black"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmbedModal(false)}
                    className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            Calculator added successfully!
          </div>
        )}
      </div>
    </div>
  );
}