import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = process.env.PORT || 5001;
const SECRET = process.env.JWT_SECRET;

// Test route
app.get("/test", (req, res) => {
  res.send("API is working!");
});

app.use(cors());
app.use(bodyParser.json());

// MySQL connection 
const pool = mysql.createPool ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// test connection 
pool.getConnection()
  .then(conn => {
    console.log("MySQL connection successful!");
    conn.release();
  })
  .catch(err => {
    console.error(" MySQL connection failed:", err);
  });
  

function authenticateToken (req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

//Register
app.post("/api/register", async (req, res) => {
    console.log("Request body:", req.body);

    const {username, email, password} = req.body;
    const hash = await bcrypt.hash(password, 10);
    try{
        await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            [username, email, hash]
        );
        res.json({ message: "User Registered"});
    } catch (err) {
        console.error("Register error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Login
app.post("/api/login", async (req, res) => {
    const {email, password} = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email =?", [email]);
    const user = rows[0];
    if(!user) return res.status(401).json({error: "Invalid Credentials"});

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({error: "Invalid Credentials"});

    const token = jwt.sign({ id: user.id, username: user.username}, SECRET, { expiresIn: "1h"});
    res.json({ token });
});

// Get categories
app.get("/api/categories", async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY name");
    res.json(rows);
});

// Get questions 
app.get("/api/questions", async (req, res) => {
    const [rows] = await pool.query(
        `SELECT q.id, q.title, q.body, q.category_id, u.username, q.created_at 
        FROM questions q JOIN users u ON q.user_id = u.id 
        ORDER BY q.created_at ASC`
    );
    res.json(rows);
});

// Get single question by ID
app.get("/api/questions/:id", async (req, res) => {
    try{
        const [rows] = await pool.query(
            `SELECT q.id, q.title, q.body, q.category_id, u.username, q.created_at
            FROM questions q
            JOIN users u ON q.user_id = u.id
            WHERE q.id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json ({ error: "Question not found"});
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error fetching question:", err);
        res.status(500).json({ error: "Failed to fetch question"});
    }
})

// Post question 
app.post ("/api/questions", authenticateToken, async (req, res) => {
    const { title, body, category_id } = req.body;
    try{
        const [result] = await pool.query(
            "INSERT INTO questions (user_id, title, body, category_id) VALUES (?, ?, ?, ?)",
            [req.user.id, title, body, category_id]
        );
        const insertId = result.insertId;
        const [rows] = await pool.query(
            `SELECT q.id, q.title, q.body, q.category_id, u.username, q.created_at
             FROM questions q
             JOIN users u ON q.user_id = u.id
             WHERE q.id = ?`,
             [insertId]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error("Error:", err);
        res.status(400).json({error: err.message});
    }
});

// Delete question
app.delete("/api/questions/:id", authenticateToken, async (req, res) => {
    const questionId = req.params.id;
    try{
        const [rows] = await pool.query("SELECT user_id FROM questions WHERE id = ?", [questionId]);
        if (rows.length === 0) return res.status(404).json({error: "Question not found"});

        if (rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: "You can only delete your own questions"})
        }
        
        await pool.query("DELETE FROM questions WHERE id = ?", [questionId]);
        res.json({ message: "Question deleted"});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete question"});
    }
});


// Get answers for a question
app.get("/api/questions/:id/answers", async (req, res) => {
    const [rows] = await pool.query(
        `SELECT a.id, a.body, u.username, a.created_at
         FROM answers a JOIN users u ON a.user_id = u.id 
         WHERE a.question_id = ? 
         ORDER BY a.created_at ASC`,
         [req.params.id]
    );
    res.json(rows);
});

// Post an answer 
app.post("/api/questions/:id/answers", authenticateToken, async (req, res) => {
    const { body } = req.body;
    const questionId = parseInt(req.params.id);
    if (!body || !body.trim()) return res.status(400).json({ error: "Answer is required"});
    try{
        const result = await pool.query(
            "INSERT INTO answers (question_id, user_id, body) VALUES ( ?, ?, ?)",
            [questionId, req.user.id, body]
        );
        const [rows] = await pool.query(
            `SELECT a.id, a.body, u.username, a.created_at
            FROM answers a JOIN users u ON a.user_id = u.id
            WHERE a.id = ?`,
            [result[0].insertId]
        );
        res.json(rows[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to post answer"});
    }
});

// Delete answer
app.delete("/api/answers/:id", authenticateToken, async (req, res) => {
    const answerId = req.params.id;
    try{
        const [rows] = await pool.query("SELECT user_id FROM answers WHERE id = ?", [answerId]);
        if (rows.length === 0) return res.status(404).json({ error: "Answer not found"});

        if (rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: "You can only delete your own answers "});
        }
        
        await pool.query("DELETE FROM answers WHERE id = ?", [answerId]);
        res.json({ message: "Answer deleted"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to delete answer"});
    }
});

console.log("starting server...");
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
