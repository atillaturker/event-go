// src/index.ts
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json()); // JSON body'leri okuyabilmek için

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/", eventRoutes);

app.get("/", (req, res) => {
  res.send("EventGo API çalışıyor 🚀");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server ${PORT} portunda çalışıyor ✅`);
});
