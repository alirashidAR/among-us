import express from "express";
import authenticateFirebaseUser from "../middleware/authenticate.js"; 

const router = express.Router();


router.post("/", authenticateFirebaseUser, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name,
                day: req.user.day
            }
        });
    } catch (error) {
        console.log("Auth Route Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
