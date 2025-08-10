import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { FlatList } from "react-native-gesture-handler";
import { Event } from "../types/events";
import { formatDate } from "../utils/formatDate";
import CustomText from "./CustomText";
import EventCard from "./EventCard";

const CalendarTab = ({ events }: { events: Event[] }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const navigation = useNavigation();
  const eventsByDate = events.reduce((acc, event) => {
    const eventDate = event.date.split("T")[0];
    acc[eventDate] = (acc[eventDate] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const markedDates = events.reduce((acc, event) => {
    const eventDate = event.date.split("T")[0];
    const eventCount = eventsByDate[eventDate];

    let backgroundColor = "#e3f2fd";
    let textColor = "#1976d2";

    if (eventCount >= 3) {
      backgroundColor = "#1976d2";
      textColor = "#ffffff";
    } else if (eventCount >= 2) {
      backgroundColor = "#42a5f5";
      textColor = "#ffffff";
    }

    acc[eventDate] = {
      customStyles: {
        container: {
          backgroundColor: selectedDate ? "#1eb819ff" : backgroundColor,
          borderRadius: 15,
        },
        text: {
          color: "#ffffff",
          fontSize: 16,
          fontWeight: "bold",
        },
      },
    };
    return acc;
  }, {} as any);

  const selectedDateEvents = events.filter((event) => {
    const eventDate = event.date.split("T")[0];
    return eventDate === selectedDate;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        style={{
          width: 375,
          height: 375,
        }}
        theme={{
          backgroundColor: "#ffffff",
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#b6c1cd",
          selectedDayBackgroundColor: "#00adf5",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#00adf5",
          dayTextColor: "#2d4150",
          textDisabledColor: "#dd99ee",
        }}
        markingType="custom"
        markedDates={markedDates}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
      />
      {selectedDateEvents.length > 0 && (
        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <CustomText fontWeight="800" style={styles.sectionTitle}>
              Events for {formatDate(selectedDate)}
            </CustomText>
            <View style={styles.eventCountBadge}>
              <CustomText fontWeight="800" style={styles.eventCountText}>
                {selectedDateEvents.length}
              </CustomText>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <FlatList
              data={selectedDateEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                return (
                  <EventCard
                    event={item}
                    onPress={() => {
                      navigation.navigate("EventDetailScreen", {
                        eventId: item.id,
                      });
                    }}
                  />
                );
              }}
            />
            <View />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CalendarTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  eventsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    marginVertical: 8,
    textAlign: "left",
  },
  eventCountBadge: {
    backgroundColor: "#673ab7",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  eventCountText: {
    color: "#ffffff",
    fontSize: 16,
  },
});
