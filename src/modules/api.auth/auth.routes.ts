import express from "express";
import { validator } from "../../middlewares/middleware.validator.js";
import validateSchema from "./auth.validateSchema.js";
//import controller from "./auth.controller"
import controller from "./auth.controller.js";

const userRouter = express.Router();

userRouter.post("/signup",validator(validateSchema.signup),controller.signup)

userRouter.post("/signin", validator(validateSchema.signin), controller.signin)

export default userRouter;