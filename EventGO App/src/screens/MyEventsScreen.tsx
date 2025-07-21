import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "../components/CustomText";
import EventCard from "../components/EventCard";
import LoadingView from "../components/LoadingView";
import { useGetMyEventsQuery } from "../services/eventsApi";
import { Event, EventStatus } from "../types/events";

const MyEventsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | "ALL">(
    "ALL"
  );
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  // API call with filters
  const {
    data: eventsResponse,
    error,
    isLoading,
    refetch,
  } = useGetMyEventsQuery({
    search: searchQuery.trim() || undefined,
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    limit: 20,
    offset: 0,
  });

  const events = eventsResponse?.events || [];
  const totalCount = eventsResponse?.totalCount || 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    // Navigate to event detail or edit screen
    Alert.alert(
      "Event Details",
      `${event.title}\n\nAttendees: ${event.attendeeCount}/${event.capacity}`,
      [
        { text: "OK", style: "default" },
        { text: "Edit", style: "default" },
      ]
    );
  };

  const handleManageRequests = (event: Event) => {
    navigation.navigate("EventRequestsScreen", {
      eventId: event.id,
    });
  };

  const renderStatusFilter = () => {
    const statuses: Array<{ key: EventStatus | "ALL"; label: string }> = [
      { key: "ALL", label: "All" },
      { key: EventStatus.ACTIVE, label: "Active" },
      { key: EventStatus.CANCELLED, label: "Cancelled" },
      { key: EventStatus.COMPLETED, label: "Completed" },
    ];

    return (
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statuses}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedStatus === item.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(item.key)}
            >
              <CustomText
                style={[
                  styles.filterButtonText,
                  selectedStatus === item.key && styles.filterButtonTextActive,
                ]}
                fontWeight="600"
              >
                {item.label}
              </CustomText>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <CustomText fontWeight="800" style={styles.title}>
        My Events
      </CustomText>
      <CustomText fontWeight="400" style={styles.subtitle}>
        You have organized {totalCount} events
      </CustomText>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search events..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#999"
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <CustomText style={styles.emptyTitle} fontWeight="600">
        You haven't created any events yet
      </CustomText>
      <CustomText style={styles.emptySubtitle} fontWeight="400">
        Tap the + button to create your first event
      </CustomText>
    </View>
  );

  const renderEventItem = ({ item }: { item: Event }) => (
    <View style={styles.eventItemContainer}>
      <EventCard event={item} onPress={handleEventPress} />
      <View style={styles.eventStats}>
        <View style={styles.statItem}>
          <CustomText style={styles.statValue} fontWeight="700">
            {item.attendeeCount}
          </CustomText>
          <CustomText style={styles.statLabel} fontWeight="400">
            Attendees
          </CustomText>
        </View>
        <View style={styles.statItem}>
          <CustomText style={styles.statValue} fontWeight="700">
            {item.capacity}
          </CustomText>
          <CustomText style={styles.statLabel} fontWeight="400">
            Capacity
          </CustomText>
        </View>
        <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
          <CustomText style={styles.statusText} fontWeight="600">
            {item.status === EventStatus.ACTIVE && "Active"}
            {item.status === EventStatus.CANCELLED && "Cancelled"}
            {item.status === EventStatus.COMPLETED && "Completed"}
          </CustomText>
        </View>
      </View>

      {/* Manage Requests Button */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.manageRequestsButton}
          onPress={() => handleManageRequests(item)}
        >
          <Ionicons
            name="people"
            size={18}
            color="#FFFFFF"
            style={styles.buttonIcon}
          />
          <CustomText style={styles.manageRequestsText} fontWeight="600">
            Manage Requests
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && !refreshing) {
    return <LoadingView />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <CustomText style={styles.errorText} fontWeight="600">
            Error occurred while loading events
          </CustomText>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <CustomText style={styles.retryButtonText} fontWeight="600">
              Try Again
            </CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEventItem}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderSearchBar()}
            {renderStatusFilter()}
          </>
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContainer,
          events.length === 0 && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default MyEventsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  listContainer: {
    padding: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  eventItemContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,

    borderTopColor: "#F0F0F0",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusACTIVE: {
    backgroundColor: "#E8F5E8",
  },
  statusCANCELLED: {
    backgroundColor: "#FFE8E8",
  },
  statusCOMPLETED: {
    backgroundColor: "#E8F0FF",
  },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#FF3B30",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  actionButtonsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  manageRequestsButton: {
    backgroundColor: "#1A1A2E",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#1A1A2E",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  manageRequestsText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
