import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteKitHeader } from "@/components/calculator-header";
import { 
  Camera, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle, 
  Download,
  Mail,
  Phone,
  User,
  Calendar,
  Star,
  Heart,
  Video,
  Image
} from "lucide-react";

interface WeddingFormData {
  packageType: string;
  hours: string;
  locations: string;
  addOns: string[];
  deliveryOption: string;
  weddingDate: string;
  weddingLocation: string;
  promoCode: string;
  naturalLanguageInput: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

interface PricingBreakdown {
  basePrice: number;
  hoursAdd: number;
  locationsAdd: number;
  addOnsTotal: number;
  deliveryAdd: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface WeddingPhotographyCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function WeddingPhotographyCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: WeddingPhotographyCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  const [customConfig, setCustomConfig] = useState<any>(propConfig || null);
  const [formData, setFormData] = useState<WeddingFormData>({
    packageType: "",
    hours: "",
    locations: "",
    addOns: [],
    deliveryOption: "",
    weddingDate: "",
    weddingLocation: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Initialize with prop config and watch for changes
  useEffect(() => {
    if (propConfig) {
      setCustomConfig(propConfig);
      applyCustomConfig(propConfig);
    }
  }, [propConfig]);

  // Handle URL parameters and postMessage for preview mode
  useEffect(() => {
    if (isPreview) return; // Skip URL params and message listener in preview mode
    
    // Handle URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    if (configParam) {
      try {
        const config = JSON.parse(decodeURIComponent(configParam));
        applyCustomConfig(config);
      } catch (error) {
        console.error('Failed to parse config:', error);
      }
    }

    // Listen for postMessage from parent dashboard
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'APPLY_CONFIG') {
        applyCustomConfig(event.data.config);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const applyCustomConfig = (config: any) => {
    console.log('Applying config to wedding calculator:', config);
    setCustomConfig(config);
    
    // Create dynamic CSS styles
    const styleId = 'wedding-calculator-custom-styles';
    let existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    
    // Handle both flat and nested config formats
    const primaryColor = config.brandColors?.primary || config.primaryColor || '#06D6A0';
    const secondaryColor = config.brandColors?.secondary || config.secondaryColor || '#2563eb';
    const accentColor = config.brandColors?.accent || config.accentColor || '#f59e0b';
    const fontFamily = config.styling?.fontFamily || config.fontFamily || 'Inter';
    const borderRadius = config.styling?.borderRadius || config.borderRadius || '0.5rem';
    
    let css = `
      :root {
        --custom-primary: ${primaryColor};
        --custom-secondary: ${secondaryColor};
        --custom-accent: ${accentColor};
        --custom-font: ${fontFamily};
        --custom-radius: ${borderRadius};
      }
      
      .wedding-calculator {
        font-family: var(--custom-font) !important;
      }
      
      .wedding-calculator * {
        font-family: inherit !important;
      }
      
      /* Primary color applications - Force override all rose colors */
      .wedding-calculator .border-rose-300,
      .wedding-calculator .border-rose-200 {
        border-color: ${primaryColor} !important;
      }
      
      .wedding-calculator .bg-rose-50 {
        background-color: ${primaryColor}15 !important;
      }
      
      .wedding-calculator .text-rose-800,
      .wedding-calculator .text-rose-600,
      .wedding-calculator .text-rose-500 {
        color: ${primaryColor} !important;
      }
      
      .wedding-calculator .bg-rose-400 {
        background-color: ${primaryColor} !important;
        color: white !important;
      }
      
      /* Target specific elements by content and structure */
      .wedding-calculator [class*="bg-rose"] {
        background-color: ${primaryColor} !important;
      }
      
      .wedding-calculator [class*="text-rose"] {
        color: ${primaryColor} !important;
      }
      
      .wedding-calculator [class*="border-rose"] {
        border-color: ${primaryColor} !important;
      }
      
      .wedding-calculator .border-rose-200 {
        border-color: ${primaryColor}40 !important;
      }
      
      .wedding-calculator .border-rose-200:hover {
        border-color: ${primaryColor}60 !important;
      }
      
      .wedding-calculator .hover\\:bg-rose-25:hover {
        background-color: ${primaryColor}08 !important;
      }
      
      /* Button styling with maximum specificity */
      .wedding-calculator button,
      .wedding-calculator .button,
      .wedding-calculator [role="button"] {
        background-color: ${primaryColor} !important;
        border-color: ${primaryColor} !important;
        color: white !important;
      }
      
      .wedding-calculator button:hover,
      .wedding-calculator .button:hover,
      .wedding-calculator [role="button"]:hover {
        background-color: ${primaryColor}dd !important;
        opacity: 0.9 !important;
      }
      
      /* Force override all existing rose colors with direct hex values */
      .wedding-calculator .bg-rose-400,
      .wedding-calculator .bg-rose-500,
      .wedding-calculator .bg-rose-600 {
        background-color: ${primaryColor} !important;
      }
      
      .wedding-calculator .border-rose-300,
      .wedding-calculator .border-rose-400,
      .wedding-calculator .border-2.border-rose-300 {
        border-color: ${primaryColor} !important;
      }
      
      .wedding-calculator .text-rose-500,
      .wedding-calculator .text-rose-600,
      .wedding-calculator .text-rose-700,
      .wedding-calculator .text-rose-800 {
        color: ${primaryColor} !important;
      }
      
      /* Override Tailwind's compiled styles */
      .wedding-calculator .bg-rose-50 {
        background-color: ${primaryColor}10 !important;
      }
      
      /* Popular badge specific override */
      .wedding-calculator .bg-rose-400.text-white {
        background-color: ${primaryColor} !important;
      }
      
      /* Badge styling */
      .wedding-calculator .bg-rose-400 {
        background-color: var(--custom-primary) !important;
      }
      
      /* Border radius */
      .wedding-calculator .rounded-2xl {
        border-radius: calc(var(--custom-radius) * 1.5) !important;
      }
      
      .wedding-calculator .rounded-xl {
        border-radius: var(--custom-radius) !important;
      }
      
      .wedding-calculator .rounded-lg {
        border-radius: calc(var(--custom-radius) * 0.75) !important;
      }
      
      /* Shadow and selection states */
      .wedding-calculator .shadow-lg {
        box-shadow: 0 10px 15px -3px ${primaryColor}20, 0 4px 6px -2px ${primaryColor}10 !important;
      }
    `;
    
    style.textContent = css;
    document.head.appendChild(style);
    
    // Apply aggressive DOM manipulation to force color changes
    setTimeout(() => {
      const calculator = document.querySelector('.wedding-calculator');
      if (calculator) {
        // Create a comprehensive style override
        const overrideStyle = document.createElement('style');
        overrideStyle.id = 'force-color-override';
        overrideStyle.textContent = `
          .wedding-calculator .bg-rose-400 { background-color: ${primaryColor} !important; }
          .wedding-calculator .bg-rose-50 { background-color: ${primaryColor}15 !important; }
          .wedding-calculator .text-rose-800 { color: ${primaryColor} !important; }
          .wedding-calculator .text-rose-600 { color: ${primaryColor} !important; }
          .wedding-calculator .text-rose-500 { color: ${primaryColor} !important; }
          .wedding-calculator .border-rose-300 { border-color: ${primaryColor} !important; }
          .wedding-calculator .border-rose-200 { border-color: ${primaryColor}40 !important; }
          .wedding-calculator button { background-color: ${primaryColor} !important; border-color: ${primaryColor} !important; }
        `;
        document.head.appendChild(overrideStyle);
        
        // Direct element targeting with specific selectors
        const specificElements = [
          '.bg-rose-400',
          '.text-rose-800',
          '.text-rose-600', 
          '.text-rose-500',
          '.border-rose-300',
          'button'
        ];
        
        specificElements.forEach(selector => {
          const elements = calculator.querySelectorAll(selector);
          elements.forEach(el => {
            const htmlEl = el as HTMLElement;
            if (selector.includes('bg-')) {
              htmlEl.style.setProperty('background-color', primaryColor, 'important');
            } else if (selector.includes('text-')) {
              htmlEl.style.setProperty('color', primaryColor, 'important');
            } else if (selector.includes('border-')) {
              htmlEl.style.setProperty('border-color', primaryColor, 'important');
            } else if (selector === 'button') {
              htmlEl.style.setProperty('background-color', primaryColor, 'important');
              htmlEl.style.setProperty('border-color', primaryColor, 'important');
            }
          });
        });
        
        // Force browser repaint
        const htmlCalc = calculator as HTMLElement;
        htmlCalc.style.transform = 'translateZ(0)';
        htmlCalc.offsetHeight; // Trigger reflow
        htmlCalc.style.transform = '';
      }
      
      setFormData(prev => ({...prev}));
    }, 50);
  };

  const packageTypes = [
    { id: "elopement", label: "Elopement / Small Ceremony", basePrice: 950, hours: 4, icon: "💕", popular: false },
    { id: "half-day", label: "Half-Day Coverage", basePrice: 1200, hours: 6, icon: "☀️", popular: true },
    { id: "full-day", label: "Full-Day Coverage", basePrice: 1800, hours: 10, icon: "💍", popular: true },
    { id: "destination", label: "Destination Wedding", basePrice: 2500, hours: 12, icon: "✈️", popular: false },
  ];

  const hourOptions = [
    { id: "4", label: "4 Hours", surcharge: 0, popular: false },
    { id: "6", label: "6 Hours", surcharge: 300, popular: true },
    { id: "8", label: "8 Hours", surcharge: 600, popular: true },
    { id: "10+", label: "10+ Hours", surcharge: 900, popular: false },
  ];

  const locationOptions = [
    { id: "1", label: "1 Location", surcharge: 0, popular: false },
    { id: "2", label: "2 Locations", surcharge: 150, popular: true },
    { id: "3+", label: "3+ Locations", surcharge: 350, popular: false },
  ];

  const deliveryOptions = [
    { id: "gallery", label: "Online Gallery Only", price: 0, popular: false },
    { id: "usb-album", label: "USB + Album", price: 250, popular: true },
    { id: "video-highlights", label: "Video Highlights Add-On", price: 400, popular: true },
  ];

  const addOnOptions = [
    { id: "engagement", label: "Engagement Session", price: 300, popular: true },
    { id: "second-photographer", label: "Second Photographer", price: 250, popular: true },
    { id: "drone", label: "Drone Coverage", price: 150, popular: false },
    { id: "album", label: "Album & Prints", price: 200, popular: true },
    { id: "rehearsal", label: "Rehearsal Dinner Coverage", price: 350, popular: false },
    { id: "express", label: "Express Turnaround", price: 175, popular: false },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const packageType = packageTypes.find(p => p.id === formData.packageType);
    const hours = hourOptions.find(h => h.id === formData.hours);
    const locations = locationOptions.find(l => l.id === formData.locations);
    const delivery = deliveryOptions.find(d => d.id === formData.deliveryOption);

    const basePrice = packageType?.basePrice || 0;
    const hoursAdd = hours?.surcharge || 0;
    const locationsAdd = locations?.surcharge || 0;
    const deliveryAdd = delivery?.price || 0;
    
    let addOnsTotal = 0;

    const breakdown: string[] = [];

    // Base package
    breakdown.push(`${packageType?.label || 'Base package'}: €${basePrice.toFixed(0)}`);

    // Hours upgrade
    if (hoursAdd > 0) {
      breakdown.push(`${hours?.label} coverage: €${hoursAdd}`);
    }

    // Locations
    if (locationsAdd > 0) {
      breakdown.push(`${locations?.label}: €${locationsAdd}`);
    }

    // Delivery option
    if (deliveryAdd > 0) {
      breakdown.push(`${delivery?.label}: €${deliveryAdd}`);
    }

    // Add-ons
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: €${addOn.price}`);
      }
    });

    // Smart logic: suggest drone for 2+ locations
    if (formData.locations === "2" || formData.locations === "3+" && !formData.addOns.includes("drone")) {
      // This would be a suggestion, not auto-added
    }

    let subtotal = basePrice + hoursAdd + locationsAdd + deliveryAdd + addOnsTotal;

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "wedding15") {
      discount = subtotal * 0.15;
      breakdown.push(`Promo code discount (15%): -€${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      hoursAdd,
      locationsAdd,
      addOnsTotal,
      deliveryAdd,
      subtotal,
      discount,
      total,
      breakdown,
    };
  };

  const pricing = calculatePricing();

  const parseNaturalLanguage = () => {
    const input = formData.naturalLanguageInput.toLowerCase();
    const newFormData = { ...formData };

    // Parse package type
    if (input.includes("elopement") || input.includes("small ceremony")) newFormData.packageType = "elopement";
    else if (input.includes("destination") || input.includes("santorini") || input.includes("abroad")) newFormData.packageType = "destination";
    else if (input.includes("full day") || input.includes("full-day")) newFormData.packageType = "full-day";
    else newFormData.packageType = "half-day";

    // Parse hours
    if (input.includes("4 hour") || input.includes("4hr")) newFormData.hours = "4";
    else if (input.includes("6 hour") || input.includes("6hr")) newFormData.hours = "6";
    else if (input.includes("8 hour") || input.includes("8hr")) newFormData.hours = "8";
    else newFormData.hours = "10+";

    // Parse locations
    if (input.includes("two venues") || input.includes("2 venues") || input.includes("two locations")) newFormData.locations = "2";
    else if (input.includes("three") || input.includes("3") || input.includes("multiple")) newFormData.locations = "3+";
    else newFormData.locations = "1";

    // Parse delivery
    if (input.includes("video") || input.includes("highlights")) newFormData.deliveryOption = "video-highlights";
    else if (input.includes("album") || input.includes("usb")) newFormData.deliveryOption = "usb-album";
    else newFormData.deliveryOption = "gallery";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("engagement")) newAddOns.push("engagement");
    if (input.includes("second photographer") || input.includes("second shooter")) newAddOns.push("second-photographer");
    if (input.includes("drone")) newAddOns.push("drone");
    if (input.includes("album")) newAddOns.push("album");
    if (input.includes("rehearsal")) newAddOns.push("rehearsal");
    if (input.includes("express") || input.includes("rush")) newAddOns.push("express");
    newFormData.addOns = newAddOns;

    // Parse location
    if (input.includes("santorini")) newFormData.weddingLocation = "Santorini, Greece";
    else if (input.includes("tuscany")) newFormData.weddingLocation = "Tuscany, Italy";
    else if (input.includes("ireland")) newFormData.weddingLocation = "Ireland";

    setFormData(newFormData);
  };

  const downloadQuotePDF = () => {
    console.log("Downloading PDF quote...");
  };

  const OptionCard = ({ 
    option, 
    selected, 
    onClick, 
    icon, 
    popular = false 
  }: { 
    option: any; 
    selected: boolean; 
    onClick: () => void; 
    icon?: string; 
    popular?: boolean;
  }) => (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${
        selected 
          ? "border-rose-300 bg-rose-50 shadow-lg" 
          : "border-stone-200 hover:border-rose-200 bg-white hover:bg-rose-25"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-rose-400 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2">{icon}</div>}
        <div className={`font-serif font-semibold ${selected ? "text-rose-800" : "text-stone-700"}`}>{option.label}</div>
        {option.basePrice !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-rose-600" : "text-stone-500"}`}>€{option.basePrice}</div>
        )}
        {option.surcharge !== undefined && option.surcharge > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-rose-600" : "text-stone-500"}`}>+€{option.surcharge}</div>
        )}
        {option.price !== undefined && option.price > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-rose-600" : "text-stone-500"}`}>+€{option.price}</div>
        )}
        {option.hours !== undefined && (
          <div className={`text-xs mt-1 ${selected ? "text-rose-500" : "text-stone-400"}`}>{option.hours} hours included</div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Package & Coverage", completed: !!formData.packageType && !!formData.hours },
    { number: 2, title: "Locations & Add-ons", completed: !!formData.locations && !!formData.deliveryOption },
    { number: 3, title: "Wedding Details", completed: true },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="wedding-calculator min-h-screen bg-gradient-to-br from-stone-50 via-rose-25 to-amber-25">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          {customConfig?.companyBranding?.logoUrl && (
            <img 
              src={customConfig.companyBranding.logoUrl} 
              alt={customConfig.companyBranding.companyName || "Company Logo"}
              className="h-16 mx-auto mb-4"
            />
          )}
          <h1 className="text-4xl font-serif text-stone-800 mb-2">
            {customConfig?.textCustomization?.headline || customConfig?.headline || 
             (customConfig?.companyBranding?.companyName || customConfig?.companyName ? 
              `${customConfig?.companyBranding?.companyName || customConfig?.companyName} - Wedding Photography` : 
              "Wedding Photography Quote Calculator")
            }
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto font-light">
            {customConfig?.textCustomization?.description || customConfig?.description || 
             "Create beautiful memories with professional wedding photography. Get your personalized quote for your special day."
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-rose-200 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-rose-400 text-white"
                          : currentStep === step.number
                          ? "bg-rose-300 text-white"
                          : "bg-stone-300 text-stone-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-stone-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-rose-200 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Package & Coverage */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-serif text-stone-800 mb-4 flex items-center">
                      <Camera className="h-6 w-6 mr-2 text-rose-400" />
                      Choose your wedding photography package
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-rose-50 rounded-2xl border border-rose-200">
                      <label className="block text-sm font-light text-stone-700 mb-2">
                        Describe your wedding photography needs (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., We're getting married in June in Santorini with two venues and want video too"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-rose-200 text-stone-800 mb-3 resize-none placeholder:text-stone-400 rounded-xl"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-rose-400 hover:bg-rose-500 text-white border-0 font-light rounded-xl"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-serif text-stone-700 mb-3">Package Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {packageTypes.map((pkg) => (
                            <OptionCard
                              key={pkg.id}
                              option={pkg}
                              selected={formData.packageType === pkg.id}
                              onClick={() => setFormData(prev => ({ ...prev, packageType: pkg.id }))}
                              icon={pkg.icon}
                              popular={pkg.popular}
                            />
                          ))}
                        </div>

                        {formData.packageType === "full-day" && (
                          <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-200">
                            <div className="text-sm text-stone-600">
                              💍 Most couples choose Full-Day + Second Shooter + Album
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-serif text-stone-700 mb-3">Coverage Hours</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {hourOptions.map((hour) => (
                            <OptionCard
                              key={hour.id}
                              option={hour}
                              selected={formData.hours === hour.id}
                              onClick={() => setFormData(prev => ({ ...prev, hours: hour.id }))}
                              popular={hour.popular}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.packageType || !formData.hours}
                      className="bg-rose-400 hover:bg-rose-500 text-white px-8 font-light rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Locations & Add-ons */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-serif text-stone-800 mb-4 flex items-center">
                      <MapPin className="h-6 w-6 mr-2 text-rose-400" />
                      Locations and additional services
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-serif text-stone-700 mb-3">Number of Locations</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {locationOptions.map((location) => (
                            <OptionCard
                              key={location.id}
                              option={location}
                              selected={formData.locations === location.id}
                              onClick={() => setFormData(prev => ({ ...prev, locations: location.id }))}
                              popular={location.popular}
                            />
                          ))}
                        </div>
                        
                        {(formData.locations === "2" || formData.locations === "3+") && !formData.addOns.includes("drone") && (
                          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                            <div className="text-sm text-amber-800">
                              💡 Consider adding drone coverage for stunning aerial shots of multiple venues
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-serif text-stone-700 mb-3">Delivery Options</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {deliveryOptions.map((delivery) => (
                            <OptionCard
                              key={delivery.id}
                              option={delivery}
                              selected={formData.deliveryOption === delivery.id}
                              onClick={() => setFormData(prev => ({ ...prev, deliveryOption: delivery.id }))}
                              popular={delivery.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-serif text-stone-700 mb-3">Add-ons (Optional)</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {addOnOptions.map((addOn) => (
                            <div
                              key={addOn.id}
                              onClick={() => {
                                const newAddOns = formData.addOns.includes(addOn.id)
                                  ? formData.addOns.filter(id => id !== addOn.id)
                                  : [...formData.addOns, addOn.id];
                                setFormData(prev => ({ ...prev, addOns: newAddOns }));
                              }}
                              className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-rose-300 bg-rose-50 shadow-lg text-stone-800"
                                  : "border-stone-200 hover:border-rose-200 bg-white text-stone-700 hover:bg-rose-25"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-rose-400 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-serif font-semibold">{addOn.label}</div>
                                <div className={`font-semibold ${formData.addOns.includes(addOn.id) ? "text-rose-600" : "text-stone-500"}`}>
                                  +€{addOn.price}
                                </div>
                              </div>
                              {addOn.id === "engagement" && (
                                <div className="text-xs text-stone-500 mt-1">
                                  💕 What's included? → 90-minute session, 50+ edited photos, online gallery
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="px-8 border-stone-300 text-stone-600 hover:bg-stone-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.locations || !formData.deliveryOption}
                      className="bg-rose-400 hover:bg-rose-500 text-white px-8 font-light rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Wedding Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-serif text-stone-800 mb-4 flex items-center">
                      <Heart className="h-6 w-6 mr-2 text-rose-400" />
                      Your wedding details
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-serif text-stone-700 mb-3">Wedding Date (Optional)</h3>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                            <Input
                              type="date"
                              value={formData.weddingDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, weddingDate: e.target.value }))}
                              className="pl-10 border-stone-300 bg-white text-stone-800 rounded-xl"
                            />
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-serif text-stone-700 mb-3">Wedding Location (Optional)</h3>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                            <Input
                              placeholder="e.g., Santorini, Greece"
                              value={formData.weddingLocation}
                              onChange={(e) => setFormData(prev => ({ ...prev, weddingLocation: e.target.value }))}
                              className="pl-10 border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-serif text-stone-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., WEDDING15)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-stone-300 text-stone-600 hover:bg-stone-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="bg-rose-400 hover:bg-rose-500 text-white px-8 font-light rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Contact Info */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-serif text-stone-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-rose-400" />
                      Get your wedding photography quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                          <Input
                            placeholder="Your full name"
                            value={formData.contactInfo.name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, name: e.target.value }
                            }))}
                            className="pl-10 border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.contactInfo.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value }
                            }))}
                            className="pl-10 border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                          <Input
                            placeholder="+353 xxx xxx xxx"
                            value={formData.contactInfo.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, phone: e.target.value }
                            }))}
                            className="pl-10 border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-stone-300 text-stone-600 hover:bg-stone-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-rose-400 hover:bg-rose-500 text-white px-8 font-light rounded-xl"
                    >
                      Get Quote
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-xl sticky top-8">
              <h3 className="text-xl font-serif text-stone-800 mb-4">Your Wedding Investment</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-rose-500">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-stone-600">
                        <span>{item.split(': ')[0]}</span>
                        <span className="text-rose-500">{item.split(': ')[1]}</span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-stone-800">
                      <span>Total</span>
                      <span className="text-rose-500">€{pricing.total.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-serif text-stone-800">Ready to Capture Your Love Story?</h3>
                    <p className="text-sm text-stone-600">
                      This quote is valid for 72 hours. Award-winning wedding photographer with stunning portfolio.
                    </p>
                    
                    <Button 
                      className="w-full bg-rose-400 hover:bg-rose-500 text-white py-3 font-light rounded-xl"
                      onClick={() => {
                        const subject = "Wedding Photography Inquiry";
                        const body = `I'd love to check my date availability! My quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@lovelightvienna.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      💕 Check My Date
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-stone-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-rose-400 rounded-full mr-1"></div>
                        Award-winning
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-rose-500 rounded-full mr-1"></div>
                        Portfolio
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-stone-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-rose-500 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-stone-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 72 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-stone-300 text-stone-600 hover:bg-stone-50 rounded-xl"
                        onClick={downloadQuotePDF}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Quote PDF
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}