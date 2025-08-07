import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
}

export class OpenAIService {
  /**
   * Analyzes images using GPT-4o vision capabilities
   */
  async analyzeImages(images: string[]): Promise<ImageAnalysisResult[]> {
    const results: ImageAnalysisResult[] = [];

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
   * Generates blog content based on image analyses and content guidance
   */
  async generateBlogPost(request: BlogGenerationRequest): Promise<BlogGenerationResult> {
    try {
      // First, analyze all the images
      const imageAnalyses = await this.analyzeImages(request.images);

      // Create a comprehensive prompt for blog generation
      const systemPrompt = `You are an expert content creator and SEO specialist. You create engaging, professional blog posts that are optimized for search engines and social media sharing. 

Your writing style is:
- Engaging and conversational yet professional
- SEO-optimized with natural keyword integration
- Structured with clear headings and subheadings
- Informative and valuable to readers
- Appropriate length (800-1500 words)

Always respond in valid JSON format with the exact structure requested.`;

      const userPrompt = `Create a comprehensive blog post based on the following information:

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
}

Make sure the content naturally incorporates the image analyses and follows the content guidance. The blog should be engaging, informative, and optimized for SEO.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 4000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      // Validate and structure the response
      return {
        title: result.title || "Generated Blog Post",
        content: result.content || "",
        excerpt: result.excerpt || "",
        seoTitle: result.seoTitle || result.title || "Generated Blog Post",
        seoDescription: result.seoDescription || result.excerpt || "",
        tags: Array.isArray(result.tags) ? result.tags : [],
        readTime: typeof result.readTime === "number" ? result.readTime : 5,
        slug: result.slug || this.generateSlug(result.title || "generated-blog-post"),
      };
    } catch (error) {
      console.error("Error generating blog post:", error);
      throw new Error("Failed to generate blog post");
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
   * Enhances existing blog content with AI suggestions
   */
  async enhanceBlogPost(content: string, enhancementType: string): Promise<string> {
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