import { httpRouter } from "convex/server";
import { mpesaCallback } from "./mpesaCallbacks";

const http = httpRouter();

http.route({
    path: "/api/stk-callback",
    method: "POST",
    handler: mpesaCallback,
});

export default http;
