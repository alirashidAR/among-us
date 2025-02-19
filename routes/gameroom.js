import express from "express";
import pool from "../db/db.js";
const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT number FROM gameroom");
    const user = result.rows;
    console.log(user);
    const imposterIndex = [];
    for (let i = 0; i < Math.floor(user.length / 5); i++) {
      let index = Math.floor(Math.random() * user.length);
      while (imposterIndex.includes(index)) {
        index = Math.floor(Math.random() * user.length);
      }
      imposterIndex.push(index);
    }

    console.log(imposterIndex);
    const role = [];
    for (let i = 0; i < user.length; i++) {
      if (imposterIndex.includes(i)) {
        role.push("Imposter");
      } else {
        role.push("Crewmate");
      }
    }
    console.log(role);
    // const query1= `UPDATE gameroom SET ROLE=${role}.`

    res.status(200).send("Badhiya");
  } catch (err) {
    console.error("Error fetching slots:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
export default router;
