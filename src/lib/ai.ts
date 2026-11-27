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
You are a strict real estate listing data extraction system.
Analyze ONLY the property notes sent by a real estate broker (English, Hindi, Hinglish, or shorthand).

STRICT RULES (NO HALLUCINATION):
1. Extract ONLY facts explicitly stated in the Broker Notes.
2. NEVER invent, guess, assume, or add any amenities, floor, facing, possession, parking, property_age, nearby landmarks, or extra claims not present in the notes.
3. If a field is NOT mentioned in the notes, return null (for strings/numbers) or [] (for arrays).
4. For "description", rewrite ONLY the broker's stated facts into clean, clear sentences—do not add unmentioned features.

Respond ONLY with valid JSON matching this structure:
{
  "title": "Crisp title based strictly on stated details (e.g. 4 BHK Flat for Sale in Bodakdev, Ahmedabad)",
  "slug": "url-friendly-slug",
  "description": "Clean factual summary using ONLY details from the notes",
  "property_type": "Apartment", // Must be one of: Apartment, Villa, Penthouse, Builder Floor, Plot, Commercial
  "listing_type": "Sale", // Must be: Sale or Rent
  "bhk": null,
  "bedrooms": null,
  "bathrooms": null,
  "carpet_area_sqft": null,
  "super_built_up_sqft": null,
  "floor": null,
  "furnishing": null,
  "facing": null,
  "possession": null,
  "parking": null,
  "property_age": null,
  "price_amount": 0,
  "display_price": "Price on Request",
  "currency": "INR",
  "location_city": "",
  "location_locality": "",
  "amenities": [],
  "ai_highlights": [],
  "ai_neighborhood_highlights": []
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
    super_built_up_sqft: parsed.super_built_up_sqft ? Number(parsed.super_built_up_sqft) : undefined,
    floor: parsed.floor || undefined,
    furnishing: parsed.furnishing || undefined,
    facing: parsed.facing || undefined,
    possession: parsed.possession || undefined,
    parking: parsed.parking || undefined,
    property_age: parsed.property_age || undefined,
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
You are a strict real estate listing data extraction system.
Analyze ONLY the property notes sent by a real estate broker (English, Hindi, Hinglish, or shorthand).

STRICT RULES (NO HALLUCINATION):
- Extract ONLY facts explicitly stated in the Broker Notes.
- NEVER invent, guess, or add any amenities, floor, facing, possession, parking, property_age, or nearby highlights not mentioned in the notes.
- If a detail is not mentioned, omit it or return null / [].
- Keep description strictly factual based only on what the broker wrote.

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
          super_built_up_sqft: { type: Type.INTEGER },
          floor: { type: Type.STRING },
          furnishing: { type: Type.STRING },
          facing: { type: Type.STRING },
          possession: { type: Type.STRING },
          parking: { type: Type.STRING },
          property_age: { type: Type.STRING },
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
