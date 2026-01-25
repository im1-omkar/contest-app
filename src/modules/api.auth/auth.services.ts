//write read code here -> calling db
import { email, number } from "zod";
import { pool } from "../../db/pool.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "JWT_SECRET";

/**
 * write a function to check wheter the email already exists
 * && return true or false based on it
 */
export async function checkEmail(email:String){

    //const dbRes = DB query to find user with given email
    const dbRes:any = await pool.query("SELECT * FROM users WHERE email = $1",[email])

    //if(dbRes) --> return true
    if(dbRes.rowCount > 0){
        return true
    }
    //if(dbRes) --> return false
    return false
}


/**
 * write function to take (user, email, password, role) & 
 * store in DB --> if role == null -> write contestee in DB
 */

export async function userEnteryInDb(name:string,email:string,hash:string,role:string){
    
    await pool.query("INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4);",[name,email,hash,role])

}

/**
 * getUser 
 */

export async function getUser(email:string){

    const user = await pool.query("SELECT * FROM users WHERE email = $1",[email])

    return user.rows[0]

}

export function getJWT({id,name,role} : {id:string,name:string,role:string}){
    const jwtToken = jwt.sign({
        "id":id,
        "name":name,
        "role":role
    },JWT_SECRET)

    return jwtToken;
}