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
  MapPin,
  MessageSquare,
  Code2
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
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState<any>(null);
  const [customConfig, setCustomConfig] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // All available calculators
  const allCalculators = [
    { id: 1, name: "Wedding Photography", category: "Photography", slug: "wedding-photography", icon: <Camera className="h-5 w-5 text-white" />, description: "Custom quote calculator for wedding photography services" },
    { id: 2, name: "Boudoir Photography", category: "Photography", slug: "boudoir-photography", icon: <Camera className="h-5 w-5 text-white" />, description: "Elegant pricing for intimate photography sessions" },
    { id: 3, name: "Real Estate Photography", category: "Photography", slug: "real-estate-photography", icon: <Home className="h-5 w-5 text-white" />, description: "Professional property photography quotes" },
    { id: 4, name: "Drone Photography", category: "Photography", slug: "drone-photography", icon: <Plane className="h-5 w-5 text-white" />, description: "Aerial photography and videography services" },
    { id: 5, name: "Event Videography", category: "Photography", slug: "event-videography", icon: <Video className="h-5 w-5 text-white" />, description: "Professional event recording services" },
    { id: 6, name: "Electrician Services", category: "Home Services", slug: "electrician", icon: <Zap className="h-5 w-5 text-white" />, description: "Electrical work and installation quotes" },
    { id: 7, name: "Home Renovation", category: "Home Services", slug: "home-renovation", icon: <Home className="h-5 w-5 text-white" />, description: "Complete home renovation estimates" },
    { id: 8, name: "Plumbing Services", category: "Home Services", slug: "plumbing", icon: <Wrench className="h-5 w-5 text-white" />, description: "Plumbing repairs and installations" },
    { id: 9, name: "Landscaping", category: "Home Services", slug: "landscaping", icon: <TreePine className="h-5 w-5 text-white" />, description: "Garden design and maintenance" },
    { id: 10, name: "Personal Training", category: "Fitness", slug: "personal-training", icon: <Dumbbell className="h-5 w-5 text-white" />, description: "Fitness coaching and training plans" },
    { id: 11, name: "Nutritionist", category: "Health", slug: "nutritionist", icon: <Utensils className="h-5 w-5 text-white" />, description: "Personalized nutrition consultations" },
    { id: 12, name: "Legal Services", category: "Professional", slug: "legal-advisor", icon: <Scale className="h-5 w-5 text-white" />, description: "Legal consultation and document preparation" },
    { id: 13, name: "Web Design", category: "Technology", slug: "web-designer", icon: <Code className="h-5 w-5 text-white" />, description: "Custom website design and development" },
    { id: 14, name: "Marketing Consulting", category: "Business", slug: "marketing-consultant", icon: <Megaphone className="h-5 w-5 text-white" />, description: "Marketing strategy and campaign planning" },
    { id: 15, name: "Tutoring Services", category: "Education", slug: "private-tutor", icon: <GraduationCap className="h-5 w-5 text-white" />, description: "Private academic tutoring sessions" }
  ];

  // Categories with counts
  const categories = [
    { name: "Photography", count: allCalculators.filter(c => c.category === "Photography").length },
    { name: "Home Services", count: allCalculators.filter(c => c.category === "Home Services").length },
    { name: "Health", count: allCalculators.filter(c => c.category === "Health").length },
    { name: "Fitness", count: allCalculators.filter(c => c.category === "Fitness").length },
    { name: "Professional", count: allCalculators.filter(c => c.category === "Professional").length },
    { name: "Technology", count: allCalculators.filter(c => c.category === "Technology").length },
    { name: "Business", count: allCalculators.filter(c => c.category === "Business").length },
    { name: "Education", count: allCalculators.filter(c => c.category === "Education").length }
  ];

  // Filter calculators based on search and category
  const filteredCalculators = allCalculators.filter(calculator => {
    const matchesSearch = calculator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calculator.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || calculator.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add calculator mutation
  const addCalculatorMutation = useMutation({
    mutationFn: async ({ calculatorId }: { calculatorId: number }) => {
      return apiRequest(`/api/user-calculators`, {
        method: 'POST',
        body: JSON.stringify({ calculatorId })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-calculators'] });
      setDemoCalculators(prev => [...prev, data]);
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

  const getCalculatorConfig = (calculator: any) => {
    const configs: { [key: string]: any } = {
      1: { // Wedding Photography
        ...defaultConfig,
        text: {
          headline: "Get Your Wedding Quote",
          subheading: "Tell us about your special day",
          ctaText: "See My Price",
          thankYouMessage: "Thank you for your request!"
        },
        questions: [
          {
            id: "event-date",
            label: "When is your wedding date?",
            type: "date",
            required: true
          },
          {
            id: "guest-count",
            label: "How many guests will attend?",
            type: "number",
            required: true,
            min: 10,
            max: 500
          },
          {
            id: "photography-style",
            label: "What photography style do you prefer?",
            type: "dropdown",
            required: true,
            options: ["Traditional", "Photojournalistic", "Fine Art", "Vintage", "Modern"]
          }
        ]
      },
      2: { // Boudoir Photography
        ...defaultConfig,
        text: {
          headline: "Get Your Boudoir Photography Quote",
          subheading: "Tell us about your project requirements",
          ctaText: "Get Quote",
          thankYouMessage: "Thank you for your request!"
        },
        questions: [
          {
            id: "session-type",
            label: "What type of boudoir session?",
            type: "dropdown",
            required: true,
            options: ["Individual Session", "Couples Session", "Maternity Boudoir", "Plus Size Boudoir"]
          },
          {
            id: "session-location",
            label: "Preferred session location?",
            type: "dropdown",
            required: true,
            options: ["Studio", "Hotel Room", "Client's Home", "Outdoor Location"]
          },
          {
            id: "session-duration",
            label: "Session duration preference?",
            type: "dropdown",
            required: true,
            options: ["1 hour", "2 hours", "3 hours", "Half day"]
          },
          {
            id: "special-requests",
            label: "Any special requests or themes?",
            type: "text",
            required: false
          }
        ]
      },
      3: { // Home Renovation
        ...defaultConfig,
        text: {
          headline: "Get Your Home Renovation Quote",
          subheading: "Tell us about your project requirements",
          ctaText: "Get Quote",
          thankYouMessage: "Thank you for your request!"
        },
        questions: [
          {
            id: "project-type",
            label: "What type of renovation project?",
            type: "dropdown",
            required: true,
            options: ["Kitchen Remodel", "Bathroom Renovation", "Basement Finishing", "Room Addition", "Full Home Renovation"]
          },
          {
            id: "project-size",
            label: "Project size",
            type: "dropdown",
            required: true,
            options: ["Small (under 100 sq ft)", "Medium (100-500 sq ft)", "Large (500-1000 sq ft)", "Extra Large (1000+ sq ft)"]
          },
          {
            id: "budget-range",
            label: "What's your budget range?",
            type: "dropdown",
            required: true,
            options: ["Under $10,000", "$10,000 - $25,000", "$25,000 - $50,000", "$50,000+"]
          },
          {
            id: "timeline",
            label: "When do you want to start?",
            type: "dropdown",
            required: true,
            options: ["ASAP", "Within 1 month", "Within 3 months", "Planning stage"]
          }
        ]
      },
      4: { // Drone Photography
        ...defaultConfig,
        text: {
          headline: "Your Drone Quote",
          subheading: "Get a custom quote based on your project requirements",
          ctaText: "Book My Flight",
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
        ]
      },
      6: { // Electrician Services
        ...defaultConfig,
        text: {
          headline: "Get Your Electrician Services Quote",
          subheading: "Tell us about your project requirements",
          ctaText: "Get Quote",
          thankYouMessage: "Thank you for your request!"
        },
        questions: [
          {
            id: "service-type",
            label: "What type of electrical work?",
            type: "dropdown",
            required: true,
            options: ["Wiring Installation", "Panel Upgrade", "Outlet Installation", "Lighting Installation", "Electrical Repair", "Safety Inspection"]
          },
          {
            id: "property-type",
            label: "Property type",
            type: "dropdown",
            required: true,
            options: ["Residential Home", "Commercial Building", "Industrial Facility", "Other"]
          },
          {
            id: "project-scope",
            label: "Describe your project in detail",
            type: "text",
            required: true
          },
          {
            id: "timeline",
            label: "When do you need this completed?",
            type: "dropdown",
            required: true,
            options: ["ASAP", "Within 1 week", "Within 1 month", "Flexible timing"]
          }
        ]
      }
    };
    
    return configs[calculator.id] || {
      ...defaultConfig,
      text: {
        headline: `Get Your ${calculator.name} Quote`,
        subheading: "Tell us about your project requirements",
        ctaText: "Get Quote",
        thankYouMessage: "Thank you for your request!"
      }
    };
  };

  const handleAddCalculator = (calculator: any) => {
    const calculatorConfig = getCalculatorConfig(calculator);
    
    const newCalc: UserCalculator = {
      id: `calc-${Date.now()}`,
      embedId: `embed-${Date.now()}`,
      embedUrl: `https://yoursite.com/calculator/embed-${Date.now()}`,
      adminUrl: `https://yoursite.com/calculator/admin/embed-${Date.now()}`,
      calculatorId: calculator.id,
      config: calculatorConfig,
      customBranding: calculatorConfig.branding,
      isActive: true
    };
    
    setDemoCalculators(prev => [...prev, newCalc]);
    toast({
      title: "Calculator Added",
      description: `${calculator.name} has been added to your dashboard.`,
    });
    setShowCalculatorModal(false);
  };

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
      headline: "Get Your Quote",
      subheading: "Tell us about your project", 
      ctaText: "Get My Quote",
      thankYouMessage: "Thank you for your request!"
    },
    packages: [
      { id: "basic", label: "Basic Package", basePrice: 500, hours: 4, icon: "📦", popular: false },
      { id: "standard", label: "Standard Package", basePrice: 800, hours: 6, icon: "⭐", popular: true },
      { id: "premium", label: "Premium Package", basePrice: 1200, hours: 8, icon: "💎", popular: false }
    ],
    addOns: [
      { id: "addon1", label: "Additional Service", price: 100, popular: false },
      { id: "addon2", label: "Premium Add-on", price: 200, popular: true }
    ],
    hourOptions: [
      { id: "4", label: "4 Hours", surcharge: 0, popular: false },
      { id: "6", label: "6 Hours", surcharge: 200, popular: true },
      { id: "8", label: "8 Hours", surcharge: 400, popular: false }
    ],
    locationOptions: [
      { id: "1", label: "1 Location", surcharge: 0, popular: true },
      { id: "2", label: "2 Locations", surcharge: 150, popular: false }
    ],
    deliveryOptions: [
      { id: "digital", label: "Digital Delivery", price: 0, popular: true },
      { id: "physical", label: "Physical Package", price: 100, popular: false }
    ],
    questions: [
      {
        id: "project-type",
        label: "What type of project?",
        type: "dropdown",
        required: true,
        options: ["Option 1", "Option 2", "Option 3", "Other"]
      },
      {
        id: "timeline",
        label: "Project timeline",
        type: "dropdown",
        required: true,
        options: ["ASAP", "Within 1 week", "Within 1 month", "Flexible"]
      },
      {
        id: "details",
        label: "Project details",
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
    
    // Load the actual calculator configuration from the original calculator
    const calculatorType = allCalculators.find(c => c.id === calc.calculatorId);
    
    // Set configuration based on the specific calculator type to preserve exact designs
    let calculatorConfig = { ...defaultConfig };
    
    if (calculatorType?.slug === 'wedding-photography') {
      calculatorConfig = {
        ...defaultConfig,
        text: {
          headline: "Wedding Photography Quote Calculator",
          subheading: "Create beautiful memories with professional wedding photography. Get your personalized quote for your special day.",
          ctaText: "Check My Date",
          thankYouMessage: "Thank you for your request!"
        },
        packages: [
          { id: "elopement", label: "Elopement / Small Ceremony", basePrice: 950, hours: 4, icon: "💕", popular: false },
          { id: "half-day", label: "Half-Day Coverage", basePrice: 1200, hours: 6, icon: "☀️", popular: true },
          { id: "full-day", label: "Full-Day Coverage", basePrice: 1800, hours: 10, icon: "💍", popular: true },
          { id: "destination", label: "Destination Wedding", basePrice: 2500, hours: 12, icon: "✈️", popular: false }
        ],
        addOns: [
          { id: "engagement", label: "Engagement Session", price: 300, popular: true },
          { id: "second-photographer", label: "Second Photographer", price: 250, popular: true },
          { id: "drone", label: "Drone Coverage", price: 150, popular: false },
          { id: "album", label: "Album & Prints", price: 200, popular: true },
          { id: "rehearsal", label: "Rehearsal Dinner Coverage", price: 350, popular: false },
          { id: "express", label: "Express Turnaround", price: 175, popular: false }
        ],
        hourOptions: [
          { id: "4", label: "4 Hours", surcharge: 0, popular: false },
          { id: "6", label: "6 Hours", surcharge: 300, popular: true },
          { id: "8", label: "8 Hours", surcharge: 600, popular: true },
          { id: "10+", label: "10+ Hours", surcharge: 900, popular: false }
        ],
        locationOptions: [
          { id: "1", label: "1 Location", surcharge: 0, popular: false },
          { id: "2", label: "2 Locations", surcharge: 150, popular: true },
          { id: "3+", label: "3+ Locations", surcharge: 350, popular: false }
        ],
        deliveryOptions: [
          { id: "gallery", label: "Online Gallery Only", price: 0, popular: false },
          { id: "usb-album", label: "USB + Album", price: 250, popular: true },
          { id: "video-highlights", label: "Video Highlights Add-On", price: 400, popular: true }
        ],
        questions: [
          {
            id: "wedding-date",
            label: "Wedding Date (Optional)",
            type: "date",
            required: false
          },
          {
            id: "wedding-location",
            label: "Wedding Location (Optional)",
            type: "text",
            required: false
          },
          {
            id: "promo-code",
            label: "Promo Code (Optional)",
            type: "text",
            required: false
          }
        ]
      };
    } else if (calculatorType?.slug === 'home-renovation') {
      calculatorConfig = {
        ...defaultConfig,
        text: {
          headline: "Get Your Home Renovation Quote",
          subheading: "Transform your space with professional renovation services",
          ctaText: "Get My Quote",
          thankYouMessage: "Thank you for your renovation request!"
        },
        packages: [
          { id: "kitchen", label: "Kitchen Renovation", basePrice: 15000, hours: 40, icon: "🍽️", popular: true },
          { id: "bathroom", label: "Bathroom Renovation", basePrice: 8000, hours: 25, icon: "🛁", popular: true },
          { id: "basement", label: "Basement Finishing", basePrice: 12000, hours: 35, icon: "🏠", popular: false },
          { id: "addition", label: "Room Addition", basePrice: 25000, hours: 60, icon: "🏗️", popular: false },
          { id: "full-home", label: "Full Home Renovation", basePrice: 45000, hours: 120, icon: "🏘️", popular: false }
        ],
        questions: [
          {
            id: "renovation-type",
            label: "What type of renovation project?",
            type: "dropdown",
            required: true,
            options: ["Kitchen Remodel", "Bathroom Remodel", "Basement Finishing", "Room Addition", "Full Home Renovation"]
          },
          {
            id: "project-size",
            label: "Project size",
            type: "dropdown",
            required: true,
            options: ["Small (under 200 sq ft)", "Medium (200-500 sq ft)", "Large (500-1000 sq ft)", "Extra Large (1000+ sq ft)"]
          },
          {
            id: "budget-range",
            label: "Budget range",
            type: "dropdown",
            required: true,
            options: ["$10,000 - $25,000", "$25,000 - $50,000", "$50,000 - $100,000", "$100,000+"]
          },
          {
            id: "timeline",
            label: "When do you want to start?",
            type: "dropdown",
            required: true,
            options: ["ASAP", "Within 1 month", "Within 3 months", "Within 6 months", "Just planning"]
          }
        ]
      };
    } else if (calculatorType?.slug === 'boudoir-photography') {
      calculatorConfig = {
        ...defaultConfig,
        text: {
          headline: "Boudoir Photography Quote",
          subheading: "Celebrate your beauty with an intimate boudoir session",
          ctaText: "Book My Session",
          thankYouMessage: "Thank you for your booking request!"
        },
        packages: [
          { id: "classic", label: "Classic Boudoir Session", basePrice: 450, hours: 2, icon: "💄", popular: true },
          { id: "luxury", label: "Luxury Boudoir Experience", basePrice: 750, hours: 3, icon: "👑", popular: true },
          { id: "couples", label: "Couples Boudoir Session", basePrice: 650, hours: 2.5, icon: "💕", popular: false },
          { id: "maternity", label: "Maternity Boudoir", basePrice: 550, hours: 2, icon: "🤱", popular: false }
        ],
        addOns: [
          { id: "hair-makeup", label: "Professional Hair & Makeup", price: 150, popular: true },
          { id: "wardrobe", label: "Wardrobe Styling", price: 75, popular: true },
          { id: "album", label: "Luxury Photo Album", price: 200, popular: false },
          { id: "prints", label: "Fine Art Prints", price: 100, popular: false }
        ],
        questions: [
          {
            id: "session-type",
            label: "What type of session interests you?",
            type: "dropdown",
            required: true,
            options: ["Classic Boudoir", "Luxury Experience", "Couples Session", "Maternity Boudoir", "Not sure yet"]
          },
          {
            id: "experience-level",
            label: "Is this your first boudoir session?",
            type: "dropdown",
            required: true,
            options: ["Yes, first time", "No, I've done this before"]
          },
          {
            id: "session-goals",
            label: "What are your goals for this session?",
            type: "dropdown",
            required: false,
            options: ["Gift for partner", "Personal empowerment", "Celebrate milestone", "Just for fun", "Other"]
          }
        ]
      };
    }
    
    setCustomConfig(calc.config || calculatorConfig);
    setShowCustomizeModal(true);
  };

  const previewCalculator = (calc: UserCalculator) => {
    // Get the calculator type to determine the correct route
    const calculatorType = allCalculators.find(c => c.id === calc.calculatorId);
    
    if (calculatorType?.slug) {
      // Open the actual calculator page instead of embed URL
      window.open(`/${calculatorType.slug}`, '_blank');
    } else {
      // Fallback to embed URL if slug not found
      window.open(calc.embedUrl, '_blank');
    }
  };

  const showEmbedCode = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    setShowEmbedModal(true);
  };

  const copyEmbedCode = async (calc: UserCalculator) => {
    const embedCode = `<iframe src="${calc.embedUrl}" width="100%" height="600" frameborder="0" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`;
    
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

  const resetToDefaults = () => {
    setCustomConfig(defaultConfig);
  };

  const saveCustomization = () => {
    if (selectedCalculator) {
      const updatedCalculator = {
        ...selectedCalculator,
        config: customConfig,
        customBranding: customConfig?.branding,
        lastUpdated: new Date().toISOString()
      };
      
      setDemoCalculators((prev: UserCalculator[]) => 
        prev.map(calc => calc.id === selectedCalculator.id ? updatedCalculator : calc)
      );
      
      toast({
        title: "Configuration Saved",
        description: "Your calculator customization has been saved successfully.",
      });
      
      setShowCustomizeModal(false);
    }
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
                        <h3 className="text-lg font-semibold text-white">
                          {(() => {
                            const calculator = allCalculators.find(c => c.id === calc.calculatorId);
                            return calculator ? calculator.name : "Calculator";
                          })()} Calculator
                        </h3>
                        <p className="text-gray-400">
                          {(() => {
                            const calculator = allCalculators.find(c => c.id === calc.calculatorId);
                            return calculator ? calculator.description : "Custom quote calculator";
                          })()}
                        </p>
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
                          onChange={(e) => setCustomConfig((prev: any) => ({
                            ...prev,
                            branding: { ...prev?.branding, primaryColor: e.target.value }
                          }))}
                          className="w-full h-10 rounded border-0 bg-transparent cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-300 block mb-2">Accent Color</label>
                        <input
                          type="color"
                          value={customConfig?.branding?.accentColor || "#facc15"}
                          onChange={(e) => setCustomConfig((prev: any) => ({
                            ...prev,
                            branding: { ...prev?.branding, accentColor: e.target.value }
                          }))}
                          className="w-full h-10 rounded border-0 bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 block mb-2">Logo Upload</label>
                      <div className="space-y-3">
                        {/* Logo Upload Input */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setCustomConfig((prev: any) => ({
                                  ...prev,
                                  branding: { ...prev?.branding, logoUrl: event.target?.result as string }
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white text-sm"
                        />
                        
                        {/* Logo Preview */}
                        {customConfig?.branding?.logoUrl && (
                          <div className="flex items-center space-x-3">
                            <img 
                              src={customConfig.branding.logoUrl} 
                              alt="Logo Preview" 
                              className="object-contain bg-white rounded border"
                              style={{ 
                                height: `${customConfig?.branding?.logoSize || 48}px`,
                                width: 'auto',
                                maxWidth: '120px'
                              }}
                            />
                            <button
                              onClick={() => setCustomConfig((prev: any) => ({
                                ...prev,
                                branding: { ...prev?.branding, logoUrl: "" }
                              }))}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              Remove Logo
                            </button>
                          </div>
                        )}
                        
                        {/* Logo Size Slider - Always Visible */}
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
                            onChange={(e) => setCustomConfig((prev: any) => ({
                              ...prev,
                              branding: { ...prev?.branding, logoSize: parseInt(e.target.value) }
                            }))}
                            className="w-full accent-neon-500"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>24px</span>
                            <span>120px</span>
                          </div>
                          {!customConfig?.branding?.logoUrl && (
                            <p className="text-xs text-gray-500 mt-1">Upload a logo to see size preview</p>
                          )}
                        </div>
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

                  {/* Typography & Fonts Section */}
                  <div className="space-y-4 mt-6">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <PenTool className="h-5 w-5 mr-2" />
                      Typography & Fonts
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Primary Font</label>
                        <select
                          value={customConfig?.typography?.primaryFont || "inter"}
                          onChange={(e) => setCustomConfig((prev: any) => ({
                            ...prev,
                            typography: { ...prev.typography, primaryFont: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="inter">Inter (Modern)</option>
                          <option value="roboto">Roboto (Clean)</option>
                          <option value="poppins">Poppins (Friendly)</option>
                          <option value="montserrat">Montserrat (Professional)</option>
                          <option value="playfair">Playfair Display (Elegant)</option>
                          <option value="source-sans">Source Sans Pro (Corporate)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Font Weight</label>
                        <select
                          value={customConfig?.typography?.fontWeight || "normal"}
                          onChange={(e) => setCustomConfig((prev: any) => ({
                            ...prev,
                            typography: { ...prev.typography, fontWeight: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="light">Light (300)</option>
                          <option value="normal">Normal (400)</option>
                          <option value="medium">Medium (500)</option>
                          <option value="semibold">Semi Bold (600)</option>
                          <option value="bold">Bold (700)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Heading Size</label>
                        <select
                          value={customConfig?.typography?.headingSize || "large"}
                          onChange={(e) => setCustomConfig((prev: any) => ({
                            ...prev,
                            typography: { ...prev.typography, headingSize: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="extra-large">Extra Large</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Line Height</label>
                        <select
                          value={customConfig?.typography?.lineHeight || "normal"}
                          onChange={(e) => setCustomConfig((prev: any) => ({
                            ...prev,
                            typography: { ...prev.typography, lineHeight: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="tight">Tight (1.2)</option>
                          <option value="normal">Normal (1.5)</option>
                          <option value="relaxed">Relaxed (1.7)</option>
                          <option value="loose">Loose (2.0)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Design Options */}
                  <div className="space-y-4 mt-6">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Advanced Design
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Border Radius</label>
                        <select
                          value={customConfig?.design?.borderRadius || "medium"}
                          onChange={(e) => setCustomConfig((prev: any) => ({
                            ...prev,
                            design: { ...prev.design, borderRadius: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="none">None (Square)</option>
                          <option value="small">Small (4px)</option>
                          <option value="medium">Medium (8px)</option>
                          <option value="large">Large (16px)</option>
                          <option value="extra-large">Extra Large (24px)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Shadow Style</label>
                        <select
                          value={customConfig?.design?.shadowStyle || "medium"}
                          onChange={(e) => setCustomConfig((prev: any) => ({
                            ...prev,
                            design: { ...prev.design, shadowStyle: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="none">No Shadow</option>
                          <option value="subtle">Subtle</option>
                          <option value="medium">Medium</option>
                          <option value="strong">Strong</option>
                          <option value="dramatic">Dramatic</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Animation Style</label>
                        <select
                          value={customConfig?.design?.animationStyle || "smooth"}
                          onChange={(e) => setCustomConfig((prev: any) => ({
                            ...prev,
                            design: { ...prev.design, animationStyle: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="none">No Animation</option>
                          <option value="subtle">Subtle</option>
                          <option value="smooth">Smooth</option>
                          <option value="dynamic">Dynamic</option>
                          <option value="playful">Playful</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Button Style</label>
                        <select
                          value={customConfig?.design?.buttonStyle || "modern"}
                          onChange={(e) => setCustomConfig((prev: any) => ({
                            ...prev,
                            design: { ...prev.design, buttonStyle: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="modern">Modern</option>
                          <option value="classic">Classic</option>
                          <option value="minimal">Minimal</option>
                          <option value="gradient">Gradient</option>
                          <option value="outlined">Outlined</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Questions & Content Section */}
                  <div className="space-y-4 mt-8 border-t border-midnight-600 pt-6">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Edit className="h-5 w-5 mr-2" />
                      Questions & Content
                    </h3>
                    
                    {/* Text Content */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-white mb-4">Calculator Text</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Headline</label>
                          <input
                            type="text"
                            value={customConfig?.text?.headline || ""}
                            onChange={(e) => setCustomConfig((prev: any) => ({
                              ...prev,
                              text: { ...prev.text, headline: e.target.value }
                            }))}
                            className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                            placeholder="Get Your Quote"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Subheading</label>
                          <input
                            type="text"
                            value={customConfig?.text?.subheading || ""}
                            onChange={(e) => setCustomConfig((prev: any) => ({
                              ...prev,
                              text: { ...prev.text, subheading: e.target.value }
                            }))}
                            className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                            placeholder="Tell us about your project"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">CTA Button Text</label>
                          <input
                            type="text"
                            value={customConfig?.text?.ctaText || ""}
                            onChange={(e) => setCustomConfig((prev: any) => ({
                              ...prev,
                              text: { ...prev.text, ctaText: e.target.value }
                            }))}
                            className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                            placeholder="Get Quote"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Thank You Message</label>
                          <input
                            type="text"
                            value={customConfig?.text?.thankYouMessage || ""}
                            onChange={(e) => setCustomConfig((prev: any) => ({
                              ...prev,
                              text: { ...prev.text, thankYouMessage: e.target.value }
                            }))}
                            className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                            placeholder="Thank you for your request!"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Service Packages */}
                    <div className="border-t border-midnight-600 pt-6 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium text-white">Service Packages</h4>
                        <button
                          onClick={() => {
                            const newPackage = {
                              id: `package-${Date.now()}`,
                              label: "New Package",
                              basePrice: 500,
                              hours: 4,
                              icon: "📦",
                              popular: false
                            };
                            setCustomConfig((prev: any) => ({
                              ...prev,
                              packages: [...(prev.packages || []), newPackage]
                            }));
                          }}
                          className="px-4 py-2 bg-neon-500 text-white rounded text-sm hover:bg-neon-600 font-medium"
                        >
                          + Add Package
                        </button>
                      </div>
                      
                      <div className="space-y-4 max-h-40 overflow-y-auto">
                        {(customConfig?.packages || [
                          { id: "elopement", label: "Elopement / Small Ceremony", basePrice: 950, hours: 4, icon: "💕", popular: false },
                          { id: "half-day", label: "Half-Day Coverage", basePrice: 1200, hours: 6, icon: "☀️", popular: true },
                          { id: "full-day", label: "Full-Day Coverage", basePrice: 1800, hours: 10, icon: "💍", popular: true },
                          { id: "destination", label: "Destination Wedding", basePrice: 2500, hours: 12, icon: "✈️", popular: false }
                        ]).map((pkg: any, index: number) => (
                          <div key={pkg.id} className="bg-midnight-700 p-4 rounded border border-midnight-600">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Package Name</label>
                                <input
                                  type="text"
                                  value={pkg.label}
                                  onChange={(e) => {
                                    const updatedPackages = [...(customConfig?.packages || [])];
                                    updatedPackages[index] = { ...pkg, label: e.target.value };
                                    setCustomConfig((prev: any) => ({ ...prev, packages: updatedPackages }));
                                  }}
                                  className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                                  placeholder="Package name..."
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Base Price (€)</label>
                                <input
                                  type="number"
                                  value={pkg.basePrice}
                                  onChange={(e) => {
                                    const updatedPackages = [...(customConfig?.packages || [])];
                                    updatedPackages[index] = { ...pkg, basePrice: parseInt(e.target.value) };
                                    setCustomConfig((prev: any) => ({ ...prev, packages: updatedPackages }));
                                  }}
                                  className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Icon</label>
                                <input
                                  type="text"
                                  value={pkg.icon}
                                  onChange={(e) => {
                                    const updatedPackages = [...(customConfig?.packages || [])];
                                    updatedPackages[index] = { ...pkg, icon: e.target.value };
                                    setCustomConfig((prev: any) => ({ ...prev, packages: updatedPackages }));
                                  }}
                                  className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                                  placeholder="📦"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <label className="flex items-center text-xs text-gray-400">
                                  <input
                                    type="checkbox"
                                    checked={pkg.popular}
                                    onChange={(e) => {
                                      const updatedPackages = [...(customConfig?.packages || [])];
                                      updatedPackages[index] = { ...pkg, popular: e.target.checked };
                                      setCustomConfig((prev: any) => ({ ...prev, packages: updatedPackages }));
                                    }}
                                    className="mr-1"
                                  />
                                  Popular
                                </label>
                                <button
                                  onClick={() => {
                                    const updatedPackages = (customConfig?.packages || []).filter((_: any, i: number) => i !== index);
                                    setCustomConfig((prev: any) => ({ ...prev, packages: updatedPackages }));
                                  }}
                                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add-On Services */}
                    <div className="border-t border-midnight-600 pt-6 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium text-white">Add-On Services</h4>
                        <button
                          onClick={() => {
                            const newAddOn = {
                              id: `addon-${Date.now()}`,
                              label: "New Add-On",
                              price: 100,
                              popular: false
                            };
                            setCustomConfig((prev: any) => ({
                              ...prev,
                              addOns: [...(prev.addOns || []), newAddOn]
                            }));
                          }}
                          className="px-4 py-2 bg-neon-500 text-white rounded text-sm hover:bg-neon-600 font-medium"
                        >
                          + Add Service
                        </button>
                      </div>
                      
                      <div className="space-y-4 max-h-40 overflow-y-auto">
                        {(customConfig?.addOns || [
                          { id: "engagement", label: "Engagement Session", price: 300, popular: true },
                          { id: "second-photographer", label: "Second Photographer", price: 250, popular: true },
                          { id: "drone", label: "Drone Coverage", price: 150, popular: false },
                          { id: "album", label: "Album & Prints", price: 200, popular: true },
                          { id: "rehearsal", label: "Rehearsal Dinner Coverage", price: 350, popular: false },
                          { id: "express", label: "Express Turnaround", price: 175, popular: false }
                        ]).map((addon: any, index: number) => (
                          <div key={addon.id} className="bg-midnight-700 p-4 rounded border border-midnight-600">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Service Name</label>
                                <input
                                  type="text"
                                  value={addon.label}
                                  onChange={(e) => {
                                    const updatedAddOns = [...(customConfig?.addOns || [])];
                                    updatedAddOns[index] = { ...addon, label: e.target.value };
                                    setCustomConfig((prev: any) => ({ ...prev, addOns: updatedAddOns }));
                                  }}
                                  className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                                  placeholder="Service name..."
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Price (€)</label>
                                <input
                                  type="number"
                                  value={addon.price}
                                  onChange={(e) => {
                                    const updatedAddOns = [...(customConfig?.addOns || [])];
                                    updatedAddOns[index] = { ...addon, price: parseInt(e.target.value) };
                                    setCustomConfig((prev: any) => ({ ...prev, addOns: updatedAddOns }));
                                  }}
                                  className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <label className="flex items-center text-xs text-gray-400">
                                  <input
                                    type="checkbox"
                                    checked={addon.popular}
                                    onChange={(e) => {
                                      const updatedAddOns = [...(customConfig?.addOns || [])];
                                      updatedAddOns[index] = { ...addon, popular: e.target.checked };
                                      setCustomConfig((prev: any) => ({ ...prev, addOns: updatedAddOns }));
                                    }}
                                    className="mr-1"
                                  />
                                  Popular
                                </label>
                                <button
                                  onClick={() => {
                                    const updatedAddOns = (customConfig?.addOns || []).filter((_: any, i: number) => i !== index);
                                    setCustomConfig((prev: any) => ({ ...prev, addOns: updatedAddOns }));
                                  }}
                                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Service Options */}
                    <div className="border-t border-midnight-600 pt-6 mb-6">
                      <h4 className="text-md font-medium text-white mb-4">Service Options</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Hour Options */}
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-sm text-gray-300">Coverage Hours</label>
                            <button
                              onClick={() => {
                                const newHourOption = {
                                  id: `hour-${Date.now()}`,
                                  label: "New Option",
                                  surcharge: 0,
                                  popular: false
                                };
                                setCustomConfig((prev: any) => ({
                                  ...prev,
                                  hourOptions: [...(prev.hourOptions || []), newHourOption]
                                }));
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                            >
                              + Add
                            </button>
                          </div>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {(customConfig?.hourOptions || [
                              { id: "4", label: "4 Hours", surcharge: 0, popular: false },
                              { id: "6", label: "6 Hours", surcharge: 300, popular: true },
                              { id: "8", label: "8 Hours", surcharge: 600, popular: true },
                              { id: "10+", label: "10+ Hours", surcharge: 900, popular: false }
                            ]).map((hour: any, index: number) => (
                              <div key={hour.id} className="flex items-center gap-2 bg-midnight-700 p-2 rounded">
                                <input
                                  type="text"
                                  value={hour.label}
                                  onChange={(e) => {
                                    const updated = [...(customConfig?.hourOptions || [])];
                                    updated[index] = { ...hour, label: e.target.value };
                                    setCustomConfig((prev: any) => ({ ...prev, hourOptions: updated }));
                                  }}
                                  className="flex-1 px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-xs"
                                />
                                <input
                                  type="number"
                                  value={hour.surcharge}
                                  onChange={(e) => {
                                    const updated = [...(customConfig?.hourOptions || [])];
                                    updated[index] = { ...hour, surcharge: parseInt(e.target.value) };
                                    setCustomConfig((prev: any) => ({ ...prev, hourOptions: updated }));
                                  }}
                                  className="w-16 px-1 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-xs"
                                  placeholder="€"
                                />
                                <button
                                  onClick={() => {
                                    const updated = (customConfig?.hourOptions || []).filter((_: any, i: number) => i !== index);
                                    setCustomConfig((prev: any) => ({ ...prev, hourOptions: updated }));
                                  }}
                                  className="text-red-400 hover:text-red-300 text-xs px-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Location Options */}
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-sm text-gray-300">Locations</label>
                            <button
                              onClick={() => {
                                const newLocationOption = {
                                  id: `location-${Date.now()}`,
                                  label: "New Location",
                                  surcharge: 0,
                                  popular: false
                                };
                                setCustomConfig((prev: any) => ({
                                  ...prev,
                                  locationOptions: [...(prev.locationOptions || []), newLocationOption]
                                }));
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                            >
                              + Add
                            </button>
                          </div>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {(customConfig?.locationOptions || [
                              { id: "1", label: "1 Location", surcharge: 0, popular: false },
                              { id: "2", label: "2 Locations", surcharge: 150, popular: true },
                              { id: "3+", label: "3+ Locations", surcharge: 350, popular: false }
                            ]).map((location: any, index: number) => (
                              <div key={location.id} className="flex items-center gap-2 bg-midnight-700 p-2 rounded">
                                <input
                                  type="text"
                                  value={location.label}
                                  onChange={(e) => {
                                    const updated = [...(customConfig?.locationOptions || [])];
                                    updated[index] = { ...location, label: e.target.value };
                                    setCustomConfig((prev: any) => ({ ...prev, locationOptions: updated }));
                                  }}
                                  className="flex-1 px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-xs"
                                />
                                <input
                                  type="number"
                                  value={location.surcharge}
                                  onChange={(e) => {
                                    const updated = [...(customConfig?.locationOptions || [])];
                                    updated[index] = { ...location, surcharge: parseInt(e.target.value) };
                                    setCustomConfig((prev: any) => ({ ...prev, locationOptions: updated }));
                                  }}
                                  className="w-16 px-1 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-xs"
                                  placeholder="€"
                                />
                                <button
                                  onClick={() => {
                                    const updated = (customConfig?.locationOptions || []).filter((_: any, i: number) => i !== index);
                                    setCustomConfig((prev: any) => ({ ...prev, locationOptions: updated }));
                                  }}
                                  className="text-red-400 hover:text-red-300 text-xs px-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Questions Editor */}
                    <div className="border-t border-midnight-600 pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium text-white">Form Questions</h4>
                        <button
                          onClick={() => {
                            const newQuestion = {
                              id: `question-${Date.now()}`,
                              label: "New Question",
                              type: "text",
                              required: false
                            };
                            setCustomConfig((prev: any) => ({
                              ...prev,
                              questions: [...(prev.questions || []), newQuestion]
                            }));
                          }}
                          className="px-4 py-2 bg-neon-500 text-white rounded text-sm hover:bg-neon-600 font-medium"
                        >
                          + Add Question
                        </button>
                      </div>
                      
                      <div className="space-y-4 max-h-60 overflow-y-auto">
                        {(customConfig?.questions || []).map((question: any, index: number) => (
                          <div key={question.id} className="bg-midnight-700 p-4 rounded border border-midnight-600">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Question Text</label>
                                <input
                                  type="text"
                                  value={question.label}
                                  onChange={(e) => {
                                    const updatedQuestions = [...(customConfig?.questions || [])];
                                    updatedQuestions[index] = { ...question, label: e.target.value };
                                    setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                                  }}
                                  className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                                  placeholder="Enter question text..."
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Type</label>
                                <select
                                  value={question.type}
                                  onChange={(e) => {
                                    const updatedQuestions = [...(customConfig?.questions || [])];
                                    updatedQuestions[index] = { ...question, type: e.target.value };
                                    setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                                  }}
                                  className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                                >
                                  <option value="text">Text</option>
                                  <option value="number">Number</option>
                                  <option value="date">Date</option>
                                  <option value="dropdown">Dropdown</option>
                                  <option value="checkbox">Checkbox</option>
                                </select>
                              </div>
                              <div className="flex items-center justify-between">
                                <label className="flex items-center text-xs text-gray-400">
                                  <input
                                    type="checkbox"
                                    checked={question.required}
                                    onChange={(e) => {
                                      const updatedQuestions = [...(customConfig?.questions || [])];
                                      updatedQuestions[index] = { ...question, required: e.target.checked };
                                      setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                                    }}
                                    className="mr-1"
                                  />
                                  Required
                                </label>
                                <button
                                  onClick={() => {
                                    const updatedQuestions = (customConfig?.questions || []).filter((_: any, i: number) => i !== index);
                                    setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                                  }}
                                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            
                            {question.type === 'dropdown' && (
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Options (comma separated)</label>
                                <input
                                  type="text"
                                  value={(question.options || []).join(', ')}
                                  onChange={(e) => {
                                    const options = e.target.value.split(',').map((opt: string) => opt.trim()).filter(Boolean);
                                    const updatedQuestions = [...(customConfig?.questions || [])];
                                    updatedQuestions[index] = { ...question, options };
                                    setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                                  }}
                                  placeholder="Option 1, Option 2, Option 3"
                                  className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                                />
                              </div>
                            )}
                            
                            {question.type === 'number' && (
                              <div className="grid grid-cols-2 gap-3 mt-3">
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Min Value</label>
                                  <input
                                    type="number"
                                    value={question.min || 0}
                                    onChange={(e) => {
                                      const updatedQuestions = [...(customConfig?.questions || [])];
                                      updatedQuestions[index] = { ...question, min: parseInt(e.target.value) };
                                      setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                                    }}
                                    className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Max Value</label>
                                  <input
                                    type="number"
                                    value={question.max || 1000}
                                    onChange={(e) => {
                                      const updatedQuestions = [...(customConfig?.questions || [])];
                                      updatedQuestions[index] = { ...question, max: parseInt(e.target.value) };
                                      setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                                    }}
                                    className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {(!customConfig?.questions || customConfig.questions.length === 0) && (
                          <div className="text-center py-6 text-gray-400 border-2 border-dashed border-midnight-600 rounded-lg">
                            <p className="mb-2">No questions added yet</p>
                            <p className="text-sm">Click "Add Question" to create your first question</p>
                          </div>
                        )}
                      </div>
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
                              style={{ 
                                color: customConfig?.branding?.primaryColor || (theme === 'minimal' ? '#1f2937' : '#ffffff'),
                                fontFamily: customConfig?.typography?.primaryFont === 'roboto' ? 'Roboto, sans-serif' :
                                           customConfig?.typography?.primaryFont === 'poppins' ? 'Poppins, sans-serif' :
                                           customConfig?.typography?.primaryFont === 'montserrat' ? 'Montserrat, sans-serif' :
                                           customConfig?.typography?.primaryFont === 'playfair' ? 'Playfair Display, serif' :
                                           customConfig?.typography?.primaryFont === 'source-sans' ? 'Source Sans Pro, sans-serif' :
                                           'Inter, sans-serif',
                                fontWeight: customConfig?.typography?.fontWeight === 'light' ? '300' :
                                          customConfig?.typography?.fontWeight === 'medium' ? '500' :
                                          customConfig?.typography?.fontWeight === 'semibold' ? '600' :
                                          customConfig?.typography?.fontWeight === 'bold' ? '700' : '400',
                                fontSize: customConfig?.typography?.headingSize === 'small' ? '1.5rem' :
                                         customConfig?.typography?.headingSize === 'medium' ? '2rem' :
                                         customConfig?.typography?.headingSize === 'extra-large' ? '3.5rem' : '3rem'
                              }}
                            >
                              {customConfig?.text?.headline || "Your Drone Quote"}
                            </h1>
                            <p 
                              className={`text-lg ${theme === 'minimal' ? 'text-gray-600' : 'text-white/80'}`}
                              style={{
                                fontFamily: customConfig?.typography?.primaryFont === 'roboto' ? 'Roboto, sans-serif' :
                                           customConfig?.typography?.primaryFont === 'poppins' ? 'Poppins, sans-serif' :
                                           customConfig?.typography?.primaryFont === 'montserrat' ? 'Montserrat, sans-serif' :
                                           customConfig?.typography?.primaryFont === 'playfair' ? 'Playfair Display, serif' :
                                           customConfig?.typography?.primaryFont === 'source-sans' ? 'Source Sans Pro, sans-serif' :
                                           'Inter, sans-serif',
                                lineHeight: customConfig?.typography?.lineHeight === 'tight' ? '1.2' :
                                          customConfig?.typography?.lineHeight === 'relaxed' ? '1.7' :
                                          customConfig?.typography?.lineHeight === 'loose' ? '2.0' : '1.5'
                              }}
                            >
                              {customConfig?.text?.subheading || "Get a custom quote based on your project requirements"}
                            </p>
                          </div>
                          
                          {/* Service Packages Preview */}
                          {customConfig?.packages && customConfig.packages.length > 0 && (
                            <div className="mb-8">
                              <h2 
                                className={`text-xl font-bold mb-6 ${theme === 'minimal' ? 'text-gray-800' : 'text-white'}`}
                                style={{
                                  fontFamily: customConfig?.typography?.primaryFont === 'roboto' ? 'Roboto, sans-serif' :
                                             customConfig?.typography?.primaryFont === 'poppins' ? 'Poppins, sans-serif' :
                                             customConfig?.typography?.primaryFont === 'montserrat' ? 'Montserrat, sans-serif' :
                                             customConfig?.typography?.primaryFont === 'playfair' ? 'Playfair Display, serif' :
                                             customConfig?.typography?.primaryFont === 'source-sans' ? 'Source Sans Pro, sans-serif' :
                                             'Inter, sans-serif'
                                }}
                              >
                                Choose your package
                              </h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {customConfig.packages.slice(0, 4).map((pkg: any, index: number) => (
                                  <div 
                                    key={pkg.id} 
                                    className={`p-6 rounded-xl transition-all cursor-pointer ${themeStyles.cardClass} ${
                                      pkg.popular ? 'ring-2 ring-cyan-400' : ''
                                    } hover:scale-105`}
                                  >
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                        <span className="text-2xl">{pkg.icon}</span>
                                        <div>
                                          <h3 
                                          className={`font-bold ${theme === 'minimal' ? 'text-gray-800' : 'text-white'}`}
                                          style={{
                                            fontFamily: customConfig?.typography?.primaryFont === 'roboto' ? 'Roboto, sans-serif' :
                                                       customConfig?.typography?.primaryFont === 'poppins' ? 'Poppins, sans-serif' :
                                                       customConfig?.typography?.primaryFont === 'montserrat' ? 'Montserrat, sans-serif' :
                                                       customConfig?.typography?.primaryFont === 'playfair' ? 'Playfair Display, serif' :
                                                       customConfig?.typography?.primaryFont === 'source-sans' ? 'Source Sans Pro, sans-serif' :
                                                       'Inter, sans-serif'
                                          }}
                                        >
                                            {pkg.label}
                                          </h3>
                                          {pkg.popular && (
                                            <span className="text-xs bg-cyan-500 text-white px-2 py-1 rounded-full">
                                              Popular
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div 
                                      className={`text-2xl font-bold mb-2 ${theme === 'minimal' ? 'text-gray-900' : 'text-white'}`}
                                      style={{
                                        fontFamily: customConfig?.typography?.primaryFont === 'roboto' ? 'Roboto, sans-serif' :
                                                   customConfig?.typography?.primaryFont === 'poppins' ? 'Poppins, sans-serif' :
                                                   customConfig?.typography?.primaryFont === 'montserrat' ? 'Montserrat, sans-serif' :
                                                   customConfig?.typography?.primaryFont === 'playfair' ? 'Playfair Display, serif' :
                                                   customConfig?.typography?.primaryFont === 'source-sans' ? 'Source Sans Pro, sans-serif' :
                                                   'Inter, sans-serif'
                                      }}
                                    >
                                      €{pkg.basePrice}
                                    </div>
                                    <div 
                                      className={`text-sm ${theme === 'minimal' ? 'text-gray-600' : 'text-white/70'}`}
                                      style={{
                                        fontFamily: customConfig?.typography?.primaryFont === 'roboto' ? 'Roboto, sans-serif' :
                                                   customConfig?.typography?.primaryFont === 'poppins' ? 'Poppins, sans-serif' :
                                                   customConfig?.typography?.primaryFont === 'montserrat' ? 'Montserrat, sans-serif' :
                                                   customConfig?.typography?.primaryFont === 'playfair' ? 'Playfair Display, serif' :
                                                   customConfig?.typography?.primaryFont === 'source-sans' ? 'Source Sans Pro, sans-serif' :
                                                   'Inter, sans-serif'
                                      }}
                                    >
                                      {pkg.hours} hours included
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Add-On Services Preview */}
                          {customConfig?.addOns && customConfig.addOns.length > 0 && (
                            <div className="mb-8">
                              <h2 
                                className={`text-xl font-bold mb-6 ${theme === 'minimal' ? 'text-gray-800' : 'text-white'}`}
                                style={{
                                  fontFamily: customConfig?.typography?.primaryFont === 'roboto' ? 'Roboto, sans-serif' :
                                             customConfig?.typography?.primaryFont === 'poppins' ? 'Poppins, sans-serif' :
                                             customConfig?.typography?.primaryFont === 'montserrat' ? 'Montserrat, sans-serif' :
                                             customConfig?.typography?.primaryFont === 'playfair' ? 'Playfair Display, serif' :
                                             customConfig?.typography?.primaryFont === 'source-sans' ? 'Source Sans Pro, sans-serif' :
                                             'Inter, sans-serif'
                                }}
                              >
                                Add-On Services
                              </h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {customConfig.addOns.slice(0, 6).map((addon: any, index: number) => (
                                  <div 
                                    key={addon.id}
                                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                      addon.popular ? 'border-cyan-400 bg-cyan-400/10' : 
                                      theme === 'minimal' ? 'border-gray-200 hover:border-gray-400' : 'border-white/20 hover:border-white/40'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div 
                                          className={`font-medium ${theme === 'minimal' ? 'text-gray-800' : 'text-white'}`}
                                          style={{
                                            fontFamily: customConfig?.typography?.primaryFont === 'roboto' ? 'Roboto, sans-serif' :
                                                       customConfig?.typography?.primaryFont === 'poppins' ? 'Poppins, sans-serif' :
                                                       customConfig?.typography?.primaryFont === 'montserrat' ? 'Montserrat, sans-serif' :
                                                       customConfig?.typography?.primaryFont === 'playfair' ? 'Playfair Display, serif' :
                                                       customConfig?.typography?.primaryFont === 'source-sans' ? 'Source Sans Pro, sans-serif' :
                                                       'Inter, sans-serif'
                                          }}
                                        >
                                          {addon.label}
                                        </div>
                                        <div 
                                          className={`text-sm ${theme === 'minimal' ? 'text-gray-600' : 'text-white/70'}`}
                                          style={{
                                            fontFamily: customConfig?.typography?.primaryFont === 'roboto' ? 'Roboto, sans-serif' :
                                                       customConfig?.typography?.primaryFont === 'poppins' ? 'Poppins, sans-serif' :
                                                       customConfig?.typography?.primaryFont === 'montserrat' ? 'Montserrat, sans-serif' :
                                                       customConfig?.typography?.primaryFont === 'playfair' ? 'Playfair Display, serif' :
                                                       customConfig?.typography?.primaryFont === 'source-sans' ? 'Source Sans Pro, sans-serif' :
                                                       'Inter, sans-serif'
                                          }}
                                        >
                                          €{addon.price}
                                        </div>
                                      </div>
                                      {addon.popular && (
                                        <span className="text-cyan-400 text-xs font-medium">Popular</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Form Questions Preview */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                              {customConfig?.questions?.slice(0, 3).map((question: any, index: number) => (
                                <div key={question.id} className={`p-6 rounded-xl ${themeStyles.cardClass}`}>
                                  <label className={`block text-sm font-semibold mb-3 ${theme === 'minimal' ? 'text-gray-700' : 'text-white/90'}`}>
                                    {question.label} {question.required && <span className="text-red-400">*</span>}
                                  </label>
                                  
                                  {question.type === 'dropdown' && (
                                    <>
                                      {layout === 'stepped' && question.options ? (
                                        <div className="grid grid-cols-2 gap-3">
                                          {question.options.slice(0, 4).map((option: any, optIndex: number) => (
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
                                          {question.options?.map((option: any, optIndex: number) => (
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

              {/* Questions & Content Section */}
              <div className="bg-midnight-800 p-6 rounded-lg border border-midnight-700 mt-6">
                <h3 className="text-lg font-semibold text-white flex items-center mb-6">
                  <Edit className="h-5 w-5 mr-2" />
                  Questions & Content
                </h3>
                
                {/* Text Content */}
                <div className="mb-8">
                  <h4 className="text-md font-medium text-white mb-4">Calculator Text</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Headline</label>
                      <input
                        type="text"
                        value={customConfig?.text?.headline || ""}
                        onChange={(e) => setCustomConfig((prev: any) => ({
                          ...prev,
                          text: { ...prev.text, headline: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        placeholder="Get Your Quote"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Subheading</label>
                      <input
                        type="text"
                        value={customConfig?.text?.subheading || ""}
                        onChange={(e) => setCustomConfig((prev: any) => ({
                          ...prev,
                          text: { ...prev.text, subheading: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        placeholder="Tell us about your project"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">CTA Button Text</label>
                      <input
                        type="text"
                        value={customConfig?.text?.ctaText || ""}
                        onChange={(e) => setCustomConfig((prev: any) => ({
                          ...prev,
                          text: { ...prev.text, ctaText: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        placeholder="Get Quote"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Thank You Message</label>
                      <input
                        type="text"
                        value={customConfig?.text?.thankYouMessage || ""}
                        onChange={(e) => setCustomConfig((prev: any) => ({
                          ...prev,
                          text: { ...prev.text, thankYouMessage: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        placeholder="Thank you for your request!"
                      />
                    </div>
                  </div>
                </div>

                {/* Questions Editor */}
                <div className="border-t border-midnight-600 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-white">Form Questions</h4>
                    <button
                      onClick={() => {
                        const newQuestion = {
                          id: `question-${Date.now()}`,
                          label: "New Question",
                          type: "text",
                          required: false
                        };
                        setCustomConfig((prev: any) => ({
                          ...prev,
                          questions: [...(prev.questions || []), newQuestion]
                        }));
                      }}
                      className="px-4 py-2 bg-neon-500 text-white rounded text-sm hover:bg-neon-600 font-medium"
                    >
                      + Add Question
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {(customConfig?.questions || []).map((question: any, index: number) => (
                      <div key={question.id} className="bg-midnight-700 p-4 rounded border border-midnight-600">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Question Text</label>
                            <input
                              type="text"
                              value={question.label}
                              onChange={(e) => {
                                const updatedQuestions = [...(customConfig?.questions || [])];
                                updatedQuestions[index] = { ...question, label: e.target.value };
                                setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                              }}
                              className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                              placeholder="Enter question text..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Type</label>
                            <select
                              value={question.type}
                              onChange={(e) => {
                                const updatedQuestions = [...(customConfig?.questions || [])];
                                updatedQuestions[index] = { ...question, type: e.target.value };
                                setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                              }}
                              className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                              <option value="dropdown">Dropdown</option>
                              <option value="checkbox">Checkbox</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center text-xs text-gray-400">
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) => {
                                  const updatedQuestions = [...(customConfig?.questions || [])];
                                  updatedQuestions[index] = { ...question, required: e.target.checked };
                                  setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                                }}
                                className="mr-1"
                              />
                              Required
                            </label>
                            <button
                              onClick={() => {
                                const updatedQuestions = (customConfig?.questions || []).filter((_: any, i: number) => i !== index);
                                setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                              }}
                              className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        
                        {question.type === 'dropdown' && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Options (comma separated)</label>
                            <input
                              type="text"
                              value={(question.options || []).join(', ')}
                              onChange={(e) => {
                                const options = e.target.value.split(',').map((opt: string) => opt.trim()).filter(Boolean);
                                const updatedQuestions = [...(customConfig?.questions || [])];
                                updatedQuestions[index] = { ...question, options };
                                setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                              }}
                              placeholder="Option 1, Option 2, Option 3"
                              className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                            />
                          </div>
                        )}
                        
                        {question.type === 'number' && (
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Min Value</label>
                              <input
                                type="number"
                                value={question.min || 0}
                                onChange={(e) => {
                                  const updatedQuestions = [...(customConfig?.questions || [])];
                                  updatedQuestions[index] = { ...question, min: parseInt(e.target.value) };
                                  setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                                }}
                                className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Max Value</label>
                              <input
                                type="number"
                                value={question.max || 1000}
                                onChange={(e) => {
                                  const updatedQuestions = [...(customConfig?.questions || [])];
                                  updatedQuestions[index] = { ...question, max: parseInt(e.target.value) };
                                  setCustomConfig((prev: any) => ({ ...prev, questions: updatedQuestions }));
                                }}
                                className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {(!customConfig?.questions || customConfig.questions.length === 0) && (
                      <div className="text-center py-8 text-gray-400 border-2 border-dashed border-midnight-600 rounded-lg">
                        <p className="mb-2">No questions added yet</p>
                        <p className="text-sm">Click "Add Question" to create your first question</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

                <div className="mt-6 flex justify-between">
                  <button 
                    onClick={resetToDefaults}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Reset to Defaults
                  </button>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setShowCustomizeModal(false)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveCustomization}
                      className="px-6 py-2 bg-neon-500 text-white rounded hover:bg-neon-600 font-semibold"
                    >
                      Save Customization
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Calculator Modal */}
        {showCalculatorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-midnight-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Add New Calculator</h2>
                <button
                  onClick={() => setShowCalculatorModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Search and Filter */}
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search calculators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-midnight-700 border border-midnight-600 rounded text-white placeholder-gray-400"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`px-4 py-2 rounded text-sm ${selectedCategory === "All" ? 'bg-neon-500 text-white' : 'bg-midnight-700 text-gray-300'}`}
                  >
                    All ({allCalculators.length})
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`px-4 py-2 rounded text-sm ${selectedCategory === category.name ? 'bg-neon-500 text-white' : 'bg-midnight-700 text-gray-300'}`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculator Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCalculators.map((calculator) => (
                  <div
                    key={calculator.id}
                    className="bg-midnight-700 border border-midnight-600 rounded-lg p-4 hover:border-neon-500 transition-colors cursor-pointer"
                    onClick={() => handleAddCalculator(calculator)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-neon-500 rounded-lg flex items-center justify-center">
                        {calculator.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">{calculator.name}</h3>
                        <p className="text-xs text-gray-400">{calculator.category}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-xs mb-3 line-clamp-2">{calculator.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" className="text-xs">{calculator.category}</Badge>
                      <Plus className="h-4 w-4 text-neon-500" />
                    </div>
                  </div>
                ))}
              </div>

              {filteredCalculators.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    No calculators match your search criteria.
                  </p>
                  <button
                    onClick={() => setShowCalculatorModal(false)}
                    className="mt-4 px-4 py-2 bg-midnight-700 text-white rounded hover:bg-midnight-600"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Embed Code Modal */}
        {showEmbedModal && selectedCalculator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-midnight-800 rounded-lg w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Embed Calculator</h2>
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Calculator Details</h3>
                  <div className="bg-midnight-700 p-4 rounded">
                    <p className="text-gray-300">
                      <strong>Calculator:</strong> {allCalculators.find(c => c.id === selectedCalculator.calculatorId)?.name || "Unknown"}
                    </p>
                    <p className="text-gray-300">
                      <strong>Embed ID:</strong> {selectedCalculator.embedId}
                    </p>
                    <p className="text-gray-300">
                      <strong>Status:</strong> <span className={selectedCalculator.isActive ? "text-green-400" : "text-red-400"}>
                        {selectedCalculator.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Embed Code</h3>
                  <div className="bg-midnight-700 p-4 rounded border">
                    <code className="text-green-400 text-sm break-all">
                      {`<iframe src="${selectedCalculator.embedUrl}" width="100%" height="600" frameborder="0" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`}
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Preview URL</h3>
                  <div className="bg-midnight-700 p-4 rounded border">
                    <p className="text-cyan-400 text-sm break-all">{selectedCalculator.embedUrl}</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={() => copyEmbedCode(selectedCalculator)}
                    className="bg-neon-500 hover:bg-neon-600 text-white"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Embed Code
                  </Button>
                  
                  <Button
                    onClick={() => window.open(selectedCalculator.embedUrl, '_blank')}
                    variant="outline"
                    className="border-midnight-600 text-gray-300 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Preview
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