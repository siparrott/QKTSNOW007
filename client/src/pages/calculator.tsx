import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calculator, DollarSign, ArrowLeft, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Calculator as CalculatorType } from "@shared/schema";
import { Link } from "wouter";

interface CalculatorFormData {
  eventType?: string;
  duration?: number;
  guestCount?: number;
  location?: string;
  complexity?: string;
  materials?: string;
  packageType?: string;
  squareFootage?: number;
}

interface QuoteResult {
  basePrice: number;
  adjustedPrice: number;
  factors: Record<string, number>;
  breakdown: string[];
}

export default function CalculatorPage() {
  const { slug } = useParams<{ slug: string }>();
  const [formData, setFormData] = useState<CalculatorFormData>({});
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const { data: calculator, isLoading } = useQuery<CalculatorType>({
    queryKey: ["/api/calculators", slug],
    enabled: !!slug
  });

  const leadMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/embed/demo-${slug}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to submit lead");
      return response.json();
    },
    onSuccess: () => {
      setShowLeadForm(false);
      setLeadData({ name: "", email: "", phone: "" });
    }
  });

  const calculateQuote = () => {
    if (!calculator?.defaultConfig) return;

    const config = calculator.defaultConfig as any;
    let basePrice = config.basePrice || 0;
    let adjustedPrice = basePrice;
    const factors: Record<string, number> = {};
    const breakdown: string[] = [];

    // Wedding Photography Calculator
    if (calculator.slug === "wedding-photography") {
      breakdown.push(`Base wedding photography package: $${basePrice}`);

      if (formData.duration) {
        const durationFactor = config.factors?.duration?.min + 
          ((formData.duration - 4) / 8) * (config.factors?.duration?.max - config.factors?.duration?.min);
        factors.duration = durationFactor;
        adjustedPrice *= durationFactor;
        breakdown.push(`Duration adjustment (${formData.duration}h): ${(durationFactor * 100 - 100).toFixed(0)}%`);
      }

      if (formData.guestCount) {
        const guestFactor = formData.guestCount > 150 ? 1.3 : formData.guestCount > 100 ? 1.1 : 1.0;
        factors.guests = guestFactor;
        adjustedPrice *= guestFactor;
        if (guestFactor > 1) {
          breakdown.push(`Large event surcharge (${formData.guestCount} guests): ${(guestFactor * 100 - 100).toFixed(0)}%`);
        }
      }

      if (formData.location && formData.location !== "indoor") {
        const locationFactor = config.factors?.location?.[formData.location] || 1.0;
        factors.location = locationFactor;
        adjustedPrice *= locationFactor;
        breakdown.push(`${formData.location} location: ${(locationFactor * 100 - 100).toFixed(0)}%`);
      }
    }

    // Personal Training Calculator
    if (calculator.slug === "personal-training") {
      const sessions = formData.packageType === "single" ? 1 : 
                     formData.packageType === "package_4" ? 4 :
                     formData.packageType === "package_8" ? 8 : 12;
      
      const packageDiscount = config.packageDiscounts?.[formData.packageType || "single"] || 1.0;
      adjustedPrice = basePrice * sessions * packageDiscount;
      
      breakdown.push(`${sessions} session${sessions > 1 ? 's' : ''} at $${basePrice} each`);
      if (packageDiscount < 1) {
        breakdown.push(`Package discount: ${((1 - packageDiscount) * 100).toFixed(0)}% off`);
      }
    }

    // Landscaping Calculator
    if (calculator.slug === "landscaping") {
      breakdown.push(`Base landscaping service: $${basePrice}`);
      
      if (formData.squareFootage) {
        const areaPrice = formData.squareFootage * (config.squareFootRate || 2.5);
        adjustedPrice += areaPrice;
        breakdown.push(`Area coverage (${formData.squareFootage} sq ft): $${areaPrice.toFixed(0)}`);
      }

      if (formData.complexity && formData.complexity !== "basic") {
        const complexityFactor = config.factors?.complexity?.[formData.complexity] || 1.0;
        factors.complexity = complexityFactor;
        adjustedPrice *= complexityFactor;
        breakdown.push(`${formData.complexity} complexity: ${(complexityFactor * 100 - 100).toFixed(0)}%`);
      }

      if (formData.materials && formData.materials !== "standard") {
        const materialFactor = config.factors?.materials?.[formData.materials] || 1.0;
        factors.materials = materialFactor;
        adjustedPrice *= materialFactor;
        breakdown.push(`${formData.materials} materials: ${(materialFactor * 100 - 100).toFixed(0)}%`);
      }
    }

    setQuote({
      basePrice,
      adjustedPrice: Math.round(adjustedPrice),
      factors,
      breakdown
    });
  };

  const handleGetQuote = () => {
    calculateQuote();
    setShowLeadForm(true);
  };

  const handleLeadSubmit = () => {
    leadMutation.mutate({
      ...leadData,
      quoteData: formData,
      estimatedValue: quote?.adjustedPrice.toString()
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading calculator...</div>
      </div>
    );
  }

  if (!calculator) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Calculator Not Found</h1>
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-400 to-neon-600 rounded-lg flex items-center justify-center">
              <Calculator className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{calculator.name}</h1>
              <p className="text-gray-400">{calculator.description}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <Card className="bg-midnight-800 border-midnight-700 p-6">
            <h2 className="text-xl font-bold mb-6">Calculate Your Quote</h2>
            
            {/* Wedding Photography Form */}
            {calculator.slug === "wedding-photography" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-white mb-2 block">Event Type</Label>
                  <Select value={formData.eventType} onValueChange={(value) => setFormData({...formData, eventType: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ceremony-reception">Ceremony + Reception</SelectItem>
                      <SelectItem value="ceremony-only">Ceremony Only</SelectItem>
                      <SelectItem value="reception-only">Reception Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Duration: {formData.duration || 8} hours</Label>
                  <Slider
                    value={[formData.duration || 8]}
                    onValueChange={(value) => setFormData({...formData, duration: value[0]})}
                    min={4}
                    max={12}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>4 hours</span>
                    <span>12 hours</span>
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Number of Guests</Label>
                  <Input
                    type="number"
                    value={formData.guestCount || ""}
                    onChange={(e) => setFormData({...formData, guestCount: parseInt(e.target.value) || 0})}
                    className="bg-midnight-700 border-midnight-600"
                    placeholder="e.g., 100"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Location Type</Label>
                  <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indoor">Indoor Venue</SelectItem>
                      <SelectItem value="outdoor">Outdoor Venue</SelectItem>
                      <SelectItem value="destination">Destination Wedding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Personal Training Form */}
            {calculator.slug === "personal-training" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-white mb-2 block">Package Type</Label>
                  <Select value={formData.packageType} onValueChange={(value) => setFormData({...formData, packageType: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Session</SelectItem>
                      <SelectItem value="package_4">4-Session Package (5% off)</SelectItem>
                      <SelectItem value="package_8">8-Session Package (10% off)</SelectItem>
                      <SelectItem value="package_12">12-Session Package (15% off)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Landscaping Form */}
            {calculator.slug === "landscaping" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-white mb-2 block">Project Area (sq ft)</Label>
                  <Input
                    type="number"
                    value={formData.squareFootage || ""}
                    onChange={(e) => setFormData({...formData, squareFootage: parseInt(e.target.value) || 0})}
                    className="bg-midnight-700 border-midnight-600"
                    placeholder="e.g., 500"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Project Complexity</Label>
                  <Select value={formData.complexity} onValueChange={(value) => setFormData({...formData, complexity: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select complexity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (lawn, simple planting)</SelectItem>
                      <SelectItem value="moderate">Moderate (multiple features)</SelectItem>
                      <SelectItem value="complex">Complex (custom design, hardscaping)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Material Quality</Label>
                  <Select value={formData.materials} onValueChange={(value) => setFormData({...formData, materials: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select materials" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Materials</SelectItem>
                      <SelectItem value="premium">Premium Materials</SelectItem>
                      <SelectItem value="luxury">Luxury Materials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button 
              onClick={calculateQuote}
              className="w-full mt-6 bg-neon-500 hover:bg-neon-600 text-white"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Calculate Quote
            </Button>
          </Card>

          {/* Quote Results */}
          <Card className="bg-midnight-800 border-midnight-700 p-6">
            <h2 className="text-xl font-bold mb-6">Your Quote</h2>
            
            {quote ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center p-6 bg-gradient-to-br from-neon-500/20 to-neon-600/20 rounded-lg border border-neon-500/30">
                  <div className="text-sm text-gray-300 mb-2">Estimated Total</div>
                  <div className="text-4xl font-bold text-neon-400">${quote.adjustedPrice.toLocaleString()}</div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-200">Quote Breakdown:</h3>
                  {quote.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>

                {!showLeadForm ? (
                  <Button 
                    onClick={handleGetQuote}
                    className="w-full bg-neon-500 hover:bg-neon-600 text-white"
                  >
                    Get Detailed Quote
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-200">Get Your Detailed Quote:</h3>
                    <div className="space-y-3">
                      <Input
                        placeholder="Your Name"
                        value={leadData.name}
                        onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                        className="bg-midnight-700 border-midnight-600"
                      />
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={leadData.email}
                        onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                        className="bg-midnight-700 border-midnight-600"
                      />
                      <Input
                        type="tel"
                        placeholder="Phone Number (optional)"
                        value={leadData.phone}
                        onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                        className="bg-midnight-700 border-midnight-600"
                      />
                    </div>
                    <Button 
                      onClick={handleLeadSubmit}
                      disabled={!leadData.name || !leadData.email || leadMutation.isPending}
                      className="w-full bg-neon-500 hover:bg-neon-600 text-white"
                    >
                      {leadMutation.isPending ? "Sending..." : "Send Detailed Quote"}
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Fill out the form to see your personalized quote</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}