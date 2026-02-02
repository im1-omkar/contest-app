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
            res.status(403).json(responses.error("FORBIDDEN"));
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

async function createDSAQuestion(req: express.Request, res: express.Response){
    const contestId = req.params.contestId;
    const role = (req as any).role;
    //role should be creator

    if(role != "creator"){
        res.status(403).json(responses.error("FORBIDDEN"));
        return;
    }

    try{
        //find contest with contestId
        //if not present --> send response
        const validateContest = await pool.query("SELECT * FROM contests WHERE id = $1",[contestId]);
        if(validateContest.rows.length == 0){
            res.status(404).json(responses.error("CONTEST_NOT_FOUND"));
            return;
        }
        //insert dsa problem -> getId -> insert into 

        const insertDSA : any= await pool.query("INSERT INTO dsa_problems (contest_id, title, description, tags, points, time_limit, memory_limit) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",[contestId, req.body.title, req.body.description, JSON.stringify(req.body.tags), req.body.points, req.body.timeLimit, req.body.memoryLimit])
        const dsaQuestionId = insertDSA.rows[0].id;

        //insert data into 
        const testCasesLen = req.body.testCases.length;

        for(let i = 0; i< testCasesLen; i++){
            await pool.query("INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES ($1, $2, $3, $4)",[dsaQuestionId,req.body.testCases[i].input, req.body.testCases[i].expectedOutput, req.body.testCases[i].isHidden]);
            
            /**for future add a checkpoint that if inserting into the test_cases failes --> should delete the DSA_question row as well, which was just created */
        }
           
        res.status(201).json(responses.success({
            "id" : insertDSA.rows[0].id,
            "contestId" : contestId
        }))
        return;


    }
    catch(err: any){
        console.log("internal server error: " + err.message);
        res.status(500).send("internal server error");
        return;
    }
}

async function getLeaderboard(req:express.Request, res:express.Response){

    const contestId = req.params.contestId;

    try{    
            //contest not found error

            //  fetch mcq submisstion points
            const mcqQuery = `
            SELECT ms.user_id, u.name, SUM(ms.points_earned) AS total_mcq
            FROM mcq_submissions ms
            JOIN mcq_questions mq ON mq.id = ms.question_id
            JOIN users u ON u.id = ms.user_id
            WHERE mq.contest_id = $1
            GROUP BY ms.user_id, u.name;
            `;
            const mcqData = await pool.query(mcqQuery, [contestId]);


            // fetch dsa submission point
            const dsaQuery = `
            SELECT ds.user_id, u.name, SUM(ds.points_earned) AS total_dsa
            FROM dsa_submissions ds
            JOIN dsa_problems dp ON dp.id = ds.problem_id
            JOIN users u ON u.id = ds.user_id
            WHERE dp.contest_id = $1
            GROUP BY ds.user_id, u.name;
            `;
            const dsaData = await pool.query(dsaQuery, [contestId]);


            //  merger mcq + dsa points
            const scores : any = {};

            // MCQ points
            mcqData.rows.forEach(row => {
            scores[row.user_id] = {
                userId: row.user_id,
                name: row.name,
                totalPoints: Number(row.total_mcq),
            };
            });

            // dsa points
            dsaData.rows.forEach(row => {
            if (!scores[row.user_id]) {
                scores[row.user_id] = {
                userId: row.user_id,
                name: row.name,
                totalPoints: 0
                };
            }

            scores[row.user_id].totalPoints += Number(row.total_dsa);
            });


            //Convert to array
            let leaderboard : any = Object.values(scores);

            //Sort by totalPoints desc
            leaderboard.sort((a: any, b:any) => b.totalPoints - a.totalPoints);

            // Assign rank with tie-handling
            if (leaderboard.length > 0) {
            leaderboard[0].rank = 1;

                for (let i = 1; i < leaderboard.length; i++) {
                    if (leaderboard[i].totalPoints === leaderboard[i - 1].totalPoints) {
                    leaderboard[i].rank = leaderboard[i - 1].rank;
                    } else {
                    leaderboard[i].rank = i + 1;
                    }
                }
            }

            res.status(201).json(responses.success(leaderboard));
            return;
    }
    catch(err:any){
        console.log("internal server error while createing leaderboard : " + err.message);
        res.status(500).send("internal servers error");
    }

}

const controller = {
    "createContest": createContest,
    "getContest":getContest,
    "addMCQ" : addMCQ,
    "submitMCQ":submitMCQ,
    "createDSAQuestion" : createDSAQuestion,
    "getLeaderboard" : getLeaderboard
}

export default controller;