import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import CustomText from "../../components/CustomText";
import LoadingView from "../../components/LoadingView";
import ScreenHeader from "../../components/ScreenHeader";
import { useGetUserEventsQuery } from "../../services/eventsApi";
import { Event } from "../../types/events";
import { formatDate } from "../../utils/formatDate";

const initialLayout = { width: Dimensions.get("window").width };

interface EventsListProps {
  events: Event[];
  status: "APPROVED" | "PENDING";
  emptyMessage: string;
  emptySubMessage: string;
  navigation: any;
}

const EventsList: React.FC<EventsListProps> = ({
  events,
  status,
  emptyMessage,
  emptySubMessage,
  navigation,
}) => {
  const renderEventCard = ({ item }: { item: Event }) => (
    <EventParticipationCard
      event={item}
      status={status}
      onPress={() => {
        navigation.navigate("EventDetailScreen", { eventId: item.id });
      }}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name={status === "APPROVED" ? "calendar-outline" : "time-outline"}
          size={48}
          color="#D1D5DB"
        />
      </View>
      <CustomText fontWeight="600" style={styles.emptyTitle}>
        {emptyMessage}
      </CustomText>
      <CustomText style={styles.emptySubtitle}>{emptySubMessage}</CustomText>
    </View>
  );

  return (
    <FlatList
      data={events}
      renderItem={renderEventCard}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={renderEmptyState}
    />
  );
};

const UserEventsScreen = () => {
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  const { data: approvedData, isLoading: isLoadingApproved } =
    useGetUserEventsQuery({ status: "APPROVED" });
  const { data: pendingData, isLoading: isLoadingPending } =
    useGetUserEventsQuery({ status: "PENDING" });

  console.log("Datas", JSON.stringify({ approvedData, pendingData }, null, 2));

  const isLoading = isLoadingApproved || isLoadingPending;
  const approvedEvents = approvedData?.data?.events || [];
  const pendingEvents = pendingData?.data?.events || [];

  // Dynamic routes with counts
  const routes = [
    {
      key: "joined",
      title:
        approvedEvents.length > 0
          ? `Joined Events (${approvedEvents.length})`
          : "Joined Events",
    },
    {
      key: "pending",
      title:
        pendingEvents.length > 0
          ? `Pending Requests (${pendingEvents.length})`
          : "Pending Requests",
    },
  ];

  // Joined Events Tab
  const JoinedEventsRoute = () => (
    <EventsList
      events={approvedEvents}
      status="APPROVED"
      emptyMessage="You haven't joined any events yet"
      emptySubMessage="Browse events and join the ones that interest you!"
      navigation={navigation}
    />
  );

  // Pending Requests Tab
  const PendingRequestsRoute = () => (
    <EventsList
      events={pendingEvents}
      status="PENDING"
      emptyMessage="No pending requests"
      emptySubMessage="Your event requests will appear here"
      navigation={navigation}
    />
  );

  const renderScene = SceneMap({
    joined: JoinedEventsRoute,
    pending: PendingRequestsRoute,
  });

  const renderTabBar = (props: any) => {
    return (
      <TabBar
        {...props}
        indicatorStyle={styles.tabIndicator}
        style={styles.tabBar}
        labelStyle={styles.tabLabel}
        activeColor="#7C3AED"
        inactiveColor="#6B7280"
      />
    );
  };

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="My Events" onBackPress={() => navigation.goBack()} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
        style={styles.tabView}
      />
    </SafeAreaView>
  );
};

// Event Card Component
interface EventParticipationCardProps {
  event: Event;
  status: "APPROVED" | "PENDING";
  onPress?: () => void;
}

const EventParticipationCard: React.FC<EventParticipationCardProps> = ({
  event,
  status,
  onPress,
}) => {
  const shortenAddress = (address: string) => {
    if (address.length > 30) {
      return address.substring(0, 30) + "...";
    }
    return address;
  };

  return (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statusBadgeContainer}>
        <View
          style={[
            styles.statusBadge,
            status === "APPROVED" ? styles.approvedBadge : styles.pendingBadge,
          ]}
        >
          <CustomText
            fontWeight="600"
            style={[
              styles.statusText,
              status === "APPROVED" ? styles.approvedText : styles.pendingText,
            ]}
          >
            {status === "APPROVED" ? "Approved" : "Pending"}
          </CustomText>
        </View>
      </View>

      <View style={styles.cardContent}>
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <CustomText fontWeight="700" style={styles.eventTitle}>
            {event.title}
          </CustomText>

          <View style={styles.eventDetailRow}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <CustomText fontWeight="500" style={styles.eventDate}>
              {formatDate(event.date)}
            </CustomText>
          </View>

          <View style={styles.eventDetailRow}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <CustomText style={styles.eventLocation}>
              {shortenAddress(event.location.address)}
            </CustomText>
          </View>

          <View style={styles.organizerContainer}>
            <CustomText style={styles.organizerText}>
              by {event.organizerName}
            </CustomText>
          </View>
        </View>

        {/* Event Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                event.imageUrl ||
                "https://placehold.jp/30/FFF/000000/300x150.png?text=No+Image",
            }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UserEventsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  tabView: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabLabel: {
    fontWeight: "600",
    fontSize: 14,
    textTransform: "none",
  },
  tabLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabIndicator: {
    backgroundColor: "#7C3AED",
    height: 3,
    borderRadius: 2,
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeOverlay: {
    position: "absolute",
    top: -8,
    left: 0,
    right: 0,
    height: 48,
    flexDirection: "row",
    alignItems: "flex-start",
    zIndex: 1000,
    pointerEvents: "none",
    backgroundColor: "rgba(0,0,0,0)",
  },
  badgePositioned: {
    position: "absolute",
    top: 8,
    zIndex: 1001,
  },
  badgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  inlineTabBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineTabBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBadgeContainer: {
    alignItems: "flex-start",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  approvedBadge: {
    backgroundColor: "#DCFCE7",
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 12,
  },
  approvedText: {
    color: "#166534",
  },
  pendingText: {
    color: "#92400E",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    color: "#111827",
    marginBottom: 8,
    lineHeight: 24,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  eventLocation: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  organizerContainer: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  organizerText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
