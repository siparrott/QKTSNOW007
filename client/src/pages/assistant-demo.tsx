import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, CheckCircle } from "lucide-react";

interface AssistantInfo {
  id: string;
  name: string;
  description: string;
  model: string;
}

interface CalculatorConfig {
  calculatorConfig: {
    title: string;
    description: string;
    layoutJson: any;
    logicJson: any;
    styleJson: any;
    promptMd: string;
  };
  userExperience: {
    onboardingFlow: string[];
    helpText: string;
    successMessages: string[];
  };
  implementation: {
    embedCode: string;
    setupInstructions: string[];
  };
}

export default function AssistantDemo() {
  const [assistantInfo, setAssistantInfo] = useState<AssistantInfo | null>(null);
  const [calculatorConfig, setCalculatorConfig] = useState<CalculatorConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [businessType, setBusinessType] = useState("Photography Studio");
  const [serviceName, setServiceName] = useState("Portrait Photography");
  const [requirements, setRequirements] = useState("Professional portrait sessions with multiple package options including individual, couple, and family sessions");

  const fetchAssistantInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/assistant/info');
      const data = await response.json();
      
      if (data.success) {
        setAssistantInfo(data.assistant);
      } else {
        setError(data.error || 'Failed to get assistant info');
      }
    } catch (err) {
      setError('Failed to connect to assistant');
    } finally {
      setLoading(false);
    }
  };

  const createCalculator = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/assistant/create-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessType,
          serviceName,
          requirements,
          customization: {
            colors: 'Professional blue and white',
            branding: 'Modern and clean',
            specificFeatures: ['Real-time pricing', 'Multiple packages', 'Lead capture']
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCalculatorConfig(data.calculator);
      } else {
        setError(data.error || 'Failed to create calculator');
      }
    } catch (err) {
      setError('Failed to create calculator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="text-purple-500" />
          OpenAI Assistant Demo
        </h1>
        <p className="text-gray-600">
          Test the integrated OpenAI Assistant for calculator creation and user experience enhancement
        </p>
      </div>

      {/* Assistant Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Assistant Connection Status</CardTitle>
          <CardDescription>
            Check the connection to your OpenAI Assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={fetchAssistantInfo} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Test Assistant Connection'
            )}
          </Button>
          
          {assistantInfo && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="text-green-500 h-5 w-5" />
                <span className="font-semibold text-green-700">Connected Successfully</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {assistantInfo.name}
                </div>
                <div>
                  <span className="font-medium">Model:</span> {assistantInfo.model}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">ID:</span> 
                  <Badge variant="secondary" className="ml-2">{assistantInfo.id}</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calculator Creation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create Calculator with Assistant</CardTitle>
          <CardDescription>
            Use the OpenAI Assistant to generate a custom calculator configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Business Type</label>
              <Input
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g., Photography Studio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Service Name</label>
              <Input
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g., Portrait Photography"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Requirements</label>
            <Textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Describe the calculator requirements..."
              rows={4}
            />
          </div>
          
          <Button 
            onClick={createCalculator} 
            disabled={loading || !businessType || !serviceName || !requirements}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Calculator...
              </>
            ) : (
              'Create Calculator with Assistant'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {calculatorConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Calculator Configuration</CardTitle>
            <CardDescription>
              Your custom calculator created by the OpenAI Assistant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Calculator Details</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Title:</strong> {calculatorConfig.calculatorConfig.title}</div>
                  <div><strong>Description:</strong> {calculatorConfig.calculatorConfig.description}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">User Experience</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Help Text:</strong> {calculatorConfig.userExperience.helpText}</div>
                  <div><strong>Flow:</strong> {calculatorConfig.userExperience.onboardingFlow.join(' → ')}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Implementation</h4>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                {calculatorConfig.implementation.embedCode}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Setup Instructions</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {calculatorConfig.implementation.setupInstructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Section */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-red-600 text-center">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}