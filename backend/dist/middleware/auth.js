"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const supabase_1 = require("../supabase");
const errorHandler_1 = require("./errorHandler");
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next(new errorHandler_1.AppError("Missing Authorization header", 401));
    }
    const parts = authHeader.split(" ");
    if (parts[0] !== "Bearer" || parts.length !== 2) {
        return next(new errorHandler_1.AppError("Invalid Authorization header format", 401));
    }
    const token = parts[1];
    try {
        const result = await supabase_1.supabase.auth.getUser(token);
        // data in the form of: result: { data: { user: User | null }, error: AuthError | null }
        if (result.error || !result.data?.user) {
            return next(new errorHandler_1.AppError("Invalid or expired token", 401));
        }
        // Attach user to request for later middleware/handlers
        const user = result.data.user;
        req.user = user;
        req.userId = user.id;
        next();
    }
    catch (err) {
        if (process.env.NODE_ENV === "development") {
            console.error("Authentication middleware error:", err);
        }
        next(new errorHandler_1.AppError("Authentication failed", 401));
    }
};
exports.requireAuth = requireAuth;
