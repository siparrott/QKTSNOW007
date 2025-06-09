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
