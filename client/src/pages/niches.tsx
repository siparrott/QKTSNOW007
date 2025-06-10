import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Camera, 
  Dumbbell, 
  TreePine, 
  Wrench, 
  Zap, 
  Building, 
  Home, 
  Shield,
  Palette,
  Scissors,
  Stethoscope,
  GraduationCap,
  Car,
  Truck,
  Utensils,
  Coffee,
  Heart,
  Music,
  Monitor,
  Smartphone,
  Wifi,
  Server,
  Code,
  PenTool,
  Video,
  Edit,
  BarChart3,
  Users,
  Briefcase,
  Globe,
  Calculator,
  Scale,
  Clock,
  Package,
  Settings,
  Hammer,
  Paintbrush,
  Bath,
  Droplets,
  Star,
  Crown,
  Target,
  TrendingUp,
  Award,
  Calendar,
  Users2,
  Gem,
  Sparkles,
  Flower,
  Sun
} from "lucide-react";
import { Link } from "wouter";

// Comprehensive list of all 60 calculators
const allNiches = [
  // Home Services (15 calculators)
  { id: 1, name: "Home Renovation", icon: Hammer, category: "Home Services", available: true, description: "Kitchen, bathroom, and full home renovations with AI pricing" },
  { id: 2, name: "Landscaping", icon: TreePine, category: "Home Services", available: true, description: "Garden design, maintenance, and outdoor projects" },
  { id: 3, name: "Interior Design", icon: Palette, category: "Home Services", description: "Room design, furniture selection, and space planning" },
  { id: 4, name: "Cleaning Services", icon: Sparkles, category: "Home Services", description: "House cleaning, deep cleaning, and maintenance services" },
  { id: 5, name: "Pool Maintenance", icon: Droplets, category: "Home Services", description: "Pool cleaning, chemical balancing, and equipment service" },
  { id: 6, name: "Plumbing", icon: Wrench, category: "Home Services", description: "Pipe repair, installation, and emergency plumbing services" },
  { id: 7, name: "Electrical Services", icon: Zap, category: "Home Services", description: "Wiring, lighting installation, and electrical repairs" },
  { id: 8, name: "HVAC Services", icon: Building, category: "Home Services", description: "Heating, cooling, and ventilation system services" },
  { id: 9, name: "Pool Installation", icon: Bath, category: "Home Services", description: "Swimming pool construction and installation projects" },
  { id: 10, name: "Pest Control", icon: Shield, category: "Home Services", available: true, description: "Residential and commercial pest management services" },
  { id: 11, name: "Roofing", icon: Home, category: "Home Services", description: "Roof repair, replacement, and maintenance services" },
  { id: 12, name: "Flooring", icon: Home, category: "Home Services", description: "Hardwood, tile, carpet, and laminate flooring installation" },
  { id: 13, name: "Painting", icon: Paintbrush, category: "Home Services", description: "Interior and exterior painting services" },
  { id: 14, name: "Fencing", icon: Shield, category: "Home Services", description: "Fence installation, repair, and maintenance" },
  { id: 15, name: "Deck & Patio", icon: Home, category: "Home Services", description: "Outdoor deck and patio construction services" },

  // Photography & Events (8 calculators)
  { id: 16, name: "Wedding Photography", icon: Camera, category: "Photography & Events", available: true, description: "Wedding packages with engagement and reception coverage" },
  { id: 17, name: "Event Photography", icon: Camera, category: "Photography & Events", description: "Corporate events, parties, and special occasions" },
  { id: 18, name: "Portrait Photography", icon: Camera, category: "Photography & Events", description: "Family portraits, headshots, and personal sessions" },
  { id: 19, name: "Real Estate Photography", icon: Camera, category: "Photography & Events", description: "Property photos for listings and marketing" },
  { id: 20, name: "Product Photography", icon: Camera, category: "Photography & Events", description: "E-commerce and catalog product photography" },
  { id: 21, name: "Event Planning", icon: Calendar, category: "Photography & Events", description: "Wedding and corporate event planning services" },
  { id: 22, name: "DJ Services", icon: Music, category: "Photography & Events", description: "Wedding, party, and event DJ entertainment" },
  { id: 23, name: "Catering", icon: Utensils, category: "Photography & Events", description: "Event catering and meal planning services" },

  // Health & Fitness (7 calculators)
  { id: 24, name: "Personal Training", icon: Dumbbell, category: "Health & Fitness", available: true, description: "1-on-1 and group fitness training sessions" },
  { id: 25, name: "Nutrition Coaching", icon: Stethoscope, category: "Health & Fitness", description: "Meal planning and dietary consultation services" },
  { id: 26, name: "Yoga Instruction", icon: Heart, category: "Health & Fitness", description: "Private and group yoga classes" },
  { id: 27, name: "Physical Therapy", icon: Stethoscope, category: "Health & Fitness", description: "Rehabilitation and injury recovery services" },
  { id: 28, name: "Massage Therapy", icon: Heart, category: "Health & Fitness", description: "Therapeutic and relaxation massage services" },
  { id: 29, name: "Life Coaching", icon: Target, category: "Health & Fitness", description: "Personal development and goal achievement coaching" },
  { id: 30, name: "Mental Health Counseling", icon: Heart, category: "Health & Fitness", description: "Therapy and counseling services" },

  // Beauty & Wellness (6 calculators)
  { id: 31, name: "Hair Styling", icon: Scissors, category: "Beauty & Wellness", description: "Cuts, coloring, and styling services" },
  { id: 32, name: "Makeup Artist", icon: Palette, category: "Beauty & Wellness", description: "Bridal, event, and special occasion makeup" },
  { id: 33, name: "Nail Services", icon: Gem, category: "Beauty & Wellness", description: "Manicures, pedicures, and nail art" },
  { id: 34, name: "Spa Services", icon: Flower, category: "Beauty & Wellness", description: "Facials, treatments, and wellness packages" },
  { id: 35, name: "Skincare Treatments", icon: Sun, category: "Beauty & Wellness", description: "Professional skincare and facial treatments" },
  { id: 36, name: "Lash Extensions", icon: Sparkles, category: "Beauty & Wellness", description: "Eyelash extension and beauty enhancement services" },

  // Education & Training (6 calculators)
  { id: 37, name: "Tutoring", icon: GraduationCap, category: "Education & Training", description: "Academic tutoring and test preparation" },
  { id: 38, name: "Language Lessons", icon: GraduationCap, category: "Education & Training", description: "Foreign language instruction and conversation practice" },
  { id: 39, name: "Music Lessons", icon: Music, category: "Education & Training", description: "Instrument lessons and music theory instruction" },
  { id: 40, name: "Driving Lessons", icon: Car, category: "Education & Training", description: "Driver education and road test preparation" },
  { id: 41, name: "Online Courses", icon: Monitor, category: "Education & Training", description: "Digital course creation and online education" },
  { id: 42, name: "Corporate Training", icon: Users2, category: "Education & Training", description: "Professional development and skills training" },

  // Technology Services (6 calculators)
  { id: 43, name: "Web Development", icon: Code, category: "Technology", description: "Website design and development services" },
  { id: 44, name: "IT Support", icon: Monitor, category: "Technology", description: "Computer repair and technical support services" },
  { id: 45, name: "App Development", icon: Smartphone, category: "Technology", description: "Mobile and web application development" },
  { id: 46, name: "Network Setup", icon: Wifi, category: "Technology", description: "Business network installation and configuration" },
  { id: 47, name: "Server Management", icon: Server, category: "Technology", description: "Server setup, maintenance, and cloud services" },
  { id: 48, name: "Cybersecurity", icon: Shield, category: "Technology", description: "Security audits and protection services" },

  // Creative Services (5 calculators)
  { id: 49, name: "Graphic Design", icon: PenTool, category: "Creative Services", description: "Logo design, branding, and visual identity" },
  { id: 50, name: "Video Production", icon: Video, category: "Creative Services", description: "Video editing, production, and post-production" },
  { id: 51, name: "Content Writing", icon: Edit, category: "Creative Services", description: "Blog posts, copywriting, and content creation" },
  { id: 52, name: "Social Media Management", icon: Globe, category: "Creative Services", description: "Social media strategy and content management" },
  { id: 53, name: "SEO Services", icon: TrendingUp, category: "Creative Services", description: "Search engine optimization and digital marketing" },

  // Business Services (4 calculators)
  { id: 54, name: "Accounting", icon: Calculator, category: "Business Services", description: "Bookkeeping, tax preparation, and financial services" },
  { id: 55, name: "Legal Services", icon: Scale, category: "Business Services", description: "Legal consultation and document preparation" },
  { id: 56, name: "Business Consulting", icon: Briefcase, category: "Business Services", description: "Strategy consulting and business development" },
  { id: 57, name: "Virtual Assistant", icon: Users, category: "Business Services", description: "Administrative support and virtual assistance" },

  // Automotive (3 calculators)
  { id: 58, name: "Auto Repair", icon: Car, category: "Automotive", description: "Car maintenance and mechanical repair services" },
  { id: 59, name: "Car Detailing", icon: Sparkles, category: "Automotive", description: "Professional car cleaning and detailing services" },
  { id: 60, name: "Mobile Mechanic", icon: Wrench, category: "Automotive", description: "On-site automotive repair and maintenance" },
];

export default function NichesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(allNiches.map(niche => niche.category)))];

  const filteredNiches = allNiches.filter(niche => {
    const matchesSearch = niche.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         niche.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || niche.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const availableCount = allNiches.filter(niche => niche.available).length;
  const totalCount = allNiches.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-900 to-midnight-800 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            All <span className="text-neon-400">{totalCount} Calculators</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Every service business niche covered with AI-powered quote calculators
          </p>
          <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
            <Badge variant="secondary" className="bg-neon-500/20 text-neon-400">
              {availableCount} Live Demos Available
            </Badge>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {totalCount - availableCount} Available in Full Version
            </Badge>
            <Badge variant="outline" className="border-neon-400 text-neon-400">
              €5/month Launch Price
            </Badge>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search calculators by name or service type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-midnight-700 border-midnight-600 text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
                className={
                  selectedCategory === category
                    ? "bg-neon-500 hover:bg-neon-600 text-white"
                    : "border-midnight-600 text-gray-300 hover:border-neon-400 hover:text-white"
                }
              >
                {category}
                {category !== "All" && (
                  <Badge variant="secondary" className="ml-2 bg-midnight-600 text-gray-300">
                    {allNiches.filter(n => n.category === category).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="text-center mb-6">
          <p className="text-gray-400">
            Showing <span className="text-neon-400 font-medium">{filteredNiches.length}</span> of {totalCount} calculators
          </p>
        </div>

        {/* Calculator Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredNiches.map((niche, index) => (
            <motion.div
              key={niche.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`relative p-6 rounded-lg border transition-all duration-300 hover:scale-105 ${
                niche.available
                  ? "bg-midnight-800 border-midnight-700 hover:border-neon-400 hover:shadow-lg"
                  : "bg-midnight-800/50 border-midnight-700/50"
              }`}
            >
              {niche.available && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-midnight-900"></div>
              )}
              
              <div className="flex items-start mb-4">
                <div className={`p-3 rounded-lg mr-4 ${
                  niche.available 
                    ? "bg-neon-500/10 border border-neon-500/30" 
                    : "bg-gray-500/10 border border-gray-500/30"
                }`}>
                  <niche.icon className={`h-6 w-6 ${
                    niche.available ? "text-neon-400" : "text-gray-400"
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{niche.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">{niche.category}</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{niche.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {niche.available ? (
                  <>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      <Star className="h-3 w-3 mr-1" />
                      Live Demo Available
                    </Badge>
                    <div className="space-y-2">
                      {niche.name === "Home Renovation" && (
                        <Link href="/calculator/home-renovation">
                          <Button className="w-full bg-neon-500 hover:bg-neon-600 text-white">
                            Try Live Demo
                          </Button>
                        </Link>
                      )}
                      {niche.name === "Wedding Photography" && (
                        <Link href="/calculator/wedding-photography">
                          <Button className="w-full bg-neon-500 hover:bg-neon-600 text-white">
                            Try Live Demo
                          </Button>
                        </Link>
                      )}
                      {niche.name === "Personal Training" && (
                        <Link href="/calculator/personal-training">
                          <Button className="w-full bg-neon-500 hover:bg-neon-600 text-white">
                            Try Live Demo
                          </Button>
                        </Link>
                      )}
                      {niche.name === "Landscaping" && (
                        <Link href="/calculator/landscaping">
                          <Button className="w-full bg-neon-500 hover:bg-neon-600 text-white">
                            Try Live Demo
                          </Button>
                        </Link>
                      )}
                      {niche.name === "Pest Control" && (
                        <Link href="/calculator/pest-control">
                          <Button className="w-full bg-neon-500 hover:bg-neon-600 text-white">
                            Try Live Demo
                          </Button>
                        </Link>
                      )}
                      {!["Home Renovation", "Wedding Photography", "Personal Training", "Landscaping", "Pest Control"].includes(niche.name) && (
                        <Button className="w-full bg-neon-500 hover:bg-neon-600 text-white">
                          Try Live Demo
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Full Version Only
                    </Badge>
                    <Button 
                      disabled 
                      className="w-full bg-gray-600 text-gray-400 cursor-not-allowed"
                    >
                      Available for €5/month
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredNiches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="mb-4">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No calculators found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              variant="outline"
              className="border-neon-400 text-neon-400 hover:bg-neon-400 hover:text-midnight-900"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Category Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {categories.slice(1).map((category) => {
            const categoryNiches = allNiches.filter(n => n.category === category);
            const availableInCategory = categoryNiches.filter(n => n.available).length;
            return (
              <div key={category} className="bg-midnight-800/50 rounded-lg p-4 border border-midnight-700 text-center">
                <div className="text-2xl font-bold text-neon-400">{categoryNiches.length}</div>
                <div className="text-sm text-gray-300 mb-1">{category}</div>
                <div className="text-xs text-gray-400">{availableInCategory} demos available</div>
              </div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16 p-8 bg-gradient-to-r from-neon-500/10 to-neon-600/10 rounded-lg border border-neon-500/30"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to <span className="text-neon-400">10X Your Conversion Rate?</span>
            </h2>
            <p className="text-gray-300 mb-6 text-lg">
              Stop losing leads to "I'll think about it" and start closing deals with instant quotes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link href="/#pricing">
                <Button size="lg" className="bg-neon-500 hover:bg-neon-600 text-white px-8 py-4 text-lg">
                  Get All {totalCount} Calculators for €5/month
                </Button>
              </Link>
              <Link href="/calculator/wedding-photography">
                <Button size="lg" variant="outline" className="border-neon-400 text-neon-400 hover:bg-neon-400 hover:text-midnight-900 px-8 py-4 text-lg">
                  Try Demo First
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center">
                <Crown className="h-4 w-4 mr-2 text-neon-400" />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-neon-400" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-neon-400" />
                <span>300% More Conversions</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}