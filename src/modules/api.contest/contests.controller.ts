import express, { response } from "express";
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
        const result:any = await pool.query("SELECT * FROM contests WHERE id = $1",[contestId])

        if((result.rows.length) == 0){
            res.status(404).json(responses.error("CONTEST_NOT_FOUND"));
        }

        const mcqs:any = await pool.query("SELECT id, question_text, options, points FROM mcq_questions WHERE contest_id = $1",[contestId]);

        const dsaProblems:any =  await pool.query("SELECT id, title, description, tags, points, time_limit, memory_limit FROM dsa_problems WHERE contest_id = $1",[contestId]);

        res.status(200).json(responses.success({
            ...result.rows[0],
            mcqs: mcqs.rows,
            dsaProblems: dsaProblems.rows
        }))

    }
    catch(err:any){
        console.log("errro while getting contests : " + err.message)
        res.json("internal server erorr")
    }

}

async function addMCQ(req: express.Request, res: express.Response){
    if((req as any).role != "creator"){
        res.status(403).json(responses.error("FORBIDDEN"))
        return;
    }

    const contestId = req.params.contestId;

    const questionText = req.body.questionText;
    const options = req.body.options;
    const correctOptionIndex = req.body.correctOptionIndex;
    const points = req.body.points;

    try{

        const contestFound = await pool.query("SELECT * FROM contests WHERE id = $1",[contestId]);

        if(contestFound.rows.length === 0){
            res.status(404).json(responses.error("CONTEST_NOT_FOUND"))
            return
        }

        const result = await pool.query("INSERT INTO mcq_questions (contest_id, question_text, options, correct_option_index, points) VALUES ($1, $2, $3, $4, $5) RETURNING *",[contestId, questionText, JSON.stringify(options), correctOptionIndex, points])

        res.status(201).json(responses.success({
            "id" : result.rows[0].id,
            "contestId" : contestId
        }))
        return

    }
    catch(err: any){
        console.log("internal server error : " + err);
        res.status(500).json(responses.error("internal server erorr"));
        return
    }

}

async function submitMCQ(req: express.Request, res : express.Response){
    /**DOES GIVEN questionId is mapped to the correct contestId ? */

    const role = (req as any ).role;
    const userId = (req as any).id;
    
    const questionId = req.params.questionId;
    const contestId = req.params.contestId;

    const selectedOptionIndex = req.body.selectedOptionIndex;

    if(role != "contestee"){
        res.status(403).json(responses.error("FORBIDDEN"));
        return;
    }

    try{

        //check if questionId is valid
        const validQuestion = await pool.query("SELECT * FROM mcq_questions WHERE id = $1",[questionId])

        if(validQuestion.rows.length  == 0){
            res.status(404).json(responses.error("QUESTION_NOT_FOUND"));
            return
        }

        // get the contest using the contestId
        const validContest = await pool.query("SELECT * FROM contests WHERE id = $1",[contestId])

        if(validContest.rows.length == 0){
            res.status(404).json(responses.error("CONTEST_NOT_FOUND"));
            return
        }

        //check if contest is active or not??
        const now = new Date();
        const contestEnd = new Date(validContest.rows[0].end_time);


        if (now > contestEnd) {
             return res.status(400).json(responses.error("CONTEST_NOT_ACTIVE"));
        }

        //check if already submitted
        const alreadySubmitted = await pool.query("SELECT * FROM  mcq_submissions WHERE user_id = $1 and question_id = $2",[userId, questionId]);

        if(alreadySubmitted.rows.length >0){
            res.status(400).json(responses.error("ALREADY_SUBMITTED"));
            return
        }

        const isCorrect = (validQuestion.rows[0].correct_option_index == selectedOptionIndex )? true : false; 

        const pointsEarned = (isCorrect) ? validQuestion.rows[0].points : 0;

        //insert the submitted contest in DB finally!!
        const result = await pool.query(`INSERT INTO mcq_submissions (user_id, question_id, selected_option_index, is_correct, points_earned) VALUES ($1, $2, $3, $4, $5)`, [userId, questionId, selectedOptionIndex, isCorrect, pointsEarned]);

        res.status(201).json(responses.success({
            "isCorrect": isCorrect,
            "pointsEarned" : pointsEarned
        }))

        return

    }catch(err:any){
        console.log("internval server error : " + err.message);
        res.json(500).send("internal server error");
        return;
    }

}

const controller = {
    "createContest": createContest,
    "getContest":getContest,
    "addMCQ" : addMCQ,
    "submitMCQ":submitMCQ
}

export default controller;