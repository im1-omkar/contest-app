import {writeFileSync} from "fs"
import {exec} from "child_process"

// async function checkTestCases(language : String, code : String, testCases: []){

//     let passed = 0
//     console.log("language : " + language + " code : " + code + " testCases : " + testCases)

//     testCases.map(async (test:any)=>{
//         let flag = true;
//         const input = test.input;
//         const expectedOutput = test.expected_output;

//         //extract the first NUMBER of input 

//         let n = input.split(/[\s]+/)[0];
        
//         for(let i =0; i<n ; i++){
//             let inputRows = input.split("\n")[2*i+2]
//             let target = input.split("\n")[2*i + 1]
//             let expectedOutputRow = expectedOutput.split("\n")[i]

//             const result = (await execute(code, target, inputRows, expectedOutputRow) as any);

//             if( result == "time_limit_exceed" || 
//                 (result == "runtime_error")){
//                 flag = false;
//                 return result;

//             };

//         }

//         if(flag){
//             passed += 1;
//         }

//     })

//     return passed;

// }

// async function execute(code: String , target: number, inputRows: [], expectedOutput : []){

//     //write in temp file -> feed the code with given inputs (by calling the function with given inputs)
//     writeFileSync("user.js", (code as any));

//     //execute the file -> get the output -> does it matches with expected_output ?
//     exec("node user.js",{timeout: 3000}, (runError, stdout, stderr)=>{
//         if(runError){
//             return "runtime_error"
//         }

//         if((runError as any).killed){
//             return "time_limit_exceed"
//         }

//         if( (stdout) == (expectedOutput.join(" "))){
//             return true;
//         }
//         else{
//             return false;
//         }
//     })

// }

async function checkTestCases(language: string, code: string, testCases: any[]) {

    // store code in fle
    writeFileSync("user.js", code);

    let passed = 0;

    // run test cases sequentially
    for (const test of testCases) {

        const input = test.input.trim();
        const expectedOutput = test.expected_output.trim();

        // first number =--> number of test cases
        const splitInput = input.split("\n");
        const n = Number(splitInput[0]);

        let allPassed = true;

        for (let i = 0; i < n; i++) {

            const target = splitInput[2 * i + 1];
            const inputRow = splitInput[2 * i + 2];

            const expectedRow = expectedOutput.split("\n")[i]?.trim();

            const result = await execute(
                code,
                target,
                inputRow,
                expectedRow
            );

            if (result === "time_limit_exceed" || result === "runtime_error") {
                return result;  // stop execution immediatelly
            }

            if (result !== true) {
                allPassed = false;
                break;
            }
        }

        if (allPassed) passed++;
    }

    return passed;
}

function execute(code: string, target: string, inputRow: string, expectedOutput: string): Promise<any> {

    return new Promise((resolve) => {

        exec(`node user.js`, { timeout: 3000 }, (err, stdout, stderr) => {

            if (err?.killed) {
                return resolve("time_limit_exceed");
            }

            if (err) {
                return resolve("runtime_error");
            }

            const actual = stdout.trim();
            const expected = expectedOutput.trim();

            if (actual === expected) {
                return resolve(true);
            } else {
                return resolve(false);
            }
        });
    });
}

const services = {
    "checkTestCases" : checkTestCases
};

export default services;

