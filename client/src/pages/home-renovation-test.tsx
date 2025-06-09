import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function HomeRenovationTest() {
  return (
    <div className="min-h-screen bg-midnight-900 text-white p-8">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </Link>
      <h1 className="text-3xl font-bold">Home Renovation Calculator Test</h1>
      <p className="text-gray-400 mt-4">This is a test page to verify the route is working.</p>
    </div>
  );
}