import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Camera, Sparkles, Heart, Star, Clock, Mail } from "lucide-react";
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
    glamour: 30
  },
  durations: {
    "1hr": 0,
    "2hr": 75,
    "3hr": 150
  },
  locations: {
    studio: 0,
    location: 100,
    hotel: 100
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
  const [formData, setFormData] = useState<BoudoirFormData>({
    sessionType: "classic",
    duration: "2hr",
    location: "studio",
    outfitCount: "3",
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
  const [showContactForm, setShowContactForm] = useState(false);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);

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
    if (input.includes("2 hour") || input.includes("2hr")) updates.duration = "2hr";
    else if (input.includes("3 hour") || input.includes("3hr")) updates.duration = "3hr";
    else if (input.includes("1 hour") || input.includes("1hr")) updates.duration = "1hr";
    
    // Location parsing
    if (input.includes("hotel")) updates.location = "hotel";
    else if (input.includes("location") || input.includes("on-location")) updates.location = "location";
    else if (input.includes("studio")) updates.location = "studio";
    
    // Session type parsing
    if (input.includes("lingerie")) updates.sessionType = "lingerie";
    else if (input.includes("nude")) updates.sessionType = "nude";
    else if (input.includes("glamour")) updates.sessionType = "glamour";
    
    // Outfit count parsing
    if (input.includes("5 outfit")) updates.outfitCount = "5";
    else if (input.includes("4 outfit")) updates.outfitCount = "4";
    else if (input.includes("3 outfit")) updates.outfitCount = "3";
    else if (input.includes("2 outfit")) updates.outfitCount = "2";
    else if (input.includes("1 outfit")) updates.outfitCount = "1";
    
    // Add-ons parsing
    const addOns = [];
    if (input.includes("makeup")) addOns.push("makeup");
    if (input.includes("album")) addOns.push("album");
    if (input.includes("deluxe") || input.includes("premium retouching")) addOns.push("deluxe-retouching");
    if (addOns.length > 0) updates.addOns = addOns;
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleContactSubmit = () => {
    if (formData.contactInfo.name && formData.contactInfo.email) {
      setIsQuoteLocked(true);
      // In production, this would save to database and send email
      console.log("Quote locked and contact info saved:", formData.contactInfo, pricing);
    }
  };

  const downloadQuotePDF = () => {
    // In production, this would generate a PDF
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-rose-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/niches">
              <Button variant="ghost" size="sm" className="mr-4 text-rose-600 hover:text-rose-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Calculators
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full flex items-center justify-center">
                <Camera className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-rose-900 font-serif">Boudoir Photography Calculator</h1>
                <p className="text-rose-600">Intimate and artistic photography sessions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Calculator Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 bg-white/70 backdrop-blur-sm border-rose-200 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-rose-900 font-serif">Design Your Session</h2>
              
              <div className="space-y-6">
                {/* Natural Language Input */}
                <div className="bg-rose-50/80 border border-rose-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Sparkles className="h-5 w-5 text-rose-500 mr-2" />
                    <Label className="text-rose-700 font-semibold font-serif">Describe Your Vision (Optional)</Label>
                  </div>
                  <Textarea
                    placeholder="e.g., 'I want a 2-hour boudoir shoot at a hotel with 3 outfits and professional makeup'"
                    value={formData.naturalLanguageInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                    className="bg-white/80 border-rose-200 mb-3 font-serif"
                    rows={2}
                  />
                  <Button 
                    onClick={parseNaturalLanguage}
                    variant="outline" 
                    size="sm" 
                    className="border-rose-300 text-rose-600 hover:bg-rose-50 font-serif"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Parse with AI
                  </Button>
                </div>

                {/* Session Type */}
                <div>
                  <Label className="text-rose-900 mb-2 block font-serif text-lg">Session Type</Label>
                  <Select value={formData.sessionType} onValueChange={(value) => setFormData(prev => ({ ...prev, sessionType: value }))}>
                    <SelectTrigger className="bg-white/80 border-rose-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic Boudoir</SelectItem>
                      <SelectItem value="lingerie">Lingerie Session (+€25)</SelectItem>
                      <SelectItem value="nude">Fine Art Nude (+€50)</SelectItem>
                      <SelectItem value="glamour">Glamour Session (+€30)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div>
                  <Label className="text-rose-900 mb-2 block font-serif text-lg">Session Duration</Label>
                  <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                    <SelectTrigger className="bg-white/80 border-rose-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1hr">1 Hour</SelectItem>
                      <SelectItem value="2hr">2 Hours (+€75) ⭐ Most Popular</SelectItem>
                      <SelectItem value="3hr">3 Hours (+€150)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <Label className="text-rose-900 mb-2 block font-serif text-lg">Location</Label>
                  <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger className="bg-white/80 border-rose-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">In-Studio</SelectItem>
                      <SelectItem value="location">On-Location (+€100)</SelectItem>
                      <SelectItem value="hotel">Hotel Suite (+€100)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Outfit Count */}
                <div>
                  <Label className="text-rose-900 mb-2 block font-serif text-lg">Number of Outfits</Label>
                  <Select value={formData.outfitCount} onValueChange={(value) => setFormData(prev => ({ ...prev, outfitCount: value }))}>
                    <SelectTrigger className="bg-white/80 border-rose-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Outfit</SelectItem>
                      <SelectItem value="2">2 Outfits (+€50)</SelectItem>
                      <SelectItem value="3">3 Outfits (+€100) ⭐ Most Popular</SelectItem>
                      <SelectItem value="4">4 Outfits (+€150)</SelectItem>
                      <SelectItem value="5">5 Outfits (+€200)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Add-ons */}
                <div>
                  <Label className="text-rose-900 mb-3 block font-serif text-lg">Add-Ons</Label>
                  <div className="space-y-3">
                    {[
                      { id: "makeup", label: "Professional Makeup (+€60)" },
                      { id: "album", label: "Printed Album (+€120)" },
                      { id: "deluxe-retouching", label: "Deluxe Retouching (+€75)" }
                    ].map((addOn) => (
                      <div key={addOn.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={addOn.id}
                          checked={formData.addOns.includes(addOn.id)}
                          onChange={(e) => {
                            const currentAddOns = formData.addOns;
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, addOns: [...currentAddOns, addOn.id] }));
                            } else {
                              setFormData(prev => ({ ...prev, addOns: currentAddOns.filter(id => id !== addOn.id) }));
                            }
                          }}
                          className="w-4 h-4 text-rose-600 bg-white border-rose-300 rounded focus:ring-rose-500"
                        />
                        <Label htmlFor={addOn.id} className="text-rose-800 font-normal font-serif">{addOn.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Code */}
                <div>
                  <Label className="text-rose-900 mb-2 block font-serif text-lg">Promo Code (Optional)</Label>
                  <Input
                    placeholder="Enter promo code"
                    value={formData.promoCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                    className="bg-white/80 border-rose-200 font-serif"
                  />
                  <p className="text-xs text-rose-600 mt-1 font-serif">Try: BOUDOIR10, NEWCLIENT, or GODDESS</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quote Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-8 bg-white/70 backdrop-blur-sm border-rose-200 shadow-lg sticky top-8">
              <h2 className="text-2xl font-bold mb-6 text-rose-900 font-serif">Your Boudoir Experience</h2>
              
              {pricing && (
                <div className="space-y-6">
                  {/* Price Display */}
                  <div className="text-center p-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg border border-rose-200">
                    <div className="text-sm text-rose-600 mb-2 font-serif">Investment Total</div>
                    <div className="text-4xl font-bold text-rose-700 font-serif">€{pricing.total.toLocaleString()}</div>
                    {isQuoteLocked && (
                      <div className="flex items-center justify-center mt-2 text-xs text-rose-500 font-serif italic">
                        <Clock className="h-3 w-3 mr-1" />
                        This price is locked for 48 hours
                      </div>
                    )}
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-rose-800 font-serif">Investment Breakdown:</h3>
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm font-serif">
                        <span className="text-rose-700">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  {!showContactForm ? (
                    <div className="space-y-3">
                      <Button 
                        onClick={() => setShowContactForm(true)}
                        className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-serif"
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Save My Quote & Contact Details
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 font-serif"
                        onClick={() => {
                          window.open(`mailto:studio@example.com?subject=Boudoir Session Booking&body=I'm interested in booking a boudoir session. My quote is €${pricing.total}`, "_blank");
                        }}
                      >
                        💌 Book My Session Now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-rose-800 font-serif">Save Your Quote:</h3>
                      <div className="space-y-3">
                        <Input
                          placeholder="Your Name"
                          value={formData.contactInfo.name}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            contactInfo: { ...prev.contactInfo, name: e.target.value } 
                          }))}
                          className="bg-white/80 border-rose-200 font-serif"
                        />
                        <Input
                          type="email"
                          placeholder="Email Address"
                          value={formData.contactInfo.email}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            contactInfo: { ...prev.contactInfo, email: e.target.value } 
                          }))}
                          className="bg-white/80 border-rose-200 font-serif"
                        />
                        <Input
                          type="tel"
                          placeholder="Phone Number (optional)"
                          value={formData.contactInfo.phone}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            contactInfo: { ...prev.contactInfo, phone: e.target.value } 
                          }))}
                          className="bg-white/80 border-rose-200 font-serif"
                        />
                      </div>
                      <div className="space-y-2">
                        <Button 
                          onClick={handleContactSubmit}
                          disabled={!formData.contactInfo.name || !formData.contactInfo.email}
                          className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-serif"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Lock This Price for 48 Hours
                        </Button>
                        {isQuoteLocked && (
                          <Button 
                            onClick={downloadQuotePDF}
                            variant="outline"
                            className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 font-serif"
                          >
                            Download Quote PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Popular Selection Badge */}
                  {formData.duration === "2hr" && formData.outfitCount === "3" && (
                    <div className="flex items-center justify-center p-3 bg-rose-50 rounded-lg border border-rose-200">
                      <Star className="h-4 w-4 text-rose-500 mr-2" />
                      <span className="text-sm text-rose-700 font-serif">Most clients choose this combination!</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}