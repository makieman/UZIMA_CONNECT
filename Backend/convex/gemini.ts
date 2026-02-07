"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";

/**
 * Summarize medical history from a text string using Google Gemini 3 Flash
 */
export const summarizeMedicalHistory = action({
    args: {
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing from environment variables.");
            return {
                success: false,
                error: "Gemini API Key is not configured on the Convex backend."
            };
        }

        const genAI = new GoogleGenAI({ apiKey });

        if (!args.text.trim()) {
            return { success: false, error: "No content provided to summarize." };
        }

        try {
            const prompt = `You are a medical assistant specializing in patient clinical documentation. 
Your task is to take raw patient medical history data and transform it into a structured summary.

Format the output into two clear sections:
1. MEDICAL_HISTORY: A concise summary of symptoms, chronic conditions, and clinical timeline.
2. LAB_RESULTS: A list of key laboratory findings, diagnostic results, and medication dosages if present.

Ensure the language is technical and professional. 
Return the output in the following format:
---
MEDICAL_HISTORY:
[Summary here]

LAB_RESULTS:
[Summary here]
---

Raw Medical Data:
${args.text}`;

            const response = await genAI.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
            });

            const summary = response.text || "";

            const medicalHistoryMatch = summary.match(/MEDICAL_HISTORY:\s*([\s\S]*?)(?=LAB_RESULTS:|$)/i);
            const labResultsMatch = summary.match(/LAB_RESULTS:\s*([\s\S]*?)(?=\n---|$)/i);

            return {
                success: true,
                summary: summary,
                parsed: {
                    medicalHistory: medicalHistoryMatch ? medicalHistoryMatch[1].trim() : "",
                    labResults: labResultsMatch ? labResultsMatch[1].trim() : "",
                }
            };
        } catch (error) {
            console.error("Gemini Error:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "An unknown error occurred during Gemini summarization."
            };
        }
    },
});
