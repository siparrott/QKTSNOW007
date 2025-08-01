import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Camera, 
  Clock, 
  MapPin, 
  Briefcase, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  Building,
  Image
} from "lucide-react";

interface CommercialFormData {
  projectType: string;
  imageCount: string;
  location: string;
  duration: string;
  addOns: string[];
  deliverySpeed: string;
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
  imageAdd: number;
  durationAdd: number;
  locationAdd: number;
  addOnsTotal: number;
  deliveryAdd: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
  currency?: string;
}

interface CommercialPhotographyCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function CommercialPhotographyCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: CommercialPhotographyCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  const [customConfig, setCustomConfig] = useState<any>(propConfig);
  const [textConfig, setTextConfig] = useState<any>({});
  
  // Initialize with prop config and watch for changes
  useEffect(() => {
    if (propConfig) {
      setCustomConfig(propConfig);
      applyCustomConfig(propConfig);
    }
  }, [propConfig]);

  // Listen for configuration updates from parent dashboard
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'APPLY_CONFIG') {
        setCustomConfig(event.data.config);
        applyCustomConfig(event.data.config);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const applyCustomConfig = (config: any) => {
    console.log('Applying config to commercial photography calculator:', config);
    setCustomConfig(config);
    
    // Initialize text configuration if provided
    if (config.textContent) {
      setTextConfig(config.textContent);
    }
  };
  
  // Text customization functionality
  const updateTextContent = (key: string, value: string) => {
    setTextConfig(prev => ({ ...prev, [key]: value }));
    // Update the customConfig as well
    setCustomConfig(prev => ({ ...prev, [key]: value }));
    // Send update to parent if in preview mode
    if (isPreview) {
      window.parent?.postMessage({
        type: 'TEXT_UPDATE',
        key,
        value
      }, '*');
    }
  };

  // Handlers for editing project types, image counts, locations, and durations
  const updateProjectType = (id: string, field: string, value: string | number) => {
    if (isPreview) {
      window.parent?.postMessage({
        type: 'UPDATE_PROJECT_TYPE',
        id,
        field,
        value
      }, '*');
    }
  };

  const updateImageCount = (id: string, field: string, value: string | number) => {
    if (isPreview) {
      window.parent?.postMessage({
        type: 'UPDATE_IMAGE_COUNT',
        id,
        field,
        value
      }, '*');
    }
  };

  const updateLocation = (id: string, field: string, value: string | number) => {
    if (isPreview) {
      window.parent?.postMessage({
        type: 'UPDATE_LOCATION',
        id,
        field,
        value
      }, '*');
    }
  };

  const updateDuration = (id: string, field: string, value: string | number) => {
    if (isPreview) {
      window.parent?.postMessage({
        type: 'UPDATE_DURATION',
        id,
        field,
        value
      }, '*');
    }
  };

  const updateAddOn = (id: string, field: string, value: string | number) => {
    if (isPreview) {
      window.parent?.postMessage({
        type: 'UPDATE_ADDON',
        id,
        field,
        value
      }, '*');
    }
  };

  const updateDeliverySpeed = (id: string, field: string, value: string | number) => {
    if (isPreview) {
      window.parent?.postMessage({
        type: 'UPDATE_DELIVERY',
        id,
        field,
        value
      }, '*');
    }
  };
  const [formData, setFormData] = useState<CommercialFormData>({
    projectType: "",
    imageCount: "",
    location: "",
    duration: "",
    addOns: [],
    deliverySpeed: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Use custom pricing configuration if available
  const getProjectTypePricing = () => {
    if (customConfig?.projectTypePrices) {
      return customConfig.projectTypePrices.map((project: any) => ({
        id: project.id,
        label: project.label,
        price: project.price,
        icon: project.icon || "📦",
        popular: project.id === "product" || project.id === "branding"
      }));
    }
    return [
      { id: "product", label: "Product Photography", icon: "📦", popular: true, price: 500 },
      { id: "headshots", label: "Corporate Headshots", icon: "👔", popular: false, price: 800 },
      { id: "branding", label: "Branding Session", icon: "💼", popular: true, price: 1200 },
      { id: "event", label: "Event Photography", icon: "🎉", popular: false, price: 1000 },
      { id: "advertising", label: "Advertising Campaign", icon: "📸", popular: false, price: 2000 },
      { id: "architectural", label: "Architectural Photography", icon: "🏢", popular: false, price: 1500 }
    ];
  };

  const projectTypes = getProjectTypePricing();

  // Use custom pricing configuration if available
  const getImageCountPricing = () => {
    if (customConfig?.imageCountPrices) {
      return customConfig.imageCountPrices.map((count: any) => ({
        id: count.id,
        label: count.label,
        price: count.price,
        icon: count.icon || "📷",
        popular: count.id === "standard" || count.id === "premium"
      }));
    }
    return [
      { id: "basic", label: "Basic Package (10-15 images)", price: 0, icon: "📷" },
      { id: "standard", label: "Standard Package (20-30 images)", price: 300, icon: "📸", popular: true },
      { id: "premium", label: "Premium Package (40-50 images)", price: 600, icon: "🎯", popular: true },
      { id: "unlimited", label: "Unlimited Package (All edited)", price: 1000, icon: "♾️" },
    ];
  };

  const getLocationPricing = () => {
    if (customConfig?.commercialLocationPrices) {
      return customConfig.commercialLocationPrices.map((location: any) => ({
        id: location.id,
        label: location.label,
        price: location.price,
        icon: location.icon || "🏢"
      }));
    }
    return [
      { id: "studio", label: "Studio Location", price: 0, icon: "🏢" },
      { id: "client", label: "Client Location", price: 200, icon: "🏠" },
      { id: "outdoor", label: "Outdoor Location", price: 150, icon: "🌳" },
    ];
  };

  const getDurationPricing = () => {
    if (customConfig?.commercialDurationPrices) {
      return customConfig.commercialDurationPrices.map((duration: any) => ({
        id: duration.id,
        label: duration.label,
        price: duration.price,
        icon: duration.icon || "⏰",
        popular: duration.id === "full-day" || duration.id === "half-day"
      }));
    }
    return [
      { id: "half-day", label: "Half Day (4 hours)", price: 0, icon: "⏰" },
      { id: "full-day", label: "Full Day (8 hours)", price: 800, icon: "🕐", popular: true },
      { id: "multi-day", label: "Multi-Day Shoot", price: 1500, icon: "📅", popular: true },
      { id: "hourly", label: "Hourly Rate", price: 200, icon: "⏱️" },
    ];
  };

  const getEnhancementPricing = () => {
    if (customConfig?.commercialAddonPrices) {
      return customConfig.commercialAddonPrices.map((addon: any) => ({
        id: addon.id,
        label: addon.label,
        price: addon.price,
        icon: addon.icon,
        popular: addon.id === "retouching" || addon.id === "rush"
      }));
    }
    return [
      { id: "retouching", label: "Advanced Retouching", price: 300, icon: "✨", popular: true },
      { id: "rush", label: "Rush Delivery", price: 400, icon: "⚡", popular: true },
      { id: "prints", label: "Print Package", price: 250, icon: "🖨️" },
      { id: "social", label: "Social Media Package", price: 150, icon: "📱" },
      { id: "video", label: "Video Content", price: 800, icon: "🎥" },
      { id: "stylist", label: "Stylist Service", price: 500, icon: "💄" }
    ];
  };

  const getDeliveryPricing = () => {
    if (customConfig?.commercialDeliveryPrices) {
      return customConfig.commercialDeliveryPrices.map((delivery: any) => ({
        id: delivery.id,
        label: delivery.label,
        price: delivery.price,
        icon: delivery.icon || "📅"
      }));
    }
    return [
      { id: "standard", label: "Standard Delivery (7-10 days)", price: 0, icon: "📦" },
      { id: "expedited", label: "Expedited Delivery (3-5 days)", price: 200, icon: "📬" },
      { id: "rush", label: "Rush Delivery (24-48 hours)", price: 500, icon: "⚡" },
    ];
  };

  const imageCounts = getImageCountPricing();
  const locations = getLocationPricing();
  const durations = getDurationPricing();
  const addOnOptions = getEnhancementPricing();
  const deliverySpeeds = getDeliveryPricing();

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    
    // Get base price from selected project type
    const selectedProject = projectTypes.find(p => p.id === formData.projectType);
    const basePrice = selectedProject?.price || customConfig?.basePrice || 500;
    
    let imageAdd = 0;
    let durationAdd = 0;
    let locationAdd = 0;
    let addOnsTotal = 0;
    let deliveryAdd = 0;
    const breakdown: string[] = [`Base package (${selectedProject?.label || 'Product Photography'}): ${currencySymbol}${basePrice}`];

    // Image count pricing
    const images = imageCounts.find(i => i.id === formData.imageCount);
    if (images && images.price > 0) {
      imageAdd = images.price;
      breakdown.push(`${images.label}: ${currencySymbol}${imageAdd}`);
    }

    // Duration pricing
    const duration = durations.find(d => d.id === formData.duration);
    if (duration && duration.price > 0) {
      durationAdd = duration.price;
      breakdown.push(`${duration.label}: ${currencySymbol}${durationAdd}`);
    }

    // Location pricing
    const location = locations.find(l => l.id === formData.location);
    if (location && location.price > 0) {
      locationAdd = location.price;
      breakdown.push(`${location.label}: ${currencySymbol}${locationAdd}`);
    }

    // Add-ons pricing - use dynamic pricing from configuration
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn && addOn.price > 0) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: ${currencySymbol}${addOn.price}`);
      }
    });

    // Delivery speed pricing
    const delivery = deliverySpeeds.find(d => d.id === formData.deliverySpeed);
    if (delivery && delivery.price > 0) {
      deliveryAdd = delivery.price;
      breakdown.push(`${delivery.label}: ${currencySymbol}${deliveryAdd}`);
    }

    const subtotal = basePrice + imageAdd + durationAdd + locationAdd + addOnsTotal + deliveryAdd;
    
    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "commercial10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice: basePrice,
      imageAdd,
      durationAdd,
      locationAdd,
      addOnsTotal,
      deliveryAdd,
      subtotal,
      discount,
      total,
      breakdown,
      currency,
      currencySymbol,
    };
  };

  const pricing = calculatePricing();

  const parseNaturalLanguage = () => {
    const input = formData.naturalLanguageInput.toLowerCase();
    const newFormData = { ...formData };

    // Parse project type
    if (input.includes("product")) newFormData.projectType = "product";
    else if (input.includes("lifestyle") || input.includes("brand")) newFormData.projectType = "branding";
    else if (input.includes("headshot") || input.includes("corporate")) newFormData.projectType = "headshots";
    else if (input.includes("editorial") || input.includes("magazine")) newFormData.projectType = "editorial";
    else if (input.includes("advertising") || input.includes("campaign")) newFormData.projectType = "advertising";
    else newFormData.projectType = "product";

    // Parse image count
    const imageMatch = input.match(/(\d+)\s*(?:image|photo|shot)/);
    if (imageMatch) {
      const count = parseInt(imageMatch[1]);
      if (count <= 5) newFormData.imageCount = "1-5";
      else if (count <= 15) newFormData.imageCount = "6-15";
      else if (count <= 30) newFormData.imageCount = "16-30";
      else newFormData.imageCount = "30+";
    } else {
      newFormData.imageCount = "6-15";
    }

    // Parse location
    if (input.includes("location") || input.includes("office") || input.includes("warehouse") || input.includes("outdoor")) {
      newFormData.location = "on-location";
    } else if (input.includes("hybrid") || input.includes("multiple")) {
      newFormData.location = "hybrid";
    } else {
      newFormData.location = "studio";
    }

    // Parse duration
    if (input.includes("full day") || input.includes("8 hour")) {
      newFormData.duration = "full-day";
    } else if (input.includes("half day") || input.includes("4 hour")) {
      newFormData.duration = "half-day";
    } else if (input.includes("multi") || input.includes("several day")) {
      newFormData.duration = "multi-day";
    } else {
      newFormData.duration = "1-hour";
    }

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("creative") || input.includes("art direct")) newAddOns.push("creative-director");
    if (input.includes("stylist") || input.includes("wardrobe")) newAddOns.push("stylist");
    if (input.includes("props") || input.includes("set design")) newAddOns.push("set-design");
    if (input.includes("casting") || input.includes("model")) newAddOns.push("casting");
    if (input.includes("advanced retouch")) newAddOns.push("advanced-retouching");
    else if (input.includes("retouch")) newAddOns.push("basic-retouching");
    if (input.includes("global")) newAddOns.push("global-rights");
    else if (input.includes("national")) newAddOns.push("national-rights");
    else if (input.includes("local")) newAddOns.push("local-rights");
    newFormData.addOns = newAddOns;

    // Parse delivery speed
    if (input.includes("same day")) {
      newFormData.deliverySpeed = "same-day";
    } else if (input.includes("rush") || input.includes("48") || input.includes("urgent")) {
      newFormData.deliverySpeed = "rush";
    } else {
      newFormData.deliverySpeed = "standard";
    }

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
    popular = false,
    onLabelEdit,
    onPriceEdit 
  }: { 
    option: any; 
    selected: boolean; 
    onClick: () => void; 
    icon?: string; 
    popular?: boolean;
    onLabelEdit?: (newLabel: string) => void;
    onPriceEdit?: (newPrice: number) => void;
  }) => (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
        selected 
          ? "border-slate-700 bg-slate-50 shadow-md" 
          : "border-slate-200 hover:border-slate-400 bg-white"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-slate-700 text-white text-xs font-semibold">
          <EditableText
            value={textConfig.popularBadge || "Popular"}
            onSave={(value) => updateTextContent('popularBadge', value)}
            className="text-xs font-semibold"
            isPreview={isPreview}
            placeholder="Enter badge text"
          />
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2">{icon}</div>}
        <div className="font-semibold text-slate-800">
          {onLabelEdit ? (
            <EditableText
              value={option.label}
              onSave={onLabelEdit}
              className="font-semibold text-slate-800"
              isPreview={isPreview}
              placeholder="Enter option label"
            />
          ) : (
            option.label
          )}
        </div>
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-slate-600 mt-1">
            +€
            {onPriceEdit ? (
              <EditableText
                value={option.price.toString()}
                onSave={(value) => onPriceEdit(parseInt(value) || 0)}
                className="text-sm text-slate-600 inline"
                isPreview={isPreview}
                placeholder="Enter price"
              />
            ) : (
              option.price
            )}
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Project & Images", completed: !!formData.projectType && !!formData.imageCount },
    { number: 2, title: "Location & Duration", completed: !!formData.location && !!formData.duration },
    { number: 3, title: "Add-ons & Delivery", completed: !!formData.deliverySpeed },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <EditableText
            value={customConfig?.mainTitle || textConfig.mainTitle || "Commercial Photography Calculator"}
            onSave={(value) => updateTextContent('mainTitle', value)}
            className="text-4xl font-display text-slate-800 mb-2 block"
            isPreview={isPreview}
            placeholder="Enter main title"
          />
          <EditableText
            value={customConfig?.subtitle || customConfig?.mainSubtitle || textConfig.mainSubtitle || "Professional commercial photography with transparent pricing. Get your custom quote instantly."}
            onSave={(value) => updateTextContent('mainSubtitle', value)}
            className="text-slate-600 max-w-2xl mx-auto font-body"
            isPreview={isPreview}
            placeholder="Enter subtitle"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-slate-200">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : currentStep === step.number
                          ? "bg-slate-700 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-slate-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-slate-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Project & Images */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Briefcase className="h-6 w-6 mr-2 text-slate-700" />
                      <EditableText
                        value={customConfig?.step1Title || textConfig.step1Title || "Tell us about your project"}
                        onSave={(value) => updateTextContent('step1Title', value)}
                        className="text-2xl font-display text-slate-800"
                        isPreview={isPreview}
                        placeholder="Enter step 1 title"
                      />
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <EditableText
                        value={customConfig?.descriptionLabel || textConfig.descriptionLabel || "Describe your project (optional)"}
                        onSave={(value) => updateTextContent('descriptionLabel', value)}
                        className="block text-sm font-body text-slate-700 mb-2"
                        isPreview={isPreview}
                        placeholder="Enter description label"
                      />
                      <Textarea
                        placeholder="e.g., Lifestyle brand shoot, full day, with props and 20 final images"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-slate-200 mb-3 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-slate-700 hover:bg-slate-800 text-white border-0 font-body font-semibold"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        <EditableText
                          value={textConfig.aiButtonText || "Calculate with AI"}
                          onSave={(value) => updateTextContent('aiButtonText', value)}
                          className="font-body font-semibold"
                          isPreview={isPreview}
                          placeholder="Enter button text"
                        />
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <EditableText
                          value={textConfig.projectTypeTitle || "Project Type"}
                          onSave={(value) => updateTextContent('projectTypeTitle', value)}
                          className="text-lg font-display text-slate-700 mb-3 block"
                          isPreview={isPreview}
                          placeholder="Enter project type title"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {projectTypes.map((project) => (
                            <OptionCard
                              key={project.id}
                              option={project}
                              selected={formData.projectType === project.id}
                              onClick={() => setFormData(prev => ({ ...prev, projectType: project.id }))}
                              icon={project.icon}
                              popular={project.popular}
                              onLabelEdit={(newLabel) => updateProjectType(project.id, 'label', newLabel)}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <EditableText
                          value={textConfig.imageCountTitle || "Number of Final Images Required"}
                          onSave={(value) => updateTextContent('imageCountTitle', value)}
                          className="text-lg font-display text-slate-700 mb-3 block"
                          isPreview={isPreview}
                          placeholder="Enter image count title"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          {imageCounts.map((count) => (
                            <OptionCard
                              key={count.id}
                              option={count}
                              selected={formData.imageCount === count.id}
                              onClick={() => setFormData(prev => ({ ...prev, imageCount: count.id }))}
                              icon={count.icon}
                              popular={count.popular}
                              onLabelEdit={(newLabel) => updateImageCount(count.id, 'label', newLabel)}
                              onPriceEdit={(newPrice) => updateImageCount(count.id, 'price', newPrice)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.projectType || !formData.imageCount}
                      className="bg-slate-700 hover:bg-slate-800 text-white px-8 font-semibold"
                    >
                      <EditableText
                        value={textConfig.nextStepButton1 || "Next Step"}
                        onSave={(value) => updateTextContent('nextStepButton1', value)}
                        className="px-8 font-semibold"
                        isPreview={isPreview}
                        placeholder="Enter next step button text"
                      />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Duration */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <MapPin className="h-6 w-6 mr-2 text-slate-700" />
                      <EditableText
                        value={textConfig.step2Title || "Location & shoot duration"}
                        onSave={(value) => updateTextContent('step2Title', value)}
                        className="text-2xl font-display text-slate-800"
                        isPreview={isPreview}
                        placeholder="Enter step 2 title"
                      />
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <EditableText
                          value={textConfig.locationTitle || "Shooting Location"}
                          onSave={(value) => updateTextContent('locationTitle', value)}
                          className="text-lg font-display text-slate-700 mb-3 block"
                          isPreview={isPreview}
                          placeholder="Enter location title"
                        />
                        <div className="grid grid-cols-1 gap-4">
                          {locations.map((location) => (
                            <OptionCard
                              key={location.id}
                              option={location}
                              selected={formData.location === location.id}
                              onClick={() => setFormData(prev => ({ ...prev, location: location.id }))}
                              icon={location.icon}
                              onLabelEdit={(newLabel) => updateLocation(location.id, 'label', newLabel)}
                              onPriceEdit={(newPrice) => updateLocation(location.id, 'price', newPrice)}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <EditableText
                          value={textConfig.durationTitle || "Shoot Duration"}
                          onSave={(value) => updateTextContent('durationTitle', value)}
                          className="text-lg font-display text-slate-700 mb-3 block"
                          isPreview={isPreview}
                          placeholder="Enter duration title"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          {durations.map((duration) => (
                            <OptionCard
                              key={duration.id}
                              option={duration}
                              selected={formData.duration === duration.id}
                              onClick={() => setFormData(prev => ({ ...prev, duration: duration.id }))}
                              icon={duration.icon}
                              popular={duration.popular}
                              onLabelEdit={(newLabel) => updateDuration(duration.id, 'label', newLabel)}
                              onPriceEdit={(newPrice) => updateDuration(duration.id, 'price', newPrice)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="px-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      <EditableText
                        value={textConfig.previousButton2 || "Previous"}
                        onSave={(value) => updateTextContent('previousButton2', value)}
                        className=""
                        isPreview={isPreview}
                        placeholder="Enter previous button text"
                      />
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.location || !formData.duration}
                      className="bg-slate-700 hover:bg-slate-800 text-white px-8 font-semibold"
                    >
                      <EditableText
                        value={textConfig.nextStepButton2 || "Next Step"}
                        onSave={(value) => updateTextContent('nextStepButton2', value)}
                        className="px-8 font-semibold"
                        isPreview={isPreview}
                        placeholder="Enter next step button text"
                      />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Add-ons & Delivery */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Image className="h-6 w-6 mr-2 text-slate-700" />
                      <EditableText
                        value={textConfig.step3Title || "Add-ons & delivery options"}
                        onSave={(value) => updateTextContent('step3Title', value)}
                        className="text-2xl font-display text-slate-800"
                        isPreview={isPreview}
                        placeholder="Enter step 3 title"
                      />
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <EditableText
                          value={textConfig.addOnsTitle || "Add-ons (Optional)"}
                          onSave={(value) => updateTextContent('addOnsTitle', value)}
                          className="text-lg font-display text-slate-700 mb-3 block"
                          isPreview={isPreview}
                          placeholder="Enter add-ons title"
                        />
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
                              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-slate-700 bg-slate-50 shadow-md"
                                  : "border-slate-200 hover:border-slate-400 bg-white"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-slate-700 text-white text-xs font-semibold">
                                  <EditableText
                                    value={textConfig.popularBadge || "Popular"}
                                    onSave={(value) => updateTextContent('popularBadge', value)}
                                    className="text-xs font-semibold"
                                    isPreview={isPreview}
                                    placeholder="Enter badge text"
                                  />
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold text-slate-800">
                                  <EditableText
                                    value={addOn.label}
                                    onSave={(newLabel) => updateAddOn(addOn.id, 'label', newLabel)}
                                    className="font-semibold text-slate-800"
                                    isPreview={isPreview}
                                    placeholder="Enter add-on label"
                                  />
                                </div>
                                <div className="text-slate-600 font-semibold">
                                  +€<EditableText
                                    value={addOn.price.toString()}
                                    onSave={(newPrice) => updateAddOn(addOn.id, 'price', parseInt(newPrice) || 0)}
                                    className="text-slate-600 font-semibold inline"
                                    isPreview={isPreview}
                                    placeholder="Enter price"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Service Button */}
                        <div className="mt-4">
                          <Button
                            onClick={() => {
                              // Add a custom service - this could open a modal or add a new entry
                              const newService = {
                                id: `custom-${Date.now()}`,
                                label: "Custom Service",
                                price: 0
                              };
                              // For now, just add it to the add-ons list if not present
                              if (!formData.addOns.includes(newService.id)) {
                                setFormData(prev => ({ ...prev, addOns: [...prev.addOns, newService.id] }));
                              }
                            }}
                            variant="outline"
                            className="w-full border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                          >
                            <EditableText
                              value={textConfig.addServiceButton || "+ Add Service"}
                              onSave={(value) => updateTextContent('addServiceButton', value)}
                              className="font-medium"
                              isPreview={isPreview}
                              placeholder="Enter add service button text"
                            />
                          </Button>
                        </div>

                        {formData.addOns.length > 0 && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <EditableText
                              value={textConfig.mostBookedText || "📸 Most booked: Full-day lifestyle + casting + creative director"}
                              onSave={(value) => updateTextContent('mostBookedText', value)}
                              className="text-sm text-green-700"
                              isPreview={isPreview}
                              placeholder="Enter most booked text"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <EditableText
                          value={textConfig.deliveryTitle || "Delivery Speed"}
                          onSave={(value) => updateTextContent('deliveryTitle', value)}
                          className="text-lg font-display text-slate-700 mb-3 block"
                          isPreview={isPreview}
                          placeholder="Enter delivery title"
                        />
                        <div className="grid grid-cols-1 gap-4">
                          {deliverySpeeds.map((speed) => (
                            <OptionCard
                              key={speed.id}
                              option={speed}
                              selected={formData.deliverySpeed === speed.id}
                              onClick={() => setFormData(prev => ({ ...prev, deliverySpeed: speed.id }))}
                              icon={speed.icon}
                              onLabelEdit={(newLabel) => updateDeliverySpeed(speed.id, 'label', newLabel)}
                              onPriceEdit={(newPrice) => updateDeliverySpeed(speed.id, 'price', newPrice)}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <EditableText
                          value={textConfig.promoCodeTitle || "Promo Code (Optional)"}
                          onSave={(value) => updateTextContent('promoCodeTitle', value)}
                          className="text-lg font-display text-slate-700 mb-3 block"
                          isPreview={isPreview}
                          placeholder="Enter promo code title"
                        />
                        <Input
                          placeholder={textConfig.promoCodePlaceholder || "Enter promo code (e.g., COMMERCIAL10)"}
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      <EditableText
                        value={textConfig.previousButton3 || "Previous"}
                        onSave={(value) => updateTextContent('previousButton3', value)}
                        className=""
                        isPreview={isPreview}
                        placeholder="Enter previous button text"
                      />
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.deliverySpeed}
                      className="bg-slate-700 hover:bg-slate-800 text-white px-8 font-semibold"
                    >
                      <EditableText
                        value={textConfig.nextStepButton3 || "Next Step"}
                        onSave={(value) => updateTextContent('nextStepButton3', value)}
                        className="px-8 font-semibold"
                        isPreview={isPreview}
                        placeholder="Enter next step button text"
                      />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Contact Details */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-slate-700" />
                      <EditableText
                        value={textConfig.step4Title || "Get your detailed quote"}
                        onSave={(value) => updateTextContent('step4Title', value)}
                        className="text-2xl font-display text-slate-800"
                        isPreview={isPreview}
                        placeholder="Enter step 4 title"
                      />
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <EditableText
                          value={textConfig.fullNameLabel || "Full Name"}
                          onSave={(value) => updateTextContent('fullNameLabel', value)}
                          className="block text-sm font-medium text-slate-700 mb-2"
                          isPreview={isPreview}
                          placeholder="Enter full name label"
                        />
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder={textConfig.fullNamePlaceholder || "Your full name"}
                            value={formData.contactInfo.name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, name: e.target.value }
                            }))}
                            className="pl-10 border-slate-300"
                          />
                        </div>
                      </div>

                      <div>
                        <EditableText
                          value={textConfig.emailLabel || "Email Address *"}
                          onSave={(value) => updateTextContent('emailLabel', value)}
                          className="block text-sm font-medium text-slate-700 mb-2"
                          isPreview={isPreview}
                          placeholder="Enter email label"
                        />
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            type="email"
                            placeholder={textConfig.emailPlaceholder || "your.email@example.com"}
                            value={formData.contactInfo.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value }
                            }))}
                            className="pl-10 border-slate-300"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <EditableText
                          value={textConfig.phoneLabel || "Phone Number"}
                          onSave={(value) => updateTextContent('phoneLabel', value)}
                          className="block text-sm font-medium text-slate-700 mb-2"
                          isPreview={isPreview}
                          placeholder="Enter phone label"
                        />
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder={textConfig.phonePlaceholder || "+353 xxx xxx xxx"}
                            value={formData.contactInfo.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, phone: e.target.value }
                            }))}
                            className="pl-10 border-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      <EditableText
                        value={textConfig.previousButton4 || "Previous"}
                        onSave={(value) => updateTextContent('previousButton4', value)}
                        className=""
                        isPreview={isPreview}
                        placeholder="Enter previous button text"
                      />
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 font-semibold"
                    >
                      <EditableText
                        value={textConfig.getQuoteButton || "Get Quote"}
                        onSave={(value) => updateTextContent('getQuoteButton', value)}
                        className="px-8 font-semibold"
                        isPreview={isPreview}
                        placeholder="Enter get quote button text"
                      />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-slate-200 sticky top-8">
              <EditableText
                value={textConfig.quoteTitle || "Your Commercial Shoot Quote"}
                onSave={(value) => updateTextContent('quoteTitle', value)}
                className="text-xl font-display text-slate-800 mb-4 block"
                isPreview={isPreview}
                placeholder="Enter quote title"
              />
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-slate-700">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 1 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-slate-600">
                        <span>{item.split(': ')[0]}</span>
                        <span>{item.split(': ')[1]}</span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-center space-y-4">
                    <EditableText
                      value={textConfig.bookingTitle || "Ready to Book This Shoot?"}
                      onSave={(value) => updateTextContent('bookingTitle', value)}
                      className="text-lg font-display text-slate-800 block"
                      isPreview={isPreview}
                      placeholder="Enter booking title"
                    />
                    <EditableText
                      value={textConfig.bookingDescription || "This quote is valid for 72 hours. Let's create stunning commercial photography together."}
                      onSave={(value) => updateTextContent('bookingDescription', value)}
                      className="text-sm text-slate-600"
                      isPreview={isPreview}
                      placeholder="Enter booking description"
                    />
                    
                    <Button 
                      className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Commercial Photography Booking";
                        const body = `I'm ready to book my commercial photography session! My quote is €${pricing.total.toLocaleString()}`;
                        const mailtoUrl = `mailto:info@commercialstudio.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      <EditableText
                        value={textConfig.bookingButton || "📸 Book This Shoot"}
                        onSave={(value) => updateTextContent('bookingButton', value)}
                        className="w-full py-3 font-semibold"
                        isPreview={isPreview}
                        placeholder="Enter booking button text"
                      />
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        <EditableText
                          value={textConfig.qualityIndicator1 || "Professional Quality"}
                          onSave={(value) => updateTextContent('qualityIndicator1', value)}
                          className="text-xs text-slate-500"
                          isPreview={isPreview}
                          placeholder="Enter quality indicator"
                        />
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-slate-500 rounded-full mr-1"></div>
                        <EditableText
                          value={textConfig.qualityIndicator2 || "Licensed & Insured"}
                          onSave={(value) => updateTextContent('qualityIndicator2', value)}
                          className="text-xs text-slate-500"
                          isPreview={isPreview}
                          placeholder="Enter quality indicator"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-slate-200 mt-4">
                    <div className="text-center">
                      <EditableText
                        value={textConfig.quoteLocked || "Quote Locked!"}
                        onSave={(value) => updateTextContent('quoteLocked', value)}
                        className="text-lg font-bold text-green-600 mb-2 block"
                        isPreview={isPreview}
                        placeholder="Enter quote locked text"
                      />
                      <div className="flex items-center justify-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <EditableText
                          value={textConfig.validityText || "Valid for 72 hours"}
                          onSave={(value) => updateTextContent('validityText', value)}
                          className="text-sm text-slate-600"
                          isPreview={isPreview}
                          placeholder="Enter validity text"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-slate-300 text-slate-600 hover:bg-slate-50"
                        onClick={downloadQuotePDF}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        <EditableText
                          value={textConfig.downloadButton || "Download Quote PDF"}
                          onSave={(value) => updateTextContent('downloadButton', value)}
                          className=""
                          isPreview={isPreview}
                          placeholder="Enter download button text"
                        />
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