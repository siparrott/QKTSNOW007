import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, X, Diamond, Circle, Square, Triangle, Star, Hexagon, Heart, Crown, Gem, Sparkles, Zap } from "lucide-react";

// Comprehensive icon gallery for service-based businesses
export const SERVICE_ICONS = {
  // Photography & Media
  photography: {
    category: "Photography & Media",
    icons: {
      "📸": "Camera/Photography",
      "👤": "Individual Portrait",
      "💕": "Couple/Romance",
      "👨‍👩‍👧‍👦": "Family",
      "👰": "Wedding/Bride",
      "🤵": "Groom/Formal",
      "💍": "Wedding Ring",
      "🎥": "Video/Film",
      "📹": "Recording",
      "🎬": "Film Production",
      "📱": "Mobile Content",
      "💻": "Digital Media",
      "🎨": "Creative/Art",
      "🖼️": "Framing/Gallery",
      "🌅": "Landscape",
      "🏠": "Real Estate",
      "🍽️": "Food Photography",
      "✈️": "Travel/Destination",
      "🎓": "Graduation/Senior",
      "👶": "Baby/Newborn",
      "🤰": "Maternity",
      "💼": "Business/Corporate"
    }
  },

  // Premium Shapes & Luxury Icons
  premium: {
    category: "Premium Shapes",
    icons: {
      "◆": "Diamond Shape",
      "◇": "Hollow Diamond", 
      "●": "Solid Circle",
      "○": "Hollow Circle",
      "■": "Solid Square",
      "□": "Hollow Square",
      "▲": "Solid Triangle",
      "△": "Hollow Triangle",
      "★": "Solid Star",
      "☆": "Hollow Star",
      "⬟": "Hexagon",
      "⬢": "Large Hexagon",
      "♦": "Diamond Suit",
      "♥": "Heart Suit",
      "♠": "Spade Suit",
      "♣": "Club Suit",
      "◉": "Circle Dot",
      "◎": "Double Circle",
      "⬡": "Black Hexagon",
      "⬠": "White Hexagon",
      "▣": "Square Check",
      "▤": "Square Horizontal",
      "▥": "Square Vertical",
      "▦": "Square Grid",
      "▧": "Square Diagonal",
      "▨": "Square Cross",
      "▩": "Square Dense",
      "◈": "Diamond Dot",
      "◊": "Lozenge",
      "⟡": "Geometric Diamond",
      "⟢": "Geometric Circle",
      "⟣": "Geometric Square"
    }
  },

  // Luxury Business Icons  
  luxury: {
    category: "Luxury Business",
    icons: {
      "◇": "Premium Service",
      "⬟": "Excellence",
      "◆": "VIP Treatment",
      "★": "Five Star",
      "◉": "Premium Quality",
      "⬢": "Exclusive",
      "♦": "Luxury Suite",
      "◎": "High-End",
      "▲": "Elite Service",
      "⬡": "Boutique",
      "◈": "Prestige",
      "⟡": "Bespoke",
      "●": "Concierge",
      "■": "Executive",
      "▣": "Professional",
      "◊": "Sophisticated",
      "⟢": "Premier",
      "☆": "Signature",
      "△": "Artisan",
      "⬠": "Curated"
    }
  },
  
  // Health & Wellness
  health: {
    category: "Health & Wellness",
    icons: {
      "🏥": "Medical/Hospital",
      "👨‍⚕️": "Doctor/Physician",
      "👩‍⚕️": "Female Doctor",
      "🦷": "Dental/Teeth",
      "💊": "Medicine/Pharmacy",
      "🩺": "Medical Equipment",
      "💉": "Injection/Vaccine",
      "🧠": "Mental Health",
      "💆": "Massage/Spa",
      "🧘": "Yoga/Meditation",
      "💪": "Fitness/Strength",
      "🏃": "Running/Cardio",
      "🥗": "Nutrition/Diet",
      "🍎": "Healthy Food",
      "⚖️": "Weight Management",
      "🛌": "Sleep/Rest",
      "🌿": "Natural/Herbal",
      "💚": "Wellness/Health",
      "🔬": "Laboratory/Testing",
      "🏋️": "Personal Training",
      "🚴": "Cycling/Exercise",
      "🤸": "Flexibility/Yoga"
    }
  },
  
  // Home & Construction
  home: {
    category: "Home & Construction",
    icons: {
      "🏠": "House/Home",
      "🔨": "Construction/Build",
      "🔧": "Repair/Fix",
      "🪚": "Carpentry/Wood",
      "🎨": "Painting/Decor",
      "🪟": "Windows",
      "🚪": "Doors",
      "🧱": "Masonry/Brick",
      "⚡": "Electrical",
      "🚿": "Plumbing/Water",
      "❄️": "HVAC/Cooling",
      "🔥": "Heating",
      "🌡️": "Temperature",
      "🧹": "Cleaning",
      "🏗️": "Construction Site",
      "📏": "Measuring/Planning",
      "🛠️": "Tools/Equipment",
      "🏡": "Residential",
      "🏢": "Commercial",
      "🌳": "Landscaping",
      "🌺": "Garden/Plants",
      "🚜": "Heavy Equipment"
    }
  },
  
  // Automotive & Transport
  automotive: {
    category: "Automotive & Transport",
    icons: {
      "🚗": "Car/Auto",
      "🔧": "Mechanic/Repair",
      "⛽": "Fuel/Gas",
      "🛞": "Tires/Wheels",
      "🚙": "SUV/Truck",
      "🏍️": "Motorcycle",
      "🚚": "Moving/Delivery",
      "🚐": "Van/Commercial",
      "🚛": "Truck/Heavy",
      "🚕": "Taxi/Rideshare",
      "🚌": "Bus/Transport",
      "⛵": "Boat/Marine",
      "🛥️": "Yacht/Luxury",
      "✈️": "Airport Transfer",
      "🚁": "Helicopter",
      "🧽": "Car Wash",
      "🔋": "Electric/Battery",
      "🛡️": "Insurance/Protection",
      "📍": "Location/GPS",
      "🕐": "Timing/Schedule",
      "💺": "Comfort/Luxury",
      "🎯": "Precision/Quality"
    }
  },
  
  // Business & Professional
  business: {
    category: "Business & Professional",
    icons: {
      "💼": "Business/Corporate",
      "📊": "Analytics/Data",
      "📈": "Growth/Success",
      "💰": "Money/Finance",
      "🎯": "Target/Goals",
      "⚖️": "Legal/Law",
      "📋": "Planning/Strategy",
      "🤝": "Partnership/Deal",
      "📞": "Communication",
      "💻": "Technology/Digital",
      "🌐": "Global/Online",
      "📱": "Mobile/Apps",
      "🏆": "Success/Awards",
      "🎓": "Education/Training",
      "📚": "Knowledge/Learning",
      "✍️": "Writing/Content",
      "🎤": "Speaking/Presentation",
      "🔍": "Research/Analysis",
      "⭐": "Quality/Premium",
      "🚀": "Launch/Growth",
      "💡": "Ideas/Innovation",
      "🔐": "Security/Privacy"
    }
  },
  
  // Personal Services
  personal: {
    category: "Personal Services",
    icons: {
      "💇": "Hair/Salon",
      "💅": "Nails/Manicure",
      "💄": "Makeup/Beauty",
      "👗": "Fashion/Styling",
      "👔": "Formal/Business",
      "🎭": "Entertainment/Events",
      "🎪": "Circus/Fun",
      "🎉": "Party/Celebration",
      "🎂": "Birthday/Cake",
      "💒": "Wedding/Marriage",
      "🏃": "Personal Training",
      "🧘": "Life Coaching",
      "📖": "Tutoring/Education",
      "🐕": "Pet Services",
      "🐾": "Animal Care",
      "👶": "Childcare/Babysitting",
      "🍳": "Cooking/Chef",
      "🧼": "Cleaning/Housekeeping",
      "🌸": "Spa/Relaxation",
      "💆": "Massage/Therapy",
      "🎨": "Art/Creative",
      "🎵": "Music/Audio"
    }
  },
  
  // Time & Duration
  time: {
    category: "Time & Duration",
    icons: {
      "⏰": "30 Minutes",
      "🕐": "1 Hour",
      "⏱️": "2 Hours",
      "🕒": "3 Hours",
      "🕓": "4 Hours",
      "☀️": "Half Day",
      "🌅": "Full Day",
      "🌙": "Evening",
      "⭐": "Premium Time",
      "⚡": "Rush/Express",
      "🔄": "Ongoing/Repeat",
      "📅": "Scheduled/Appointment"
    }
  },
  
  // Quality & Features
  quality: {
    category: "Quality & Features",
    icons: {
      "⭐": "Premium/Quality",
      "💎": "Luxury/High-End",
      "🏆": "Award/Best",
      "✨": "Special/Featured",
      "🔥": "Popular/Hot",
      "💯": "Perfect/Complete",
      "🎯": "Targeted/Focused",
      "🚀": "Fast/Express",
      "🛡️": "Protected/Insured",
      "✅": "Verified/Approved",
      "🌟": "Featured/Highlighted",
      "💝": "Gift/Special Offer"
    }
  }
};

interface IconGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string) => void;
  currentIcon?: string;
}

export default function IconGallery({ isOpen, onClose, onSelectIcon, currentIcon }: IconGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get all categories
  const categories = Object.keys(SERVICE_ICONS);
  
  // Filter icons based on search and category
  const getFilteredIcons = () => {
    const allIcons: Array<{ icon: string; name: string; category: string }> = [];
    
    Object.entries(SERVICE_ICONS).forEach(([categoryKey, categoryData]) => {
      if (selectedCategory === "all" || selectedCategory === categoryKey) {
        Object.entries(categoryData.icons).forEach(([icon, name]) => {
          if (searchTerm === "" || 
              name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              icon.includes(searchTerm)) {
            allIcons.push({ icon, name, category: categoryData.category });
          }
        });
      }
    });
    
    return allIcons;
  };

  const filteredIcons = getFilteredIcons();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-midnight-800 border-midnight-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span>Service Business Icon Gallery</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search icons by name or emoji..."
                className="pl-10 bg-midnight-900 border-midnight-600 text-white"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-midnight-900 border border-midnight-600 text-white rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {SERVICE_ICONS[category as keyof typeof SERVICE_ICONS].category}
                </option>
              ))}
            </select>
          </div>

          {/* Category Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedCategory === "all" ? "default" : "secondary"}
              className={`cursor-pointer ${selectedCategory === "all" ? "bg-neon-500 text-black" : "bg-midnight-700 text-gray-300"}`}
              onClick={() => setSelectedCategory("all")}
            >
              All ({filteredIcons.length})
            </Badge>
            {categories.map(category => {
              const count = Object.keys(SERVICE_ICONS[category as keyof typeof SERVICE_ICONS].icons).length;
              return (
                <Badge 
                  key={category}
                  variant={selectedCategory === category ? "default" : "secondary"}
                  className={`cursor-pointer ${selectedCategory === category ? "bg-neon-500 text-black" : "bg-midnight-700 text-gray-300"}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {SERVICE_ICONS[category as keyof typeof SERVICE_ICONS].category} ({count})
                </Badge>
              );
            })}
          </div>

          {/* Icons Grid */}
          <div className="max-h-96 overflow-y-auto bg-midnight-900 rounded-lg p-4">
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
              {filteredIcons.map(({ icon, name, category }) => (
                <div
                  key={`${icon}-${name}`}
                  onClick={() => onSelectIcon(icon)}
                  className={`
                    flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all
                    hover:bg-midnight-700 hover:scale-105 border-2
                    ${currentIcon === icon 
                      ? "border-neon-500 bg-neon-500/20" 
                      : "border-transparent hover:border-midnight-600"
                    }
                  `}
                  title={`${name} (${category})`}
                >
                  <span className="text-2xl mb-1">{icon}</span>
                  <span className="text-xs text-gray-400 text-center leading-tight">
                    {name.length > 12 ? name.substring(0, 12) + "..." : name}
                  </span>
                </div>
              ))}
            </div>
            
            {filteredIcons.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No icons found matching your search.</p>
                <p className="text-sm">Try different keywords or select a different category.</p>
              </div>
            )}
          </div>

          {/* Usage Tips */}
          <div className="bg-midnight-900 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">💡 Usage Tips:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Icons help users quickly understand different service options</li>
              <li>• Use consistent icon themes within each calculator</li>
              <li>• Popular choices: ⭐ for premium, 🔥 for popular, ⚡ for express</li>
              <li>• Click any icon to select it for your service option</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}