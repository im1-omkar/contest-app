import express from "express";
import auth from "../../middlewares/middleware.auth.js";
import { validator } from "../../middlewares/middleware.validator.js";
import validateSchema from "./contests.validateSchema.js";
import controller from "./contests.controller.js";

const contestsRouter = express.Router();

contestsRouter.post("/", [auth, validator(validateSchema.createContest)], controller.createContest)

contestsRouter.get("/:contestId", auth ,controller.getContest)

contestsRouter.post("/:contestId/mcq", [auth, validator(validateSchema.addMCQ)], controller.addMCQ)

contestsRouter.post("/:contestId/mcq/:questionId/submit",[auth, validator(validateSchema.submitMCQ)], controller.submitMCQ)

contestsRouter.post("/:contestId/dsa", [auth, validator(validateSchema.createDSAQuestion)], controller.createDSAQuestion)

contestsRouter.get("/:contestId/leaderboard",[auth], controller.getLeaderboard);

export default contestsRouter;