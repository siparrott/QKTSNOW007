import { useEffect, useState } from 'react';

// Import only the Portrait Photography Calculator
import PortraitPhotographyCalculator from '@/pages/portrait-photography-calculator';

// Streamlined Calculator Component Mapping - Portrait Photography Only
const calculatorComponents: { [key: string]: React.ComponentType<any> } = {
  'portrait-photography': PortraitPhotographyCalculator,
};

interface EmbedCalculatorProps {
  embedId: string;
  templateSlug: string;
  customConfig: any;
}

export default function EmbedCalculator({ embedId, templateSlug, customConfig }: EmbedCalculatorProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give a moment for the component to initialize
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calculator...</p>
        </div>
      </div>
    );
  }

  const CalculatorComponent = calculatorComponents[templateSlug];

  if (!CalculatorComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Calculator Not Found</h2>
          <p className="text-gray-600">The requested calculator template "{templateSlug}" could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <CalculatorComponent
      customConfig={customConfig}
      isPreview={false}
      hideHeader={true}
      embedId={embedId}
    />
  );
}