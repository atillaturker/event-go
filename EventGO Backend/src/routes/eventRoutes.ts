import express from "express";
import { getEventById, getEvents } from "../controllers/eventControllerClean";

const router = express.Router();

// Public routes
router.get("/", getEvents); // Tüm eventleri listele
router.get("/:id", getEventById); // Tek event detayı

export default router;
