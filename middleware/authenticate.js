import admin from "../config/firebase.js";
import pool from "../db/db.js";

const authenticateFirebaseUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const email = decodedToken.email;
        const name = decodedToken.name;

        const client = await pool.connect();

        // Check if user has access in `user_slots`
        const userSlotResult = await client.query(
            "SELECT email FROM user_slots WHERE email = $1",
            [email]
        );

        client.release();

        if (userSlotResult.rowCount === 0) {
            return res.status(403).json({ message: "Access denied: No booking permission" });
        }

        // Attach user data to request
        req.user = {
            name: name,
            email: email,
            googleId: decodedToken.uid,
        };

        next(); // Move to the next middleware or route handler
    } catch (err) {
        console.error("Authentication Error:", err);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

export default authenticateFirebaseUser;
