import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuoteKitHeader } from "@/components/calculator-header";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { TestAuth } from "@/components/test-auth";
import { 
  Settings, 
  BarChart3, 
  ExternalLink, 
  Copy, 
  Eye, 
  Calendar,
  CreditCard,
  Users,
  TrendingUp,
  Calculator,
  Mail,
  Globe
} from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName: string;
  subscriptionStatus: string;
  quotesUsedThisMonth: number;
  quotesLimit: number;
}

interface UserCalculator {
  id: string;
  embedId: string;
  embedUrl: string;
  adminUrl: string;
  calculatorId: number;
  config: any;
  customBranding: any;
  isActive: boolean;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      setLocation('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setLocation('/login');
    }
  }, [setLocation]);

  const { data: userCalculators, isLoading: calculatorsLoading } = useQuery({
    queryKey: ['/api/user-calculators'],
    enabled: !!user,
  });

  const { data: subscriptionPlans } = useQuery({
    queryKey: ['/api/subscription/plans'],
  });

  const copyEmbedCode = (embedUrl: string) => {
    const embedCode = `<iframe src="${embedUrl}" width="100%" height="600px" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed code copied!",
      description: "Paste this code on your website to add the calculator.",
    });
  };

  const handleUpgrade = async (planId: string) => {
    try {
      const response = await apiRequest('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          calculatorSlug: 'wedding-photography'
        }),
      });

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (error: any) {
      toast({
        title: "Upgrade failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  const quotesPercentage = Math.round((user.quotesUsedThisMonth / user.quotesLimit) * 100);
  const currentPlan = subscriptionPlans?.[user.subscriptionStatus];

  return (
    <div className="min-h-screen bg-midnight-900">
      <QuoteKitHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Test Auth Component - Remove after testing */}
        <TestAuth />
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.fullName?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-400">
            Manage your quote calculators and track your business growth
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-midnight-800 border-midnight-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Quotes This Month</p>
                    <p className="text-2xl font-bold text-white">
                      {user.quotesUsedThisMonth}/{user.quotesLimit}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-neon-400" />
                </div>
                <Progress value={quotesPercentage} className="mt-3" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-midnight-800 border-midnight-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Calculators</p>
                    <p className="text-2xl font-bold text-white">
                      {userCalculators?.length || 0}
                    </p>
                  </div>
                  <Calculator className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-midnight-800 border-midnight-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Current Plan</p>
                    <p className="text-2xl font-bold text-white capitalize">
                      {user.subscriptionStatus}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-midnight-800 border-midnight-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Leads</p>
                    <p className="text-2xl font-bold text-white">0</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Your Calculators */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="bg-midnight-800 border-midnight-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Your Calculators
                    <Link href="/niches">
                      <Button variant="outline" size="sm" className="border-midnight-600 text-gray-300">
                        Create New
                      </Button>
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage and customize your quote calculators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {calculatorsLoading ? (
                    <div className="text-center py-8 text-gray-400">Loading calculators...</div>
                  ) : userCalculators?.length > 0 ? (
                    <div className="space-y-4">
                      {userCalculators.map((calc: UserCalculator) => (
                        <div key={calc.id} className="bg-midnight-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-white">Calculator #{calc.calculatorId}</h3>
                            <Badge variant={calc.isActive ? "default" : "secondary"}>
                              {calc.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(calc.embedUrl, '_blank')}
                              className="border-midnight-600 text-gray-300"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(calc.adminUrl, '_blank')}
                              className="border-midnight-600 text-gray-300"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Customize
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyEmbedCode(calc.embedUrl)}
                              className="border-midnight-600 text-gray-300"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Embed Code
                            </Button>
                          </div>
                          
                          <p className="text-sm text-gray-400">
                            Embed ID: {calc.embedId}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calculator className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No calculators yet</p>
                      <Link href="/niches">
                        <Button className="bg-neon-500 hover:bg-neon-600 text-white">
                          Create Your First Calculator
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="bg-midnight-800 border-midnight-700">
                <CardHeader>
                  <CardTitle className="text-white">Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <Badge variant="outline" className="text-lg px-3 py-1 capitalize">
                      {user.subscriptionStatus} Plan
                    </Badge>
                  </div>
                  
                  {currentPlan && (
                    <div className="text-center mb-4">
                      <p className="text-gray-400 text-sm">Monthly Price</p>
                      <p className="text-2xl font-bold text-white">
                        €{currentPlan.price}/mo
                      </p>
                    </div>
                  )}

                  {user.subscriptionStatus === 'free' ? (
                    <Button 
                      onClick={() => handleUpgrade('starter')}
                      className="w-full bg-neon-500 hover:bg-neon-600 text-white"
                    >
                      Upgrade to Starter
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full border-midnight-600 text-gray-300">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Billing
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="bg-midnight-800 border-midnight-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/features">
                    <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Features
                    </Button>
                  </Link>
                  
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                    <Globe className="h-4 w-4 mr-2" />
                    Knowledge Base
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}