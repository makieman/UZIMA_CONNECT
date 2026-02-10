"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { ImageAnnotatorClient } from "@google-cloud/vision";

/**
 * Perform OCR on a medical image (handwritten note or lab report)
 * Expects a base64 encoded image or an image URL
 */
export const ocrMedicalImage = action({
    args: {
        imageBase64: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        demoUserId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // SECURITY: Require physician or admin role
        await ctx.runQuery(internal.permissions.validateRole, {
            roles: ["physician", "admin"],
            demoUserId: args.demoUserId
        });

        const project = process.env.GOOGLE_CLOUD_PROJECT;
        let credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS;

        if (!project || !credentialsJson) {
            const missingVars = [];
            if (!project) missingVars.push("GOOGLE_CLOUD_PROJECT");
            if (!credentialsJson) missingVars.push("GOOGLE_APPLICATION_CREDENTIALS_JSON");

            return {
                success: false,
                error: `OCR failed: Google Cloud Vision authentication is not configured. Missing: ${missingVars.join(", ")}.`
            };
        }

        let parsedCredentials: any;

        try {
            // Clean the string (trim whitespace and potential wrapping quotes)
            let sanitized = credentialsJson.trim();
            while ((sanitized.startsWith("'") && sanitized.endsWith("'")) ||
                (sanitized.startsWith('"') && sanitized.endsWith('"'))) {
                sanitized = sanitized.slice(1, -1).trim();
            }

            // STRATEGY 1: Try direct JSON parse
            try {
                parsedCredentials = JSON.parse(sanitized);
            } catch (e) {
                // STRATEGY 2: If JSON parse fails, it might be Base64 encoded
                // Clean of any non-b64 characters before decoding
                const b64clean = sanitized.replace(/[^A-Za-z0-9+/=]/g, '');
                const decoded = Buffer.from(b64clean, 'base64').toString('utf8');
                parsedCredentials = JSON.parse(decoded);
                console.log("Successfully decoded and parsed Base64 credentials.");
            }

            const client = new ImageAnnotatorClient({
                projectId: project,
                credentials: parsedCredentials,
            });

            let imageSource: any = {};
            if (args.imageBase64) {
                const base64 = args.imageBase64.replace(/^data:image\/\w+;base64,/, "");
                imageSource = { content: base64 };
            } else if (args.imageUrl) {
                imageSource = { source: { imageUri: args.imageUrl } };
            } else {
                return { success: false, error: "No image source provided." };
            }

            console.log("Calling Google Cloud Vision Document Text Detection...");
            const [result] = await client.documentTextDetection(imageSource);
            const fullText = result.fullTextAnnotation?.text || "";

            return {
                success: true,
                text: fullText || "",
                message: fullText ? undefined : "No text was detected in the image."
            };

        } catch (error) {
            console.error("Vision OCR Error:", error);
            return {
                success: false,
                error: `OCR failed: ${error instanceof Error ? error.message : "An unknown error occurred"}`
            };
        }
    },
});
