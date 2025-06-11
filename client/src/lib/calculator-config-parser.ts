// Calculator Configuration Parser
// Extracts actual configuration from calculator files to generate customization options

export interface CalculatorField {
  id: string;
  type: 'select' | 'multi-select' | 'input' | 'range' | 'toggle';
  label: string;
  description?: string;
  options?: Array<{
    value: string;
    label: string;
    price?: number;
    percentage?: number;
    multiplier?: number;
    description?: string;
  }>;
  defaultValue?: any;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
}

export interface CalculatorConfig {
  id: string;
  name: string;
  fields: CalculatorField[];
  steps: Array<{
    id: string;
    title: string;
    fields: string[];
  }>;
  pricing: {
    baseRates?: Record<string, number>;
    multipliers?: Record<string, number>;
    addOns?: Record<string, { cost?: number; percentage?: number }>;
  };
}

// Translation Services Calculator Configuration
export const translationServicesConfig: CalculatorConfig = {
  id: 'translation-services',
  name: 'Translation Services',
  fields: [
    {
      id: 'serviceType',
      type: 'select',
      label: 'Service Type',
      description: 'Select the type of translation service you need',
      options: [
        { value: 'translation', label: 'Translation', description: 'Professional document translation', price: 0.12 },
        { value: 'proofreading', label: 'Proofreading', description: 'Review and correct existing translations', price: 0.06 },
        { value: 'transcription', label: 'Transcription', description: 'Audio/video to text conversion', price: 0.08 },
        { value: 'subtitling', label: 'Subtitling', description: 'Video subtitle creation', price: 0.15 },
        { value: 'certified', label: 'Certified Translation', description: 'Official certified document translation', price: 0.18 }
      ],
      validation: { required: true }
    },
    {
      id: 'sourceLanguage',
      type: 'select',
      label: 'Source Language',
      description: 'Language of the original document',
      options: [
        { value: 'en', label: 'English 🇺🇸' },
        { value: 'de', label: 'German 🇩🇪' },
        { value: 'es', label: 'Spanish 🇪🇸' },
        { value: 'fr', label: 'French 🇫🇷' },
        { value: 'it', label: 'Italian 🇮🇹' },
        { value: 'pt', label: 'Portuguese 🇵🇹' },
        { value: 'nl', label: 'Dutch 🇳🇱' },
        { value: 'ru', label: 'Russian 🇷🇺' },
        { value: 'zh', label: 'Chinese 🇨🇳' },
        { value: 'ja', label: 'Japanese 🇯🇵' },
        { value: 'ar', label: 'Arabic 🇸🇦' }
      ],
      validation: { required: true }
    },
    {
      id: 'targetLanguage',
      type: 'select',
      label: 'Target Language',
      description: 'Language to translate to',
      options: [
        { value: 'en', label: 'English 🇺🇸' },
        { value: 'de', label: 'German 🇩🇪' },
        { value: 'es', label: 'Spanish 🇪🇸' },
        { value: 'fr', label: 'French 🇫🇷' },
        { value: 'it', label: 'Italian 🇮🇹' },
        { value: 'pt', label: 'Portuguese 🇵🇹' },
        { value: 'nl', label: 'Dutch 🇳🇱' },
        { value: 'ru', label: 'Russian 🇷🇺' },
        { value: 'zh', label: 'Chinese 🇨🇳' },
        { value: 'ja', label: 'Japanese 🇯🇵' },
        { value: 'ar', label: 'Arabic 🇸🇦' }
      ],
      validation: { required: true }
    },
    {
      id: 'documentType',
      type: 'select',
      label: 'Document Type',
      description: 'Different types require specialized expertise',
      options: [
        { value: 'legal', label: 'Legal', multiplier: 1.3 },
        { value: 'marketing', label: 'Marketing', multiplier: 1.1 },
        { value: 'technical', label: 'Technical', multiplier: 1.4 },
        { value: 'academic', label: 'Academic', multiplier: 1.2 },
        { value: 'personal', label: 'Personal', multiplier: 1.0 }
      ],
      validation: { required: true }
    },
    {
      id: 'wordCount',
      type: 'select',
      label: 'Word Count',
      description: 'Estimate your document length',
      options: [
        { value: '0-500', label: '0–500 words' },
        { value: '500-1000', label: '500–1,000 words' },
        { value: '1000-5000', label: '1,000–5,000 words' },
        { value: '5000+', label: '5,000+ words' }
      ],
      validation: { required: true }
    },
    {
      id: 'urgency',
      type: 'select',
      label: 'Delivery Time',
      description: 'Faster delivery may include rush fees',
      options: [
        { value: 'standard', label: 'Standard (3–5 days)', multiplier: 1.0 },
        { value: 'express', label: 'Express (48 hours)', multiplier: 1.25 },
        { value: 'same-day', label: 'Same Day', multiplier: 1.5 }
      ],
      validation: { required: true }
    },
    {
      id: 'addOns',
      type: 'multi-select',
      label: 'Additional Services',
      description: 'Enhance your translation with optional add-ons',
      options: [
        { value: 'certified-stamp', label: 'Certified Stamp', description: 'Official certification seal', price: 20 },
        { value: 'formatting', label: 'Formatting / Layout', description: 'Maintain original document formatting', percentage: 10 },
        { value: 'extra-proofreading', label: 'Extra Proofreading', description: 'Additional quality review', price: 0.04 }
      ]
    },
    {
      id: 'promoCode',
      type: 'input',
      label: 'Promo Code',
      description: 'Enter promo code for discounts'
    }
  ],
  steps: [
    { id: 'service', title: 'Service Type', fields: ['serviceType'] },
    { id: 'languages', title: 'Languages', fields: ['sourceLanguage', 'targetLanguage'] },
    { id: 'document', title: 'Document Type', fields: ['documentType'] },
    { id: 'wordcount', title: 'Word Count', fields: ['wordCount'] },
    { id: 'urgency', title: 'Delivery Time', fields: ['urgency'] },
    { id: 'addons', title: 'Additional Services', fields: ['addOns', 'promoCode'] }
  ],
  pricing: {
    baseRates: {
      'translation': 0.12,
      'proofreading': 0.06,
      'transcription': 0.08,
      'subtitling': 0.15,
      'certified': 0.18
    },
    multipliers: {
      'legal': 1.3,
      'marketing': 1.1,
      'technical': 1.4,
      'academic': 1.2,
      'personal': 1.0,
      'standard': 1.0,
      'express': 1.25,
      'same-day': 1.5
    },
    addOns: {
      'certified-stamp': { cost: 20 },
      'formatting': { percentage: 10 },
      'extra-proofreading': { cost: 0.04 }
    }
  }
};

// Calculator configurations registry
export const calculatorConfigs: Record<string, CalculatorConfig> = {
  'translation-services': translationServicesConfig,
  // Add more calculator configs here as needed
};

// Function to get calculator configuration by slug
export function getCalculatorConfig(slug: string): CalculatorConfig | null {
  // Remove common suffixes and variations
  const baseSlug = slug
    .replace(/-calculator$/, '')
    .replace(/-services$/, '-services')
    .replace(/^(.+)-temp_\d+-\d+$/, '$1');
    
  return calculatorConfigs[baseSlug] || null;
}

// Function to generate customization fields from calculator config
export function generateCustomizationFields(config: CalculatorConfig) {
  return {
    services: config.fields.filter(field => 
      field.type === 'select' && (field.id === 'serviceType' || field.options?.some(opt => opt.price))
    ),
    pricing: {
      baseRates: config.pricing.baseRates || {},
      multipliers: config.pricing.multipliers || {},
      addOns: config.pricing.addOns || {}
    },
    fields: config.fields,
    steps: config.steps
  };
}