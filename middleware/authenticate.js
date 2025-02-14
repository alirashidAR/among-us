import admin from "../config/firebase.js";
import pool from "../db/db.js";

const authenticateFirebaseUser = async (req, res, next) => {
    const authHeader = req.headers.authorization
    console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    console.log(token);

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name } = decodedToken;
        req.user = { uid, email, name };

        const client = await pool.connect();

        const userSlotResult = await client.query(
            `SELECT id, day FROM user_slots 
             WHERE email = $1`,
            [email]
        );

        if (userSlotResult.rowCount === 0) {
            client.release();
            return res.status(403).json({ message: "Access denied: No booking found" });
        }

        const { id, day } = userSlotResult.rows[0];
        req.user.id = id;
        req.user.day = day;

        await client.query(
            `INSERT INTO users (id, google_uid, email, name) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (id) DO NOTHING;`,
            [id, uid, email, name]
        );

        client.release();

        next();
    } catch (err) {
        console.error("Firebase Authentication Error:", err);
        console.log(err);
        return res.status(401).json({ message: "Unauthorized: Invalid token or database error" });
    }
};

export default authenticateFirebaseUser;
