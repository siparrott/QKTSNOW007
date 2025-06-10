import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processCarWashRequest, processChauffeurRequest } from "./ai";
import { 
  insertUserSchema, 
  insertLeadSchema,
  insertUserCalculatorSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all calculators
  app.get("/api/calculators", async (req, res) => {
    try {
      const calculators = await storage.getCalculators();
      res.json(calculators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calculators" });
    }
  });

  // Get calculators by category
  app.get("/api/calculators/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const calculators = await storage.getCalculatorsByCategory(category);
      res.json(calculators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calculators by category" });
    }
  });

  // Get calculator by slug
  app.get("/api/calculators/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const calculator = await storage.getCalculatorBySlug(slug);
      if (!calculator) {
        return res.status(404).json({ error: "Calculator not found" });
      }
      res.json(calculator);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calculator" });
    }
  });

  // Create user (signup)
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Get user calculators
  app.get("/api/users/:userId/calculators", async (req, res) => {
    try {
      const { userId } = req.params;
      const userCalculators = await storage.getUserCalculators(userId);
      res.json(userCalculators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user calculators" });
    }
  });

  // Create user calculator (after purchase)
  app.post("/api/user-calculators", async (req, res) => {
    try {
      const userCalculatorData = insertUserCalculatorSchema.parse(req.body);
      const userCalculator = await storage.createUserCalculator(userCalculatorData);
      res.status(201).json(userCalculator);
    } catch (error) {
      res.status(400).json({ error: "Invalid user calculator data" });
    }
  });

  // Get embed calculator data
  app.get("/api/embed/:embedId", async (req, res) => {
    try {
      const { embedId } = req.params;
      const userCalculator = await storage.getUserCalculatorByEmbedId(embedId);
      
      if (!userCalculator) {
        return res.status(404).json({ error: "Calculator not found" });
      }

      const calculator = await storage.getCalculatorBySlug(userCalculator.calculatorId.toString());
      if (!calculator) {
        return res.status(404).json({ error: "Calculator template not found" });
      }

      res.json({
        userCalculator,
        calculator,
        config: userCalculator.config || calculator.defaultConfig
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch embed calculator" });
    }
  });

  // Submit lead from calculator
  app.post("/api/embed/:embedId/lead", async (req, res) => {
    try {
      const { embedId } = req.params;
      const userCalculator = await storage.getUserCalculatorByEmbedId(embedId);
      
      if (!userCalculator) {
        return res.status(404).json({ error: "Calculator not found" });
      }

      const leadData = insertLeadSchema.parse({
        ...req.body,
        userCalculatorId: userCalculator.id
      });

      const lead = await storage.createLead(leadData);
      res.status(201).json(lead);
    } catch (error) {
      res.status(400).json({ error: "Invalid lead data" });
    }
  });

  // Get leads for user calculator
  app.get("/api/user-calculators/:userCalculatorId/leads", async (req, res) => {
    try {
      const { userCalculatorId } = req.params;
      const leads = await storage.getLeadsByUserCalculator(userCalculatorId);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // AI processing for car wash calculator
  app.post("/api/ai/process-car-wash", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processCarWashRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for chauffeur calculator
  app.post("/api/ai/process-chauffeur", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processChauffeurRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
