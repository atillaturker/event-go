import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "../components/CustomText";
import EventCard from "../components/EventCard";
import { useGetEventsQuery } from "../services/eventsApi";
import { Event, EventCategory } from "../types/events";
import { getCategoryDisplayName } from "../utils/categoryDisplay";
import { formatDate } from "../utils/formatDate";

const EventsScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "">(
    ""
  );
  const navigation = useNavigation();

  const queryParams: any = {
    search: searchText,
    limit: 20,
  };

  if (selectedCategory) {
    queryParams.category = selectedCategory;
  }

  const { data: eventsData, error, isLoading } = useGetEventsQuery(queryParams);

  const categories = ["All", ...Object.values(EventCategory)];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <CustomText fontWeight="600" style={styles.loadingText}>
            Loading events...
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <CustomText fontWeight="600" style={styles.errorText}>
            Error loading events
          </CustomText>
          <TouchableOpacity style={styles.retryButton} onPress={() => {}}>
            <CustomText fontWeight="600" style={styles.retryButtonText}>
              Try Again
            </CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const events = eventsData?.data.events || [];

  const getMapRegion = () => {
    if (events.length === 0) {
      return {
        latitude: 41.0082,
        longitude: 28.9784,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const latitudes = events.map((event) => event.location.latitude);
    const longitudes = events.map((event) => event.location.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latDelta = Math.max(maxLat - minLat, 0.01) * 1.5;
    const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.5;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate("EventDetailScreen", { eventId: event.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <CustomText fontWeight="800" style={styles.headerTitle}>
            Events
          </CustomText>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView style={styles.map} initialRegion={getMapRegion()}>
            {events.map((event) => (
              <Marker
                key={event.id}
                coordinate={{
                  latitude: event.location.latitude,
                  longitude: event.location.longitude,
                }}
                title={event.title}
                description={`${formatDate(event.date)} - ${
                  event.location.address
                }`}
              />
            ))}
          </MapView>
          <View style={styles.mapOverlay}>
            <CustomText fontWeight="800" style={styles.mapTitle}>
              {events.length > 0 ? `${events.length} Events` : "No Events"}
            </CustomText>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() =>
                setSelectedCategory(
                  category === "All" ? "" : (category as EventCategory)
                )
              }
            >
              <CustomText
                fontWeight="600"
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {getCategoryDisplayName(category)}
              </CustomText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <CustomText fontWeight="800" style={styles.sectionTitle}>
            Upcoming Events
          </CustomText>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={handleEventPress}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    color: "#000",
  },
  filterButton: {
    padding: 8,
  },
  mapContainer: {
    height: 275,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  mapTitle: {
    fontSize: 24,
    color: "#000",
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: "#000",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  categoryTextActive: {
    color: "#FFF",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 21,
    color: "#000",
    marginBottom: 16,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EventsScreen;
