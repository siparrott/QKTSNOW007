import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authService } from "./auth";
import { stripeService } from "./stripe";
import { emailService } from "./email";
import { processCarWashRequest, processChauffeurRequest, processAirportTransferRequest, processVanRentalRequest, processBoatCharterRequest, processMovingServicesRequest, processMotorcycleRepairRequest, processDrivingInstructorRequest, processWebDesignerRequest, processMarketingConsultantRequest, processSEOAgencyRequest, processVideoEditorRequest, processCopywriterRequest } from "./ai";
import { 
  insertUserSchema, 
  insertLeadSchema,
  insertUserCalculatorSchema,
  registerUserSchema,
  loginUserSchema
} from "@shared/schema";

// Auth middleware
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const user = await authService.verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      const result = await authService.register(userData);
      
      res.status(201).json({
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          subscriptionStatus: result.user.subscriptionStatus
        },
        token: result.token
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginUserSchema.parse(req.body);
      const result = await authService.login(credentials);
      
      res.json({
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          subscriptionStatus: result.user.subscriptionStatus,
          quotesUsedThisMonth: result.user.quotesUsedThisMonth,
          quotesLimit: result.user.quotesLimit
        },
        token: result.token
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      const sessionToken = req.headers.authorization?.substring(7);
      if (sessionToken) {
        await authService.logout(sessionToken);
      }
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = (req as any).user;
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      subscriptionStatus: user.subscriptionStatus,
      quotesUsedThisMonth: user.quotesUsedThisMonth,
      quotesLimit: user.quotesLimit
    });
  });

  // Subscription routes
  app.get("/api/subscription/plans", async (req, res) => {
    const plans = authService.getSubscriptionPlans();
    res.json(plans);
  });

  app.post("/api/subscription/checkout", requireAuth, async (req, res) => {
    try {
      const { planId, calculatorSlug } = req.body;
      const user = (req as any).user;
      
      const successUrl = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/dashboard/success`;
      const cancelUrl = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/pricing`;
      
      const session = await stripeService.createCheckoutSession(
        user.id,
        planId,
        calculatorSlug,
        successUrl,
        cancelUrl
      );
      
      res.json({ checkoutUrl: session.url });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/subscription/success", requireAuth, async (req, res) => {
    try {
      const { sessionId, calculator } = req.body;
      const user = (req as any).user;
      
      // Here you would verify the session with Stripe and complete setup
      // For now, we'll simulate successful subscription
      const result = await stripeService.handleSuccessfulSubscription(
        user.id,
        'starter', // Default to starter plan
        calculator,
        'sub_' + Math.random().toString(36).substring(7)
      );
      
      // Send welcome email
      const calc = await storage.getCalculatorBySlug(calculator);
      if (calc) {
        await emailService.sendWelcomeEmail(
          result.user,
          result.userCalculator,
          calc.name
        );
      }
      
      res.json({
        success: true,
        userCalculator: result.userCalculator
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/subscription/portal", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const returnUrl = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/dashboard`;
      
      const portalUrl = await stripeService.createCustomerPortalSession(user.id, returnUrl);
      res.json({ portalUrl });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Stripe webhooks
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      await stripeService.handleWebhook(req.body, signature);
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  // User calculator management
  app.get("/api/user-calculators", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const userCalculators = await storage.getUserCalculators(user.id);
      res.json(userCalculators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user calculators" });
    }
  });

  app.get("/api/user-calculators/:embedId", async (req, res) => {
    try {
      const { embedId } = req.params;
      const userCalculator = await storage.getUserCalculatorByEmbedId(embedId);
      if (!userCalculator) {
        return res.status(404).json({ error: "Calculator not found" });
      }
      res.json(userCalculator);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calculator" });
    }
  });

  app.put("/api/user-calculators/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const updateData = req.body;
      
      // Verify ownership
      const userCalculators = await storage.getUserCalculators(user.id);
      const calculator = userCalculators.find(uc => uc.id === id);
      if (!calculator) {
        return res.status(404).json({ error: "Calculator not found" });
      }
      
      const updated = await storage.updateUserCalculator(id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update calculator" });
    }
  });

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

  // AI processing for airport transfer calculator
  app.post("/api/ai/process-airport-transfer", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processAirportTransferRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for van rental calculator
  app.post("/api/ai/process-van-rental", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processVanRentalRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for boat charter calculator
  app.post("/api/ai/process-boat-charter", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processBoatCharterRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for moving services calculator
  app.post("/api/ai/process-moving-services", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processMovingServicesRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for motorcycle repair calculator
  app.post("/api/ai/process-motorcycle-repair", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processMotorcycleRepairRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for driving instructor calculator
  app.post("/api/ai/process-driving-instructor", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processDrivingInstructorRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for web designer calculator
  app.post("/api/ai/process-web-designer", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processWebDesignerRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for marketing consultant calculator
  app.post("/api/ai/process-marketing-consultant", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processMarketingConsultantRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for SEO agency calculator
  app.post("/api/ai/process-seo-agency", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processSEOAgencyRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for video editor calculator
  app.post("/api/ai/process-video-editor", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processVideoEditorRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for copywriter calculator
  app.post("/api/ai/process-copywriter", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const result = await processCopywriterRequest(input);
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for virtual assistant calculator
  app.post("/api/ai/process-virtual-assistant", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // For now, return a structured response directly
      const result = {
        serviceType: "inbox management",
        hoursPerWeek: "6-10",
        availability: "flexible",
        urgency: "within 2 weeks",
        contractType: "monthly retainer",
        baseRate: 30,
        weeklyHours: 8,
        monthlyCost: 816,
        totalCost: 816,
        breakdown: {
          baseCost: 960,
          discounts: [{ name: "Monthly Retainer Discount", amount: 144 }],
          fees: []
        }
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for business coach calculator
  app.post("/api/ai/process-business-coach", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // Return structured response for business coaching
      const result = {
        coachingFocus: "leadership",
        sessionFrequency: "weekly",
        coachingFormat: "online",
        packageDuration: "3-months",
        addOns: ["email-support"],
        baseRate: 200,
        totalCost: 2370,
        breakdown: {
          baseCost: 2400,
          discounts: [{ name: "3 Months Package Discount", amount: 240 }],
          addOnCosts: [{ name: "Email Support", amount: 150 }]
        }
      };
      res.json(result);
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // AI processing for legal advisor calculator
  app.post("/api/ai/process-legal-advisor", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      // Return structured response for legal consultation
      const result = {
        serviceType: "contract-drafting",
        consultationType: "1hour-session",
        urgencyLevel: "priority",
        jurisdiction: "local",
        addOns: ["document-review"],
        baseRate: 120,
        totalCost: 340,
        breakdown: {
          baseCost: 200,
          urgencyFee: 50,
          jurisdictionFee: 0,
          addOnCosts: [{ name: "Document Review", amount: 90 }],
          discounts: []
        }
      };
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
