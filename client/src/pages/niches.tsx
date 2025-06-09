import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Search,
  Camera, 
  Home, 
  Dumbbell, 
  Trees, 
  Car, 
  Wrench, 
  Scissors, 
  Heart, 
  Monitor, 
  Truck, 
  Dog, 
  Music, 
  Briefcase, 
  Shield, 
  Utensils, 
  Palette, 
  GraduationCap, 
  Building, 
  Plane, 
  Stethoscope,
  Sparkles,
  Calculator,
  Zap
} from "lucide-react";
import { Link } from "wouter";

const serviceNiches = [
  // Home & Property Services
  { id: 1, name: "Home Renovation", icon: Home, category: "Home Services", available: true, featured: true },
  { id: 2, name: "Landscaping", icon: Trees, category: "Home Services", available: true },
  { id: 3, name: "House Cleaning", icon: Home, category: "Home Services" },
  { id: 4, name: "Interior Design", icon: Palette, category: "Home Services" },
  { id: 5, name: "Roofing Services", icon: Building, category: "Home Services" },
  { id: 6, name: "Plumbing", icon: Wrench, category: "Home Services" },
  { id: 7, name: "Electrical Services", icon: Zap, category: "Home Services" },
  { id: 8, name: "HVAC Services", icon: Building, category: "Home Services" },
  { id: 9, name: "Pool Installation", icon: Home, category: "Home Services" },
  { id: 10, name: "Pest Control", icon: Shield, category: "Home Services" },

  // Photography & Events
  { id: 11, name: "Wedding Photography", icon: Camera, category: "Photography", available: true },
  { id: 12, name: "Event Photography", icon: Camera, category: "Photography" },
  { id: 13, name: "Portrait Photography", icon: Camera, category: "Photography" },
  { id: 14, name: "Real Estate Photography", icon: Camera, category: "Photography" },
  { id: 15, name: "Product Photography", icon: Camera, category: "Photography" },

  // Fitness & Health
  { id: 16, name: "Personal Training", icon: Dumbbell, category: "Fitness", available: true },
  { id: 17, name: "Nutrition Coaching", icon: Dumbbell, category: "Fitness" },
  { id: 18, name: "Yoga Instruction", icon: Heart, category: "Fitness" },
  { id: 19, name: "Massage Therapy", icon: Heart, category: "Health" },
  { id: 20, name: "Life Coaching", icon: Heart, category: "Health" },

  // Automotive
  { id: 21, name: "Auto Repair", icon: Car, category: "Automotive" },
  { id: 22, name: "Car Detailing", icon: Car, category: "Automotive" },
  { id: 23, name: "Towing Services", icon: Truck, category: "Automotive" },
  { id: 24, name: "Mobile Mechanic", icon: Wrench, category: "Automotive" },

  // Beauty & Personal Care
  { id: 25, name: "Hair Styling", icon: Scissors, category: "Beauty" },
  { id: 26, name: "Makeup Artist", icon: Palette, category: "Beauty" },
  { id: 27, name: "Nail Services", icon: Scissors, category: "Beauty" },
  { id: 28, name: "Spa Services", icon: Heart, category: "Beauty" },

  // Technology & Digital
  { id: 29, name: "Web Development", icon: Monitor, category: "Technology" },
  { id: 30, name: "IT Support", icon: Monitor, category: "Technology" },
  { id: 31, name: "Graphic Design", icon: Palette, category: "Technology" },
  { id: 32, name: "Digital Marketing", icon: Monitor, category: "Technology" },

  // Professional Services
  { id: 33, name: "Legal Services", icon: Briefcase, category: "Professional" },
  { id: 34, name: "Accounting", icon: Briefcase, category: "Professional" },
  { id: 35, name: "Real Estate", icon: Building, category: "Professional" },
  { id: 36, name: "Insurance Services", icon: Shield, category: "Professional" },

  // Food & Catering
  { id: 37, name: "Catering Services", icon: Utensils, category: "Food" },
  { id: 38, name: "Personal Chef", icon: Utensils, category: "Food" },
  { id: 39, name: "Meal Prep", icon: Utensils, category: "Food" },
  { id: 40, name: "Baking Services", icon: Utensils, category: "Food" },

  // Education & Training
  { id: 41, name: "Tutoring", icon: GraduationCap, category: "Education" },
  { id: 42, name: "Music Lessons", icon: Music, category: "Education" },
  { id: 43, name: "Language Teaching", icon: GraduationCap, category: "Education" },
  { id: 44, name: "Driving Instruction", icon: Car, category: "Education" },

  // Specialized Services
  { id: 45, name: "Pet Services", icon: Dog, category: "Pet Care" },
  { id: 46, name: "Travel Planning", icon: Plane, category: "Travel" },
  { id: 47, name: "Event Planning", icon: Sparkles, category: "Events" },
  { id: 48, name: "Security Services", icon: Shield, category: "Security" },
  { id: 49, name: "Moving Services", icon: Truck, category: "Moving" },
  { id: 50, name: "Healthcare Services", icon: Stethoscope, category: "Healthcare" }
];

const categories = [
  "All",
  "Home Services",
  "Photography", 
  "Fitness",
  "Health",
  "Automotive",
  "Beauty",
  "Technology",
  "Professional",
  "Food",
  "Education",
  "Pet Care",
  "Travel",
  "Events",
  "Security",
  "Moving",
  "Healthcare"
];

export default function NichesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredNiches = serviceNiches.filter(niche => {
    const matchesSearch = niche.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || niche.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const availableCount = serviceNiches.filter(n => n.available).length;
  const comingSoonCount = serviceNiches.length - availableCount;

  return (
    <div className="min-h-screen bg-midnight-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">All Service Niches</h1>
            <p className="text-gray-400 mt-2">
              Choose from 50+ calculator templates designed for service businesses
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-midnight-800 border-midnight-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-neon-500 rounded-lg flex items-center justify-center mr-4">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neon-400">{serviceNiches.length}</div>
                <div className="text-gray-400">Total Niches</div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-midnight-800 border-midnight-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{availableCount}</div>
                <div className="text-gray-400">Available Now</div>
              </div>
            </div>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{comingSoonCount}</div>
                <div className="text-gray-400">Coming Soon</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search service niches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-midnight-800 border-midnight-600 pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category 
                  ? "bg-neon-500 hover:bg-neon-600" 
                  : "border-midnight-600 hover:border-neon-500"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredNiches.length} of {serviceNiches.length} service niches
          </p>
        </div>

        {/* Niches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNiches.map((niche, index) => (
            <motion.div
              key={niche.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Card className={`bg-midnight-800 border-midnight-700 p-6 hover:border-neon-500/30 transition-all duration-300 group relative ${
                niche.available ? 'cursor-pointer' : 'opacity-75'
              }`}>
                {/* Featured Badge */}
                {niche.featured && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-neon-500 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      NEW
                    </Badge>
                  </div>
                )}

                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-400 to-neon-600 rounded-lg flex items-center justify-center mr-3">
                    <niche.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white group-hover:text-neon-400 transition-colors">
                      {niche.name}
                    </h3>
                    <p className="text-sm text-gray-400">{niche.category}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {niche.available ? (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        Available Now
                      </div>
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
                      {!["Home Renovation", "Wedding Photography", "Personal Training", "Landscaping"].includes(niche.name) && (
                        <Button className="w-full bg-neon-500 hover:bg-neon-600 text-white">
                          Try Live Demo
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-blue-400">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                        Coming Soon
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full border-midnight-600 text-gray-400 cursor-not-allowed"
                        disabled
                      >
                        Get Notified
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16 p-8 bg-gradient-to-br from-neon-500/10 to-neon-600/10 rounded-2xl border border-neon-500/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Build Your Quote Calculator?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of service businesses already using QuoteKit.ai to convert more visitors into paying customers with instant, professional quotes.
          </p>
          <Link href="#pricing">
            <Button className="bg-neon-500 hover:bg-neon-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-glow">
              Get Started - €5/month
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}