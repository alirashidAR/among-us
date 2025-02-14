import express from "express";
import authenticateFirebaseUser from "../middleware/authenticate.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", authenticateFirebaseUser, (req, res) => {
    try {
        const jwtToken = jwt.sign(req.user, process.env.JWT_SECRET, { expiresIn: "2h" });

        res.json({
            success: true,
            token: jwtToken,
            user: req.user,
        });
    } catch (error) {
        console.error("Auth Route Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
