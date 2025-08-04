import express from "express";
import {
  getAllEventAttendanceRequests,
  getEventAttendanceRequests,
  manageAttendanceRequest,
} from "../controllers/eventAttendanceController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requireOrganizer } from "../middlewares/roleMiddleware";

const router = express.Router();

// Attendance routes
router.get(
  "/attendance",
  authenticateToken,
  requireOrganizer,
  getAllEventAttendanceRequests
);
router.get(
  "/attendance/:eventId/requests",
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

export default router;
