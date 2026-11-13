import { GoogleGenAI, Type } from "@google/genai";
import { ParsedPropertyData } from "@/types/database";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set. Please add it to your .env.local file.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function parsePropertyNotes(rawNotes: string): Promise<ParsedPropertyData> {
  const ai = getGeminiClient();

  const prompt = `
You are an expert real estate AI copywriter and listing data extraction system.
Analyze the following unstructured property notes sent by a real estate broker.
The notes might be in English, Hindi, Hinglish, or casual shorthand broker jargon.

Extract all details into a clean, highly structured, professional listing.

Broker Notes:
"""
${rawNotes}
"""

Rules:
1. title: Generate a crisp, premium, high-converting title (e.g. "Luxurious 3 BHK Fully Furnished Apartment in Satellite").
2. slug: Generate a clean url-friendly slug (e.g. "3-bhk-satellite-ahmedabad-luxury").
3. description: Write a polished 2-paragraph sales description highlighting the key selling points, layout, and appeal for buyers or tenants.
4. property_type: Must be one of: "Apartment", "Villa", "Penthouse", "Builder Floor", "Plot", "Commercial".
5. listing_type: Must be "Sale" or "Rent".
6. bhk: Integer number of bedrooms (e.g., 1, 2, 3, 4, 5).
7. price_amount: Raw numerical price (e.g. 13500000). If rent, per month price.
8. display_price: Formatted clean string (e.g. "₹1.35 Cr", "₹45,000 / mo", "$450,000", "AED 2.1M").
9. currency: "INR", "USD", or "AED". Default to "INR" unless specified otherwise.
10. location_city: Name of the city (e.g., "Ahmedabad", "Mumbai", "Dubai", "Bengaluru").
11. location_locality: Specific neighborhood or landmark (e.g., "Satellite", "Whitefield", "Downtown").
12. amenities: Array of detected or standard amenities (e.g., ["Lift", "Covered Parking", "24/7 Security", "Gym", "Clubhouse"]).
13. ai_highlights: Exactly 5 compelling selling bullet points that impress buyers.
14. ai_neighborhood_highlights: Exactly 3 nearby perks (e.g. "5 mins to Metro station", "Top international schools within 2 km", "Close to SG Highway").
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          slug: { type: Type.STRING },
          description: { type: Type.STRING },
          property_type: { 
            type: Type.STRING,
            enum: ["Apartment", "Villa", "Penthouse", "Builder Floor", "Plot", "Commercial"]
          },
          listing_type: { 
            type: Type.STRING,
            enum: ["Sale", "Rent"]
          },
          bhk: { type: Type.INTEGER },
          bedrooms: { type: Type.INTEGER },
          bathrooms: { type: Type.INTEGER },
          carpet_area_sqft: { type: Type.INTEGER },
          price_amount: { type: Type.NUMBER },
          display_price: { type: Type.STRING },
          currency: { type: Type.STRING },
          location_city: { type: Type.STRING },
          location_locality: { type: Type.STRING },
          amenities: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          ai_highlights: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          ai_neighborhood_highlights: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: [
          "title",
          "slug",
          "description",
          "property_type",
          "listing_type",
          "price_amount",
          "display_price",
          "location_city",
          "location_locality",
          "amenities",
          "ai_highlights",
          "ai_neighborhood_highlights"
        ]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response received from Gemini AI model.");
  }

  return JSON.parse(text) as ParsedPropertyData;
}
