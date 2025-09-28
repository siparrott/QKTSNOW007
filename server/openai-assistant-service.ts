import OpenAI from "openai";

// Optional OpenAI client (do NOT crash app if key missing)
let openai: OpenAI | null = null;
if (!process.env.OPENAI_API_KEY) {
  console.warn("[startup] OPENAI_API_KEY not set – assistant features disabled.");
} else {
  try {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (e) {
    console.error("[startup] Failed to initialize OpenAI assistant client – disabling assistant features:", e);
    openai = null;
  }
}

// Default Assistant ID - will be overridden by environment variable if set
const DEFAULT_ASSISTANT_ID = "asst_nINuiVStB5sKhKbNCgjeODI2";

export interface CalculatorCreationRequest {
  businessType: string;
  serviceName: string;
  requirements: string;
  customization?: {
    colors?: string;
    branding?: string;
    specificFeatures?: string[];
  };
}

export interface CalculatorCreationResult {
  calculatorConfig: {
    title: string;
    description: string;
    layoutJson: any;
    logicJson: any;
    styleJson: any;
    promptMd: string;
  };
  userExperience: {
    onboardingFlow: string[];
    helpText: string;
    successMessages: string[];
  };
  implementation: {
    embedCode: string;
    setupInstructions: string[];
  };
}

export class OpenAIAssistantService {
  private assistantId: string;

  constructor() {
    // Use environment variable if set, otherwise use the provided default
    this.assistantId = process.env.OPENAI_ASSISTANT_ID || DEFAULT_ASSISTANT_ID;
    console.log(`OpenAI Assistant Service initialized with ID: ${this.assistantId}`);
  }

  private requireClient(): OpenAI {
    if (!openai) {
      throw new Error("AI assistant features disabled (missing OPENAI_API_KEY)");
    }
    return openai;
  }

  /**
   * Creates a new thread for conversation with the assistant
   */
  async createThread(): Promise<string> {
    try {
      const client = this.requireClient();
      const thread = await client.beta.threads.create();
      return thread.id;
    } catch (error) {
      console.error("Error creating thread:", error);
      throw new Error("Failed to create conversation thread");
    }
  }

  /**
   * Sends a message to the assistant and gets a response
   */
  async sendMessage(threadId: string, message: string): Promise<string> {
    try {
      const client = this.requireClient();
      // Add message to thread
      await client.beta.threads.messages.create(threadId, {
        role: "user",
        content: message,
      });

      // Create a run
      const run = await client.beta.threads.runs.create(threadId, {
        assistant_id: this.assistantId,
      });

      // Wait for completion with timeout
      let runStatus = run;
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout
      
      while ((runStatus.status === "in_progress" || runStatus.status === "queued") && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
  // Type workaround: newer OpenAI SDK expects params object
  runStatus = await client.beta.threads.runs.retrieve(threadId, { id: run.id } as any);
        attempts++;
      }

      if (runStatus.status === "completed") {
        // Get the messages
  const messages = await client.beta.threads.messages.list(threadId);
        const lastMessage = messages.data[0];
        
        if (lastMessage?.content?.[0] && lastMessage.content[0].type === "text") {
          return (lastMessage.content[0] as any).text.value;
        }
      }

      throw new Error(`Run failed with status: ${runStatus.status} after ${attempts} attempts`);
    } catch (error) {
      console.error("Error sending message to assistant:", error);
      if (error instanceof Error) {
        throw new Error(`Assistant communication failed: ${error.message}`);
      }
      throw new Error("Failed to get response from assistant");
    }
  }

  /**
   * Creates a calculator configuration using the OpenAI Assistant
   */
  async createCalculator(request: CalculatorCreationRequest): Promise<CalculatorCreationResult> {
    try {
      const threadId = await this.createThread();
      
      const prompt = `Create a comprehensive calculator configuration for a ${request.businessType} business providing ${request.serviceName} services.

Requirements: ${request.requirements}

${request.customization ? `Customization preferences:
- Colors: ${request.customization.colors || 'Default professional colors'}
- Branding: ${request.customization.branding || 'Clean and modern'}
- Special features: ${request.customization.specificFeatures?.join(', ') || 'Standard features'}` : ''}

Please provide a complete calculator configuration including:
1. Calculator layout and logic
2. User experience design
3. Implementation details

Format the response as structured JSON that can be directly used in our QuoteKit.ai platform.`;

      const response = await this.sendMessage(threadId, prompt);
      
      // Parse the response and structure it
      try {
        const parsedResponse = JSON.parse(response);
        return parsedResponse;
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from the text
        return this.createFallbackResponse(response, request);
      }
    } catch (error) {
      console.error("Error creating calculator with assistant:", error);
      throw new Error("Failed to create calculator configuration");
    }
  }

  /**
   * Enhances user experience design using the assistant
   */
  async enhanceUserExperience(calculatorType: string, currentUX: any): Promise<any> {
    try {
      const threadId = await this.createThread();
      
      const prompt = `Enhance the user experience for a ${calculatorType} calculator.

Current UX configuration: ${JSON.stringify(currentUX, null, 2)}

Please provide improved:
1. User onboarding flow
2. Help text and tooltips
3. Success and error messages
4. Accessibility improvements
5. Mobile optimization suggestions

Return as structured JSON.`;

      const response = await this.sendMessage(threadId, prompt);
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        return {
          enhanced: true,
          recommendations: response,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error("Error enhancing UX with assistant:", error);
      throw new Error("Failed to enhance user experience");
    }
  }

  /**
   * Creates a fallback response when JSON parsing fails
   */
  private createFallbackResponse(response: string, request: CalculatorCreationRequest): CalculatorCreationResult {
    return {
      calculatorConfig: {
        title: `${request.serviceName} Calculator`,
        description: `Professional pricing calculator for ${request.businessType} services`,
        layoutJson: {
          sections: [
            { id: "service", title: "Service Selection", type: "selection" },
            { id: "details", title: "Project Details", type: "form" },
            { id: "pricing", title: "Pricing", type: "output" }
          ]
        },
        logicJson: {
          basePrice: 100,
          calculations: response.includes("pricing") ? "Advanced pricing logic from assistant" : "Standard pricing logic"
        },
        styleJson: {
          theme: request.customization?.colors || "professional",
          branding: request.customization?.branding || "modern"
        },
        promptMd: response
      },
      userExperience: {
        onboardingFlow: ["welcome", "service-selection", "customization", "pricing"],
        helpText: "This calculator helps you get accurate pricing for your project",
        successMessages: ["Quote generated successfully!", "Thank you for using our calculator"]
      },
      implementation: {
        embedCode: `<div id="quotekit-calculator" data-type="${request.serviceName.toLowerCase().replace(/\s+/g, '-')}"></div>`,
        setupInstructions: [
          "Copy the embed code to your website",
          "Add the QuoteKit script tag",
          "Customize the styling if needed"
        ]
      }
    };
  }

  /**
   * Gets the current assistant information
   */
  async getAssistantInfo(): Promise<any> {
    try {
      const client = this.requireClient();
      const assistant = await client.beta.assistants.retrieve(this.assistantId);
      return {
        id: assistant.id,
        name: assistant.name,
        description: assistant.description,
        model: assistant.model,
        instructions: assistant.instructions
      };
    } catch (error) {
      console.error("Error getting assistant info:", error);
      throw new Error("Failed to retrieve assistant information");
    }
  }
}

export const assistantService = new OpenAIAssistantService();