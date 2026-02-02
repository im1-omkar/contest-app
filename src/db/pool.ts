import pg from "pg";
const URL = "";

/***test purpose */

import dotenv from "dotenv";
dotenv.config();

/***test purpose */

console.log("db secret is : " +  process.env.DB_SECRET);

export const pool = new pg.Pool({
  connectionString: process.env.DB_SECRET,
});