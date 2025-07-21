import express from "express";
import {
  createEvent,
  getEventAttendanceRequests,
  getEventById,
  getEvents,
  getMyEvents,
  joinEvent,
  manageAttendanceRequest,
  updateEvent,
} from "../controllers/eventControllerClean";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requireOrganizer } from "../middlewares/roleMiddleware";

const router = express.Router();

// Public routes
router.get("/", getEvents);

// Protected routes - my-events önce olmalı
router.get("/my-events", authenticateToken, requireOrganizer, getMyEvents);
router.post("/", authenticateToken, requireOrganizer, createEvent);
router.put("/:id", authenticateToken, requireOrganizer, updateEvent);

// Attendance routes
router.post("/:eventId/join", authenticateToken, joinEvent);
router.get(
  "/:eventId/requests",
  authenticateToken,
  requireOrganizer,
  getEventAttendanceRequests
);
router.put(
  "/attendance/:attendanceId",
  authenticateToken,
  requireOrganizer,
  manageAttendanceRequest
);

// ID route en sonda olmalı
router.get("/:id", getEventById);

export default router;
