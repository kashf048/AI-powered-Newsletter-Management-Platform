import { CookieOptions, Request } from "express";
import { ENV } from "./env";

export function getSessionCookieOptions(req: Request): CookieOptions {
  const isProd = ENV.nodeEnv === "production";
  
  return {
    httpOnly: true,
    secure: isProd || req.headers["x-forwarded-proto"] === "https",
    sameSite: isProd ? "lax" : "lax",
    path: "/",
  };
}
