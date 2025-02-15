import express from "express";
import pool from "../db/db.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

/**
 * @route   POST /bookings
 * @desc    Book a slot
 * @access  Private (JWT Verified Users)
 */
router.get("/", verifyJWT, async (req, res) => {
    const day = req.user.day;
    try {
        const client = await pool.connect();

        const result = await client.query(
            "SELECT * FROM slots WHERE day = $1",
            [day]
        );

        client.release();

        return res.status(200).json(result.rows);

    } catch (err) {
        console.error("Error fetching slots:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;