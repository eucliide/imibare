import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// This uses HTTP, not TCP. It works perfectly on Cloudflare Workers.
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });