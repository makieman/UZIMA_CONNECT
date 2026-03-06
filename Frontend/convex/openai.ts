"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

/**
 * Summarize medical history from a text string using OpenAI
 */
export const summarizeMedicalHistory = action({
    args: {
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("OPENAI_API_KEY is missing from environment variables.");
            return {
                success: false,
                error: "OpenAI API Key is not configured on the Convex backend. Please ensure it's set in the Convex dashboard or .env.local and synced."
            };
        }

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        if (!args.text.trim()) {
            return { success: false, error: "No content provided to summarize." };
        }

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are a medical assistant specializing in patient clinical documentation. 
            Your task is to take raw patient medical history data (which may come from OCR or document extraction) and transform it into a structured summary.
            
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
            ---`
                    },
                    {
                        role: "user",
                        content: `Please summarize the following raw medical data:\n\n${args.text}`
                    }
                ],
                temperature: 0.3,
            });

            const summary = response.choices[0].message.content || "";

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
            console.error("OpenAI Error:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "An unknown error occurred during AI summarization."
            };
        }
    },
});
