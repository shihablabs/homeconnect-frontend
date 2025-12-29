import { PropertyResponse, isRentalResponse } from "@/types/property.types";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export interface AIComparisonData {
  title: string;
  properties: string[];
  features: {
    featureName: string;
    values: string[];
    winnerIndex?: number;
  }[];
  summary: string;
  recommendation: string;
}

export const aiService = {
  
  async generateComparisonInsight(
    properties: PropertyResponse[],
    instruction: string,
    language: 'english' | 'bangla' = 'english',
    style: 'concise' | 'detailed' | 'professional' = 'concise'
  ): Promise<AIComparisonData | string> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return "Error: Gemini API Key is missing. Please configure it in .env file.";
    }

    if (properties.length === 0) return "Please select properties to compare first.";

    const propertyDetails = properties.map((p, index) => {
      const price = isRentalResponse(p)
        ? `${(p as any).pricePerMonth}/mo`
        : `${(p as any).totalPrice}`;

      return `
      Property ${index + 1}: ${p.title}
      - ID: ${p.id}
      - Type: ${p.propertyType}
      - Listing: ${p.listingType}
      - Price: ${price}
      - Location: ${p.neighborhood}, ${p.city}
      - Bed/Bath: ${p.bedrooms} bed, ${p.bathrooms} bath
      - Size: ${p.areaSize} ${p.areaUnit}
      - Amenities: ${p.amenities?.join(", ")}
      `;
    }).join("\n");

    const langInstruction = language === 'bangla'
      ? "Answer in Bangla (Bengali)."
      : "Answer in English.";

    
    const styleInstruction = style === 'concise'
      ? "Keep values short and punchy."
      : style === 'detailed'
        ? "Provide detailed analysis in values."
        : "Maintain professional tone.";

    const finalPrompt = `
      Act as a senior real estate analyst.

      Analyze the following properties:
      ${propertyDetails}

      Your Task:
      ${instruction}

      Language Requirement:
      ${langInstruction}

      Style Requirement:
      ${styleInstruction}

      Safety & Privacy Rules (CRITICAL):
      1. DO NOT output internal Property IDs. Use generic names or Titles.
      2. If off-topic, return JSON with "title": "Error", "summary": "This is out of topic please don't try this other wise we will disable this fature".

      OUTPUT FORMAT (CRITICAL):
      Return ONLY a raw JSON object (no Markdown code blocks, no \`\`\`json).
      The JSON must match this structure:
      {
        "title": "A catchy title for the comparison",
        "properties": ["Property 1 Title", "Property 2 Title"], // Names corresponding to input order
        "features": [
          {
            "featureName": "Price Analysis",
            "values": ["Value for Prop 1", "Value for Prop 2"], // Must correspond to properties array order
            "winnerIndex": 0 // Index of the property that 'wins' this feature (optional, set null if neutral)
          },
          // ... Generate 5-8 key comparison features based on the instruction
        ],
        "summary": "A brief textual summary of the comparison.",
        "recommendation": "Final verdict on which property is better for the specific goal."
      }
      `;

    try {
      const result = await model.generateContent(finalPrompt);
      const response = await result.response;
      const text = response.text();

      
      const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();

      const data: AIComparisonData = JSON.parse(jsonStr);
      return data;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Failed to parse AI response. Please try again.";
    }
  }
};
