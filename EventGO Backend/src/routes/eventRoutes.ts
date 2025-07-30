import express from "express";
import {
  cancelEvent,
  createEvent,
  getAllEventAttendanceRequests,
  getEventAttendanceRequests,
  getEventById,
  getEvents,
  getOrganizerEvents,
  getUserEvents,
  joinEvent,
  manageAttendanceRequest,
  updateEvent,
} from "../controllers/eventControllerClean";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requireOrganizer } from "../middlewares/roleMiddleware";

const router = express.Router();

// Public routes
router.get("/events", getEvents);

// Attendance routes (önce sabit endpointler!)
router.get(
  "/events/attendance",
  authenticateToken,
  requireOrganizer,
  getAllEventAttendanceRequests
);
router.get(
  "/events/:eventId/requests",
  authenticateToken,
  requireOrganizer,
  getEventAttendanceRequests
);

// Event detail (dinamik id en sonda!)
router.get("/events/:eventId", getEventById);

// Organizer routes
router.get(
  "/organizer/events",
  authenticateToken,
  requireOrganizer,
  getOrganizerEvents
);
router.post("/events", authenticateToken, requireOrganizer, createEvent);
router.patch(
  "/events/:eventId/cancel",
  authenticateToken,
  requireOrganizer,
  cancelEvent
);
router.put(
  "/events/:eventId",
  authenticateToken,
  requireOrganizer,
  updateEvent
);

// User routes
router.get("/user/events", authenticateToken, getUserEvents);
router.post("/events/:eventId/join", authenticateToken, joinEvent);

// Attendance management
router.put(
  "/attendance/:attendanceId",
  authenticateToken,
  requireOrganizer,
  manageAttendanceRequest
);

export default router;
