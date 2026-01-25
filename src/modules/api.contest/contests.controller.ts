import express from "express";
import responses from "../../utils/responses.js";
import { pool } from "../../db/pool.js";

async function createContest(req:express.Request, res:express.Response){

    const role = (req as any).role;
    const creatorId = (req as any).id;

    const title = req.body.title
    const description = req.body.description;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;

    if(role !== "creator"){
            res.status(401).json(responses.error("FORBIDDEN"));
            return
    }

    try{

        //add the contest in DB
        const result = await pool.query("INSERT INTO contests (title, description, creator_id, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING *",[title, description, creatorId, startTime, endTime])
        console.log(result)
        res.status(200).json(responses.success(result.rows[0]));
        return;    
        
    }
    catch(err:any){
        console.log("error during creatingContest : " + err.message);
        res.status(500).send("internval server error");
        return;
    }
    
}

async function getContest(req:express.Request, res:express.Response){

    const contestId = req.params.contestId;

    try{

        //get contest Id
        const result = pool.query("SELECT * FROM contests WHERE contestId = $1",[contestId])

        res.status(200).json()

    }
    catch(err){
        
    }

}

const controller = {
    "createContest": createContest
}

export default controller;