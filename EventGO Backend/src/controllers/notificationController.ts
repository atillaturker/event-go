import { Request, Response } from "express";
import { NotificationType, PrismaClient } from "../generated/prisma";
import { createNotificationContent } from "../utils/notificationTemplates";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const getUserNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    console.log("UserID", userId);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const notifications = await prisma.userNotification.findMany({
      where: {
        userId,
        read: false, // Sadece okunmamış bildirimler
      },
      include: {
        notification: true,
      },
      orderBy: {
        notification: {
          createdAt: "desc",
        },
      },
    });

    res.json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Helper function: Etkinlik güncellendiğinde katılımcılara bildirim gönder
export const notifyEventUpdate = async (
  eventId: string,
  oldEventData: any,
  newEventData: any,
  updateMessage?: string
) => {
  try {
    // 1. Etkinliğe katılan tüm kullanıcıları bul (APPROVED olanlar)
    const attendees = await prisma.eventAttendance.findMany({
      where: {
        eventId,
        status: "APPROVED",
      },
      select: {
        userId: true,
      },
    });

    if (attendees.length === 0) {
      console.log("No attendees found for event:", eventId);
      return {
        success: true,
        notifiedUsers: 0,
        message: "No attendees to notify",
      };
    }

    // 2. Değişen alanları tespit et
    const changedFields = detectChangedFields(oldEventData, newEventData);
    const changesList = Object.keys(changedFields);

    // 3. Notification template'ini kullanarak bildirim content'i oluştur
    const notificationContent = createNotificationContent(
      NotificationType.EVENT_UPDATED,
      {
        eventTitle: newEventData.title,
        changes: changesList,
        eventId,
      }
    );

    if (!notificationContent) {
      throw new Error("Failed to create notification content");
    }

    // 4. Bildirim oluştur
    const notification = await prisma.notification.create({
      data: {
        type: notificationContent.type,
        title: notificationContent.title,
        message: notificationContent.message,
        eventId,
        // changedFields ve eventSnapshot alanları schema update sonrası aktif olacak
      },
    });

    // 5. Tüm katılımcılara bu bildirimi ata
    const userNotifications = attendees.map((attendee) => ({
      userId: attendee.userId,
      notificationId: notification.id,
    }));

    await prisma.userNotification.createMany({
      data: userNotifications,
    });

    console.log(
      `Notification sent to ${attendees.length} attendees for event: ${newEventData.title}`
    );
    return {
      success: true,
      notifiedUsers: attendees.length,
      notificationId: notification.id,
      changedFields: Object.keys(changedFields),
    };
  } catch (error) {
    console.error("Error sending event update notification:", error);
    throw error;
  }
};

// Helper function: Attendance onaylandığında kullanıcıya bildirim gönder
export const notifyAttendanceApproved = async (
  userId: string,
  eventId: string,
  eventTitle: string
) => {
  try {
    // 1. Notification template'ini kullanarak bildirim content'i oluştur
    const notificationContent = createNotificationContent(
      NotificationType.ATTENDANCE_APPROVED,
      {
        eventTitle,
        eventId,
      }
    );

    if (!notificationContent) {
      throw new Error("Failed to create notification content");
    }

    // 2. Bildirim oluştur
    const notification = await prisma.notification.create({
      data: {
        type: notificationContent.type,
        title: notificationContent.title,
        message: notificationContent.message,
        eventId,
      },
    });

    // 3. Kullanıcıya bildirimi ata
    await prisma.userNotification.create({
      data: {
        userId,
        notificationId: notification.id,
      },
    });

    console.log(
      `Attendance approved notification sent to user ${userId} for event: ${eventTitle}`
    );
    return {
      success: true,
      notificationId: notification.id,
    };
  } catch (error) {
    console.error("Error sending attendance approved notification:", error);
    throw error;
  }
};

// Helper function: Attendance reddedildiğinde kullanıcıya bildirim gönder
export const notifyAttendanceRejected = async (
  userId: string,
  eventId: string,
  eventTitle: string
) => {
  try {
    // 1. Notification template'ini kullanarak bildirim content'i oluştur
    const notificationContent = createNotificationContent(
      NotificationType.ATTENDANCE_REJECTED,
      {
        eventTitle,
        eventId,
      }
    );

    if (!notificationContent) {
      throw new Error("Failed to create notification content");
    }

    // 2. Bildirim oluştur
    const notification = await prisma.notification.create({
      data: {
        type: notificationContent.type,
        title: notificationContent.title,
        message: notificationContent.message,
        eventId,
      },
    });

    // 3. Kullanıcıya bildirimi ata
    await prisma.userNotification.create({
      data: {
        userId,
        notificationId: notification.id,
      },
    });

    console.log(
      `Attendance rejected notification sent to user ${userId} for event: ${eventTitle}`
    );
    return {
      success: true,
      notificationId: notification.id,
    };
  } catch (error) {
    console.error("Error sending attendance rejected notification:", error);
    throw error;
  }
};

// Helper function: Attendance request geldiğinde organizera bildirim gönder
export const notifyAttendanceRequestReceived = async (
  organizerId: string,
  eventId: string,
  eventTitle: string,
  userName: string
) => {
  try {
    // 1. Notification template'ini kullanarak bildirim content'i oluştur
    const notificationContent = createNotificationContent(
      NotificationType.ATTENDANCE_REQUEST_RECEIVED,
      {
        eventTitle,
        userName,
        eventId,
      }
    );

    if (!notificationContent) {
      throw new Error("Failed to create notification content");
    }

    // 2. Bildirim oluştur
    const notification = await prisma.notification.create({
      data: {
        type: notificationContent.type,
        title: notificationContent.title,
        message: notificationContent.message,
        eventId,
      },
    });

    // 3. Organizera bildirimi ata
    await prisma.userNotification.create({
      data: {
        userId: organizerId,
        notificationId: notification.id,
      },
    });

    console.log(
      `Attendance request notification sent to organizer ${organizerId} for event: ${eventTitle}`
    );
    return {
      success: true,
      notificationId: notification.id,
    };
  } catch (error) {
    console.error("Error sending attendance request notification:", error);
    throw error;
  }
};

// Helper function: Event iptal edildiğinde katılımcılara bildirim gönder
export const notifyEventCancellation = async (
  eventId: string,
  eventTitle: string
) => {
  try {
    // 1. Etkinliğe katılan tüm kullanıcıları bul (APPROVED olanlar)
    const attendees = await prisma.eventAttendance.findMany({
      where: {
        eventId,
        status: "APPROVED",
      },
      select: {
        userId: true,
      },
    });

    if (attendees.length === 0) {
      console.log("No attendees found for cancelled event:", eventId);
      return {
        success: true,
        notifiedUsers: 0,
        message: "No attendees to notify",
      };
    }

    // 2. Notification template'ini kullanarak bildirim content'i oluştur
    const notificationContent = createNotificationContent(
      NotificationType.EVENT_CANCELLED,
      {
        eventTitle,
        eventId,
      }
    );

    if (!notificationContent) {
      throw new Error("Failed to create notification content");
    }

    // 3. Bildirim oluştur
    const notification = await prisma.notification.create({
      data: {
        type: notificationContent.type,
        title: notificationContent.title,
        message: notificationContent.message,
        eventId,
      },
    });

    // 4. Tüm katılımcılara bu bildirimi ata
    const userNotifications = attendees.map((attendee) => ({
      userId: attendee.userId,
      notificationId: notification.id,
    }));

    await prisma.userNotification.createMany({
      data: userNotifications,
    });

    console.log(
      `Event cancellation notification sent to ${attendees.length} attendees for event: ${eventTitle}`
    );
    return {
      success: true,
      notifiedUsers: attendees.length,
      notificationId: notification.id,
    };
  } catch (error) {
    console.error("Error sending event cancellation notification:", error);
    throw error;
  }
};

// Helper function: Detect changed fields
const detectChangedFields = (oldData: any, newData: any) => {
  const changes: any = {};
  const fieldsToCheck = [
    "title",
    "description",
    "date",
    "location",
    "capacity",
    "status",
  ];

  fieldsToCheck.forEach((field) => {
    if (oldData[field] !== newData[field]) {
      changes[field] = {
        old: oldData[field],
        new: newData[field],
      };
    }
  });

  return changes;
};

// Helper function: Generate changes summary
const generateChangesSummary = (changedFields: any) => {
  const fieldNames: any = {
    title: "Title",
    description: "Description",
    date: "Date",
    location: "Location",
    capacity: "Capacity",
    status: "Status",
  };

  const changes = Object.keys(changedFields).map(
    (field) => fieldNames[field] || field
  );

  if (changes.length === 0) return "General update";
  if (changes.length === 1) return `${changes[0]} updated`;
  if (changes.length === 2) return `${changes[0]} and ${changes[1]} updated`;

  return `${changes.slice(0, -1).join(", ")} and ${
    changes[changes.length - 1]
  } updated`;
};

// Tek bildirimi okundu işaretle
export const markNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userNotification = await prisma.userNotification.findFirst({
      where: {
        userId,
        notificationId,
      },
    });

    if (!userNotification) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    const updatedNotification = await prisma.userNotification.update({
      where: {
        id: userNotification.id,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Notification marked as read",
      data: updatedNotification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// Tüm bildirimleri okundu işaretle
export const markAllNotificationsAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const result = await prisma.userNotification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "All notifications marked as read",
      data: { updatedCount: result.count },
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};
