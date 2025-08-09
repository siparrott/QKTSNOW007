import React, { Suspense, lazy, useEffect } from 'react';

// Portrait Photography Calculator - Our primary and only calculator
const calculatorComponents: { [key: string]: React.LazyExoticComponent<React.ComponentType<any>> } = {
  'portrait-photography': lazy(() => import('../pages/portrait-photography-calculator')),
  'portrait-photography-classic': lazy(() => import('../pages/portrait-photography-calculator')),
  'portrait-photography-minimal': lazy(() => import('../pages/portrait-photography-calculator')),
  'portrait-photography-modern': lazy(() => import('../pages/portrait-photography-calculator')),
  'portrait-photography-elegant': lazy(() => import('../pages/portrait-photography-calculator')),
  'portrait-photography-bold': lazy(() => import('../pages/portrait-photography-calculator')),
  'portrait-photography-serif': lazy(() => import('../pages/portrait-photography-calculator')),
  'portrait-photography-rounded': lazy(() => import('../pages/portrait-photography-calculator')),
  'portrait-photography-mono': lazy(() => import('../pages/portrait-photography-calculator')),
  'portrait-photography-contrast': lazy(() => import('../pages/portrait-photography-calculator')),
  'portrait-photography-pastel': lazy(() => import('../pages/portrait-photography-calculator')),
  'portrait-photography-neon': lazy(() => import('../pages/portrait-photography-calculator')),
  'portrait-photography-dark': lazy(() => import('../pages/portrait-photography-calculator')),
};

interface CalculatorPreviewProps {
  slug: string;
  customConfig?: any;
  className?: string;
  onConfigChange?: (config: any) => void;
}

export default function CalculatorPreview({ slug, customConfig, className = "", onConfigChange }: CalculatorPreviewProps) {
  console.log('Applying config to', slug, 'calculator:', customConfig);
  
  const CalculatorComponent = calculatorComponents[slug];

  if (!CalculatorComponent) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-xl font-semibold mb-2">Calculator Preview</div>
          <div className="text-sm">Calculator "{slug}" not found</div>
        </div>
      </div>
    );
  }

  // Extract theme from slug and create enhanced customConfig
  const getThemeConfig = (slug: string) => {
    const baseConfig = customConfig || {};
    
    // Map industry calculators to their styling configs
    const themeConfigs = {
      'portrait-photography-classic': {
        ...baseConfig,
        brandColors: { primary: '#2563eb', secondary: '#64748b', accent: '#0ea5e9' },
        themeClass: 'theme-classic',
        themeId: 'construction',
        industry: 'Construction & Contracting'
      },
      'portrait-photography-minimal': {
        ...baseConfig,
        brandColors: { primary: '#000000', secondary: '#737373', accent: '#525252' },
        themeClass: 'theme-minimal',
        themeId: 'insurance',
        industry: 'Insurance & Financial Services'
      },
      'portrait-photography-modern': {
        ...baseConfig,
        brandColors: { primary: '#3b82f6', secondary: '#6366f1', accent: '#8b5cf6' },
        themeClass: 'theme-modern',
        themeId: 'home-services',
        industry: 'Home Services'
      },
      'portrait-photography-elegant': {
        ...baseConfig,
        brandColors: { primary: '#1f2937', secondary: '#6b7280', accent: '#d97706' },
        themeClass: 'theme-elegant',
        themeId: 'saas',
        industry: 'SaaS & Subscription Software'
      },
      'portrait-photography-bold': {
        ...baseConfig,
        brandColors: { primary: '#dc2626', secondary: '#ea580c', accent: '#d97706' },
        themeClass: 'theme-bold',
        themeId: 'ecommerce',
        industry: 'E-Commerce & Custom Products'
      },
      'portrait-photography-serif': {
        ...baseConfig,
        brandColors: { primary: '#7c2d12', secondary: '#a3a3a3', accent: '#ca8a04' },
        styling: { ...baseConfig.styling, fontFamily: 'Georgia, serif' },
        themeClass: 'theme-serif',
        themeId: 'marketing',
        industry: 'Marketing Agencies & Freelancers'
      },
      'portrait-photography-rounded': {
        ...baseConfig,
        brandColors: { primary: '#059669', secondary: '#10b981', accent: '#34d399' },
        styling: { ...baseConfig.styling, borderRadius: '16px' },
        themeClass: 'theme-rounded',
        themeId: 'events',
        industry: 'Event Planning & Weddings'
      },
      'portrait-photography-mono': {
        ...baseConfig,
        brandColors: { primary: '#374151', secondary: '#6b7280', accent: '#9ca3af' },
        styling: { ...baseConfig.styling, fontFamily: 'Monaco, monospace' },
        themeClass: 'theme-mono',
        themeId: 'automotive',
        industry: 'Automotive Services'
      },
      'portrait-photography-contrast': {
        ...baseConfig,
        brandColors: { primary: '#000000', secondary: '#1f2937', accent: '#ffffff' },
        themeClass: 'theme-contrast',
        themeId: 'real-estate',
        industry: 'Real Estate & Property Services'
      },
      'portrait-photography-pastel': {
        ...baseConfig,
        brandColors: { primary: '#db2777', secondary: '#f472b6', accent: '#fb7185' },
        themeClass: 'theme-pastel',
        themeId: 'legal',
        industry: 'Legal & Consulting Firms'
      },
      'portrait-photography-neon': {
        ...baseConfig,
        brandColors: { primary: '#06b6d4', secondary: '#0891b2', accent: '#0369a1' },
        themeClass: 'theme-neon',
        themeId: 'printing',
        industry: 'Printing & Promotional Goods'
      },
      'portrait-photography-dark': {
        ...baseConfig,
        brandColors: { primary: '#f59e0b', secondary: '#d97706', accent: '#92400e' },
        themeClass: 'theme-dark',
        themeId: 'energy',
        industry: 'Energy & Utilities'
      }
    };
    
    return themeConfigs[slug as keyof typeof themeConfigs] || baseConfig;
  };

  const enhancedConfig = getThemeConfig(slug);

  // Apply custom styling from config with dynamic CSS injection
  useEffect(() => {
    if (enhancedConfig && Object.keys(enhancedConfig).length > 0) {
      const styleId = `preview-styles-${slug}`;
      let existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const style = document.createElement('style');
      style.id = styleId;
      
      const primaryColor = enhancedConfig.brandColors?.primary || '#06D6A0';
      const secondaryColor = enhancedConfig.brandColors?.secondary || '#2563eb';
      const accentColor = enhancedConfig.brandColors?.accent || '#f59e0b';
      const fontFamily = enhancedConfig.styling?.fontFamily || 'Inter';
      const borderRadius = enhancedConfig.styling?.borderRadius || '0.5rem';
      
      style.textContent = `
        .calculator-preview-${slug} {
          font-family: ${fontFamily} !important;
        }
        
        .calculator-preview-${slug} * {
          font-family: inherit !important;
        }
        
        .calculator-preview-${slug} [class*="bg-rose-"], 
        .calculator-preview-${slug} [class*="border-rose-"], 
        .calculator-preview-${slug} [class*="text-rose-"] {
          color: ${primaryColor} !important;
          border-color: ${primaryColor} !important;
        }
        
        .calculator-preview-${slug} [class*="bg-rose-50"] {
          background-color: ${primaryColor}15 !important;
        }
        
        .calculator-preview-${slug} [class*="bg-rose-400"] {
          background-color: ${primaryColor} !important;
          color: white !important;
        }
        
        .calculator-preview-${slug} button:not([class*="outline"]) {
          background-color: ${primaryColor} !important;
          border-color: ${primaryColor} !important;
          color: white !important;
        }
        
        .calculator-preview-${slug} [class*="rounded"] {
          border-radius: ${borderRadius} !important;
        }
      `;
      
      document.head.appendChild(style);
    }
  }, [enhancedConfig, slug]);

  const previewStyles = {
    fontFamily: enhancedConfig?.styling?.fontFamily || 'Inter',
    borderRadius: enhancedConfig?.styling?.borderRadius || '0.5rem',
    '--primary-color': enhancedConfig?.brandColors?.primary || '#06D6A0',
    '--secondary-color': enhancedConfig?.brandColors?.secondary || '#2563eb',
    '--accent-color': enhancedConfig?.brandColors?.accent || '#f59e0b',
  } as React.CSSProperties;

  return (
    <div 
      className={`calculator-preview-${slug} ${enhancedConfig?.themeClass || ''} bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}
      style={previewStyles}
    >
      <Suspense fallback={
        <div className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <div className="text-sm text-gray-500">Loading calculator...</div>
        </div>
      }>
        <CalculatorComponent 
          customConfig={enhancedConfig}
          onConfigChange={onConfigChange}
          isPreview={true}
          hideHeader={true}
          forceDetailedView={enhancedConfig?.forceDetailedView}
          useComprehensiveCalculator={enhancedConfig?.useComprehensiveCalculator}
          calculatorType={enhancedConfig?.calculatorType}
        />
      </Suspense>
    </div>
  );
}