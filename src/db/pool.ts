import pg from "pg";
const URL = "";

export const pool = new pg.Pool({
  connectionString: "postgresql://neondb_owner:npg_bSgP2k3tZdso@ep-morning-dawn-ahqqqwkr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});