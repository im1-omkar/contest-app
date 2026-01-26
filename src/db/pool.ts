import pg from "pg";
const URL = "";

export const pool = new pg.Pool({
  connectionString: "postgresql://neondb_owner:npg_hvVQ1kXmlPD8@ep-morning-dawn-ahqqqwkr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require'",
});