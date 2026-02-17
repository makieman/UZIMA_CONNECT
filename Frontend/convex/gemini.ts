"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";

/**
 * Helper function to delay execution
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Summarize medical history from a text string using Google Gemini 3 Flash
 * Includes automatic retry logic for transient 503 errors
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

        // Retry configuration
        const maxRetries = 3;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Gemini API attempt ${attempt}/${maxRetries}`);

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
                lastError = error instanceof Error ? error : new Error(String(error));
                console.error(`Gemini Error (attempt ${attempt}):`, lastError.message);

                // Check if it's a retryable error (503, 429, etc)
                const errorMsg = lastError.message.toLowerCase();
                const isRetryable = errorMsg.includes("503") ||
                    errorMsg.includes("overloaded") ||
                    errorMsg.includes("unavailable") ||
                    errorMsg.includes("429") ||
                    errorMsg.includes("rate limit");

                if (isRetryable && attempt < maxRetries) {
                    // Exponential backoff: 2s, 4s, 8s
                    const waitTime = Math.pow(2, attempt) * 1000;
                    console.log(`Retrying in ${waitTime / 1000}s...`);
                    await delay(waitTime);
                    continue;
                }

                // Non-retryable or max retries reached
                break;
            }
        }

        return {
            success: false,
            error: lastError?.message || "An unknown error occurred during Gemini summarization after multiple retries."
        };
    },
});
