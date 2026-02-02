import express from "express";
import auth from "../../middlewares/middleware.auth.js";
import controller from "./problems.controller.js";
import { validator } from "../../middlewares/middleware.validator.js";
import validateSchema from "./problems.validateSchema.js";


const problemsRoutes = express.Router();

problemsRoutes.get("/:problemId",[auth], controller.getDSAProblem)

problemsRoutes.post("/:problemId/submit",[auth, validator(validateSchema.submitDSAQuestion)], controller.submitDSAQuestion)


export default problemsRoutes;