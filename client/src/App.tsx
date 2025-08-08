import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CalculatorPage from "@/pages/calculator";
import NichesPage from "@/pages/niches";
import PortraitPhotographyCalculator from "@/pages/portrait-photography-calculator";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Subscribe from "@/pages/subscribe";
import Checkout from "@/pages/checkout";
import Dashboard from "@/pages/dashboard";
import Upgrade from "@/pages/upgrade";
import AdminDashboard from "@/pages/admin";
import EmbedCalculator from "@/components/embed-calculator";
import Profile from "@/pages/profile";
import TwoFactorSetup from "@/pages/two-factor-setup";
import TwoFactorVerify from "@/pages/two-factor-verify";
import Blogs from "@/pages/blogs";
import BlogPost from "@/pages/blog-post-new";
import AdminBlogEditor from "@/pages/admin-blog-editor";
import AssistantDemo from "@/pages/assistant-demo";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";

// Check if this is an embed route at startup
function EmbedHandler() {
  const embedConfig = (window as any).__EMBED_CONFIG__;
  
  if (embedConfig) {
    return (
      <EmbedCalculator
        embedId={embedConfig.embedId}
        templateSlug={embedConfig.templateSlug}
        customConfig={embedConfig.customConfig}
      />
    );
  }
  
  return null;
}

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Portrait Photography - Our primary calculator */}
      <Route path="/portrait-photography-calculator" component={PortraitPhotographyCalculator} />
      <Route path="/calculator/portrait-photography" component={PortraitPhotographyCalculator} />
      
      {/* Generic calculator router for any embedded instances */}
      <Route path="/calculator/:slug" component={CalculatorPage} />
      
      {/* Core application pages */}
      <Route path="/niches" component={NichesPage} />
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/upgrade" component={Upgrade} />
      <Route path="/profile" component={Profile} />
      <Route path="/two-factor-setup" component={TwoFactorSetup} />
      <Route path="/two-factor-verify" component={TwoFactorVerify} />
      <Route path="/admin" component={AdminDashboard} />
      
      {/* Blog pages */}
      <Route path="/blogs" component={Blogs} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/admin/blog/new" component={AdminBlogEditor} />
      
      {/* Assistant Demo */}
      <Route path="/assistant-demo" component={AssistantDemo} />
      
      {/* Fallback routes */}
      <Route path="/niches/:niche" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
      initGA();
    }
  }, []);

  // Check if this is an embed page
  const embedConfig = (window as any).__EMBED_CONFIG__;
  
  if (embedConfig) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <EmbedHandler />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
