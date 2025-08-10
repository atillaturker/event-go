import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Event, EventCategory } from "../types/events";
import CustomText from "./CustomText";

const MapMarker = ({
  event,
  fullTitle,
}: {
  event: Event;
  fullTitle: boolean;
}) => {
  const getMarkerConfig = (category: EventCategory) => {
    const markerConfigs = {
      [EventCategory.SPORTS]: {
        color: "#4ECDC4",
        icon: "football",
        backgroundColor: "#4ecdc4",
      },
      [EventCategory.TECHNOLOGY]: {
        color: "#45B7D1",
        icon: "hardware-chip-sharp",
        backgroundColor: "#45b7d1",
      },
      [EventCategory.ART]: {
        color: "#A29BFE",
        icon: "brush",
        backgroundColor: "#a29bfe",
      },
      [EventCategory.CONCERT]: {
        color: "#FF6B6B",
        icon: "musical-notes",
        backgroundColor: "#ff6b6b",
      },
      [EventCategory.EDUCATION]: {
        color: "#FFEAA7",
        icon: "school",
        backgroundColor: "#ffeaa7",
      },
      [EventCategory.FOOD_DRINK]: {
        color: "#FD79A8",
        icon: "restaurant",
        backgroundColor: "#fd79a8",
      },
      [EventCategory.PERFORMING_ARTS]: {
        color: "#81ECEC",
        icon: "theater",
        backgroundColor: "#81ecec",
      },
      [EventCategory.OTHER]: {
        color: "#636E72",
        icon: "ellipsis-horizontal",
        backgroundColor: "#636e72",
      },
    };
    return markerConfigs[category] || markerConfigs[EventCategory.OTHER];
  };
  return (
    <View style={styles.markerContainer}>
      <View
        style={[
          styles.marker,
          { backgroundColor: getMarkerConfig(event.category).backgroundColor },
        ]}
      >
        <Ionicons
          name={getMarkerConfig(event.category).icon as any}
          size={18}
          color="#FFFFFF"
        />
      </View>
      <View style={styles.titleBadge}>
        <CustomText
          fontFamily="Inter"
          fontWeight="800"
          style={styles.markerText}
        >
          {fullTitle
            ? event.title
            : event.title.length > 15
            ? `${event.title.slice(0, 15)}...`
            : event.title}
        </CustomText>
      </View>
    </View>
  );
};

export default MapMarker;

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  markerText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
});
