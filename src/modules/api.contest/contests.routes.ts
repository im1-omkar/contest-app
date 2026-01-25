import express from "express";
import auth from "../../middlewares/middleware.auth.js";
import { validator } from "../../middlewares/middleware.validator.js";
import validateSchema from "./contests.validateSchema.js";
import controller from "./contests.controller.js";

const contestsRouter = express.Router();

contestsRouter.post("/", [auth, validator(validateSchema.createContest)], controller.createContest)

contestsRouter.get("/:contestId",/**getContest */)

contestsRouter.post("/:contestId/mcq",(req,res)=>{
    res.status(200).send("/:contestId/mcq POST health")
})

contestsRouter.post("/:contestId/mcq/:questionId/submit",(req,res)=>{
    res.status(200).send("/:contestId/mcq POST")
})

contestsRouter.post("/:contestId/mcq/:contestId/dsa",(req,res)=>{
    res.status(200).send("/:contestId/mcq POST")
})

export default contestsRouter;