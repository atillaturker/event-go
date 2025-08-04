// components/NotificationHeaderIcon.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  useGetUserNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../services/eventsApi";
import { NotificationTypes } from "../types/notification";
import { formatDate } from "../utils/formatDate";
import CustomText from "./CustomText";

const NotificationHeaderIcon = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const { data, isLoading, refetch } = useGetUserNotificationsQuery(undefined, {
    pollingInterval: 15000,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: true,
  });

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  console.log("Data", JSON.stringify(data, null, 2));

  const notifications = data?.data || [];
  const hasNotifications = notifications.length > 0;

  const getNotificationStyle = (type: NotificationTypes) => {
    const baseStyle = {
      backgroundColor: "#FFFFFF",
      borderColor: "#E5E7EB",
      titleColor: "#374151",
      eventColor: "#6366F1", // İndigo - event ismi için
      iconColor: "#9CA3AF",
    };

    let iconName: any = "notifications";
    switch (type) {
      case NotificationTypes.EVENT_CANCELLED:
        iconName = "warning";
        break;
      case NotificationTypes.EVENT_UPDATED:
        iconName = "information-circle";
        break;
      case NotificationTypes.ATTENDANCE_APPROVED:
        iconName = "checkmark-circle";
        break;
      case NotificationTypes.ATTENDANCE_REJECTED:
        iconName = "close-circle";
        break;
      case NotificationTypes.ATTENDANCE_REQUEST_RECEIVED:
        iconName = "person-add";
        break;
      default:
        iconName = "notifications";
    }

    return {
      ...baseStyle,
      iconName,
    };
  };

  // Helper function to extract event name and format notification
  const parseNotificationContent = (
    title: string,
    message: string,
    type: NotificationTypes
  ) => {
    const eventNameMatch =
      title.match(/"([^"]*)"/) || message.match(/"([^"]*)"/);
    const eventName = eventNameMatch ? eventNameMatch[1] : null;

    let cleanTitle = title.replace(/"([^"]*)"/, "").trim();
    if (cleanTitle.endsWith(" Updated"))
      cleanTitle = cleanTitle.replace("Event Updated", "");
    if (cleanTitle.startsWith("Attendance Approved for"))
      cleanTitle = "Attendance Approved";
    if (cleanTitle.startsWith("Attendance Rejected for"))
      cleanTitle = "Attendance Rejected";
    if (cleanTitle.startsWith("New Attendance Request for"))
      cleanTitle = "New Attendance Request";

    let additionalInfo = "";
    if (type === NotificationTypes.EVENT_UPDATED) {
      const changesMatch = message.match(/with changes: (.+)$/);
      if (changesMatch) {
        additionalInfo = `Updated: ${changesMatch[1]}`;
      }
    } else if (type === NotificationTypes.ATTENDANCE_REQUEST_RECEIVED) {
      const userMatch = message.match(/^(.+) has requested/);
      if (userMatch) {
        additionalInfo = `From: ${userMatch[1]}`;
      }
    }

    return {
      cleanTitle,
      eventName,
      additionalInfo,
    };
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId).unwrap();
      refetch();
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred while marking the notification as read"
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) return;

    Alert.alert(
      "Mark All Notifications as Read",
      "All notifications will be marked as read. Do you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await markAllAsRead().unwrap();
              refetch();
            } catch (error) {
              Alert.alert(
                "Error",
                "An error occurred while marking notifications as read"
              );
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="notifications-outline" size={24} color="#6366F1" />
        {hasNotifications && (
          <View style={styles.badge}>
            <CustomText style={styles.badgeText}>
              {notifications.length > 9 ? "9+" : notifications.length}
            </CustomText>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ionicons
                      name="notifications"
                      size={20}
                      color="#6366F1"
                      style={{ marginTop: 4 }}
                    />
                    <CustomText fontWeight="600" style={styles.modalTitle}>
                      Notifications
                    </CustomText>
                  </View>
                  <View style={styles.headerActions}>
                    {hasNotifications && (
                      <TouchableOpacity
                        style={styles.markAllButton}
                        onPress={handleMarkAllAsRead}
                      >
                        <Ionicons
                          name="checkmark-done"
                          size={20}
                          color="#10B981"
                        />
                        <CustomText fontWeight="600" style={styles.markAllText}>
                          Read All
                        </CustomText>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <CustomText style={styles.loadingText}>
                      Notifications are loading...
                    </CustomText>
                  </View>
                ) : (
                  <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                      const notificationStyle = getNotificationStyle(
                        item.notification.type
                      );
                      const { cleanTitle, eventName, additionalInfo } =
                        parseNotificationContent(
                          item.notification.title,
                          item.notification.message,
                          item.notification.type
                        );

                      return (
                        <View
                          style={[
                            styles.notificationItem,
                            {
                              backgroundColor:
                                notificationStyle.backgroundColor,
                              borderColor: notificationStyle.borderColor,
                            },
                          ]}
                        >
                          <View style={styles.notificationHeader}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                flex: 1,
                                gap: 8,
                              }}
                            >
                              <View style={{ flex: 1 }}>
                                <CustomText
                                  fontWeight="600"
                                  style={[
                                    styles.notificationTitle,
                                    { color: notificationStyle.titleColor },
                                  ]}
                                >
                                  {cleanTitle}
                                </CustomText>
                                {eventName && (
                                  <View style={styles.eventNameContainer}>
                                    <Ionicons
                                      name="calendar"
                                      size={16}
                                      color="#6366F1"
                                    />
                                    <CustomText
                                      fontWeight="700"
                                      style={styles.eventName}
                                    >
                                      {`${eventName}`}
                                    </CustomText>
                                  </View>
                                )}
                              </View>
                            </View>

                            <TouchableOpacity
                              onPress={() =>
                                handleMarkAsRead(item.notificationId)
                              }
                            >
                              <Ionicons
                                name="checkmark-circle"
                                size={28}
                                color="#a9e3cfff"
                              />
                            </TouchableOpacity>
                          </View>

                          <View style={styles.dateContainer}>
                            {additionalInfo && (
                              <CustomText
                                fontWeight="500"
                                style={styles.additionalInfo}
                              >
                                {additionalInfo}
                              </CustomText>
                            )}
                            <CustomText
                              fontWeight="500"
                              style={styles.notificationDate}
                            >
                              {formatDate(item.notification.createdAt)}
                            </CustomText>
                          </View>
                        </View>
                      );
                    }}
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <Ionicons
                          name="notifications-off-outline"
                          size={64}
                          color="#CBD5E1"
                        />
                        <CustomText style={styles.emptyTitle}>
                          No new notifications
                        </CustomText>
                        <CustomText style={styles.emptyText}>
                          You have read all your notifications!
                        </CustomText>
                      </View>
                    }
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.listContainer}
                    nestedScrollEnabled={true}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
    marginRight: 8,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 22,
    color: "#1F2937",
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  markAllText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },
  listContainer: {
    flexGrow: 1,
  },
  notificationItem: {
    marginBottom: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  notificationIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  markReadButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 4,
    fontWeight: "600",
  },
  eventNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
  },
  eventName: {
    fontSize: 15,
    color: "#6366F1",
    fontWeight: "700",
  },
  additionalInfo: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  dateContainer: {
    marginTop: 6,
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  notificationDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default NotificationHeaderIcon;
