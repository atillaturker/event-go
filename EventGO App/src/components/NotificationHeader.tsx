// components/NotificationHeaderIcon.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import {
  useGetUserNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../services/eventsApi";
import { RootState } from "../store/reduxStore";
import { NotificationTypes } from "../types/notification";
import { formatDate } from "../utils/formatDate";
import CustomText from "./CustomText";

const NotificationHeaderIcon = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const navigation = useNavigation();

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const { data, isLoading, refetch } = useGetUserNotificationsQuery(undefined, {
    pollingInterval: 15000,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    skip: !isAuthenticated || !user?.id,
  });

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refetch();
    }
  }, [user?.id, isAuthenticated, refetch]);

  const notifications = data?.data || [];
  const hasNotifications = notifications.length > 0;

  const getNotificationStyle = (type: NotificationTypes) => {
    let iconName: any = "notifications";
    let iconBackgroundColor = "#6366F1"; // Default blue

    switch (type) {
      case NotificationTypes.EVENT_CANCELLED:
        iconName = "warning";
        iconBackgroundColor = "#EF4444"; // Red for cancelled
        break;
      case NotificationTypes.EVENT_UPDATED:
        iconName = "information-circle";
        iconBackgroundColor = "#10B981"; // Green for updates
        break;
      case NotificationTypes.ATTENDANCE_APPROVED:
        iconName = "checkmark-circle";
        iconBackgroundColor = "#10B981"; // Green for approved
        break;
      case NotificationTypes.ATTENDANCE_REJECTED:
        iconName = "close-circle";
        iconBackgroundColor = "#EF4444"; // Red for rejected
        break;
      case NotificationTypes.ATTENDANCE_REQUEST_RECEIVED:
        iconName = "person-add";
        iconBackgroundColor = "#F59E0B"; // Orange for requests
        break;
      case NotificationTypes.EVENT_REMINDER:
        iconName = "time";
        iconBackgroundColor = "#8B5CF6"; // Purple for reminders
        break;
      case NotificationTypes.EVENT_COMPLETED:
        iconName = "checkmark-done";
        iconBackgroundColor = "#059669"; // Dark green for completed
        break;
      default:
        iconName = "notifications";
        iconBackgroundColor = "#6366F1"; // Default blue
    }

    return {
      iconName,
      iconBackgroundColor,
    };
  };

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
      setModalVisible(false);
      navigation.navigate("MyEvents");
      console.log("Notification marked as read:", notificationId);
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
                        <TouchableOpacity
                          style={styles.notificationItem}
                          onPress={() => handleMarkAsRead(item.notificationId)}
                          activeOpacity={0.7}
                        >
                          {/* Left side - Event Image or Icon */}
                          <View style={styles.notificationImageContainer}>
                            {item.notification.event?.imageUrl ? (
                              <Image
                                source={{
                                  uri: item.notification.event.imageUrl,
                                }}
                                style={styles.eventImage}
                                resizeMode="cover"
                              />
                            ) : (
                              <View
                                style={[
                                  styles.notificationIconContainer,
                                  {
                                    backgroundColor:
                                      notificationStyle.iconBackgroundColor,
                                  },
                                ]}
                              >
                                <Ionicons
                                  name={notificationStyle.iconName}
                                  size={42}
                                  color="#FFFFFF"
                                />
                              </View>
                            )}
                          </View>

                          {/* Right side - Content */}
                          <View style={styles.notificationContent}>
                            <CustomText
                              fontWeight="600"
                              style={styles.notificationTitle}
                              numberOfLines={2}
                              ellipsizeMode="tail"
                            >
                              {cleanTitle} - {eventName}
                            </CustomText>

                            <CustomText style={styles.notificationDate}>
                              {formatDate(item.notification.createdAt)}
                            </CustomText>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <Ionicons
                          name="notifications-off-outline"
                          size={90}
                          color="#CBD5E1"
                        />
                        <CustomText
                          fontWeight="600-italic"
                          style={styles.emptyTitle}
                        >
                          No new notifications
                        </CustomText>
                        <CustomText
                          fontWeight="500-italic"
                          style={styles.emptyText}
                        >
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  notificationImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginRight: 16,
    overflow: "hidden",
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  notificationIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
    justifyContent: "center",
  },
  notificationTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 4,
    fontWeight: "600",
  },
  notificationDate: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
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
    paddingBottom: 45,
    paddingTop: 30,
  },
  emptyTitle: {
    fontSize: 24,
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default NotificationHeaderIcon;
