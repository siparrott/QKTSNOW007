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
import ElectricianCalculator from "@/pages/electrician-calculator";
import HomeRenovationCalculator from "@/pages/home-renovation-calculator-new";
import DronePhotographyCalculator from "@/pages/drone-photography-calculator";
import EventVideographyCalculator from "@/pages/event-videography-calculator";
import RealEstatePhotographyCalculator from "@/pages/real-estate-photography-calculator";
import FoodPhotographyCalculator from "@/pages/food-photography-calculator";
import CommercialPhotographyCalculator from "@/pages/commercial-photography-calculator";
import PortraitPhotographyCalculator from "@/pages/portrait-photography-calculator";
import LifestyleInfluencerCalculator from "@/pages/lifestyle-influencer-calculator";
import LandscapingCalculator from "@/pages/landscaping-calculator";
import RoofingCalculator from "@/pages/roofing-calculator";
import SolarCalculator from "@/pages/solar-calculator";
import PestControlCalculator from "@/pages/pest-control-calculator";
import WindowDoorCalculator from "@/pages/window-door-calculator";
import MakeupArtistCalculator from "@/pages/makeup-artist-calculator";
import HairStylistCalculator from "@/pages/hair-stylist-calculator";
import TattooArtistCalculator from "@/pages/tattoo-artist-calculator";
import MassageTherapyCalculator from "@/pages/massage-therapy-calculator";
import PersonalTrainingCalculator from "@/pages/personal-training-calculator";
import PlumbingCalculator from "@/pages/plumbing-calculator";
import InteriorDesignCalculator from "@/pages/interior-design-calculator";
import PaintingDecoratingCalculator from "@/pages/painting-decorating-calculator";
import WeddingPhotographyCalculator from "@/pages/wedding-photography-calculator";
import NewbornPhotographyCalculator from "@/pages/newborn-photography-calculator";
import MaternityPhotographyCalculator from "@/pages/maternity-photography-calculator";
import NutritionistCalculator from "@/pages/nutritionist-calculator";
import LifeCoachCalculator from "@/pages/life-coach-calculator";
import HypnotherapistCalculator from "@/pages/hypnotherapist-calculator";
import PrivateTutorCalculator from "@/pages/private-tutor-calculator";
import DogTrainerCalculator from "@/pages/dog-trainer-calculator";
import CarDetailingCalculator from "@/pages/car-detailing-calculator";
import AutoMechanicCalculator from "@/pages/auto-mechanic-calculator";
import MobileCarWashCalculator from "@/pages/mobile-car-wash-calculator";
import ChauffeurLimoCalculator from "@/pages/chauffeur-limo-calculator";
import AirportTransferCalculator from "@/pages/airport-transfer-calculator";
import VanRentalCalculator from "@/pages/van-rental-calculator";
import BoatCharterCalculator from "@/pages/boat-charter-calculator";
import MovingServicesCalculator from "@/pages/moving-services-calculator";
import MotorcycleRepairCalculator from "@/pages/motorcycle-repair-calculator";
import DrivingInstructorCalculator from "@/pages/driving-instructor-calculator";
import WebDesignerCalculator from "@/pages/web-designer-calculator";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/calculator/boudoir-photography" component={BoudoirPhotographyCalculator} />
      <Route path="/calculator/electrician" component={ElectricianCalculator} />
      <Route path="/calculator/home-renovation" component={HomeRenovationCalculator} />
      <Route path="/calculator/drone-photography" component={DronePhotographyCalculator} />
      <Route path="/calculator/event-videography" component={EventVideographyCalculator} />
      <Route path="/calculator/real-estate-photography" component={RealEstatePhotographyCalculator} />
      <Route path="/calculator/food-photography" component={FoodPhotographyCalculator} />
      <Route path="/calculator/commercial-photography" component={CommercialPhotographyCalculator} />
      <Route path="/calculator/portrait-photography" component={PortraitPhotographyCalculator} />
      <Route path="/calculator/lifestyle-influencer" component={LifestyleInfluencerCalculator} />
      <Route path="/calculator/landscaping" component={LandscapingCalculator} />
      <Route path="/calculator/roofing" component={RoofingCalculator} />
      <Route path="/calculator/solar" component={SolarCalculator} />
      <Route path="/calculator/pest-control" component={PestControlCalculator} />
      <Route path="/calculator/window-door" component={WindowDoorCalculator} />
      <Route path="/calculator/makeup-artist" component={MakeupArtistCalculator} />
      <Route path="/calculator/hair-stylist" component={HairStylistCalculator} />
      <Route path="/calculator/tattoo-artist" component={TattooArtistCalculator} />
      <Route path="/calculator/massage-therapy" component={MassageTherapyCalculator} />
      <Route path="/calculator/personal-training" component={PersonalTrainingCalculator} />
      <Route path="/calculator/plumbing" component={PlumbingCalculator} />
      <Route path="/calculator/interior-design" component={InteriorDesignCalculator} />
      <Route path="/calculator/painting-decorating" component={PaintingDecoratingCalculator} />
      <Route path="/calculator/wedding-photography" component={WeddingPhotographyCalculator} />
      <Route path="/calculator/newborn-photography" component={NewbornPhotographyCalculator} />
      <Route path="/calculator/maternity-photography" component={MaternityPhotographyCalculator} />
      <Route path="/calculator/nutritionist" component={NutritionistCalculator} />
      <Route path="/calculator/life-coach" component={LifeCoachCalculator} />
      <Route path="/calculator/hypnotherapist" component={HypnotherapistCalculator} />
      <Route path="/calculator/private-tutor" component={PrivateTutorCalculator} />
      <Route path="/calculator/dog-trainer" component={DogTrainerCalculator} />
      <Route path="/calculator/car-detailing" component={CarDetailingCalculator} />
      <Route path="/calculator/auto-mechanic" component={AutoMechanicCalculator} />
      <Route path="/calculator/mobile-car-wash" component={MobileCarWashCalculator} />
      <Route path="/calculator/chauffeur-limo" component={ChauffeurLimoCalculator} />
      <Route path="/calculator/airport-transfer" component={AirportTransferCalculator} />
      <Route path="/calculator/van-rental" component={VanRentalCalculator} />
      <Route path="/calculator/boat-charter" component={BoatCharterCalculator} />
      <Route path="/calculator/moving-services" component={MovingServicesCalculator} />
      <Route path="/calculator/motorcycle-repair" component={MotorcycleRepairCalculator} />
      <Route path="/calculator/driving-instructor" component={DrivingInstructorCalculator} />
      <Route path="/calculator/web-designer" component={WebDesignerCalculator} />
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
