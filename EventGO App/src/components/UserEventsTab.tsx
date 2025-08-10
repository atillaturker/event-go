import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useGetUserEventsQuery } from "../services/eventsApi";
import { Event } from "../types/events";
import { formatDate } from "../utils/formatDate";
import CalendarTab from "./CalendarTab";
import CustomText from "./CustomText";

// Event Card Component
interface EventParticipationCardProps {
  eventData: {
    event: Event;
    request: {
      id: string;
      userStatus: "PENDING" | "APPROVED" | "REJECTED";
      isAttending: boolean;
      requestDate: string;
      updatedAt: string;
      userId: string;
    };
  };
  onPress?: () => void;
}

const EventParticipationCard: React.FC<EventParticipationCardProps> = ({
  eventData,
  onPress,
}) => {
  const { event, request } = eventData;
  const status = request.userStatus;
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

interface EventsListProps {
  eventsData: Array<{
    event: Event;
    request: {
      id: string;
      userStatus: "PENDING" | "APPROVED" | "REJECTED";
      isAttending: boolean;
      requestDate: string;
      updatedAt: string;
      userId: string;
    };
  }>;
  emptyMessage: string;
  emptySubMessage: string;
  navigation: any;
}

const EventList: React.FC<EventsListProps> = ({
  eventsData,
  emptyMessage,
  emptySubMessage,
  navigation,
}) => {
  const renderEventCard = ({
    item,
  }: {
    item: EventsListProps["eventsData"][0];
  }) => {
    return (
      <EventParticipationCard
        eventData={item}
        onPress={() =>
          navigation.navigate("EventDetailScreen", { eventId: item.event.id })
        }
      />
    );
  };

  const renderEmptyState = () => {
    const status = eventsData[0]?.request?.userStatus || "PENDING";
    return (
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
  };

  return (
    <FlatList
      data={eventsData}
      renderItem={renderEventCard}
      keyExtractor={(item) => item.request.id}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={renderEmptyState}
    />
  );
};

const UserEventsTab = () => {
  const initialLayout = { width: Dimensions.get("window").width };
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);

  const { data: approvedData, isLoading: isLoadingApproved } =
    useGetUserEventsQuery({ status: "APPROVED" });
  const { data: pendingData, isLoading: isLoadingPending } =
    useGetUserEventsQuery({ status: "PENDING" });

  console.log("Approved Data:", JSON.stringify(approvedData, null, 2));
  console.log("Pending Data:", JSON.stringify(pendingData, null, 2));

  const pendingEvents = pendingData?.data?.events || [];
  const approvedEvents = approvedData?.data?.events || [];

  const routes = [
    {
      key: "joined",
      title: `Joined Events (${approvedEvents.length})`,
    },
    { key: "pending", title: `Pending Events (${pendingEvents.length})` },
    { key: "calendar", title: "Calendar" },
  ];

  const joinedEventsRoute = () => {
    return (
      <EventList
        eventsData={approvedEvents}
        emptyMessage="You haven't joined any events yet"
        emptySubMessage="Browse events and join the ones that interest you!"
        navigation={navigation}
      />
    );
  };

  const pendingEventsRoute = () => {
    return (
      <EventList
        eventsData={pendingEvents}
        emptyMessage="No pending requests"
        emptySubMessage="Your event requests will appear here"
        navigation={navigation}
      />
    );
  };

  const calendarEventsRoute = () => {
    // Calendar için sadece event bilgilerini çıkar
    const approvedEventsOnly = approvedEvents.map(
      (item: { event: Event; request: any }) => item.event
    );
    return <CalendarTab events={approvedEventsOnly} />;
  };

  const renderScene = SceneMap({
    joined: joinedEventsRoute,
    pending: pendingEventsRoute,
    calendar: calendarEventsRoute,
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
        tabStyle={styles.tabStyle}
      />
    );
  };

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default UserEventsTab;

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
    fontSize: 12,
    textTransform: "none",
    backgroundColor: "blue",
  },
  tabStyle: {
    width: "auto",
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
    marginVertical: 16,
    marginHorizontal: 16,
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
