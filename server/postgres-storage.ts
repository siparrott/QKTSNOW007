import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  calculators, 
  userCalculators, 
  leads, 
  sessions, 
  subscriptions 
} from "@shared/schema";
import type { 
  Calculator, 
  User, 
  UserCalculator, 
  Lead, 
  Session,
  Subscription,
  InsertUser, 
  InsertCalculator, 
  InsertUserCalculator, 
  InsertLead,
  InsertSession,
  InsertSubscription
} from "@shared/schema";
import type { IStorage } from "./storage";

export class PostgresStorage implements IStorage {
  constructor() {
    this.seedCalculators();
  }

  private async seedCalculators() {
    try {
      // Check if calculators already exist
      const existingCalculators = await db.select().from(calculators).limit(1);
      if (existingCalculators.length > 0) return;

      // Seed initial calculators
      const calculatorData: InsertCalculator[] = [
        {
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
              "album": 300,
              "prints": 150
            }
          }
        },
        {
          name: "Home Renovation Calculator",
          slug: "home-renovation",
          category: "home-services",
          description: "Comprehensive home renovation cost estimator",
          defaultConfig: {
            roomTypes: {
              "kitchen": 15000,
              "bathroom": 8000,
              "bedroom": 5000,
              "living-room": 7000
            },
            renovationLevels: {
              "basic": 1.0,
              "mid-range": 1.5,
              "luxury": 2.5
            }
          }
        },
        {
          name: "Personal Training Calculator",
          slug: "personal-training",
          category: "fitness",
          description: "Personal training session pricing calculator",
          defaultConfig: {
            sessionTypes: {
              "individual": 80,
              "small-group": 50,
              "group": 30
            },
            packages: {
              "4-sessions": 0.95,
              "8-sessions": 0.90,
              "12-sessions": 0.85
            }
          }
        }
      ];

      await db.insert(calculators).values(calculatorData);
    } catch (error) {
      console.error("Error seeding calculators:", error);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUserSubscription(userId: string, data: Partial<User>): Promise<User> {
    const result = await db.update(users).set(data).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async resetUserQuotes(userId: string): Promise<void> {
    await db.update(users)
      .set({ 
        quotesUsedThisMonth: 0, 
        lastQuoteReset: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async incrementUserQuotes(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      await db.update(users)
        .set({ quotesUsedThisMonth: (user.quotesUsedThisMonth || 0) + 1 })
        .where(eq(users.id, userId));
    }
  }

  // Sessions
  async createSession(session: InsertSession): Promise<Session> {
    const result = await db.insert(sessions).values(session).returning();
    return result[0];
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    return result[0];
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  // Subscriptions
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values(subscription).returning();
    return result[0];
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
    return result[0];
  }

  async updateSubscription(subscriptionId: string, data: Partial<Subscription>): Promise<Subscription> {
    const result = await db.update(subscriptions).set(data).where(eq(subscriptions.id, subscriptionId)).returning();
    return result[0];
  }

  // Calculators
  async getCalculators(): Promise<Calculator[]> {
    return await db.select().from(calculators);
  }

  async getCalculatorBySlug(slug: string): Promise<Calculator | undefined> {
    const result = await db.select().from(calculators).where(eq(calculators.slug, slug)).limit(1);
    return result[0];
  }

  async getCalculatorsByCategory(category: string): Promise<Calculator[]> {
    return await db.select().from(calculators).where(eq(calculators.category, category));
  }

  async createCalculator(calculator: InsertCalculator): Promise<Calculator> {
    const result = await db.insert(calculators).values(calculator).returning();
    return result[0];
  }

  // User Calculators
  async getUserCalculators(userId: string): Promise<UserCalculator[]> {
    return await db.select().from(userCalculators).where(eq(userCalculators.userId, userId));
  }

  async getUserCalculatorByEmbedId(embedId: string): Promise<UserCalculator | undefined> {
    const result = await db.select().from(userCalculators).where(eq(userCalculators.embedId, embedId)).limit(1);
    return result[0];
  }

  async createUserCalculator(userCalculator: InsertUserCalculator): Promise<UserCalculator> {
    const result = await db.insert(userCalculators).values(userCalculator).returning();
    return result[0];
  }

  async updateUserCalculator(id: string, data: Partial<UserCalculator>): Promise<UserCalculator> {
    const result = await db.update(userCalculators).set(data).where(eq(userCalculators.id, id)).returning();
    return result[0];
  }

  // Leads
  async getLeadsByUserCalculator(userCalculatorId: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.userCalculatorId, userCalculatorId));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(lead).returning();
    return result[0];
  }
}