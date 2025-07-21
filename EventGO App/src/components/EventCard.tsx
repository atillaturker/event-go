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
    <View>
      <TouchableOpacity
        onPress={() => onPress?.(event)}
        style={styles.eventItem}
      >
        <View style={styles.eventContent}>
          <CustomText fontWeight="800" style={styles.eventTitle}>
            {event.title}
          </CustomText>
          <CustomText fontWeight="800" style={styles.eventDate}>
            {formatDate(event.date)}
          </CustomText>
          <CustomText fontWeight="800" style={styles.eventLocation}>
            {event.location.address}
          </CustomText>
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
    </View>
  );
};

export default EventCard;

const styles = StyleSheet.create({
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#F0F0F0",
    marginBottom: 12,
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
    width: 80,
    height: 80,
    marginLeft: 16,
    borderRadius: 12,
  },
});
