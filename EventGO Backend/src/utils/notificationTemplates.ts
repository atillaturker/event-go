import { NotificationType } from "../generated/prisma";

export interface NotificationContentType {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  eventId?: string;
  createdAt: string;
  category: string;
  priority: "low" | "medium" | "high";
}

export interface UserNotificationType {
  id: string;
  userId: string;
  notificationId: string;
  read: boolean;
  readAt: string | null;
  notification: NotificationType;
}

export const notificationTemplates = {
  EVENT_UPDATED: {
    title: "Event Updated",
    getTitle: (eventTitle: string) => `"${eventTitle}" Updated`,
    getMessage: (eventTitle: string, changes?: string[]) => {
      return changes && changes.length > 0
        ? `The event "${eventTitle}" has been updated with changes: ${changes.join(
            ", "
          )}`
        : `The event "${eventTitle}" has been updated.`;
    },
    type: NotificationType.EVENT_UPDATED,
    priority: "medium" as const,
    category: "Event",
  },

  EVENT_CANCELLED: {
    title: "Event Cancelled",
    getTitle: (eventTitle: string) => `"${eventTitle}" Cancelled`,
    getMessage: (eventTitle: string) =>
      `The event "${eventTitle}" has been cancelled.`,
    type: NotificationType.EVENT_CANCELLED,
    priority: "high" as const,
    category: "Event",
  },

  EVENT_REMINDER: {
    title: "Event Reminder",
    getTitle: (eventTitle: string) => `Reminder: "${eventTitle}"`,
    getMessage: (eventTitle: string, eventDate: string) =>
      `Reminder for the event "${eventTitle}" happening on ${new Date(
        eventDate
      ).toLocaleDateString()}.`,
    type: NotificationType.EVENT_REMINDER,
    priority: "low" as const,
    category: "Event",
  },

  ATTENDANCE_APPROVED: {
    title: "Attendance Approved",
    getTitle: (eventTitle: string) => `Attendance Approved for "${eventTitle}"`,
    getMessage: (eventTitle: string) =>
      `Your attendance request for the event "${eventTitle}" has been approved.`,
    type: NotificationType.ATTENDANCE_APPROVED,
    priority: "medium" as const,
    category: "Event",
  },

  ATTENDANCE_REJECTED: {
    title: "Attendance Rejected",
    getTitle: (eventTitle: string) => `Attendance Rejected for "${eventTitle}"`,
    getMessage: (eventTitle: string) =>
      `Your attendance request for the event "${eventTitle}" has been rejected.`,
    type: NotificationType.ATTENDANCE_REJECTED,
    priority: "medium" as const,
    category: "Event",
  },

  ATTENDANCE_REQUEST_RECEIVED: {
    title: "New Attendance Request",
    getTitle: (eventTitle: string) =>
      `New Attendance Request for "${eventTitle}"`,
    getMessage: (eventTitle: string, userName: string) =>
      `${userName} has requested to attend the event "${eventTitle}".`,
    type: NotificationType.ATTENDANCE_REQUEST_RECEIVED,
    priority: "high" as const,
    category: "Event",
  },

  GENERAL_ANNOUNCEMENT: {
    title: "General Announcement",
    getTitle: (announcementTitle: string) =>
      `Announcement: ${announcementTitle}`,
    getMessage: (announcementTitle: string, content: string) =>
      `New announcement: "${announcementTitle}". Details: ${content}`,
    type: NotificationType.GENERAL_ANNOUNCEMENT,
    priority: "medium" as const,
    category: "General",
  },
};

export const getNotificationTemplate = (type: NotificationType) => {
  const templateKey = Object.keys(notificationTemplates).find(
    (key) =>
      notificationTemplates[key as keyof typeof notificationTemplates].type ===
      type
  );

  if (templateKey) {
    return notificationTemplates[
      templateKey as keyof typeof notificationTemplates
    ];
  }

  return null;
};

export const getNotificationTemplatesByType = () => {
  const templatesByType: Record<
    NotificationType,
    (typeof notificationTemplates)[keyof typeof notificationTemplates]
  > = {} as any;

  Object.values(notificationTemplates).forEach((template) => {
    templatesByType[template.type] = template;
  });

  return templatesByType;
};

export const createNotificationContent = (
  type: NotificationType,
  params: {
    eventTitle?: string;
    eventDate?: string;
    userName?: string;
    announcementTitle?: string;
    content?: string;
    changes?: string[];
    eventId?: string;
  }
): NotificationContentType | null => {
  const template = getNotificationTemplate(type);

  if (!template) {
    return null;
  }

  let title: string;
  let message: string;

  switch (type) {
    case NotificationType.EVENT_UPDATED:
      title = params.eventTitle
        ? template.getTitle(params.eventTitle)
        : template.title;
      message = params.eventTitle
        ? (notificationTemplates.EVENT_UPDATED.getMessage as any)(
            params.eventTitle,
            params.changes
          )
        : "Event has been updated.";
      break;

    case NotificationType.EVENT_CANCELLED:
      title = params.eventTitle
        ? template.getTitle(params.eventTitle)
        : template.title;
      message = params.eventTitle
        ? (notificationTemplates.EVENT_CANCELLED.getMessage as any)(
            params.eventTitle
          )
        : "An event has been cancelled.";
      break;

    case NotificationType.EVENT_REMINDER:
      title = params.eventTitle
        ? template.getTitle(params.eventTitle)
        : template.title;
      message =
        params.eventTitle && params.eventDate
          ? (notificationTemplates.EVENT_REMINDER.getMessage as any)(
              params.eventTitle,
              params.eventDate
            )
          : "You have an upcoming event.";
      break;

    case NotificationType.ATTENDANCE_APPROVED:
      title = params.eventTitle
        ? template.getTitle(params.eventTitle)
        : template.title;
      message = params.eventTitle
        ? (notificationTemplates.ATTENDANCE_APPROVED.getMessage as any)(
            params.eventTitle
          )
        : "Your attendance has been approved.";
      break;

    case NotificationType.ATTENDANCE_REJECTED:
      title = params.eventTitle
        ? template.getTitle(params.eventTitle)
        : template.title;
      message = params.eventTitle
        ? (notificationTemplates.ATTENDANCE_REJECTED.getMessage as any)(
            params.eventTitle
          )
        : "Your attendance has been rejected.";
      break;

    case NotificationType.ATTENDANCE_REQUEST_RECEIVED:
      title = params.eventTitle
        ? template.getTitle(params.eventTitle)
        : template.title;
      message =
        params.eventTitle && params.userName
          ? (
              notificationTemplates.ATTENDANCE_REQUEST_RECEIVED
                .getMessage as any
            )(params.eventTitle, params.userName)
          : "A new attendance request has been received.";
      break;

    case NotificationType.GENERAL_ANNOUNCEMENT:
      title = params.announcementTitle
        ? template.getTitle(params.announcementTitle)
        : template.title;
      message =
        params.announcementTitle && params.content
          ? (notificationTemplates.GENERAL_ANNOUNCEMENT.getMessage as any)(
              params.announcementTitle,
              params.content
            )
          : "A new announcement has been made.";
      break;

    default:
      title = template.title;
      message = "You have a new notification.";
  }

  return {
    id: "",
    type,
    title,
    message,
    eventId: params.eventId,
    createdAt: new Date().toISOString(),
    category: template.category,
    priority: template.priority,
  };
};

// KULLANIM ÖRNEKLERİ:
/*
// 1. Tek bir template almak için:
const eventUpdatedTemplate = getNotificationTemplate(NotificationType.EVENT_UPDATED);

// 2. Tüm template'ları type'a göre organize edilmiş şekilde almak için:
const allTemplatesByType = getNotificationTemplatesByType();

// 3. Hazır notification content oluşturmak için:
const eventUpdatedNotification = createNotificationContent(
  NotificationType.EVENT_UPDATED,
  {
    eventTitle: "Tech Conference 2024",
    changes: ["date", "location"],
    eventId: "507f1f77bcf86cd799439011"
  }
);

const attendanceApprovedNotification = createNotificationContent(
  NotificationType.ATTENDANCE_APPROVED,
  {
    eventTitle: "Tech Conference 2024",
    eventId: "507f1f77bcf86cd799439011"
  }
);

const reminderNotification = createNotificationContent(
  NotificationType.EVENT_REMINDER,
  {
    eventTitle: "Tech Conference 2024",
    eventDate: "2025-08-15T10:00:00Z",
    eventId: "507f1f77bcf86cd799439011"
  }
);

const attendanceRequestNotification = createNotificationContent(
  NotificationType.ATTENDANCE_REQUEST_RECEIVED,
  {
    eventTitle: "Tech Conference 2024",
    userName: "John Doe",
    eventId: "507f1f77bcf86cd799439011"
  }
);

const announcementNotification = createNotificationContent(
  NotificationType.GENERAL_ANNOUNCEMENT,
  {
    announcementTitle: "Platform Maintenance",
    content: "The platform will be under maintenance tomorrow from 2 AM to 4 AM."
  }
);
*/
