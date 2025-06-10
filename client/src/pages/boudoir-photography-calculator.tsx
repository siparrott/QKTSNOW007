import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuoteKitHeader } from "@/components/calculator-header";
import { ArrowLeft, Camera, Heart, Star, Clock, Mail, ArrowRight, Check, Crown, MapPin, Home, Building, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface BoudoirFormData {
  sessionType: string;
  duration: string;
  location: string;
  outfitCount: string;
  addOns: string[];
  naturalLanguageInput: string;
  promoCode: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

interface PricingBreakdown {
  basePrice: number;
  sessionTypeAdd: number;
  durationAdd: number;
  locationAdd: number;
  outfitAdd: number;
  addOnsCost: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

const pricingConfig = {
  basePrice: 250,
  sessionTypes: {
    classic: 0,
    lingerie: 25,
    nude: 50,
    glamour: 35
  },
  durations: {
    "1hr": 0,
    "2hr": 75,
    "3hr": 150
  },
  locations: {
    studio: 0,
    hotel: 100,
    location: 100
  },
  outfitPricing: {
    "1": 0,
    "2": 50,
    "3": 100,
    "4": 150,
    "5": 200
  },
  addOns: {
    makeup: 60,
    album: 120,
    "deluxe-retouching": 75
  },
  promoCodes: {
    BOUDOIR10: 0.1,
    NEWCLIENT: 0.15,
    GODDESS: 0.2
  }
};

export default function BoudoirPhotographyCalculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BoudoirFormData>({
    sessionType: "",
    duration: "",
    location: "",
    outfitCount: "",
    addOns: [],
    naturalLanguageInput: "",
    promoCode: "",
    contactInfo: {
      name: "",
      email: "",
      phone: ""
    }
  });

  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);

  const totalSteps = 4;

  const calculatePricing = (): PricingBreakdown => {
    let total = pricingConfig.basePrice;
    const breakdown: string[] = [`Base Session (1hr, studio, 1 outfit): €${pricingConfig.basePrice}`];

    // Session type
    const sessionTypeAdd = pricingConfig.sessionTypes[formData.sessionType as keyof typeof pricingConfig.sessionTypes] || 0;
    if (sessionTypeAdd > 0) {
      total += sessionTypeAdd;
      const sessionName = formData.sessionType.charAt(0).toUpperCase() + formData.sessionType.slice(1);
      breakdown.push(`${sessionName} Session: +€${sessionTypeAdd}`);
    }

    // Duration
    const durationAdd = pricingConfig.durations[formData.duration as keyof typeof pricingConfig.durations] || 0;
    if (durationAdd > 0) {
      total += durationAdd;
      breakdown.push(`${formData.duration} Duration: +€${durationAdd}`);
    }

    // Location
    const locationAdd = pricingConfig.locations[formData.location as keyof typeof pricingConfig.locations] || 0;
    if (locationAdd > 0) {
      total += locationAdd;
      const locationName = formData.location === "location" ? "On-Location" : "Hotel Suite";
      breakdown.push(`${locationName}: +€${locationAdd}`);
    }

    // Outfits
    const outfitAdd = pricingConfig.outfitPricing[formData.outfitCount as keyof typeof pricingConfig.outfitPricing] || 0;
    if (outfitAdd > 0) {
      total += outfitAdd;
      breakdown.push(`${formData.outfitCount} Outfits: +€${outfitAdd}`);
    }

    // Add-ons
    let addOnsCost = 0;
    formData.addOns.forEach(addOnId => {
      const cost = pricingConfig.addOns[addOnId as keyof typeof pricingConfig.addOns];
      if (cost) {
        addOnsCost += cost;
        let label = addOnId.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        if (addOnId === "deluxe-retouching") label = "Deluxe Retouching";
        breakdown.push(`${label}: +€${cost}`);
      }
    });
    total += addOnsCost;

    const subtotal = total;

    // Promo code
    let discount = 0;
    if (formData.promoCode) {
      const discountRate = pricingConfig.promoCodes[formData.promoCode.toUpperCase() as keyof typeof pricingConfig.promoCodes];
      if (discountRate) {
        discount = subtotal * discountRate;
        total -= discount;
        breakdown.push(`Promo Code (${formData.promoCode.toUpperCase()}): -€${discount.toFixed(0)}`);
      }
    }

    return {
      basePrice: pricingConfig.basePrice,
      sessionTypeAdd,
      durationAdd,
      locationAdd,
      outfitAdd,
      addOnsCost,
      subtotal,
      discount,
      total: Math.round(total),
      breakdown
    };
  };

  useEffect(() => {
    setPricing(calculatePricing());
  }, [formData]);

  const parseNaturalLanguage = () => {
    const input = formData.naturalLanguageInput.toLowerCase();
    const updates: Partial<BoudoirFormData> = {};
    
    // Duration parsing
    if (input.includes("2 hour") || input.includes("2hr") || input.includes("two hour")) updates.duration = "2hr";
    else if (input.includes("3 hour") || input.includes("3hr") || input.includes("three hour")) updates.duration = "3hr";
    else if (input.includes("1 hour") || input.includes("1hr") || input.includes("one hour")) updates.duration = "1hr";
    
    // Location parsing
    if (input.includes("hotel")) updates.location = "hotel";
    else if (input.includes("location") || input.includes("on-location") || input.includes("outdoor")) updates.location = "location";
    else if (input.includes("studio")) updates.location = "studio";
    
    // Session type parsing
    if (input.includes("lingerie")) updates.sessionType = "lingerie";
    else if (input.includes("nude") || input.includes("artistic")) updates.sessionType = "nude";
    else if (input.includes("glamour") || input.includes("fashion")) updates.sessionType = "glamour";
    else if (input.includes("classic") || input.includes("traditional")) updates.sessionType = "classic";
    
    // Outfit count parsing
    if (input.includes("5 outfit") || input.includes("five outfit")) updates.outfitCount = "5";
    else if (input.includes("4 outfit") || input.includes("four outfit")) updates.outfitCount = "4";
    else if (input.includes("3 outfit") || input.includes("three outfit")) updates.outfitCount = "3";
    else if (input.includes("2 outfit") || input.includes("two outfit")) updates.outfitCount = "2";
    else if (input.includes("1 outfit") || input.includes("one outfit")) updates.outfitCount = "1";
    
    // Add-ons parsing
    const addOns = [];
    if (input.includes("makeup") || input.includes("make up")) addOns.push("makeup");
    if (input.includes("album") || input.includes("book")) addOns.push("album");
    if (input.includes("deluxe") || input.includes("premium retouching") || input.includes("advanced editing")) addOns.push("deluxe-retouching");
    if (addOns.length > 0) updates.addOns = addOns;
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContactSubmit = () => {
    if (formData.contactInfo.name && formData.contactInfo.email) {
      setIsQuoteLocked(true);
    }
  };

  const downloadQuotePDF = () => {
    const quoteText = `
Boudoir Photography Quote
Client: ${formData.contactInfo.name}
Email: ${formData.contactInfo.email}

Session Details:
- Type: ${formData.sessionType}
- Duration: ${formData.duration}
- Location: ${formData.location}
- Outfits: ${formData.outfitCount}
- Add-ons: ${formData.addOns.join(", ")}

Investment Total: €${pricing?.total}
${pricing?.breakdown.join("\n")}

This quote is valid for 48 hours.
    `;
    
    const blob = new Blob([quoteText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boudoir-quote-${formData.contactInfo.name.replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              i + 1 < currentStep
                ? "bg-pink-500 text-white"
                : i + 1 === currentStep
                ? "bg-pink-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {i + 1 < currentStep ? <Check className="w-5 h-5" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-16 h-1 mx-2 ${i + 1 < currentStep ? "bg-pink-500" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );

  const OptionCard = ({ 
    icon, 
    title, 
    subtitle, 
    price, 
    isSelected, 
    onClick, 
    isPopular = false 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    price?: string;
    isSelected: boolean;
    onClick: () => void;
    isPopular?: boolean;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-pink-400 bg-pink-50 shadow-lg"
          : "border-gray-200 bg-white hover:border-pink-200 hover:shadow-md"
      }`}
      onClick={onClick}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Most Popular
          </div>
        </div>
      )}
      <div className="text-center">
        <div className={`mx-auto mb-3 ${isSelected ? "text-pink-500" : "text-gray-400"}`}>
          {icon}
        </div>
        <h3 className={`font-semibold mb-1 ${isSelected ? "text-pink-700" : "text-gray-700"}`}>
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
        {price && (
          <p className="text-pink-500 font-medium text-sm">{price}</p>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/niches">
              <Button variant="ghost" size="sm" className="mr-4 text-pink-600 hover:text-pink-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Calculators
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full flex items-center justify-center">
                <Camera className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 font-serif">Boudoir Photography Calculator</h1>
                <p className="text-pink-600">Create your perfect session</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <StepIndicator />
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Step Content */}
            <div className="order-2 lg:order-1">
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-pink-100 shadow-lg min-h-[500px]">
                <AnimatePresence mode="wait">
                  {/* Step 1: Session Style */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 font-serif mb-6">Choose Your Session Style</h2>
                      
                      {/* Natural Language Input */}
                      <div className="mb-8 bg-pink-50/80 border border-pink-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <Sparkles className="h-5 w-5 text-pink-500 mr-2" />
                          <h3 className="text-pink-700 font-semibold font-serif">Describe Your Vision (Optional)</h3>
                        </div>
                        <Textarea
                          placeholder="e.g., 'I want a 2-hour boudoir shoot at a hotel with 3 outfits and professional makeup'"
                          value={formData.naturalLanguageInput}
                          onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                          className="bg-white/80 border-pink-200 mb-3 font-serif resize-none"
                          rows={2}
                        />
                        <Button 
                          onClick={parseNaturalLanguage}
                          variant="outline" 
                          size="sm" 
                          className="border-pink-300 text-pink-600 hover:bg-pink-50 font-serif"
                          disabled={!formData.naturalLanguageInput.trim()}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Calculate with AI
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <OptionCard
                          icon={<Star className="w-8 h-8" />}
                          title="Classic"
                          subtitle="Timeless elegance"
                          isSelected={formData.sessionType === "classic"}
                          onClick={() => setFormData(prev => ({ ...prev, sessionType: "classic" }))}
                        />
                        <OptionCard
                          icon={<Heart className="w-8 h-8" />}
                          title="Lingerie"
                          subtitle="Intimate beauty"
                          price="+€25"
                          isSelected={formData.sessionType === "lingerie"}
                          onClick={() => setFormData(prev => ({ ...prev, sessionType: "lingerie" }))}
                        />
                        <OptionCard
                          icon={<Star className="w-8 h-8" />}
                          title="Nude"
                          subtitle="Artistic celebration"
                          price="+€50"
                          isSelected={formData.sessionType === "nude"}
                          onClick={() => setFormData(prev => ({ ...prev, sessionType: "nude" }))}
                        />
                        <OptionCard
                          icon={<Crown className="w-8 h-8" />}
                          title="Glamour"
                          subtitle="High-fashion drama"
                          price="+€35"
                          isSelected={formData.sessionType === "glamour"}
                          onClick={() => setFormData(prev => ({ ...prev, sessionType: "glamour" }))}
                        />
                      </div>
                      
                      <div className="flex justify-end pt-6">
                        <Button
                          onClick={handleNext}
                          disabled={!formData.sessionType}
                          className="bg-pink-500 hover:bg-pink-600 text-white px-8"
                        >
                          Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Duration & Location */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 font-serif">Duration & Location</h2>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Session Duration</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <OptionCard
                            icon={<Clock className="w-6 h-6" />}
                            title="1 Hour"
                            subtitle="Perfect for beginners"
                            isSelected={formData.duration === "1hr"}
                            onClick={() => setFormData(prev => ({ ...prev, duration: "1hr" }))}
                          />
                          <OptionCard
                            icon={<div className="flex"><Clock className="w-6 h-6" /><Clock className="w-6 h-6" /></div>}
                            title="2 Hours"
                            subtitle="Most popular choice"
                            price="+€75"
                            isSelected={formData.duration === "2hr"}
                            onClick={() => setFormData(prev => ({ ...prev, duration: "2hr" }))}
                            isPopular={true}
                          />
                          <OptionCard
                            icon={<div className="flex"><Clock className="w-6 h-6" /><Clock className="w-6 h-6" /><Clock className="w-6 h-6" /></div>}
                            title="3 Hours"
                            subtitle="Ultimate experience"
                            price="+€150"
                            isSelected={formData.duration === "3hr"}
                            onClick={() => setFormData(prev => ({ ...prev, duration: "3hr" }))}
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Location</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <OptionCard
                            icon={<Home className="w-6 h-6" />}
                            title="In-Studio"
                            subtitle="Professional setting"
                            isSelected={formData.location === "studio"}
                            onClick={() => setFormData(prev => ({ ...prev, location: "studio" }))}
                          />
                          <OptionCard
                            icon={<Building className="w-6 h-6" />}
                            title="Hotel Suite"
                            subtitle="Luxury accommodation"
                            price="+€100"
                            isSelected={formData.location === "hotel"}
                            onClick={() => setFormData(prev => ({ ...prev, location: "hotel" }))}
                          />
                          <OptionCard
                            icon={<MapPin className="w-6 h-6" />}
                            title="On-Location"
                            subtitle="Your chosen venue"
                            price="+€100"
                            isSelected={formData.location === "location"}
                            onClick={() => setFormData(prev => ({ ...prev, location: "location" }))}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-6">
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="border-pink-300 text-pink-600"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <Button
                          onClick={handleNext}
                          disabled={!formData.duration || !formData.location}
                          className="bg-pink-500 hover:bg-pink-600 text-white px-8"
                        >
                          Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Outfits & Enhancements */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 font-serif">Outfits & Enhancements</h2>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Number of Outfits</h3>
                        <div className="grid grid-cols-5 gap-3">
                          {["1", "2", "3", "4", "5"].map((count) => (
                            <OptionCard
                              key={count}
                              icon={<span className="text-2xl">👗</span>}
                              title={count}
                              subtitle={count === "1" ? "Outfit" : "Outfits"}
                              price={count !== "1" ? `+€${pricingConfig.outfitPricing[count as keyof typeof pricingConfig.outfitPricing]}` : undefined}
                              isSelected={formData.outfitCount === count}
                              onClick={() => setFormData(prev => ({ ...prev, outfitCount: count }))}
                              isPopular={count === "3"}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Premium Add-ons</h3>
                        <div className="space-y-4">
                          <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.addOns.includes("makeup")
                                ? "border-pink-400 bg-pink-50"
                                : "border-gray-200 hover:border-pink-200"
                            }`}
                            onClick={() => {
                              const addOns = formData.addOns.includes("makeup")
                                ? formData.addOns.filter(a => a !== "makeup")
                                : [...formData.addOns, "makeup"];
                              setFormData(prev => ({ ...prev, addOns }));
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">💄</span>
                                <div>
                                  <h4 className="font-medium">Professional Makeup</h4>
                                  <p className="text-sm text-gray-500">Full makeup application by pro artist</p>
                                </div>
                              </div>
                              <span className="text-pink-500 font-medium">+€60</span>
                            </div>
                          </div>

                          <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.addOns.includes("album")
                                ? "border-pink-400 bg-pink-50"
                                : "border-gray-200 hover:border-pink-200"
                            }`}
                            onClick={() => {
                              const addOns = formData.addOns.includes("album")
                                ? formData.addOns.filter(a => a !== "album")
                                : [...formData.addOns, "album"];
                              setFormData(prev => ({ ...prev, addOns }));
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">📖</span>
                                <div>
                                  <h4 className="font-medium">Printed Album</h4>
                                  <p className="text-sm text-gray-500">20-page premium photo album</p>
                                </div>
                              </div>
                              <span className="text-pink-500 font-medium">+€120</span>
                            </div>
                          </div>

                          <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.addOns.includes("deluxe-retouching")
                                ? "border-pink-400 bg-pink-50"
                                : "border-gray-200 hover:border-pink-200"
                            }`}
                            onClick={() => {
                              const addOns = formData.addOns.includes("deluxe-retouching")
                                ? formData.addOns.filter(a => a !== "deluxe-retouching")
                                : [...formData.addOns, "deluxe-retouching"];
                              setFormData(prev => ({ ...prev, addOns }));
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">✨</span>
                                <div>
                                  <h4 className="font-medium">Deluxe Retouching</h4>
                                  <p className="text-sm text-gray-500">Advanced editing and enhancement</p>
                                </div>
                              </div>
                              <span className="text-pink-500 font-medium">+€75</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-6">
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="border-pink-300 text-pink-600"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <Button
                          onClick={handleNext}
                          disabled={!formData.outfitCount}
                          className="bg-pink-500 hover:bg-pink-600 text-white px-8"
                        >
                          Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Final Details */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 font-serif">Final Details</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Email (required for quote)
                          </label>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={formData.contactInfo.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value }
                            }))}
                            className="bg-white border-pink-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Name
                          </label>
                          <Input
                            placeholder="Your beautiful name"
                            value={formData.contactInfo.name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, name: e.target.value }
                            }))}
                            className="bg-white border-pink-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Promo Code (optional)
                          </label>
                          <Input
                            placeholder="Enter promo code"
                            value={formData.promoCode}
                            onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                            className="bg-white border-pink-200"
                          />
                        </div>

                        <div className="bg-pink-50 p-4 rounded-lg">
                          <p className="text-sm text-pink-700">
                            Your personalized quote will be valid for 48 hours. We'll email you a beautiful PDF with all the details.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between pt-6">
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="border-pink-300 text-pink-600"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <Button
                          onClick={handleContactSubmit}
                          disabled={!formData.contactInfo.email}
                          className="bg-pink-500 hover:bg-pink-600 text-white px-8"
                        >
                          Get My Quote
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>

            {/* Quote Display */}
            <div className="order-1 lg:order-2">
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-pink-100 shadow-lg sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 font-serif mb-4">Your Boudoir Experience</h2>
                
                {pricing && (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl">
                      <div className="text-4xl font-bold text-pink-600 font-serif">€{pricing.total}</div>
                      <div className="text-sm text-gray-600 mt-1">Total Investment</div>
                    </div>

                    <div className="space-y-2">
                      {formData.sessionType && (
                        <div className="flex justify-between text-sm">
                          <span>Base Session (1hr, 1 outfit)</span>
                          <span>€250</span>
                        </div>
                      )}
                      {formData.sessionType && formData.sessionType !== "classic" && (
                        <div className="flex justify-between text-sm">
                          <span>Session Type Upgrade</span>
                          <span>€{pricing.sessionTypeAdd}</span>
                        </div>
                      )}
                      {formData.duration && formData.duration !== "1hr" && (
                        <div className="flex justify-between text-sm">
                          <span>{formData.duration} Duration</span>
                          <span>€{pricing.durationAdd}</span>
                        </div>
                      )}
                      {formData.location && formData.location !== "studio" && (
                        <div className="flex justify-between text-sm">
                          <span>Location</span>
                          <span>€{pricing.locationAdd}</span>
                        </div>
                      )}
                      {formData.outfitCount && formData.outfitCount !== "1" && (
                        <div className="flex justify-between text-sm">
                          <span>{formData.outfitCount} Outfits</span>
                          <span>€{pricing.outfitAdd}</span>
                        </div>
                      )}
                      {formData.addOns.map(addOn => (
                        <div key={addOn} className="flex justify-between text-sm">
                          <span>{addOn === "deluxe-retouching" ? "Deluxe Retouching" : addOn.charAt(0).toUpperCase() + addOn.slice(1)}</span>
                          <span>€{pricingConfig.addOns[addOn as keyof typeof pricingConfig.addOns]}</span>
                        </div>
                      ))}
                      {pricing.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span>-€{pricing.discount.toFixed(0)}</span>
                        </div>
                      )}
                    </div>

                    {formData.duration === "2hr" && formData.outfitCount === "3" && (
                      <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                        <div className="flex items-center text-sm text-pink-700">
                          <Star className="h-4 w-4 mr-2" />
                          Most clients choose 2 hours + makeup + 3 outfits
                        </div>
                      </div>
                    )}

                    {/* Ready to Book Section */}
                    <div className="mt-6 pt-6 border-t border-pink-200">
                      <div className="text-center space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 font-serif">Ready to Book Your Session?</h3>
                        <p className="text-sm text-gray-600">
                          This quote is valid for 48 hours. Secure your preferred date today.
                        </p>
                        
                        <Button 
                          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-serif py-3"
                          onClick={() => window.open(`mailto:studio@example.com?subject=Boudoir Session Booking&body=I'm ready to book my boudoir session! My quote is €${pricing.total}`, "_blank")}
                        >
                          📅 Book My Session
                        </Button>
                        
                        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            100% Confidential
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                            Professional
                          </div>
                        </div>
                      </div>
                    </div>

                    {isQuoteLocked && (
                      <div className="space-y-3 pt-4 border-t border-pink-200 mt-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600 mb-2">Quote Locked!</div>
                          <div className="flex items-center justify-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            Valid for 48 hours
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Button 
                            variant="outline"
                            className="w-full border-pink-300 text-pink-600 hover:bg-pink-50"
                            onClick={downloadQuotePDF}
                          >
                            📄 Download Quote PDF
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}