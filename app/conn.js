import mysql2 from "mysql2";
import dotenv from 'dotenv';
dotenv.config()

function conn() {
    const conn = mysql2.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    })
}

export default conn;