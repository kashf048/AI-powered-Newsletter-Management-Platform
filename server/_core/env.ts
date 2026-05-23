import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env files
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default("fallback_secret_for_local_development"),
  PORT: z.string().default("3000").transform(val => parseInt(val, 10)),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  BUILT_IN_FORGE_API_KEY: z.string().optional(),
  BUILT_IN_FORGE_API_URL: z.string().url().default("https://forge.manus.ai"),
  OAUTH_SERVER_URL: z.string().url().default("https://api.manus.im"),
  OWNER_NAME: z.string().default("Mansoor Ali"),
  OWNER_OPEN_ID: z.string().default("G3bMnM4qoUt6FDoRBYAXab"),
  VITE_APP_ID: z.string().default("PbWNmmJLvG7EgPvn48QQw6"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const ENV = {
  databaseUrl: parsed.data.DATABASE_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  port: parsed.data.PORT,
  nodeEnv: parsed.data.NODE_ENV,
  forgeApiKey: parsed.data.BUILT_IN_FORGE_API_KEY,
  forgeApiUrl: parsed.data.BUILT_IN_FORGE_API_URL,
  oauthServerUrl: parsed.data.OAUTH_SERVER_URL,
  ownerName: parsed.data.OWNER_NAME,
  ownerOpenId: parsed.data.OWNER_OPEN_ID,
  appId: parsed.data.VITE_APP_ID,
};
