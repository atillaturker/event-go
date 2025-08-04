import express from "express";
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notificationController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

// Kullanıcının bildirimlerini getir (sadece okunmamış)
router.get("/notifications", authenticateToken, getUserNotifications);

// Tek bildirimi okundu işaretle
router.patch(
  "/notifications/:notificationId/read",
  authenticateToken,
  markNotificationAsRead
);

// Tüm bildirimleri okundu işaretle
router.patch(
  "/notifications/read-all",
  authenticateToken,
  markAllNotificationsAsRead
);

export default router;
