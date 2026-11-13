import OpenAI from "openai";
import { GoogleGenAI, Type } from "@google/genai";
import { ParsedPropertyData } from "@/types/database";

/**
 * Universal AI Parser for PropFolio:
 * Supports Groq Cloud (ultra-fast Llama 3.3 70B),
 * OpenCode, or Google Gemini.
 */
export async function parsePropertyNotes(rawNotes: string): Promise<ParsedPropertyData> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const opencodeApiKey = process.env.OPENCODE_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (groqApiKey) {
    return parseWithGroq(rawNotes, groqApiKey);
  }

  if (opencodeApiKey) {
    return parseWithOpenAICompatible(
      rawNotes, 
      opencodeApiKey, 
      process.env.OPENCODE_BASE_URL || "https://opencode.ai/inference/openai/v1",
      process.env.OPENCODE_MODEL || "kimi-k2.6"
    );
  }

  if (geminiApiKey) {
    return parseWithGemini(rawNotes, geminiApiKey);
  }

  throw new Error(
    "No AI API key found! Please set GROQ_API_KEY (or OPENCODE_API_KEY / GEMINI_API_KEY) in your .env.local file."
  );
}

/**
 * Groq Cloud implementation (Llama 3.3 70B)
 */
async function parseWithGroq(rawNotes: string, apiKey: string): Promise<ParsedPropertyData> {
  const baseURL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  return parseWithOpenAICompatible(rawNotes, apiKey, baseURL, model);
}

/**
 * Generic OpenAI Compatible Runner (Used for Groq, OpenCode, Together, DeepSeek)
 */
async function parseWithOpenAICompatible(
  rawNotes: string,
  apiKey: string,
  baseURL: string,
  model: string
): Promise<ParsedPropertyData> {
  const client = new OpenAI({
    apiKey,
    baseURL,
  });

  const systemPrompt = `
You are an expert real estate AI copywriter and listing data extraction system.
Analyze the unstructured property notes sent by a real estate broker.
The notes might be in English, Hindi, Hinglish, or casual shorthand broker jargon.

Extract all details into a clean, highly structured, professional listing.

Respond ONLY with valid JSON matching this exact structure:
{
  "title": "Crisp premium title (e.g. Luxurious 3 BHK Fully Furnished Apartment in Satellite)",
  "slug": "url-friendly-slug (e.g. 3-bhk-satellite-ahmedabad-luxury)",
  "description": "Polished 2-paragraph sales description highlighting key layout & features",
  "property_type": "Apartment", // Must be one of: Apartment, Villa, Penthouse, Builder Floor, Plot, Commercial
  "listing_type": "Sale", // Must be: Sale or Rent
  "bhk": 3,
  "bedrooms": 3,
  "bathrooms": 3,
  "carpet_area_sqft": 1750,
  "price_amount": 13500000,
  "display_price": "₹1.35 Cr",
  "currency": "INR",
  "location_city": "Ahmedabad",
  "location_locality": "Satellite",
  "amenities": ["Lift", "Covered Parking", "24/7 Security", "Gym"],
  "ai_highlights": ["5 compelling selling bullet points"],
  "ai_neighborhood_highlights": ["3 nearby perks (e.g. 5 mins to metro)"]
}
`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Broker Notes:\n"""\n${rawNotes}\n"""` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error(`No response received from AI model (${model}).`);
  }

  const parsed = JSON.parse(content);
  return {
    title: parsed.title || "Modern Property",
    slug: parsed.slug || "featured-property",
    description: parsed.description || "",
    property_type: parsed.property_type || "Apartment",
    listing_type: parsed.listing_type || "Sale",
    bhk: parsed.bhk ? Number(parsed.bhk) : undefined,
    bedrooms: parsed.bedrooms ? Number(parsed.bedrooms) : undefined,
    bathrooms: parsed.bathrooms ? Number(parsed.bathrooms) : undefined,
    carpet_area_sqft: parsed.carpet_area_sqft ? Number(parsed.carpet_area_sqft) : undefined,
    price_amount: Number(parsed.price_amount) || 0,
    display_price: parsed.display_price || "Price on Request",
    currency: parsed.currency || "INR",
    location_city: parsed.location_city || "City",
    location_locality: parsed.location_locality || "Locality",
    amenities: Array.isArray(parsed.amenities) ? parsed.amenities : [],
    ai_highlights: Array.isArray(parsed.ai_highlights) ? parsed.ai_highlights : [],
    ai_neighborhood_highlights: Array.isArray(parsed.ai_neighborhood_highlights) ? parsed.ai_neighborhood_highlights : [],
  };
}

/**
 * Google Gemini implementation
 */
async function parseWithGemini(rawNotes: string, apiKey: string): Promise<ParsedPropertyData> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert real estate AI copywriter and listing data extraction system.
Analyze the following unstructured property notes sent by a real estate broker.
The notes might be in English, Hindi, Hinglish, or casual shorthand broker jargon.

Extract all details into a clean, highly structured, professional listing.

Broker Notes:
"""
${rawNotes}
"""
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
          amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
          ai_highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          ai_neighborhood_highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: [
          "title", "slug", "description", "property_type", "listing_type",
          "price_amount", "display_price", "location_city", "location_locality",
          "amenities", "ai_highlights", "ai_neighborhood_highlights"
        ]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response received from Gemini.");
  return JSON.parse(text) as ParsedPropertyData;
}
