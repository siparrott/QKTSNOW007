import { pgTable, text, integer, boolean, timestamp, uuid, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  passwordHash: text("password_hash"),
  subscriptionStatus: text("subscription_status").default("free"), // free, starter, pro, enterprise
  stripeCustomerId: text("stripe_customer_id"),
  quotesUsedThisMonth: integer("quotes_used_this_month").default(0),
  quotesLimit: integer("quotes_limit").default(5), // based on plan
  subscriptionStartDate: timestamp("subscription_start_date"),
  lastQuoteReset: timestamp("last_quote_reset").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calculators = pgTable("calculators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  category: text("category").notNull(),
  description: text("description"),
  defaultConfig: jsonb("default_config"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userCalculators = pgTable("user_calculators", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  calculatorId: integer("calculator_id").references(() => calculators.id, { onDelete: "cascade" }).notNull(),
  embedId: text("embed_id").unique().notNull(),
  config: jsonb("config"),
  customBranding: jsonb("custom_branding"), // logo, colors, fonts
  embedUrl: text("embed_url").notNull(),
  adminUrl: text("admin_url").notNull(),
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  userCalculatorId: uuid("user_calculator_id").references(() => userCalculators.id, { onDelete: "cascade" }).notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  quoteData: jsonb("quote_data"),
  estimatedValue: text("estimated_value"),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  status: text("status").notNull(), // active, canceled, past_due, etc.
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  fullName: true,
  passwordHash: true,
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  password: z.string().min(8),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const insertCalculatorSchema = createInsertSchema(calculators).pick({
  name: true,
  slug: true,
  category: true,
  description: true,
  defaultConfig: true,
});

export const insertUserCalculatorSchema = createInsertSchema(userCalculators).pick({
  userId: true,
  calculatorId: true,
  embedId: true,
  config: true,
  customBranding: true,
  embedUrl: true,
  adminUrl: true,
});

export const insertLeadSchema = createInsertSchema(leads).pick({
  userCalculatorId: true,
  name: true,
  email: true,
  phone: true,
  quoteData: true,
  estimatedValue: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  stripeSubscriptionId: true,
  status: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  token: true,
  expiresAt: true,
});

// Select schemas
export const selectUserSchema = createSelectSchema(users);
export const selectCalculatorSchema = createSelectSchema(calculators);
export const selectUserCalculatorSchema = createSelectSchema(userCalculators);
export const selectLeadSchema = createSelectSchema(leads);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);
export const selectSessionSchema = createSelectSchema(sessions);

// Type exports
export type User = typeof users.$inferSelect;
export type Calculator = typeof calculators.$inferSelect;
export type UserCalculator = typeof userCalculators.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Session = typeof sessions.$inferSelect;

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type Calculator = typeof calculators.$inferSelect;
export type UserCalculator = typeof userCalculators.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type InsertCalculator = z.infer<typeof insertCalculatorSchema>;
export type InsertUserCalculator = z.infer<typeof insertUserCalculatorSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
