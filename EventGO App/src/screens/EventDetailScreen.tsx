import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import CustomText from "../components/CustomText";
import MapMarker from "../components/MapMarker";
import {
  useGetEventByIdQuery,
  useJoinEventMutation,
  useLeaveEventMutation,
} from "../services/eventsApi";
import { RootState } from "../store/reduxStore";
import { EventStatus } from "../types/events";
import { formatDate } from "../utils/formatDate";

interface EventDetailScreenProps {
  route: { params: { eventId: string } };
}

const dimensions = Dimensions.get("window");

const EventDetailScreen: React.FC<EventDetailScreenProps> = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { eventId } = route.params as { eventId: string };
  const { data: eventData, isLoading, error } = useGetEventByIdQuery(eventId);
  const [joinEvent, { isLoading: isJoining }] = useJoinEventMutation();
  const [leaveEvent, { isLoading: isLeaving }] = useLeaveEventMutation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Extract event from the response data
  const event = eventData?.data.event;

  const isUserJoined = event?.isAttending || false;

  console.log("Is user joined:", isUserJoined);

  const handleJoinEvent = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to join events");
      return;
    }

    try {
      await joinEvent(eventId).unwrap();
      Alert.alert(
        "Success",
        "You have successfully sent a join request to the event."
      );
    } catch (error: any) {
      const errorMessage = error.data?.error;
      Alert.alert("Error:", errorMessage);
    }
  };

  const handleLeaveEvent = async () => {
    Alert.alert("Leave Event", "Are you sure you want to leave this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            await leaveEvent(eventId).unwrap();
            Alert.alert("Success", "You have left the event");
          } catch (error: any) {
            Alert.alert(
              "Error",
              error.data?.message || "Failed to leave event"
            );
          }
        },
      },
    ]);
  };

  const handleShare = () => {
    // Share functionality
    Alert.alert("Share", "Share functionality will be implemented");
  };

  const renderStatusBadge = () => {
    let statusColor, statusText, statusBgColor;

    switch (event?.status) {
      case EventStatus.ACTIVE:
        statusColor = "#059669";
        statusBgColor = "#ECFDF5";
        statusText = "Active";
        break;
      case EventStatus.COMPLETED:
        statusColor = "#0369A1";
        statusBgColor = "#EFF6FF";
        statusText = "Completed";
        break;
      case EventStatus.CANCELLED:
        statusColor = "#DC2626";
        statusBgColor = "#FEF2F2";
        statusText = "Cancelled";
        break;
      default:
        statusColor = "#6B7280";
        statusBgColor = "#F3F4F6";
        statusText = "Unknown";
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
        <CustomText
          fontWeight="600"
          style={[styles.statusText, { color: statusColor }]}
        >
          {statusText}
        </CustomText>
      </View>
    );
  };

  // const isUserJoined = event?.isAttending || false;
  const isOrganizer = event?.organizerId === user?.id;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <CustomText fontWeight="600">Loading event details...</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <CustomText fontWeight="600">Failed to load event details</CustomText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <CustomText fontWeight="600" style={styles.retryText}>
              Go Back
            </CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <CustomText fontWeight="800" style={styles.headerTitle}>
          Event Details
        </CustomText>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Image
          source={{
            uri:
              event.imageUrl ||
              "https://via.placeholder.com/400x200/CCCCCC/FFFFFF?text=Event",
          }}
          style={styles.eventImage}
        />

        {/* Event Info */}
        <View style={styles.eventInfo}>
          <View style={styles.titleContainer}>
            <CustomText fontWeight="800" style={styles.eventTitle}>
              {event.title}
            </CustomText>
            {renderStatusBadge()}
          </View>

          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <CustomText fontWeight="600" style={styles.metaText}>
                {formatDate(event.date)}
              </CustomText>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <CustomText fontWeight="600" style={styles.metaText}>
                {new Date(event.date).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </CustomText>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <CustomText fontWeight="600" style={styles.metaText}>
                {event.location.address || "No address provided"}
              </CustomText>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <CustomText fontWeight="600" style={styles.metaText}>
                {event.attendeeCount || 0} / {event.capacity} participants
              </CustomText>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <CustomText fontWeight="800" style={styles.sectionTitle}>
              About Event
            </CustomText>
            <CustomText
              fontWeight="400"
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {event.description}
            </CustomText>
            {event.description && event.description.length > 150 && (
              <TouchableOpacity
                onPress={() => setShowFullDescription(!showFullDescription)}
              >
                <CustomText fontWeight="600" style={styles.readMoreText}>
                  {showFullDescription ? "Read less" : "Read more"}
                </CustomText>
              </TouchableOpacity>
            )}
          </View>

          {/* Organizer */}
          <View style={styles.organizerContainer}>
            <CustomText fontWeight="800" style={styles.sectionTitle}>
              Organizer
            </CustomText>
            <View style={styles.organizerInfo}>
              <View style={styles.organizerAvatar}>
                <CustomText fontWeight="600" style={styles.avatarText}>
                  {event.organizerName?.charAt(0).toUpperCase() || "O"}
                </CustomText>
              </View>
              <View style={styles.organizerDetails}>
                <CustomText fontWeight="600" style={styles.organizerName}>
                  {event.organizerName || "Event Organizer"}
                </CustomText>
                <CustomText fontWeight="400" style={styles.organizerRole}>
                  Event Organizer
                </CustomText>
              </View>
            </View>
          </View>

          {/* Map */}
          <View style={styles.mapContainer}>
            <CustomText fontWeight="800" style={styles.sectionTitle}>
              Location
            </CustomText>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: event.location.latitude,
                longitude: event.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: event.location.latitude,
                  longitude: event.location.longitude,
                }}
                title={event.title}
                description={event.location.address}
              >
                <MapMarker fullTitle={false} event={event} />
              </Marker>
            </MapView>
            <TouchableOpacity
              style={styles.mapOverlay}
              onPress={() => {
                Alert.alert("Map", "Open in full map view");
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {!isOrganizer && event?.status === EventStatus.ACTIVE && (
        <View style={styles.actionContainer}>
          {isUserJoined ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.leaveButton]}
              onPress={handleLeaveEvent}
              disabled={isLeaving}
            >
              <CustomText fontWeight="600" style={styles.leaveButtonText}>
                {isLeaving ? "Leaving..." : "Leave Event"}
              </CustomText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleJoinEvent}
              disabled={isJoining}
            >
              <CustomText fontWeight="600" style={styles.actionButtonText}>
                {isJoining ? "Joining..." : "Join Event"}
              </CustomText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Show message for non-active events */}
      {!isOrganizer && event?.status !== EventStatus.ACTIVE && (
        <View style={styles.actionContainer}>
          <View style={[styles.actionButton, styles.disabledButton]}>
            <CustomText fontWeight="600" style={styles.disabledButtonText}>
              {event?.status === EventStatus.COMPLETED
                ? "Event Completed"
                : "Event Cancelled"}
            </CustomText>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    height: 60,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  eventImage: {
    width: dimensions.width,
    height: 250,
    backgroundColor: "#f0f0f0",
  },
  eventInfo: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 24,
    color: "#000",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  eventMeta: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metaText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 12,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#000",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  readMoreText: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 8,
  },
  organizerContainer: {
    marginBottom: 24,
  },
  organizerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  organizerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    color: "#fff",
  },
  organizerDetails: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    color: "#000",
  },
  organizerRole: {
    fontSize: 14,
    color: "#666",
  },
  mapContainer: {
    marginBottom: 20,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  mapOverlay: {
    position: "absolute",
    top: 44,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  actionContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  leaveButton: {
    backgroundColor: "#FF3B30",
  },
  leaveButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  disabledButtonText: {
    fontSize: 16,
    color: "#fff",
  },
});

export default EventDetailScreen;
