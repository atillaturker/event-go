import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/core";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabBar, TabView } from "react-native-tab-view";
import CustomText from "../../components/CustomText";
import EventCard from "../../components/EventCard";
import OrganizerOnly from "../../components/OrganizerOnly";
import ScreenHeader from "../../components/ScreenHeader";
import {
  useGetEventAttendanceRequestsQuery,
  useGetEventByIdQuery,
  useManageAttendanceRequestMutation,
} from "../../services/eventsApi";

const EventInfo = ({ event }: { event: any }) => {
  if (!event) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "#10B981";
      case "COMPLETED":
        return "#6366F1";
      case "CANCELLED":
        return "#EF4444";
      default:
        return "#6B7280";
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

  return (
    <View style={styles.eventHeaderCard}>
      <EventCard event={event} />
      <View style={styles.eventMetaRow}>
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
            style={[styles.statusText, { color: getStatusColor(event.status) }]}
          >
            {event.status}
          </Text>
        </View>
        <View style={styles.attendeesInfo}>
          <Ionicons name="people-outline" size={16} color="#6B7280" />
          <Text style={styles.attendeesText}>
            {event.attendeeCount || 0}/{event.capacity} Attendees
          </Text>
        </View>
      </View>
    </View>
  );
};

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
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>
        {item.user.name.charAt(0).toUpperCase()}
      </Text>
    </View>
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
  const [tabIndex, setTabIndex] = useState(0);
  const [manageRequest] = useManageAttendanceRequestMutation();
  const navigation = useNavigation();

  const {
    data: eventData,
    isLoading: eventDetailLoading,
    error: eventError,
  } = useGetEventByIdQuery(eventId);

  console.log("Event", JSON.stringify(eventData, null, 2));

  const {
    data: requestsData,
    isLoading: requestsLoading,
    isError: requestsError,
  } = useGetEventAttendanceRequestsQuery(eventId);

  const requests = requestsData?.requests || [];
  const pendingRequests = requests.filter(
    (req: any) => req.status === "PENDING"
  );
  const approvedRequests = requests.filter(
    (req: any) => req.status === "APPROVED"
  );

  const routes = [
    {
      key: "pending",
      title: `Pending (${pendingRequests.length})`,
    },
    {
      key: "approved",
      title: `Approved (${approvedRequests.length})`,
    },
  ];

  const handleApprove = async (attendanceId: string, userName: string) => {
    try {
      await manageRequest({ attendanceId, status: "APPROVED" }).unwrap();
      Alert.alert("Success", `${userName} has been accepted to the event!`);
    } catch (error) {
      Alert.alert("Error", "An error occurred while approving the request");
    }
  };

  const handleReject = async (attendanceId: string, userName: string) => {
    try {
      await manageRequest({ attendanceId, status: "REJECTED" }).unwrap();
      Alert.alert("Success", `${userName} has been rejected from the event`);
    } catch (error) {
      Alert.alert("Error", "An error occurred while rejecting the request");
    }
  };

  const handleApproveAll = async () => {
    Alert.alert(
      "Approve All",
      `Are you sure you want to approve ${pendingRequests.length} requests?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            for (const request of pendingRequests) {
              try {
                await manageRequest({
                  attendanceId: request.id,
                  status: "APPROVED",
                }).unwrap();
              } catch (error) {
                console.error("Bulk approval error:", error);
              }
            }
          },
        },
      ]
    );
  };

  const handleRejectAll = () => {
    Alert.alert("Reject", "This feature has not been implemented yet");
  };

  if (requestsLoading || eventDetailLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case "pending":
        return (
          <FlatList
            data={pendingRequests}
            renderItem={({ item }) => (
              <UserRequestItem
                item={item}
                onApprove={handleApprove}
                onReject={handleReject}
                showActions={true}
              />
            )}
            keyExtractor={(item) => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        );
      case "approved":
        return (
          <FlatList
            data={approvedRequests}
            renderItem={({ item }) => (
              <UserRequestItem
                item={item}
                onApprove={handleApprove}
                onReject={handleReject}
                showActions={false}
              />
            )}
            keyExtractor={(item) => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        );
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => {
    return (
      <TabBar
        {...props}
        activeColor="#333"
        inactiveColor="#999"
        pressColor="#E5E5E7"
        scrollEnabled={true}
        style={styles.tabBar}
        indicatorStyle={styles.tabBarIndicator}
        labelStyle={styles.tabLabel}
        renderLabel={({ route, focused, color }: any) => (
          <CustomText
            style={[styles.tabLabel, { color: focused ? "#111827" : color }]}
          >
            {route.title}
          </CustomText>
        )}
        tabStyle={{ width: Dimensions.get("window").width / 2 }}
      />
    );
  };

  return (
    <OrganizerOnly>
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title="Attendees"
          onBackPress={() => {
            navigation.goBack();
          }}
        />

        <EventInfo event={eventData} />

        <TabView
          navigationState={{ index: tabIndex, routes }}
          renderScene={renderScene}
          onIndexChange={setTabIndex}
          initialLayout={{ width: Dimensions.get("window").width }}
          renderTabBar={renderTabBar}
        />

        {tabIndex === 0 && (
          <BottomActions
            pendingRequests={pendingRequests}
            onRejectAll={handleRejectAll}
            onApproveAll={handleApproveAll}
          />
        )}
      </SafeAreaView>
    </OrganizerOnly>
  );
};

export default EventRequestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
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
  eventMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
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
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },

  tabBar: {
    backgroundColor: "#FFFFFF",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EB",
    height: 50,
  },
  tabBarIndicator: {
    backgroundColor: "#111827",
    height: 1,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "none",
    letterSpacing: -0.2,
  },

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
  approveButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  approveButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 34,
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

  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 50,
  },
});
