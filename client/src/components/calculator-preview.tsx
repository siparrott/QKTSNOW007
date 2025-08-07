import React, { Suspense, lazy, useEffect } from 'react';

// Portrait Photography Calculator - Our primary and only calculator
const calculatorComponents: { [key: string]: React.LazyExoticComponent<React.ComponentType<any>> } = {
  'portrait-photography': lazy(() => import('../pages/portrait-photography-calculator')),
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

  // Apply custom styling from config with dynamic CSS injection
  useEffect(() => {
    if (customConfig && Object.keys(customConfig).length > 0) {
      const styleId = `preview-styles-${slug}`;
      let existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const style = document.createElement('style');
      style.id = styleId;
      
      const primaryColor = customConfig.brandColors?.primary || '#06D6A0';
      const secondaryColor = customConfig.brandColors?.secondary || '#2563eb';
      const accentColor = customConfig.brandColors?.accent || '#f59e0b';
      const fontFamily = customConfig.styling?.fontFamily || 'Inter';
      const borderRadius = customConfig.styling?.borderRadius || '0.5rem';
      
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
  }, [customConfig, slug]);

  const previewStyles = {
    fontFamily: customConfig?.styling?.fontFamily || 'Inter',
    borderRadius: customConfig?.styling?.borderRadius || '0.5rem',
    '--primary-color': customConfig?.brandColors?.primary || '#06D6A0',
    '--secondary-color': customConfig?.brandColors?.secondary || '#2563eb',
    '--accent-color': customConfig?.brandColors?.accent || '#f59e0b',
  } as React.CSSProperties;

  return (
    <div 
      className={`calculator-preview-${slug} bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}
      style={previewStyles}
    >
      <Suspense fallback={
        <div className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <div className="text-sm text-gray-500">Loading calculator...</div>
        </div>
      }>
        <CalculatorComponent 
          customConfig={customConfig}
          onConfigChange={onConfigChange}
          isPreview={true}
          hideHeader={true}
          forceDetailedView={customConfig?.forceDetailedView}
          useComprehensiveCalculator={customConfig?.useComprehensiveCalculator}
          calculatorType={customConfig?.calculatorType}
        />
      </Suspense>
    </div>
  );
}