import SEOHead from "@/components/seo-head";

export default function EmbedTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <SEOHead
        title="Embed Code Test Page"
        description="Testing embed code functionality"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Embed Code Test Page
            </h1>
            <p className="text-lg text-gray-600">
              Testing external embed functionality
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Wedding Timeline Planner Embed
            </h2>
            <p className="text-gray-600 mb-6">
              This is a test embed for a wedding timeline planning tool:
            </p>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <iframe 
                src="https://86a32f66-26a0-4cb7-8499-b6af23f515f0-00-3e8czkepyefz7.worf.replit.dev/embed?businessName=Your+Wedding+Business&primaryColor=%23e91e63&accentColor=%239c27b0&buttonText=Plan+My+Wedding+Timeline&headline=Create+Your+Perfect+Wedding+Day+Schedule&description=AI-powered+timeline+generation+in+60+seconds&showPoweredBy=true" 
                width="100%" 
                height="600" 
                frameBorder="0"
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
                }}
                title="Wedding Timeline Planner"
              />
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Test Information:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Embed URL: Wedding timeline planner from external Replit</li>
                <li>• Customization: Pink/purple theme with custom business name</li>
                <li>• Features: AI-powered timeline generation</li>
                <li>• Status: Testing iframe functionality and responsiveness</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}