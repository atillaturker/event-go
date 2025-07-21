import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/core";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import {
  useGetEventAttendanceRequestsQuery,
  useGetEventByIdQuery,
  useManageAttendanceRequestMutation,
} from "../services/eventsApi";

// Header Component
const AttendeeHeader = ({
  eventName,
  eventDate,
  onBack,
}: {
  eventName: string;
  eventDate: string;
  onBack: () => void;
}) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Text style={styles.backArrow}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Attendees</Text>
  </View>
);

// Event Info Component - Enhanced Header
const EventInfo = ({ event }: { event: any }) => {
  if (!event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "#10B981"; // Green
      case "COMPLETED":
        return "#6366F1"; // Purple
      case "CANCELLED":
        return "#EF4444"; // Red
      default:
        return "#6B7280"; // Gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "checkmark-circle";
      case "COMPLETED":
        return "checkmark-done-circle";
      case "CANCELLED":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const dateTime = formatDate(event.date);

  return (
    <View style={styles.eventHeaderCard}>
      <View style={styles.eventHeaderRow}>
        {/* Event Title and Details */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>

          {/* Date & Time */}
          <View style={styles.eventDetailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.eventDetailText}>
              {dateTime.date}, {dateTime.time}
            </Text>
          </View>

          {/* Location */}
          {event.location?.address && (
            <View style={styles.eventDetailRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.eventDetailText}>
                {event.location.address}
              </Text>
            </View>
          )}

          {/* Status and Attendees Row */}
          <View style={styles.eventMetaRow}>
            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(event.status) + "20" },
              ]}
            >
              <Ionicons
                name={getStatusIcon(event.status)}
                size={14}
                color={getStatusColor(event.status)}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(event.status) },
                ]}
              >
                {event.status}
              </Text>
            </View>

            {/* Attendees Summary */}
            <View style={styles.attendeesInfo}>
              <Ionicons name="people-outline" size={16} color="#6B7280" />
              <Text style={styles.attendeesText}>
                {event.attendeeCount || 0}/{event.capacity} Attendees
              </Text>
            </View>
          </View>
        </View>

        {/* Event Image */}
        <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
      </View>
    </View>
  );
};

// Tab Header Component
const TabHeader = ({
  pendingCount,
  approvedCount,
  activeTab,
  onTabChange,
}: {
  pendingCount: number;
  approvedCount: number;
  activeTab: "pending" | "approved";
  onTabChange: (tab: "pending" | "approved") => void;
}) => (
  <View style={styles.tabContainer}>
    <TouchableOpacity
      style={[styles.tab, activeTab === "pending" && styles.activeTab]}
      onPress={() => onTabChange("pending")}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === "pending" && styles.activeTabText,
        ]}
      >
        Pending Requests ({pendingCount})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.tab, activeTab === "approved" && styles.activeTab]}
      onPress={() => onTabChange("approved")}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === "approved" && styles.activeTabText,
        ]}
      >
        Approved Attendees ({approvedCount})
      </Text>
    </TouchableOpacity>
  </View>
);

// User Avatar Component (Simple placeholder)
const UserAvatar = ({ name }: { name: string }) => (
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
  </View>
);

// User Request Item Component
const UserRequestItem = ({
  item,
  onApprove,
  onReject,
  showActions = true,
}: {
  item: any;
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
  showActions?: boolean;
}) => (
  <View style={styles.userItem}>
    <UserAvatar name={item.user.name} />
    <View style={styles.userDetails}>
      <Text style={styles.userName}>{item.user.name}</Text>
      <Text style={styles.userEmail}>{item.user.email}</Text>
    </View>
    {showActions && item.status === "PENDING" && (
      <TouchableOpacity
        style={styles.approveButton}
        onPress={() => onApprove(item.id, item.user.name)}
      >
        <Text style={styles.approveButtonText}>Approve</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Bottom Actions Component
const BottomActions = ({
  pendingRequests,
  onRejectAll,
  onApproveAll,
}: {
  pendingRequests: any[];
  onRejectAll: () => void;
  onApproveAll: () => void;
}) => {
  if (pendingRequests.length === 0) return null;

  return (
    <View style={styles.bottomActions}>
      <TouchableOpacity style={styles.rejectAllButton} onPress={onRejectAll}>
        <Text style={styles.rejectAllText}>Reject</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.approveAllButton} onPress={onApproveAll}>
        <Text style={styles.approveAllText}>Approve All</Text>
      </TouchableOpacity>
    </View>
  );
};

const EventRequestScreen = () => {
  const route = useRoute();
  const { eventId } = route.params as { eventId: string };
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");

  const {
    data: eventData,
    isLoading: eventDetailLoading,
    error: eventError,
  } = useGetEventByIdQuery(eventId);

  const { data: requestsData, isLoading } =
    useGetEventAttendanceRequestsQuery(eventId);

  const [manageRequest] = useManageAttendanceRequestMutation();
  const navigation = useNavigation();

  const handleApprove = async (attendanceId: string, userName: string) => {
    try {
      await manageRequest({ attendanceId, status: "APPROVED" }).unwrap();
      Alert.alert("Başarılı", `${userName} etkinliğe kabul edildi!`);
    } catch (error) {
      Alert.alert("Hata", "İstek onaylanırken bir hata oluştu");
    }
  };

  const handleReject = async (attendanceId: string, userName: string) => {
    try {
      await manageRequest({ attendanceId, status: "REJECTED" }).unwrap();
      Alert.alert("Başarılı", `${userName} etkinliğe kabul edilmedi`);
    } catch (error) {
      Alert.alert("Hata", "İstek reddedilirken bir hata oluştu");
    }
  };

  const handleApproveAll = async () => {
    const pendingRequests =
      requestsData?.requests?.filter((req) => req.status === "PENDING") || [];
    Alert.alert(
      "Tümünü Onayla",
      `${pendingRequests.length} isteği onaylamak istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Onayla",
          onPress: async () => {
            for (const request of pendingRequests) {
              try {
                await manageRequest({
                  attendanceId: request.id,
                  status: "APPROVED",
                }).unwrap();
              } catch (error) {
                console.error("Toplu onay hatası:", error);
              }
            }
          },
        },
      ]
    );
  };

  const handleRejectAll = () => {
    Alert.alert("Reddet", "Bu işlev henüz uygulanmadı");
  };

  const handleBack = () => {
    // Navigate back to the previous screen
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  const requests = requestsData?.requests || [];
  const pendingRequests = requests.filter((req) => req.status === "PENDING");
  const approvedRequests = requests.filter((req) => req.status === "APPROVED");
  const displayData =
    activeTab === "pending" ? pendingRequests : approvedRequests;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Attendees"
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      <EventInfo event={eventData} />

      <TabHeader
        pendingCount={pendingRequests.length}
        approvedCount={approvedRequests.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <FlatList
        data={displayData}
        renderItem={({ item }) => (
          <UserRequestItem
            item={item}
            onApprove={handleApprove}
            onReject={handleReject}
            showActions={activeTab === "pending"}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {activeTab === "pending" && (
        <BottomActions
          pendingRequests={pendingRequests}
          onRejectAll={handleRejectAll}
          onApproveAll={handleApproveAll}
        />
      )}
    </SafeAreaView>
  );
};

export default EventRequestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Event Header Card Styles
  eventHeaderCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    lineHeight: 24,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
  },
  eventMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  eventImage: {
    width: 60,
    height: 60,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    textTransform: "capitalize",
  },
  attendeesInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendeesText: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 6,
    fontWeight: "500",
  },

  // Header Styles
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    marginRight: 16,
  },
  backArrow: {
    fontSize: 24,
    color: "#333",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  // Tab Styles
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#333",
  },
  tabText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#333",
    fontWeight: "600",
  },

  // List Styles
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // User Item Styles
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F4FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1976D2",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },

  // Button Styles
  approveButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  approveButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },

  // Bottom Actions Styles
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 34, // Safe area padding
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 12,
  },
  rejectAllButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  rejectAllText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  approveAllButton: {
    flex: 1,
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  approveAllText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Loading State
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 50,
  },
});
