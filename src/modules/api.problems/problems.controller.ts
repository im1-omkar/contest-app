import express from "express"
import { pool } from "../../db/pool.js";
import responses from "../../utils/responses.js";

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
        console.log("internal server error : "+ err.message);
        res.status(500).send("internal server error")
        return
    }

}

const controller = {

    "getDSAProblem":getDSAProblem

}

export default controller;
