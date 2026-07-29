import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export class GeminiService {
  /**
   * Explainable AI (XAI) for predictions
   */
  async explainPrediction(predictionData: any, userProfile: any): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return "Gemini explanation is currently unavailable due to missing API configuration.";
    }

    const isFallback = predictionData.isFallback;
    const fallbackInstructions = isFallback 
      ? "\n5. CRITICAL: Mention that because their rank/percentile is significantly lower than historical trends, this college is suggested as an alternative/fallback option that has a relatively more lenient cutoff compared to others, but it is still a 'Reach' or 'Dream'." 
      : "";

    const prompt = `
You are an expert admission counselor for engineering and medical colleges in India. 
Your task is to explain a deterministic college prediction to a student in a natural, encouraging, and clear manner.

Student Profile:
- Exam: ${userProfile.examName}
- Rank: ${userProfile.rank || userProfile.scoreValue || 'N/A'} 
- Percentile: ${userProfile.percentile || userProfile.scoreValue || 'N/A'}
- Category: ${userProfile.category}
- Home State: ${userProfile.homeState || 'N/A'}

Prediction Result:
- College: ${predictionData.collegeName} (${predictionData.collegeDetails.location})
- Branch: ${predictionData.courseName}
- Status (Probability Band): ${predictionData.status} (Probability: ${predictionData.probability}%)
- Historical Average Cutoff (Last 3-5 Years): Rank ${predictionData.historicalAvgClosingRank || 'N/A'}, Percentile ${predictionData.historicalAvgClosingPercentile || 'N/A'}
- Multi-factor Match Score: ${predictionData.matchScore}/100

Instructions:
1. Briefly explain WHY this college is categorized as "${predictionData.status}" for them based on the historical cutoff versus their rank/percentile.
2. Mention their match score and what it implies (e.g. good placement, infrastructure).
3. Do not make any guarantees. Clearly distinguish this prediction from a 100% guarantee.
4. Keep the explanation concise (2-3 short paragraphs).${fallbackInstructions}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini XAI error:", error);
      return "We encountered an error while generating the AI explanation for this prediction. However, based on the data, the status is " + predictionData.status + ".";
    }
  }
}

export const geminiService = new GeminiService();
