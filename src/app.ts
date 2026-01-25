import express from "express";
import userRouter from "./modules/api.auth/auth.routes.js";
import contestsRouter from "./modules/api.contest/contests.routes.js";

const app = express();
app.use(express.json());

app.use("/api/auth",userRouter)
app.use("/api/contests", contestsRouter)

export default app;
