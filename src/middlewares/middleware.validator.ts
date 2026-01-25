import express from "express";
import * as z from "zod";
import  responses  from "../utils/responses.js";

export function validator(validateSchema:any /**here only few specific types of bodys are allowed */){

    return (req:express.Request,res:express.Response,next:express.NextFunction)=>{
        //make zod validation of request.body
        try{
            validateSchema.parse(req.body);
            next()
        }
        catch(err:any){
            console.log("invalid body format :  " + err.message)
            res.status(400).json(responses.error("INVALID_REQUEST"))
            return
        }
    }

}