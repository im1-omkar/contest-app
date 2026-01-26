import express from "express";
import auth from "../../middlewares/middleware.auth.js";
import controller from "./problems.controller.js";


const problemsRoutes = express.Router();

problemsRoutes.get("/:problemId",[auth], controller.getDSAProblem)

problemsRoutes.post("/:problemId",(req:express.Request , res:express.Response)=>{
    
})

problemsRoutes.post("/:problemId",(req:express.Request , res:express.Response)=>{
    
})

export default problemsRoutes;