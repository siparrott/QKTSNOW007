import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processCarWashRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for mobile car wash services and extracts structured data. 

Available options:
- Vehicle sizes: compact, sedan, suv, truck
- Service packages: exterior (exterior only), ext_int (exterior + interior), full_detail (full detail), showroom (showroom finish)
- Locations: home, work, other
- Urgency: rush (24 hours), normal (2-3 days), flexible
- Add-ons: engine (engine bay cleaning), pet_hair (pet hair removal), ceramic (ceramic coating), wax (wax & polish), headlight (headlight restoration)

Respond with JSON in this exact format:
{
  "vehicleSize": "string or null",
  "servicePackage": "string or null", 
  "serviceLocation": "string or null",
  "urgency": "string or null",
  "addOns": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}