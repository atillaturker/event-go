import express from "express";
import {
  createEvent,
  getEventById,
  getEvents,
} from "../controllers/eventControllerClean";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requireOrganizer } from "../middlewares/roleMiddleware";

const router = express.Router();

// Public routes
router.get("/", getEvents); // Tüm eventleri listele
router.get("/:id", getEventById); // Tek event detayı

// Protected routes
router.post("/", authenticateToken, requireOrganizer, createEvent); // Event oluştur (sadece organizer)

export default router;
