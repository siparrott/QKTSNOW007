import { 
  users, 
  calculators, 
  userCalculators, 
  leads,
  type User, 
  type InsertUser,
  type Calculator,
  type InsertCalculator,
  type UserCalculator,
  type InsertUserCalculator,
  type Lead,
  type InsertLead
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Calculators
  getCalculators(): Promise<Calculator[]>;
  getCalculatorBySlug(slug: string): Promise<Calculator | undefined>;
  getCalculatorsByCategory(category: string): Promise<Calculator[]>;
  createCalculator(calculator: InsertCalculator): Promise<Calculator>;
  
  // User Calculators
  getUserCalculators(userId: string): Promise<UserCalculator[]>;
  getUserCalculatorByEmbedId(embedId: string): Promise<UserCalculator | undefined>;
  createUserCalculator(userCalculator: InsertUserCalculator): Promise<UserCalculator>;
  
  // Leads
  getLeadsByUserCalculator(userCalculatorId: string): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private calculators: Map<number, Calculator>;
  private userCalculators: Map<string, UserCalculator>;
  private leads: Map<string, Lead>;
  private currentCalculatorId: number;

  constructor() {
    this.users = new Map();
    this.calculators = new Map();
    this.userCalculators = new Map();
    this.leads = new Map();
    this.currentCalculatorId = 1;
    
    // Seed with default calculators
    this.seedCalculators();
  }

  private seedCalculators() {
    const defaultCalculators: InsertCalculator[] = [
      {
        name: "Electrician Services Calculator",
        slug: "electrician",
        category: "home-services",
        description: "Professional electrical services quote calculator with AI input",
        defaultConfig: {
          baseCallOut: 80,
          roomRate: 60,
          serviceTypes: {
            "new-installation": 50,
            "rewiring": 150,
            "fault-finding": 40,
            "fuse-box-upgrade": 120,
            "lighting-installation": 80,
            "ev-charger": 200,
            "smart-home": 225
          },
          urgencyRates: {
            "standard": 0,
            "next-day": 50,
            "emergency": 100
          },
          addOns: {
            "certificate": 40,
            "cleanup": 50,
            "materials": 100,
            "extra-tech": 70
          }
        }
      },
      {
        name: "Drone & Aerial Photography Calculator",
        slug: "drone-photography",
        category: "photography",
        description: "Professional aerial photography and videography quote calculator",
        defaultConfig: {
          baseShoot: 200,
          durationMultipliers: {
            "under-1hr": 1.0,
            "half-day": 2.5,
            "full-day": 4.0
          },
          outputTypes: {
            "video-only": 100,
            "stills-only": 0,
            "both": 150,
            "edited-highlights": 250,
            "raw-footage": 50
          },
          locationTypes: {
            "rural": 0,
            "urban": 75,
            "restricted": 200
          },
          addOns: {
            "voiceover": 50,
            "music": 80,
            "promo-video": 300,
            "cloud-delivery": 40,
            "express-delivery": 100
          }
        }
      },
      {
        name: "Event Videography Calculator",
        slug: "event-videography",
        category: "photography",
        description: "Professional event videography quote calculator with cinematic quality",
        defaultConfig: {
          baseEvent: 450,
          durations: {
            "2-hours": 0,
            "half-day": 300,
            "full-day": 600,
            "multi-day": 1200
          },
          deliverables: {
            "full-video": 0,
            "highlights": 250,
            "raw-footage": 0,
            "social-teasers": 120,
            "drone": 200,
            "same-day-edit": 400
          },
          crewSizes: {
            "solo": 0,
            "duo": 200,
            "full-team": 400
          },
          locations: {
            "local": 0,
            "regional": 100,
            "destination": 300
          },
          addOns: {
            "voiceover": 80,
            "music": 100,
            "titles": 60,
            "livestream": 300,
            "express": 100
          }
        }
      },
      {
        name: "Real Estate Photography Calculator",
        slug: "real-estate-photography",
        category: "photography",
        description: "Professional property photography quote calculator with competitive pricing",
        defaultConfig: {
          baseApartment: 150,
          propertyTypes: {
            "apartment": 0,
            "house": 50,
            "villa": 100,
            "commercial": 100
          },
          services: {
            "interior": 0,
            "exterior": 30,
            "aerial": 80,
            "twilight": 90,
            "floor-plan": 60,
            "virtual-tour": 120
          },
          timeframes: {
            "standard": 0,
            "rush": 50,
            "same-day": 90
          },
          locations: {
            "city": 0,
            "nearby": 25,
            "distant": 75
          }
        }
      },
      {
        name: "Food Photography Calculator",
        slug: "food-photography",
        category: "photography",
        description: "Professional food photography quote calculator with elegant styling",
        defaultConfig: {
          baseStudio: 180,
          dishCounts: {
            "1-5": 0,
            "6-10": 100,
            "11-20": 200,
            "20+": 300
          },
          locations: {
            "studio": 0,
            "on-location": 75,
            "outdoor": 50
          },
          styles: {
            "overhead": 0,
            "lifestyle": 80,
            "studio": 0,
            "process": 60
          },
          addOns: {
            "stylist": 150,
            "props": 100,
            "fast": 80,
            "raw": 50,
            "commercial": 200
          },
          delivery: {
            "jpeg": 0,
            "social": 40,
            "tiff": 60,
            "web": 30
          }
        }
      },
      {
        name: "Commercial Photography Calculator",
        slug: "commercial-photography",
        category: "photography",
        description: "Professional commercial photography quote calculator with corporate styling",
        defaultConfig: {
          baseStudio: 350,
          imageCounts: {
            "1-5": 0,
            "6-15": 300,
            "16-30": 750,
            "30+": 1200
          },
          durations: {
            "1-hour": 0,
            "half-day": 250,
            "full-day": 600,
            "multi-day": 1200
          },
          locations: {
            "studio": 0,
            "on-location": 100,
            "hybrid": 200
          },
          addOns: {
            "creative-director": 200,
            "stylist": 150,
            "basic-retouching": 50,
            "advanced-retouching": 100,
            "casting": 300,
            "set-design": 180,
            "local-rights": 100,
            "national-rights": 250,
            "global-rights": 500
          },
          delivery: {
            "standard": 0,
            "rush": 90,
            "same-day": 150
          }
        }
      },
      {
        name: "Portrait Photography Calculator",
        slug: "portrait-photography",
        category: "photography",
        description: "Professional portrait photography quote calculator with warm styling",
        defaultConfig: {
          baseSession: 150,
          durations: {
            "30-min": 0,
            "1-hour": 75,
            "2-hours": 150
          },
          locations: {
            "studio": 0,
            "outdoor": 60,
            "client-location": 60
          },
          wardrobe: {
            "1": 0,
            "2": 40,
            "3+": 80
          },
          addOns: {
            "makeup": 80,
            "standard-retouching": 0,
            "deluxe-retouching": 50,
            "express-delivery": 50,
            "extra-images": 100,
            "headshot-bundle": 75
          },
          usage: {
            "personal": 0,
            "commercial": 120
          }
        }
      },
      {
        name: "Lifestyle Influencer Calculator",
        slug: "lifestyle-influencer",
        category: "digital-marketing",
        description: "Professional influencer collaboration rate calculator with modern styling",
        defaultConfig: {
          basePost: 250,
          deliverables: {
            "1-post": 0,
            "post-stories": 150,
            "reel": 100,
            "full-campaign": 400,
            "unboxing": 200
          },
          usageRights: {
            "organic": 0,
            "paid-3m": 150,
            "paid-6m": 250,
            "paid-12m": 300,
            "whitelisting": 200
          },
          exclusivity: {
            "none": 0,
            "30-days": 100,
            "3-months": 200,
            "6-months": 400
          },
          addOns: {
            "photography": 150,
            "blog-writeup": 150,
            "link-in-bio": 75,
            "giveaway": 75,
            "bts-content": 100
          }
        }
      },
      {
        name: "Landscaping Calculator",
        slug: "landscaping",
        category: "home-services",
        description: "Professional landscaping quote calculator with earthy styling",
        defaultConfig: {
          baseLawnMowing: 120,
          services: {
            "mowing": 0,
            "tree-trimming": 100,
            "garden-design": 200,
            "irrigation": 300,
            "patio": 900,
            "lighting": 250,
            "fence": 800,
            "cleanup": 80
          },
          sizes: {
            "small": 0,
            "medium": 50,
            "large": 100,
            "very-large": 150
          },
          frequencies: {
            "one-time": 0,
            "weekly": 0.10,
            "bi-weekly": 0.07,
            "monthly": 0.05
          },
          addOns: {
            "soil-treatment": 120,
            "sod": 200,
            "pressure-washing": 80,
            "mulching": 90,
            "garden-redesign": 150
          }
        }
      },
      {
        name: "Wedding Photography Quote Calculator",
        slug: "wedding-photography",
        category: "photography",
        description: "Calculate quotes for wedding photography services",
        defaultConfig: {
          basePrice: 1500,
          hourlyRate: 200,
          factors: {
            guestCount: { min: 0.8, max: 1.5 },
            duration: { min: 0.5, max: 2.0 },
            location: { indoor: 1.0, outdoor: 1.2, destination: 1.8 }
          }
        }
      },
      {
        name: "Personal Training Package Calculator",
        slug: "personal-training",
        category: "fitness",
        description: "Calculate quotes for personal training services",
        defaultConfig: {
          basePrice: 75,
          packageDiscounts: {
            single: 1.0,
            package_4: 0.95,
            package_8: 0.9,
            package_12: 0.85
          }
        }
      },
      {
        name: "Landscaping Services Calculator",
        slug: "landscaping",
        category: "home-services",
        description: "Calculate quotes for landscaping projects",
        defaultConfig: {
          basePrice: 500,
          squareFootRate: 2.5,
          factors: {
            complexity: { basic: 1.0, moderate: 1.3, complex: 1.8 },
            materials: { standard: 1.0, premium: 1.4, luxury: 2.0 }
          }
        }
      },
      {
        name: "Home Renovation AI Calculator",
        slug: "home-renovation",
        category: "home-services",
        description: "AI-powered home renovation quotes with natural language input",
        defaultConfig: {
          baseConsultation: 500,
          projectTypes: {
            "kitchen-remodel": { min: 6000, max: 15000 },
            "bathroom-remodel": { min: 4000, max: 10000 },
            "full-home": { min: 20000, max: 50000 },
            "flooring": { min: 2000, max: 8000 },
            "painting": { min: 1000, max: 5000 },
            "basement-conversion": { min: 8000, max: 20000 },
            "attic-renovation": { min: 5000, max: 15000 }
          },
          finishMultipliers: {
            "standard": 1.0,
            "premium": 1.2,
            "luxury": 1.35
          },
          extras: {
            "interior-design": 800,
            "project-management": 1200,
            "cleanup": 400,
            "permits": 350
          },
          timeframeSurcharges: {
            "flexible": 0,
            "3-months": 0,
            "asap": 500
          },
          promoCodes: {
            "LAUNCH10": 0.1,
            "NEWCLIENT": 0.15,
            "QUOTEKIT": 0.1
          }
        }
      },
      {
        name: "Boudoir Photography Calculator",
        slug: "boudoir-photography",
        category: "photography",
        description: "AI-powered boudoir photography quotes with natural language input",
        defaultConfig: {
          basePrice: 250,
          sessionTypes: {
            "classic": 0,
            "lingerie": 25,
            "nude": 50,
            "glamour": 30
          },
          durations: {
            "1hr": 0,
            "2hr": 75,
            "3hr": 150
          },
          locations: {
            "studio": 0,
            "location": 100,
            "hotel": 100
          },
          outfitPricing: {
            "1": 0,
            "2": 50,
            "3": 100,
            "4": 150,
            "5": 200
          },
          addOns: {
            "makeup": 60,
            "album": 120,
            "deluxe-retouching": 75
          },
          promoCodes: {
            "BOUDOIR10": 0.1,
            "NEWCLIENT": 0.15,
            "GODDESS": 0.2
          }
        }
      },
      {
        name: "Pest Control Services Calculator",
        slug: "pest-control",
        category: "home-services",
        description: "Professional pest control quotes for residential and commercial properties",
        defaultConfig: {
          baseVisit: 100,
          pestTypes: {
            "cockroaches": 75,
            "ants": 50,
            "wasps-bees": 100,
            "bedbugs": 250,
            "rodents": 150,
            "termites": 300,
            "general-prevention": 60
          },
          infestationLevels: {
            "light": 0,
            "moderate": 75,
            "severe": 150
          },
          propertyTypes: {
            "apartment": 1.0,
            "house": 1.2,
            "commercial": 1.5,
            "warehouse": 2.0
          },
          serviceTypes: {
            "one-time": 1.0,
            "monthly": 0.8,
            "quarterly": 0.9
          },
          addOns: {
            "eco-friendly": 40,
            "same-day": 80,
            "follow-up": 50,
            "pet-safe": 40
          },
          promoCodes: {
            "LAUNCH10": 0.1,
            "NEWCLIENT": 0.15,
            "PEST20": 0.2
          }
        }
      }
    ];

    defaultCalculators.forEach(calc => {
      const calculator: Calculator = {
        ...calc,
        id: this.currentCalculatorId++,
        description: calc.description || null,
        defaultConfig: calc.defaultConfig || null,
        createdAt: new Date()
      };
      this.calculators.set(calculator.id, calculator);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: crypto.randomUUID(),
      fullName: insertUser.fullName || null,
      subscriptionStatus: "free",
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  // Calculators
  async getCalculators(): Promise<Calculator[]> {
    return Array.from(this.calculators.values());
  }

  async getCalculatorBySlug(slug: string): Promise<Calculator | undefined> {
    return Array.from(this.calculators.values()).find(calc => calc.slug === slug);
  }

  async getCalculatorsByCategory(category: string): Promise<Calculator[]> {
    return Array.from(this.calculators.values()).filter(calc => calc.category === category);
  }

  async createCalculator(insertCalculator: InsertCalculator): Promise<Calculator> {
    const calculator: Calculator = {
      ...insertCalculator,
      id: this.currentCalculatorId++,
      description: insertCalculator.description || null,
      defaultConfig: insertCalculator.defaultConfig || null,
      createdAt: new Date()
    };
    this.calculators.set(calculator.id, calculator);
    return calculator;
  }

  // User Calculators
  async getUserCalculators(userId: string): Promise<UserCalculator[]> {
    return Array.from(this.userCalculators.values()).filter(uc => uc.userId === userId);
  }

  async getUserCalculatorByEmbedId(embedId: string): Promise<UserCalculator | undefined> {
    return Array.from(this.userCalculators.values()).find(uc => uc.embedId === embedId);
  }

  async createUserCalculator(insertUserCalculator: InsertUserCalculator): Promise<UserCalculator> {
    const userCalculator: UserCalculator = {
      ...insertUserCalculator,
      id: crypto.randomUUID(),
      config: insertUserCalculator.config || null,
      isActive: true,
      createdAt: new Date()
    };
    this.userCalculators.set(userCalculator.id, userCalculator);
    return userCalculator;
  }

  // Leads
  async getLeadsByUserCalculator(userCalculatorId: string): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(lead => lead.userCalculatorId === userCalculatorId);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const lead: Lead = {
      id: crypto.randomUUID(),
      userCalculatorId: insertLead.userCalculatorId,
      name: insertLead.name || null,
      email: insertLead.email || null,
      phone: insertLead.phone || null,
      quoteData: insertLead.quoteData || null,
      estimatedValue: insertLead.estimatedValue || null,
      status: "new",
      createdAt: new Date()
    };
    this.leads.set(lead.id, lead);
    return lead;
  }
}

export const storage = new MemStorage();
