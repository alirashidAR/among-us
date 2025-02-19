import express from "express";
import pool from "../db/db.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();
router.patch("/", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT number FROM gameroom");
    const user = result.rows;
    
    const imposterIndex = [];
    for (let i = 0; i < Math.floor(user.length / 5); i++) {
      let index = Math.floor(Math.random() * user.length);
      while (imposterIndex.includes(index)) {
        index = Math.floor(Math.random() * user.length);
      }
      imposterIndex.push(index);
    }

    
    const role = [];
    for (let i = 0; i < user.length; i++) {
      if (imposterIndex.includes(i)) {
        role.push("Imposter");
      } else {
        role.push("Crewmate");
      }
    }
   
    for (let i = 0; i < user.length; i++) {
      await client.query("UPDATE gameroom SET roles = $1 WHERE number = $2", [
        role[i],
        i+1,
      ]);
    }
    res.status(200).send("Roles Alloted");
  } catch (err) {
    console.error("Error fetching slots:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/showRoles", verifyJWT ,async (req, res) => {
  const userId = req.user.id;
  console.log(userId);

  try {
      const client = await pool.connect();
      const result = await client.query(
          `SELECT roles 
           FROM gameroom
           WHERE id = '${userId}'`,
         
      );
      if(result.rows[0].roles === "Crewmate"){
          return res.status(200).json({ message: "You are a Crewmate" });
      }
      else{
        const impost = await client.query(
          `SELECT number
           FROM gameroom
           WHERE roles = 'Imposter'`,
);
        res.json({ message: "You are an Imposter", imposters: impost.rows });
      
      }
      
    } catch (err) {
      console.error("Error fetching booking:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  
  });


export default router;
