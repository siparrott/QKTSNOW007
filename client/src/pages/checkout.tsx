import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        // Get plan from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const tier = urlParams.get('tier') || 'pro';
        const userId = urlParams.get('userId') || `checkout_${Date.now()}`;

        const response = await fetch('/api/create-subscription-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tier,
            userId
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.url) {
          setCheckoutUrl(data.url);
          console.log('Checkout URL created:', data.url);
          
          // Try multiple redirect approaches for Replit environment
          try {
            // First try: direct redirect
            window.location.href = data.url;
          } catch (redirectError) {
            console.log('Direct redirect failed, will show manual options');
          }
        } else {
          throw new Error('No checkout URL received');
        }
        
      } catch (error) {
        console.error('Checkout error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    createCheckoutSession();
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      toast({
        title: "Link Copied",
        description: "Checkout link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the link",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-blue-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-midnight-800 border-midnight-600 text-white">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-neon-400" />
            <h2 className="text-xl font-semibold mb-2">Setting up your checkout...</h2>
            <p className="text-gray-400">Please wait while we prepare your secure payment page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-blue-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-midnight-800 border-midnight-600 text-white">
          <CardHeader>
            <CardTitle className="text-red-400">Checkout Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">Unable to create checkout session: {error}</p>
            <Button 
              onClick={() => setLocation('/dashboard')}
              className="w-full bg-gray-700 hover:bg-gray-600"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-midnight-800 border-midnight-600 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-neon-400 text-xl">Complete Your Payment</CardTitle>
          <p className="text-gray-300 mt-2">
            Your secure Stripe checkout is ready. Click below to complete your subscription.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-3">
            <Button
              onClick={() => window.open(checkoutUrl, '_blank', 'noopener,noreferrer')}
              className="w-full bg-neon-500 hover:bg-neon-600 text-black font-semibold text-lg py-4"
              size="lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Continue to Stripe Payment
            </Button>
            
            <div className="text-center text-sm text-gray-400">
              Secure payment processing by Stripe
            </div>
          </div>

          <div className="border-t border-midnight-600 pt-4">
            <p className="text-sm text-gray-400 mb-3">Alternative options:</p>
            
            <div className="space-y-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Checkout Link
              </Button>
              
              <Button
                onClick={() => window.location.href = checkoutUrl}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Try Direct Redirect
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-400 p-3 bg-midnight-700 rounded border border-midnight-600">
            <strong>Checkout URL:</strong>
            <div className="mt-1 break-all font-mono text-xs">{checkoutUrl}</div>
          </div>

          <Button 
            onClick={() => setLocation('/dashboard')}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
          >
            Skip for now - Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}