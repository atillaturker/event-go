// src/index.ts
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "./jobs/cron";
import { startCronJobs } from "./jobs/cron";
import authRoutes from "./routes/authRoutes";
import eventAttendanceRoutes from "./routes/eventAttendanceRoutes";
import eventRoutes from "./routes/eventRoutes";
import notificationsRoute from "./routes/notificationsRoute";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/", eventAttendanceRoutes);
app.use("/api/", eventRoutes);
app.use("/api/", notificationsRoute);

app.get("/", (req, res) => {
  res.send("EventGo API çalışıyor 🚀");
});

startCronJobs();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server ${PORT} portunda çalışıyor ✅`);
});
