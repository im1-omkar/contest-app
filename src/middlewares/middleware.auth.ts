import jwt from "jsonwebtoken";
import express from "express";
import responses from "../utils/responses.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET:any = process.env.JWT_SECRET;
console.log("jwt secret is : " + JWT_SECRET);

const auth = (req:express.Request, res:express.Response, next: express.NextFunction)=>{
    const bearerToken = req.headers.authorization;

    if(!bearerToken){
        res.status(401).json(responses.error("UNAUTHORIZED"))
        return
    }

    const token = bearerToken.split(" ")[1];
    if(!token){
        res.status(401).json(responses.error("UNAUTHORIZED"))
        return
    }

    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET missing from environment");
    }

    jwt.verify(token, JWT_SECRET,(err:any, decoded:any)=>{
        if(err){
            res.status(401).json(responses.error("UNAUTHORIZED"))
            return
        }

        const name = decoded.name;
        const role = decoded.role;
        const id = decoded.id;

        (req as any).username = name;
        (req as any).role = role;
        (req as any).id = id;

        next()

    })
}

export default auth

