import express from "express";
import pool from "../db/db.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

/**
 * @route   POST /bookings
 * @desc    Create a new booking if user hasn't booked before and slot has vacancies
 * @access  Private (JWT Verified Users)
 */
router.post("/", verifyJWT, async (req, res) => {
    const { slotId } = req.body;
    const userId = req.user.id;

    try {
        const client = await pool.connect();
        await client.query('BEGIN');

        // First check if user has any existing bookings
        const userBookingsResult = await client.query(
            "SELECT * FROM bookings WHERE user_id = $1",
            [userId]
        );

        console.log(userBookingsResult.rows);

        if (userBookingsResult.rows.length > 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ 
                error: "You have already registered for a slot. Multiple bookings are not allowed." 
            });
        }

        // Check if slot exists and has vacancies
        const slotResult = await client.query(
            "SELECT * FROM slots WHERE id = $1 FOR UPDATE",
            [slotId]
        );

        if (slotResult.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ error: "Slot not found" });
        }

        console.log(userId);
        const slot = slotResult.rows[0];

        // Check if vacancies available
        if (parseInt(slot.vacancies) <= 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ error: "This slot is full. Please select another slot." });
        }

        // Create booking
        await client.query(
            "INSERT INTO bookings (user_id, slot_id) VALUES ($1, $2)",
            [userId, slotId]
        );

        // Decrement vacancy count
        await client.query(
            "UPDATE slots SET vacancies = $1 WHERE id = $2",
            [(parseInt(slot.vacancies) - 1).toString(), slotId]
        );

        await client.query('COMMIT');
        client.release();

        return res.status(201).json({
            message: "Slot booked successfully!",
            booking: {
                userId,
                slotId,
                day: slot.day,
                timing: slot.timing,
                remainingVacancies: parseInt(slot.vacancies) - 1
            }
        });

    } catch (err) {
        console.error("Error creating booking:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   GET /bookings
 * @desc    Get user's booking if it exists
 * @access  Private (JWT Verified Users)
 */
router.get("/", verifyJWT, async (req, res) => {
    const userId = req.user.id;

    try {
        const client = await pool.connect();
        const result = await client.query(
            `SELECT b.*, s.day,s.timing 
             FROM bookings b 
             JOIN slots s ON b.slot_id = s.id 
             WHERE b.user_id = $1`,
            [userId]
        );
        client.release();

        if (result.rows.length === 0) {
            return res.status(204).json({ 
                message: "You haven't booked any slots yet" 
            });
        }

        return res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error("Error fetching booking:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});


export default router;