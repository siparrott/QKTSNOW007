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

export async function processChauffeurRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for chauffeur and limousine services and extracts structured data.

Available options:
- Service types: airport (Airport Transfer), hourly (Hourly Hire), wedding (Wedding/Event), corporate (Corporate Booking)
- Vehicle types: sedan (Luxury Sedan), suv (Executive SUV), limo (Stretch Limousine), party_bus (Party Bus)
- Duration: 1hr (1 Hour), 2-4hr (2-4 Hours), 5hr+ (5+ Hours), full_day (Full Day)
- Add-ons: red_carpet (Red Carpet Service), champagne (Champagne & Refreshments), decorations (Wedding Decorations), extra_stops (Extra Stopovers)

Respond with JSON in this exact format:
{
  "serviceType": "string or null",
  "vehicleType": "string or null",
  "duration": "string or null", 
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

export async function processAirportTransferRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for airport transfer services and extracts structured data.

Available options:
- Destination airports: vie (Vienna International Airport), muc (Munich Airport), fra (Frankfurt Airport), zur (Zurich Airport), prg (Prague Airport), other (Other Airport)
- Vehicle types: economy (Economy Car), sedan (Executive Sedan), suv (SUV), van (Van), shuttle (Shuttle Bus)
- Passengers: number from 1-8
- Add-ons: baby_seat (Baby Seat), extra_luggage (Extra Luggage), meet_greet (Meet & Greet), flight_tracking (Flight Tracking)
- Return trip: true or false

Respond with JSON in this exact format:
{
  "destinationAirport": "string or null",
  "vehicleType": "string or null",
  "passengers": "number or null",
  "addOns": ["array of strings or empty array"],
  "returnTrip": "boolean or null"
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

export async function processVanRentalRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for van rental services and extracts structured data.

Available options:
- Rental types: cargo (Cargo Van), passenger (Passenger Van), luton (Luton/Box Van), camper (Campervan)
- Duration: half_day (Half Day), full_day (Full Day), weekend (Weekend), weekly (Weekly)
- Kilometre limits: 100 (100km/day), 200 (200km/day), unlimited (Unlimited)
- Extras: gps (GPS Navigation), baby_seat (Child/Baby Seat), trolley (Sack Trolley), extra_driver (Additional Driver), insurance (Insurance Upgrade)

Respond with JSON in this exact format:
{
  "rentalType": "string or null",
  "duration": "string or null",
  "kmLimit": "string or null",
  "extras": ["array of strings or empty array"]
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

export async function processBoatCharterRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for boat charter services and extracts structured data.

Available options:
- Boat types: sailboat (Sailboat), catamaran (Catamaran), motor_yacht (Motor Yacht), speedboat (Speedboat), fishing_boat (Fishing Boat), party_boat (Party Boat)
- Duration: 2_hours (2 Hours), half_day (Half Day), full_day (Full Day), sunset (Sunset Cruise), multi_day (Multi-Day)
- Guests: number from 1-50+ as string
- Extras: captain_crew (Captain & Crew), catering (Catering / Drinks), water_toys (Water Toys), photographer (Photographer), dj_music (Live DJ / Music)

Respond with JSON in this exact format:
{
  "boatType": "string or null",
  "duration": "string or null",
  "guests": "string or null",
  "extras": ["array of strings or empty array"]
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

export async function processMovingServicesRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for moving services and extracts structured data.

Available options:
- Moving types: local (Local Move), long_distance (Long Distance), international (International), office (Office Relocation)
- Property types: studio (Studio/1BR), 2br (2 Bedroom), 3br (3 Bedroom), 4br (4+ Bedroom), office_space (Office Space)
- Distance: local_short (Under 10 miles), local_medium (10-50 miles), regional (50-200 miles), long_distance (200+ miles)
- Extras: packing (Packing Services), unpacking (Unpacking Services), assembly (Furniture Assembly), storage (Storage Service), cleaning (Cleaning Service)

Respond with JSON in this exact format:
{
  "movingType": "string or null",
  "propertyType": "string or null",
  "distance": "string or null",
  "extras": ["array of strings or empty array"]
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

export async function processMotorcycleRepairRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for motorcycle repair services and extracts structured data.

Available options:
- Bike types: cruiser (Cruiser), sportbike (Sportbike), touring (Touring), dirt_bike (Dirt Bike), scooter (Scooter / Moped), electric (Electric / Hybrid)
- Service types: maintenance (General Maintenance), engine (Engine Repair), brakes (Brake Replacement), tires (Tire Change), suspension (Suspension Service), electrical (Electrical Diagnostics)
- Urgency: standard (Standard), express (Express), emergency (Emergency)
- Add-ons: oil_change (Oil & Filter Change), chain (Chain Replacement), valves (Valve Adjustment), pickup (Pickup & Dropoff)

Respond with JSON in this exact format:
{
  "bikeType": "string or null",
  "serviceType": "string or null",
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