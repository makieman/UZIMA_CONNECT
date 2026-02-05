import { action } from "./_generated/server";

export const checkEnv = action({
    args: {},
    handler: async () => {
        const username = process.env.AT_USERNAME;
        const apiKey = process.env.AT_API_KEY;

        console.log("--- DEBUG ENV VARS ---");
        console.log(`AT_USERNAME: '${username}'`);
        console.log(`AT_API_KEY exists: ${!!apiKey}`);
        console.log(`AT_API_KEY length: ${apiKey?.length}`);
        console.log(`AT_API_KEY prefix: ${apiKey?.substring(0, 5)}`);
        // Check for whitespace
        console.log(`AT_USERNAME whitespace: /${username}/`);

        return {
            username,
            apiKeyLength: apiKey?.length,
            apiKeyPrefix: apiKey?.substring(0, 5)
        };
    },
});
