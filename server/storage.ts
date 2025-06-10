import type { Calculator, User, UserCalculator, Lead, InsertUser, InsertCalculator, InsertUserCalculator, InsertLead } from "@shared/schema";

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
    this.seedCalculators();
  }

  private seedCalculators() {
    const calculators: Calculator[] = [
      {
        id: 1,
        name: "Wedding Photography Calculator",
        slug: "wedding-photography",
        category: "photography",
        description: "Professional wedding photography pricing calculator with luxurious styling",
        defaultConfig: {
          packageTypes: {
            "elopement": 950,
            "half-day": 1200,
            "full-day": 1800,
            "destination": 2500
          },
          hourOptions: {
            "4": 0,
            "6": 300,
            "8": 600,
            "10+": 900
          },
          locationOptions: {
            "1": 0,
            "2": 150,
            "3+": 350
          },
          deliveryOptions: {
            "gallery": 0,
            "usb-album": 250,
            "video-highlights": 400
          },
          addOns: {
            "engagement": 300,
            "second-photographer": 250,
            "drone": 150,
            "album": 200,
            "rehearsal": 350,
            "express": 175
          }
        },
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Painting & Decorating Calculator",
        slug: "painting-decorating",
        category: "home-services",
        description: "Professional painting and decorating pricing calculator with trade-pro styling",
        defaultConfig: {
          projectTypes: {
            "interior": 180,
            "exterior": 250,
            "wallpaper": 220,
            "decorative": 300,
            "whole-house": 800
          },
          roomCounts: {
            "1-room": 1,
            "2-3-rooms": 2.5,
            "4-5-rooms": 4.5,
            "full-home": 6.5
          },
          wallConditions: {
            "new": 0,
            "minor": 30,
            "repair": 80
          },
          paintTypes: {
            "standard": 0,
            "premium": 30,
            "eco": 25
          },
          urgencyLevels: {
            "flexible": 0,
            "two-weeks": 50,
            "asap": 100
          },
          addOns: {
            "ceiling": 25,
            "doors-trims": 40,
            "feature-wall": 50,
            "two-coat": 35,
            "protection": 45
          }
        },
        createdAt: new Date(),
      },
      {
        id: 3,
        name: "Interior Design Calculator",
        slug: "interior-design",
        category: "home-services",
        description: "Professional interior design pricing calculator with elegant styling",
        defaultConfig: {
          projectTypes: {
            "living-room": 200,
            "bedroom": 180,
            "kitchen": 300,
            "bathroom": 250,
            "whole-home": 800
          },
          propertySizes: {
            "under-50": 1.0,
            "51-100": 1.2,
            "101-150": 1.5,
            "151-plus": 2.0
          },
          serviceLevels: {
            "basic": 0,
            "full-design": 300,
            "renovation": 600,
            "virtual": -100
          },
          urgencyLevels: {
            "flexible": 0,
            "one-month": 100,
            "asap": 200
          },
          addOns: {
            "3d-render": 100,
            "furniture-sourcing": 80,
            "mood-boards": 50,
            "in-person": 120
          }
        },
        createdAt: new Date(),
      },
      {
        id: 4,
        name: "Plumbing Services Calculator",
        slug: "plumbing",
        category: "home-services",
        description: "Professional plumbing service pricing calculator with industrial styling",
        defaultConfig: {
          serviceTypes: {
            "leak-repair": 120,
            "pipe-installation": 200,
            "water-heater": 450,
            "toilet-faucet": 90,
            "renovation": 800,
            "emergency": 150
          },
          propertyTypes: {
            "apartment": 1.0,
            "house": 1.2,
            "commercial": 1.8
          },
          urgencyLevels: {
            "flexible": 0,
            "48-hours": 50,
            "emergency": 100
          },
          addOns: {
            "inspection": 60,
            "report": 40,
            "warranty": 30
          },
          floorSurcharge: 10
        },
        createdAt: new Date(),
      },
      {
        id: 5,
        name: "Personal Training Calculator",
        slug: "personal-training",
        category: "beauty-wellness",
        description: "Professional fitness training pricing calculator with bold fitness styling",
        defaultConfig: {
          trainingTypes: {
            "general": 0,
            "strength": 10,
            "weight-loss": 15,
            "prenatal": 20,
            "online": -5
          },
          sessionFormats: {
            "one-on-one": 50,
            "small-group": 30,
            "virtual": 35,
            "outdoor": 55,
            "in-gym": 50
          },
          frequencies: {
            "1x": { sessions: 1, multiplier: 1 },
            "2-3x": { sessions: 2.5, multiplier: 2.5 },
            "4x+": { sessions: 4, multiplier: 4 }
          },
          durations: {
            "30": 0.75,
            "45": 0.9,
            "60": 1.0
          },
          addOns: {
            "meal-plan": 40,
            "progress-app": 25,
            "check-in": 20,
            "pdf-plan": 30
          }
        },
        createdAt: new Date(),
      },
      {
        id: 6,
        name: "Newborn Photography Calculator",
        slug: "newborn-photography",
        category: "photography",
        description: "Gentle newborn photography pricing calculator with soft pastel styling",
        defaultConfig: {
          sessionTypes: {
            "classic-studio": 290,
            "lifestyle": 340,
            "combo": 365,
            "mini": 190
          },
          babyAges: {
            "5-10-days": 0,
            "11-21-days": 25,
            "1-month-plus": 50
          },
          peopleOptions: {
            "baby-only": 0,
            "baby-parents": 50,
            "baby-family": 100
          },
          deliveryOptions: {
            "digital-only": 0,
            "prints-album": 140,
            "usb-album": 160
          },
          addOns: {
            "makeup": 80,
            "sibling": 50,
            "album": 140,
            "wall-art": 120,
            "retouching": 60,
            "extended": 75
          },
          weekendSurcharge: 75
        },
        createdAt: new Date(),
      },
      {
        id: 7,
        name: "Maternity Photography Calculator",
        slug: "maternity-photography",
        category: "photography",
        description: "Elegant maternity photography pricing calculator with warm neutral styling",
        defaultConfig: {
          sessionTypes: {
            "classic-studio": 280,
            "outdoor-lifestyle": 355,
            "artistic": 355,
            "combo": 450
          },
          gestationWeeks: {
            "25-29": 0,
            "30-34": 0,
            "35-38": 25
          },
          whoIncluded: {
            "mom-only": 0,
            "mom-partner": 40,
            "mom-family": 80
          },
          locationOptions: {
            "in-studio": 0,
            "outdoor": 50,
            "in-home": 75
          },
          addOns: {
            "makeup": 80,
            "dress-rental": 60,
            "hair-styling": 60,
            "partner-portraits": 40,
            "retouched-set": 65,
            "album": 140,
            "wall-art": 120
          }
        },
        createdAt: new Date(),
      },
      {
        id: 8,
        name: "Nutritionist Calculator",
        slug: "nutritionist",
        category: "beauty-wellness",
        description: "Modern wellness nutrition plan pricing calculator with green styling",
        defaultConfig: {
          goalTypes: {
            "weight-loss": 0,
            "muscle-gain": 0,
            "digestive-health": 0,
            "general-wellness": 0,
            "sports-nutrition": 0
          },
          planTypes: {
            "one-time": 90,
            "4-week": 180,
            "8-week": 300,
            "monthly": 120
          },
          dietPreferences: {
            "balanced": 0,
            "vegetarian": 0,
            "vegan": 0,
            "keto": 0,
            "gluten-free": 0,
            "custom": 0
          },
          addOns: {
            "grocery-list": 25,
            "supplement-plan": 35,
            "whatsapp-support": 15,
            "zoom-checkins": 20,
            "food-diary-review": 30
          },
          clientTypes: {
            "new": 0,
            "returning": 0.1
          }
        },
        createdAt: new Date(),
      },
      {
        id: 9,
        name: "Life Coach Calculator",
        slug: "life-coach",
        category: "beauty-wellness",
        description: "Warm, calming life coaching pricing calculator with sage green and lilac styling",
        defaultConfig: {
          coachingFocus: {
            "personal-growth": 0,
            "career-coaching": 0,
            "confidence-building": 0,
            "relationship-coaching": 0,
            "life-purpose": 0
          },
          sessionFormats: {
            "zoom-coaching": 0,
            "group-sessions": -30,
            "in-person": 40,
            "asynchronous": -20
          },
          programDurations: {
            "one-off": 80,
            "4-week": 280,
            "8-week": 480,
            "monthly": 150
          },
          addOns: {
            "accountability-checkins": 20,
            "worksheets": 30,
            "video-resources": 40,
            "whatsapp-support": 15,
            "discovery-call": 0
          },
          clientTypes: {
            "new": 0,
            "returning": 0.1
          }
        },
        createdAt: new Date(),
      },
      {
        id: 10,
        name: "Hypnotherapist Calculator",
        slug: "hypnotherapist",
        category: "beauty-wellness",
        description: "Clean therapeutic hypnotherapy pricing calculator with sage green and teal styling",
        defaultConfig: {
          treatmentTypes: {
            "stop-smoking": 0,
            "weight-loss": 0,
            "stress-anxiety": 0,
            "confidence": 0,
            "sleep-improvement": 0,
            "rtt-deep-healing": 0
          },
          sessionFormats: {
            "in-person": 0,
            "online-zoom": -20,
            "group-session": -40
          },
          sessionPlans: {
            "one-off": 100,
            "3-session": 270,
            "6-session": 500
          },
          addOns: {
            "audio-recording": 25,
            "follow-up": 20,
            "progress-journal": 15,
            "nlp-addon": 30,
            "urgent-booking": 40
          },
          clientTypes: {
            "new": 0,
            "returning": 0.1
          }
        },
        createdAt: new Date(),
      },
      {
        id: 11,
        name: "Private Tutor Calculator",
        slug: "private-tutor",
        category: "education-training",
        description: "Clean academic private tutoring pricing calculator with navy and slate styling",
        defaultConfig: {
          subjects: {
            "mathematics": 0,
            "science": 0,
            "english-languages": 0,
            "coding-it": 0,
            "music": 0
          },
          studentLevels: {
            "primary": 0,
            "secondary": 10,
            "university": 15,
            "adult": 12
          },
          sessionTypes: {
            "online": 0,
            "student-home": 10,
            "tutor-home": 5
          },
          sessionDurations: {
            "30min": 25,
            "60min": 30,
            "90min": 40
          },
          sessionFrequencies: {
            "one-off": 1,
            "weekly": 1,
            "twice-weekly": 1.9,
            "intensive": 2.7
          },
          addOns: {
            "exam-materials": 10,
            "progress-reports": 15,
            "homework-support": 10,
            "emergency-booking": 25
          }
        },
        createdAt: new Date(),
      },
      {
        id: 12,
        name: "Dog Trainer Calculator",
        slug: "dog-trainer",
        category: "animals-pets",
        description: "Friendly professional dog training pricing calculator with light blue and sage green styling",
        defaultConfig: {
          dogAges: {
            "puppy": 0,
            "adult": 0,
            "senior": 5
          },
          dogSizes: {
            "small": 0,
            "medium": 5,
            "large": 10,
            "xl": 15
          },
          trainingTypes: {
            "basic-obedience": 0,
            "puppy-socialization": 0,
            "behavioral-correction": 30,
            "leash-training": 10,
            "protection-k9": 50
          },
          sessionFormats: {
            "one-on-one": 0,
            "group-class": -15,
            "at-home": 20,
            "trainer-location": 5,
            "online": -10
          },
          sessionFrequencies: {
            "one-off": 1,
            "weekly": 1,
            "twice-weekly": 1.9,
            "full-program": 5.5
          },
          addOns: {
            "training-plan": 15,
            "progress-report": 12,
            "leash-collar-package": 25,
            "emergency-weekend": 35,
            "travel-to-client": 20
          }
        },
        createdAt: new Date(),
      }
    ];

    calculators.forEach(calculator => {
      this.calculators.set(calculator.id, calculator);
    });
    this.currentCalculatorId = calculators.length + 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: insertUser.email,
      name: insertUser.name || null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getCalculators(): Promise<Calculator[]> {
    return Array.from(this.calculators.values());
  }

  async getCalculatorBySlug(slug: string): Promise<Calculator | undefined> {
    for (const calculator of this.calculators.values()) {
      if (calculator.slug === slug) {
        return calculator;
      }
    }
    return undefined;
  }

  async getCalculatorsByCategory(category: string): Promise<Calculator[]> {
    const result: Calculator[] = [];
    for (const calculator of this.calculators.values()) {
      if (calculator.category === category) {
        result.push(calculator);
      }
    }
    return result;
  }

  async createCalculator(insertCalculator: InsertCalculator): Promise<Calculator> {
    const calculator: Calculator = {
      id: this.currentCalculatorId++,
      name: insertCalculator.name,
      slug: insertCalculator.slug,
      category: insertCalculator.category,
      description: insertCalculator.description || null,
      defaultConfig: insertCalculator.defaultConfig || {},
      createdAt: new Date(),
    };
    this.calculators.set(calculator.id, calculator);
    return calculator;
  }

  async getUserCalculators(userId: string): Promise<UserCalculator[]> {
    const result: UserCalculator[] = [];
    for (const userCalculator of this.userCalculators.values()) {
      if (userCalculator.userId === userId) {
        result.push(userCalculator);
      }
    }
    return result;
  }

  async getUserCalculatorByEmbedId(embedId: string): Promise<UserCalculator | undefined> {
    return this.userCalculators.get(embedId);
  }

  async createUserCalculator(insertUserCalculator: InsertUserCalculator): Promise<UserCalculator> {
    const userCalculator: UserCalculator = {
      id: crypto.randomUUID(),
      userId: insertUserCalculator.userId,
      calculatorId: insertUserCalculator.calculatorId,
      customConfig: insertUserCalculator.customConfig || {},
      embedId: insertUserCalculator.embedId || crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.userCalculators.set(userCalculator.id, userCalculator);
    return userCalculator;
  }

  async getLeadsByUserCalculator(userCalculatorId: string): Promise<Lead[]> {
    const result: Lead[] = [];
    for (const lead of this.leads.values()) {
      if (lead.userCalculatorId === userCalculatorId) {
        result.push(lead);
      }
    }
    return result;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const lead: Lead = {
      id: crypto.randomUUID(),
      userCalculatorId: insertLead.userCalculatorId,
      name: insertLead.name,
      email: insertLead.email,
      phone: insertLead.phone || null,
      quoteData: insertLead.quoteData || {},
      estimatedValue: insertLead.estimatedValue || 0,
      status: insertLead.status || "new",
      createdAt: new Date(),
    };
    this.leads.set(lead.id, lead);
    return lead;
  }
}

export const storage = new MemStorage();