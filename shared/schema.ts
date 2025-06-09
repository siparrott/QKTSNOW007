import { pgTable, text, integer, boolean, timestamp, uuid, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  subscriptionStatus: text("subscription_status").default("free"),
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
  isActive: boolean("is_active").default(true),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  fullName: true,
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
});

export const insertLeadSchema = createInsertSchema(leads).pick({
  userCalculatorId: true,
  name: true,
  email: true,
  phone: true,
  quoteData: true,
  estimatedValue: true,
});

// Select schemas
export const selectUserSchema = createSelectSchema(users);
export const selectCalculatorSchema = createSelectSchema(calculators);
export const selectUserCalculatorSchema = createSelectSchema(userCalculators);
export const selectLeadSchema = createSelectSchema(leads);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Calculator = typeof calculators.$inferSelect;
export type UserCalculator = typeof userCalculators.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type InsertCalculator = z.infer<typeof insertCalculatorSchema>;
export type InsertUserCalculator = z.infer<typeof insertUserCalculatorSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
