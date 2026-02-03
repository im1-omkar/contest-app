import express, { response } from "express"
import { pool } from "../../db/pool.js";
import responses from "../../utils/responses.js";
import services from "./problems.services.js";
import { number } from "zod";


async function getDSAProblem(req:express.Request, res: express.Response ){

    const problemId = req.params.problemId;

    try{

        //find the problem given test case
        //-> if not found --> give back response
        const problem = await pool.query("SELECT id, contest_id, title, description, tags, points, time_limit, memory_limit FROM dsa_problems WHERE id = $1",[problemId]);

        if(problem.rows.length == 0){
            res.status(404).json(responses.error("PROBLEM_NOT_FOUND"));
            return;
        }

        const p:any = problem.rows[0];
        console.log(p)

        //find the corresponding test-cases
        const testCases = await pool.query("SELECT input, expected_output FROM test_cases WHERE problem_id = $1 AND is_hidden = $2 ",[problemId, false]);

        const visibleTestCases = testCases.rows.map(tc => ({
            "input": tc.input,
            "expectedOutput": tc.expected_output,
        }));

        //send back the response in correct format
        res.status(200).json(responses.success({
            id: p.id,
            contestId: p.contest_id,
            title: p.title,
            description: p.description,
            tags: p.tags,
            points: p.points,
            timeLimit: p.time_limit,
            memoryLimit: p.memory_limit,
            "visibleTestCases" : visibleTestCases
        }))

        return

    }
    catch(err:any){
        console.log("internal server error while getting dsa problem : "+ err.message);
        res.status(500).send("internal server error")
        return
    }

}

async function submitDSAQuestion(req: express.Request, res: express.Response){
    const role = (req as any).role;
    const problemId = req.params.problemId;
    const code = req.body.code;

    if(role != "contestee"){
        res.status(403).json(responses.error("FORBIDDEN"));
        return;
    }

    try{

        //get problem from problemId
        //if(problm.rows.length == 0)
        const problem:any = await pool.query("SELECT * FROM dsa_problems WHERE id = $1",[problemId]);

        if(problem.rows.length == 0){
            res.status(404).json(responses.error("PROBLEM_NOT_FOUND"));
            return
        }

        //const contestId = problem.id
        const contestId = problem.rows[0].contest_id;
        
        //get contest from contestId
        const contest:any = await pool.query("SELECT * FROM contests WHERE id = $1",[contestId]);
        const endTime = new Date(contest.rows[0].end_time);
        const now = new Date()


        //check the end_time of contest
        if(now > endTime){
            res.status(400).json(responses.error("CONTEST_NOT_ACTIVE"));
            return
        }

        //take out testcases from test_cases
        const testCases = await pool.query("SELECT * FROM test_cases WHERE problem_id = $1",[problemId]);
        

        //check the test cases in corresponding time-limit
        const result = services.checkTestCases((req as any).language, code, (testCases as any).rows )

        let submisstionStatus:any = "result";
        if(typeof result === 'number'){
            if(result == testCases.rows.length){
                submisstionStatus = "accepted";
            }

            if(result < testCases.rows.length){
                submisstionStatus = "wrong_answer";
            }
        }
        else{
            submisstionStatus = (result as any);
        }

        //strore the result in DB
        await pool.query("INSERT INTO dsa_submissions (user_id, problem_id, code, language, status, points_earned, test_cases_passed, total_test_cases) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",[(req as any).id, problem.rows[0].id, code, req.body.language, submisstionStatus, ((typeof result === 'number')? (Math.floor((result / testCases.rows.length) * problem.points)) : 0), (typeof result === 'number')? result: 0, testCases.rows.length ])

        //send back the result
        if(typeof result === 'number'){
            if(result == testCases.rows.length ){
                res.status(201).json(responses.success({
                    "status": "accepted",
                    "pointsEarned" : problem.points,
                    "testCasesPassed" : result,
                    "totolTestCases": result
                }))

                return
            }
            
            if(result < testCases.rows.length){
                res.status(201).json(responses.success({
                    "status": "wrong_answer",
                    "pointsEarned" :  (Math.floor((result / testCases.rows.length) * problem.points)),
                    "testCasesPassed" : result,
                    "totalTestCases": testCases.rows.length
                }))

                return
            }
        }
        
        if((result as any) == "time_limit_exceed"){
            res.status(201).json(responses.success({
                "status":"time_limit_exceed",
                "pointsEarned": 0,
                "testCasesPassed" : 0,
                "totalTestCases" : testCases.rows.length
            }))

            return
        }

        if((result as any) == "runtime_error"){
            res.status(201).json(responses.success({
                "status":"runtime_error",
                "pointsEarned": 0,
                "testCasesPassed" : 0,
                "totalTestCases" : testCases.rows.length
            }))

            return

        }

    }
    catch(err:any){
        console.log("internal server error while submitting error : "+ err.message)
        res.status(500).send("internal server error")
        return
    }
}

const controller = {

    "getDSAProblem":getDSAProblem,
    "submitDSAQuestion" : submitDSAQuestion

}

export default controller;
