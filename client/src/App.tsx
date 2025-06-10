import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CalculatorPage from "@/pages/calculator";
import NichesPage from "@/pages/niches";
import BoudoirPhotographyCalculator from "@/pages/boudoir-photography-calculator";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/calculator/boudoir-photography" component={BoudoirPhotographyCalculator} />
      <Route path="/calculator/:slug" component={CalculatorPage} />
      <Route path="/niches" component={NichesPage} />
      <Route path="/niches/:niche" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
