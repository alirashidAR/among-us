import express from "express";
import authenticateFirebaseUser from "../middleware/authenticate.js";
import jwt from "jsonwebtoken";
import pool from "../db/db.js";

const router = express.Router();

router.post("/", authenticateFirebaseUser, async (req, res) => {
    try {
        const jwtToken = jwt.sign(req.user, process.env.JWT_SECRET, { expiresIn: "2h" });
        
        const client = await pool.connect();

        // Check if user exists in `users` table if not insert and return the user in the user table
        const userResult = await client.query(
            "SELECT * FROM users WHERE email = $1",
            [req.user.email]
        );

        if (userResult.rowCount === 0) {
            await client.query(
                "INSERT INTO users (email, name, google_uid) VALUES ($1, $2, $3)",
                [req.user.email, req.user.name, req.user.googleId]
            );
        }

        const updatedUserResult = await client.query(
            "SELECT * FROM users WHERE email = $1",
            [req.user.email]
        );

        client.release();
        res.json({
            success: true,
            token: jwtToken,
            user: updatedUserResult.rows[0],
            email: req.user.email,
            name: req.user.name,
        });
    } catch (error) {
        console.error("Auth Route Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
