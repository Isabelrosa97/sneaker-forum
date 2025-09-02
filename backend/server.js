import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection 
const pool = mysql.createPool ({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "sneaker_forum"
});

function authenticateToken (req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.sendStatus(401);
}