import express from "express";
import cors from "cors";
import authRoutes from './routes/authRoutes.js';
// import slotRoutes from "./routes/slotRoutes.js";
// import bookingRoutes from "./routes/bookingRoutes.js";

const app = express();
app.use(express.json());
app.use(cors({}));

app.use("/auth", authRoutes);
// // app.use("/slots", slotRoutes);
// app.use("/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
