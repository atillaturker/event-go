export enum NotificationTypes {
  EVENT_UPDATED = "EVENT_UPDATED",
  EVENT_CANCELLED = "EVENT_CANCELLED",
  EVENT_REMINDER = "EVENT_REMINDER",
  EVENT_COMPLETED = "EVENT_COMPLETED",
  ATTENDANCE_APPROVED = "ATTENDANCE_APPROVED",
  ATTENDANCE_REJECTED = "ATTENDANCE_REJECTED",
  ATTENDANCE_REQUEST_RECEIVED = "ATTENDANCE_REQUEST_RECEIVED",
  GENERAL_ANNOUNCEMENT = "GENERAL_ANNOUNCEMENT",
}

export interface NotificationType {
  id: string;
  type: NotificationTypes;
  title: string;
  message: string;
  eventId?: string;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    imageUrl?: string;
  };
}

export interface UserNotificationType {
  id: string;
  userId: string;
  notificationId: string;
  read: boolean;
  readAt: string | null;
  notification: NotificationType;
}
