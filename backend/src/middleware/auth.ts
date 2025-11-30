import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase";
import { AppError } from "./errorHandler";


export const requireAuth = async (
    req: Request, 
    res: Response, 
    next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError("Missing Authorization header", 401));
  }

  const parts = authHeader.split(" ");
  if (parts[0] !== "Bearer" || parts.length !== 2) {
    return next(new AppError("Invalid Authorization header format", 401));
  }

  const token = parts[1];

  try {
    const result = await supabase.auth.getUser({ accessToken: token } as any);

    // data in the form of: result: { data: { user: User | null }, error: AuthError | null }
    if (result.error || !result.data?.user) { 
      return next(new AppError("Invalid or expired token", 401));
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
    next(new AppError("Authentication failed", 401));
  }
};
