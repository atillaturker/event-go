import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Event } from "../types/events";
import { formatDate } from "../utils/formatDate";
import CustomText from "./CustomText";

interface EventCardProps {
  event: Event;
  onPress?: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress?.(event)} style={styles.eventItem}>
      <View style={styles.eventContent}>
        <CustomText fontWeight="800" style={styles.eventTitle}>
          {event.title}
        </CustomText>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color="#999"
            style={{ marginRight: 6 }}
          />
          <CustomText fontWeight="800" style={styles.eventDate}>
            {formatDate(event.date)}
          </CustomText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="location-outline"
            size={16}
            color="#666"
            style={{ marginRight: 6 }}
          />
          <CustomText fontWeight="800" style={styles.eventLocation}>
            {event.location.address}
          </CustomText>
        </View>
      </View>
      <Image
        source={{
          uri:
            event.imageUrl ||
            "https://placehold.jp/30/FFF/000000/300x150.png?text=No+Image",
        }}
        style={styles.eventImage}
      />
    </TouchableOpacity>
  );
};

export default EventCard;

const styles = StyleSheet.create({
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginHorizontal: 20,
    paddingBottom: 8,
    padding: 8,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    color: "#000",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  eventImage: {
    width: 78,
    height: 78,
    marginLeft: 16,
    borderRadius: 12,
  },
});
