// SEO Blueprint Implementation for QuoteKit.ai AutoBlog System
// Based on the comprehensive SEO strategy provided

export interface SEOKeywords {
  primary: string[];
  secondary: string[];
  longTail: string[];
  synonyms: string[];
}

export interface TopicCluster {
  pillarPage: string;
  h1Title: string;
  description: string;
  supportingArticles: string[];
  targetKeywords: string[];
}

export interface BlogPromptTemplate {
  title: string;
  keywords: string[];
  intent: 'transactional' | 'comparison' | 'educational' | 'technical';
  contentStructure: string[];
  callToAction: string;
}

export const SEO_KEYWORDS: SEOKeywords = {
  primary: [
    "ai quote generator",
    "ai price estimator", 
    "online quote calculator",
    "instant quote tool"
  ],
  secondary: [
    "quote builder app",
    "pricing calculator",
    "service quote generator",
    "quotation software",
    "cost estimate app"
  ],
  longTail: [
    "photography pricing calculator",
    "wedding photography quote calculator",
    "SaaS cost estimator AI",
    "website quote form builder",
    "embed quote widget no-code"
  ],
  synonyms: [
    "estimate generator",
    "price quote software", 
    "interactive calculator",
    "cost calculator",
    "quotation form"
  ]
};

export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    pillarPage: "AI Quote Generator: How It Works & Why It Beats Spreadsheets",
    h1Title: "AI Quote Generator: Transform Your Pricing Process in 2025",
    description: "Core explainer + buy page targeting transactional intent",
    supportingArticles: [
      "5 Industries Winning With Instant Quotes",
      "Calculator vs. Webform: Conversion Showdown",
      "ROI Analysis: AI Quotes vs Traditional Methods"
    ],
    targetKeywords: ["ai quote generator", "automated pricing", "instant quotes"]
  },
  {
    pillarPage: "Embed a Price Calculator in < 5 Minutes (No-Code Guide)",
    h1Title: "Embed Price Calculator: Complete No-Code Setup Guide",
    description: "Captures DIY intent for technical users",
    supportingArticles: [
      "Best No-Code Platforms for Calculators",
      "Embed on WordPress/Wix/Squarespace",
      "Widget Customization Best Practices"
    ],
    targetKeywords: ["embed quote widget", "no-code calculator", "price calculator embed"]
  },
  {
    pillarPage: "Photography Pricing Calculator Toolkit",
    h1Title: "Photography Pricing Calculator: Complete Business Toolkit",
    description: "Leverages QuoteKits photo niche specialization",
    supportingArticles: [
      "Wedding Quote Template Walk-through",
      "Portrait Session Pricing Guide",
      "Commercial Photography Estimator"
    ],
    targetKeywords: ["photography pricing calculator", "wedding photography quotes", "portrait pricing"]
  },
  {
    pillarPage: "AI Cost Estimator API for Developers",
    h1Title: "AI Cost Estimator API: Developer Integration Guide",
    description: "Hooks technical SaaS audience",
    supportingArticles: [
      "React Hook Implementation Example",
      "Securing API Keys & Webhooks",
      "GraphQL vs REST for Quote APIs"
    ],
    targetKeywords: ["quote calculator api", "pricing api", "cost estimator sdk"]
  }
];

export const BLOG_PROMPT_TEMPLATES: BlogPromptTemplate[] = [
  {
    title: "AI Quote Generator Comparison",
    keywords: ["ai quote generator", "quote builder app", "pricing calculator"],
    intent: "comparison",
    contentStructure: [
      "Problem statement (traditional quoting pain points)",
      "Solution overview (AI-powered automation)",
      "Feature comparison table",
      "ROI analysis with real numbers",
      "Implementation timeline",
      "Call-to-action with demo link"
    ],
    callToAction: "Try QuoteKit's AI quote generator free for 14 days"
  },
  {
    title: "Industry-Specific Implementation Guide",
    keywords: ["photography pricing calculator", "service quote generator"],
    intent: "educational",
    contentStructure: [
      "Industry challenges overview",
      "Pricing psychology insights",
      "Step-by-step calculator setup",
      "Conversion optimization tips",
      "Real case study results",
      "Integration best practices"
    ],
    callToAction: "Start building your custom quote calculator"
  },
  {
    title: "Technical Implementation Tutorial", 
    keywords: ["embed quote widget", "quote calculator api"],
    intent: "technical",
    contentStructure: [
      "Technical requirements",
      "Code examples with React/vanilla JS",
      "Authentication setup",
      "Webhook configuration",
      "Error handling patterns",
      "Performance optimization"
    ],
    callToAction: "Access full API documentation and get your free API key"
  }
];

export function generateAIPrompt(template: BlogPromptTemplate, specificTopic: string): string {
  return `
You are a senior content strategist for QuoteKit.ai, writing high-converting SEO content that ranks on Google and drives signups.

ARTICLE BRIEF:
Topic: ${specificTopic}
Primary Keywords: ${template.keywords.join(", ")}
Content Intent: ${template.intent}
Target Audience: Business owners looking for quote automation solutions

WRITING GUIDELINES:
1. Use primary keyword "${template.keywords[0]}" in title, H1, URL slug, and 2-3 times in body
2. Include secondary keywords naturally in subheadings
3. Write for humans first, SEO second - focus on providing genuine value
4. Include actionable takeaways readers can implement immediately
5. Add social proof through statistics and case studies
6. Write in a confident, authoritative tone that builds trust

CONTENT STRUCTURE:
${template.contentStructure.map((section, i) => `${i + 1}. ${section}`).join('\n')}

SEO REQUIREMENTS:
- Title: ≤ 60 characters with primary keyword first
- Meta description: 120-156 characters with primary keyword and CTA
- Include H2 with primary keyword or synonym
- Add FAQ section at the end (5 relevant questions)
- Internal link opportunities to /features, /pricing, /demo
- External authority links to industry studies or tools

CALL TO ACTION:
End with: "${template.callToAction}"

TONE: Professional but approachable, data-driven, conversion-focused

Write a complete 1500-2000 word blog post that follows this structure and drives qualified traffic to QuoteKit.ai.
`;
}

export function getRandomTopicCluster(): TopicCluster {
  return TOPIC_CLUSTERS[Math.floor(Math.random() * TOPIC_CLUSTERS.length)];
}

export function getRandomPromptTemplate(): BlogPromptTemplate {
  return BLOG_PROMPT_TEMPLATES[Math.floor(Math.random() * BLOG_PROMPT_TEMPLATES.length)];
}

export function generateSEOOptimizedSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

export function extractKeywordsFromContent(content: string): string[] {
  const allKeywords = [
    ...SEO_KEYWORDS.primary,
    ...SEO_KEYWORDS.secondary,
    ...SEO_KEYWORDS.longTail,
    ...SEO_KEYWORDS.synonyms
  ];
  
  return allKeywords.filter(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );
}

export function generateMetaDescription(title: string, excerpt: string): string {
  const maxLength = 156;
  const primaryKeyword = SEO_KEYWORDS.primary[0];
  
  let description = `${excerpt} ${primaryKeyword} solution by QuoteKit.ai`;
  
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + "...";
  }
  
  return description;
}