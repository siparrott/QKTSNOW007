import OpenAI from "openai";

// Make OpenAI optional so the whole server doesn't crash if the key is missing.
let openai: OpenAI | null = null;
if (!process.env.OPENAI_API_KEY) {
  console.warn("[startup] OPENAI_API_KEY not set – AI content & image endpoints disabled.");
} else {
  try {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (e) {
    console.error('[startup] Failed to initialize OpenAI client – disabling AI features:', e);
    openai = null;
  }
}

export interface ImageAnalysisResult {
  description: string;
  mainSubjects: string[];
  setting: string;
  mood: string;
  colors: string[];
  technicalAspects: string;
  suggestedTags: string[];
}

export interface BlogGenerationRequest {
  images: string[]; // Base64 encoded images
  contentGuidance: string;
  language: string;
  websiteUrl: string;
  title?: string;
}

export interface BlogGenerationResult {
  title: string;
  content: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  readTime: number;
  slug: string;
  keywords?: string[];
  metaDescription?: string;
  seoScore?: number;
}

export interface BlogGenerationWithStrategyRequest {
  prompt: string;
  topicCluster: any;
  promptTemplate: any;
  specificTopic: string;
  language: string;
  websiteUrl: string;
  customSlug: string;
  images: string[];
}

export class OpenAIService {
  /**
   * Analyzes images using GPT-4o vision capabilities
   */
  async analyzeImages(images: string[]): Promise<ImageAnalysisResult[]> {
    const results: ImageAnalysisResult[] = [];

    if (!openai) {
      console.warn('[ai] analyzeImages called but OpenAI disabled. Returning empty analyses.');
      return images.map(() => ({
        description: "AI disabled",
        mainSubjects: [],
        setting: "",
        mood: "",
        colors: [],
        technicalAspects: "",
        suggestedTags: []
      }));
    }

    for (const base64Image of images) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are an expert image analyst. Analyze the image in detail and provide structured information that can be used for blog content creation. Focus on visual elements, subjects, setting, mood, colors, and technical aspects.",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image and provide detailed information in JSON format with the following structure: { description, mainSubjects, setting, mood, colors, technicalAspects, suggestedTags }",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 1000,
        });

        const analysis = JSON.parse(response.choices[0].message.content || "{}");
        results.push({
          description: analysis.description || "",
          mainSubjects: Array.isArray(analysis.mainSubjects) ? analysis.mainSubjects : [],
          setting: analysis.setting || "",
          mood: analysis.mood || "",
          colors: Array.isArray(analysis.colors) ? analysis.colors : [],
          technicalAspects: analysis.technicalAspects || "",
          suggestedTags: Array.isArray(analysis.suggestedTags) ? analysis.suggestedTags : [],
        });
      } catch (error) {
        console.error("Error analyzing image:", error);
        results.push({
          description: "Unable to analyze image",
          mainSubjects: [],
          setting: "",
          mood: "",
          colors: [],
          technicalAspects: "",
          suggestedTags: [],
        });
      }
    }

    return results;
  }

  /**
   * Enhanced blog generation with Assistant-first approach
   */
  async generateBlogPost(request: BlogGenerationRequest): Promise<BlogGenerationResult> {
    if (!openai) {
      throw new Error('AI content generation disabled (missing OPENAI_API_KEY).');
    }
    return await this.generateContentWithAssistant(request);
  }

  /**
   * Stronger Assistant-first with strict JSON + safe fallback
   */
  private async generateContentWithAssistant(request: BlogGenerationRequest): Promise<BlogGenerationResult> {
    if (!openai) {
      throw new Error('AI assistant unavailable (missing OPENAI_API_KEY).');
    }
    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    const haveAssistant = Boolean(assistantId && assistantId.trim().length > 0);

    console.log("Using Assistant:", haveAssistant, "ID:", assistantId?.substring(0, 10) + "...");

    // First, analyze all the images
    const imageAnalyses = await this.analyzeImages(request.images);

    // Build comprehensive prompt
    const prompt = `Create a comprehensive blog post based on the following information:

**Content Guidance:** ${request.contentGuidance}
**Language:** ${request.language}
**Website URL:** ${request.websiteUrl}
**Suggested Title:** ${request.title || "Generate an engaging title"}

**Image Analyses:**
${imageAnalyses.map((analysis, index) => `
Image ${index + 1}:
- Description: ${analysis.description}
- Main Subjects: ${analysis.mainSubjects.join(", ")}
- Setting: ${analysis.setting}
- Mood: ${analysis.mood}
- Colors: ${analysis.colors.join(", ")}
- Technical Aspects: ${analysis.technicalAspects}
- Suggested Tags: ${analysis.suggestedTags.join(", ")}
`).join("\n")}

Please generate a blog post in JSON format with:
{
  "title": "Engaging title (50-60 characters)",
  "content": "Full blog post content in HTML format with proper headings, paragraphs, and structure",
  "excerpt": "Compelling excerpt (150-160 characters)",
  "seoTitle": "SEO-optimized title (50-60 characters)",
  "seoDescription": "SEO meta description (150-160 characters)",
  "tags": ["array", "of", "relevant", "tags"],
  "readTime": "estimated reading time in minutes (number)",
  "slug": "url-friendly-slug"
}`;

    // Build one consolidated user message with optional inline images
    const contentParts: any[] = [{ type: "text", text: prompt }];

    for (const imageBase64 of request.images ?? []) {
      // Add images directly to the Assistant thread
      contentParts.push({ 
        type: "image_url", 
        image_url: { url: `data:image/jpeg;base64,${imageBase64}` } 
      });
    }

    // Prefer Assistant API if configured
    if (haveAssistant) {
      try {
        const thread = await openai.beta.threads.create();

        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: contentParts,
        });

        // **Key change**: inject your stricter blog spec as run-time instructions too
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: assistantId!,
          instructions: `${prompt}\n\nReturn a SINGLE JSON object only. No prose before/after.`,
        });

        // Poll until it completes (more defensive)
        let attempts = 0;
        const maxAttempts = 60;
  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, { id: run.id } as any);

        while ((runStatus.status === "queued" || runStatus.status === "in_progress") && attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(thread.id, { id: run.id } as any);
          attempts++;
          if (attempts % 10 === 0) console.log(`Run status: ${runStatus.status} (attempt ${attempts})`);
        }

        if (runStatus.status === "completed") {
          const messages = await openai.beta.threads.messages.list(thread.id, { order: "desc", limit: 10 });
          const assistantMessage = messages.data.find(m => m.role === "assistant");

          if (assistantMessage?.content?.[0]?.type === "text") {
            const content = assistantMessage.content[0].text.value;
            console.log("✅ Assistant generated content successfully");
            return this.parseAndValidateBlogResult(content);
          }

          console.warn("Assistant returned no text block — falling back to chat.");
        } else {
          console.warn(`Assistant run ended with status ${runStatus.status} — falling back to chat.`);
        }
      } catch (err: any) {
        console.warn("Assistant API failed — falling back to chat completions:", err?.message || err);
      }
    } else {
      console.warn("OPENAI_ASSISTANT_ID not set — using chat completion fallback.");
    }

    // Fallback: force JSON output using chat completions with strict formatting
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You generate ONLY a single valid JSON object with fields: title, content (HTML), excerpt, seoTitle, seoDescription, tags, readTime, slug. No prose before/after.",
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const content = response.choices?.[0]?.message?.content ?? "{}";
      console.log("🔄 Used chat completions fallback");
      return this.parseAndValidateBlogResult(content);
    } catch (error) {
      console.error("All generation methods failed:", error);
      throw new Error("Failed to generate blog post");
    }
  }

  /**
   * Parse and validate blog generation result
   */
  private parseAndValidateBlogResult(content: string): BlogGenerationResult {
    try {
      const result = JSON.parse(content);

      // Calculate read time if not provided
      const wordCount = result.content ? result.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      return {
        title: result.title || "Generated Blog Post",
        content: result.content || "",
        excerpt: result.excerpt || "",
        seoTitle: result.seoTitle || result.title || "Generated Blog Post",
        seoDescription: result.seoDescription || result.excerpt || "",
        tags: Array.isArray(result.tags) ? result.tags : [],
        readTime: typeof result.readTime === "number" ? result.readTime : readTime,
        slug: result.slug || this.generateSlug(result.title || "generated-blog-post"),
      };
    } catch (parseError) {
      console.error("Failed to parse blog result:", parseError);
      return {
        title: "Generated Blog Post",
        content: "<p>Content generation failed. Please try again.</p>",
        excerpt: "Blog post generation encountered an error.",
        seoTitle: "Generated Blog Post",
        seoDescription: "Blog post generation encountered an error.",
        tags: [],
        readTime: 1,
        slug: "generated-blog-post",
      };
    }
  }

  /**
   * Generates a URL-friendly slug from a title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Generates SEO-optimized blog content using the blueprint strategy
   */
  async generateBlogPostWithStrategy(request: BlogGenerationWithStrategyRequest): Promise<BlogGenerationResult> {
    if (!openai) throw new Error('AI generation disabled');
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a senior content strategist for QuoteKit.ai with expertise in SEO and conversion optimization. You create high-ranking blog content that drives qualified traffic and signups. Always respond in valid JSON format.",
          },
          {
            role: "user",
            content: request.prompt,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 4000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Calculate estimated read time (average 200 words per minute)
      const wordCount = result.content ? result.content.split(/\s+/).length : 0;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      return {
        title: result.title || `${request.specificTopic} - QuoteKit.ai`,
        content: result.content || "",
        excerpt: result.excerpt || result.metaDescription || "",
        seoTitle: result.seoTitle || result.title || request.specificTopic,
        seoDescription: result.seoDescription || result.metaDescription || "",
        tags: Array.isArray(result.tags) ? result.tags : request.promptTemplate.keywords || [],
        readTime,
        slug: request.customSlug || this.generateSlug(result.title || request.specificTopic),
      };
    } catch (error) {
      console.error("Error generating SEO-optimized blog post:", error);
      throw new Error("Failed to generate SEO-optimized blog post");
    }
  }

  /**
   * Enhances existing blog content with AI suggestions
   */
  async enhanceBlogPost(content: string, enhancementType: string): Promise<string> {
    if (!openai) throw new Error('AI enhancement disabled');
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert content editor. Your task is to enhance existing blog content based on the enhancement type requested. Maintain the original structure and tone while improving the content.`,
          },
          {
            role: "user",
            content: `Please enhance this blog content for: ${enhancementType}

Original content:
${content}

Return only the enhanced content without any additional formatting or explanation.`,
          },
        ],
        max_tokens: 3000,
      });

      return response.choices[0].message.content || content;
    } catch (error) {
      console.error("Error enhancing blog post:", error);
      throw new Error("Failed to enhance blog post");
    }
  }
}

export const openaiService = new OpenAIService();