import express from "express";
import {
  cancelEvent,
  createEvent,
  getEventById,
  getEvents,
  getOrganizerEvents,
  getUserEvents,
  joinEvent,
  leaveEvent,
  updateEvent,
} from "../controllers/eventControllerClean";
import {
  authenticateToken,
  optionalAuthenticateToken,
} from "../middlewares/authMiddleware";
import { requireOrganizer } from "../middlewares/roleMiddleware";

const router = express.Router();

// Public routes
router.get("/events", getEvents);
// Event detail (dinamik id en sonda!) - with optional auth to check if user is attending
router.get("/events/:eventId", optionalAuthenticateToken, getEventById);

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
router.post("/events/:eventId/leave", authenticateToken, leaveEvent);

export default router;
