import { z } from "zod"
import dotenv from "dotenv"

dotenv.config()

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  PORT: z.string().transform(Number).default("4000"),
  FRONTEND_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

export const env = envSchema.parse(process.env)
