import { ActionCtx } from "./_generated/server";

/**
 * Helper to send logs to the central Google Cloud Log Forwarder
 */
export async function sendToCloudLog(
    ctx: ActionCtx,
    eventName: string,
    data: any = {},
    severity: "INFO" | "WARNING" | "ERROR" | "DEFAULT" = "INFO"
) {
    const logForwarderUrl = process.env.LOG_FORWARDER_URL || "http://localhost:5000/api/logs";

    try {
        const response = await fetch(logForwarderUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Bypass-Tunnel-Reminder": "true"
            },
            body: JSON.stringify({
                event: eventName,
                severity,
                data,
                message: `${eventName} triggered from Convex`,
            }),
        });

        if (!response.ok) {
            console.error(`Failed to send log to forwarder: ${response.statusText}`);
        }
    } catch (error) {
        // We don't want log failures to crash the main app logic
        console.error("Error sending log to cloud log forwarder:", error);
    }
}

/**
 * Log a payment event
 */
export async function logPayment(ctx: ActionCtx, action: string, details: any) {
    await sendToCloudLog(ctx, `PAYMENT_${action}`, details, "INFO");
}

/**
 * Log an error event
 */
export async function logCloudError(ctx: ActionCtx, errorName: string, error: any, context: any = {}) {
    await sendToCloudLog(ctx, `ERROR_${errorName}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        ...context
    }, "ERROR");
}
