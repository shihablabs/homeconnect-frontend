import { api } from "@/lib/api/api";
import { PropertyResponse } from "@/types/property.types";

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
  /**
   * Generates insight by calling our backend AI proxy
   */
  async generateComparisonInsight(
    properties: PropertyResponse[],
    instruction: string,
    language: 'english' | 'bangla' = 'english',
    style: 'concise' | 'detailed' | 'professional' = 'concise'
  ): Promise<AIComparisonData | string> {

    if (properties.length === 0) return "Please select properties to compare first.";

    try {
      const response = await api.post("/ai/compare", {
        properties,
        instruction,
        language,
        style
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        return response.data.message || "Failed to generate AI response.";
      }
    } catch (error: any) {
      console.error("AI Proxy Error:", error);
      const errorMessage = error.response?.data?.message || "Something went wrong while connecting to the AI service.";
      return `Error: ${errorMessage}`;
    }
  }
};
