import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
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
import Icon from "react-native-vector-icons/Feather";
import CustomText from "../../components/CustomText";
import EventCard from "../../components/EventCard";
import LoadingView from "../../components/LoadingView";
import {
  useCancelEventMutation,
  useGetAllEventAttendanceRequestsQuery,
  useGetOrganizerEventsQuery,
} from "../../services/eventsApi";
import { Event, EventStatus } from "../../types/events";

const MyEventsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | "ALL">(
    "ALL"
  );
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();

  // API call with filters
  const {
    data: eventsResponse,
    error,
    isLoading,
    refetch: refetchEvents,
  } = useGetOrganizerEventsQuery({
    search: searchQuery.trim() || undefined,
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    limit: 20,
    offset: 0,
  });

  const { data: allEventsAttendanceRequests, refetch: refetchRequests } =
    useGetAllEventAttendanceRequestsQuery();

  const [
    cancelEvent,
    { isLoading: isLoadingCancelEvent, isSuccess: isCancelSuccess },
  ] = useCancelEventMutation();

  useEffect(() => {
    if (isCancelSuccess) {
      bottomSheetRef.current?.close();
    }
  }, [isCancelSuccess]);

  console.log("Events:", JSON.stringify(eventsResponse?.data.events, null, 2));

  const events = eventsResponse?.data.events;
  const totalCount = eventsResponse?.data.events.length;

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      setSelectedEvent(undefined);
    }
  };

  const openBottomSheet = (event: Event) => {
    setSelectedEvent(event);
    bottomSheetRef.current?.snapToIndex(0);
    console.log(event);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchEvents();
    await refetchRequests();
    setRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    openBottomSheet(event);
  };

  const handleManageRequests = (event: Event) => {
    navigation.navigate("EventRequestsScreen", {
      eventId: event?.id,
    });
  };

  const handleEventEdit = (event: Event) => {
    navigation.navigate("Create", {
      event,
    });
  };

  const handleEventCancel = (event: Event) => {
    Alert.alert("Cancel Event", "Are you sure you want to cancel this event?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: () => cancelEvent(event.id),
      },
    ]);
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

  const renderEventItem = ({ item }: { item: Event }) => {
    const pendingRequestsCount = allEventsAttendanceRequests?.data.filter(
      (req) => req.eventId === item.id && req.status === "PENDING"
    ).length;

    return (
      <View style={styles.cardRowContainer}>
        <View style={styles.cardImageWrapper}>
          <EventCard event={item} onPress={() => handleEventPress(item)} />
        </View>
        <View style={styles.cardInfoWrapper}>
          <CustomText style={styles.cardTitle} fontWeight="700">
            {item.title}
          </CustomText>

          <CustomText fontWeight="400" style={styles.cardAddress}>
            {item.location?.address}
          </CustomText>
          <CustomText style={styles.cardDate} fontWeight="400">
            {new Date(item.date).toLocaleDateString()} ·{" "}
            {new Date(item.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </CustomText>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="people-outline"
                size={16}
                color="#888"
                style={{ marginRight: 4 }}
              />
              <CustomText style={styles.cardAttendees} fontWeight="300">
                {item.attendeeCount}
              </CustomText>
            </View>

            {pendingRequestsCount > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="mail-unread-outline"
                  size={16}
                  color="#56e269ff"
                  style={{ marginRight: 4 }}
                />
                <CustomText
                  style={[
                    styles.cardAttendees,
                    { color: "#10B981", fontWeight: "700" },
                  ]}
                >
                  {pendingRequestsCount}
                </CustomText>
              </View>
            )}
          </View>
        </View>
        {/* 3-dot menu */}
        <TouchableOpacity
          style={styles.cardMenuButton}
          onPress={() => openBottomSheet(item)}
        >
          <Ionicons
            style={{ marginBottom: 60 }}
            name="ellipsis-vertical"
            size={22}
            color="#666"
          />
        </TouchableOpacity>
      </View>
    );
  };

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
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
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
          events?.length === 0 && styles.emptyListContainer,
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
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["30%"]}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: "#FFFFFF" }}
        handleIndicatorStyle={{ backgroundColor: "#CCCCCC" }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetView>
          <View style={styles.sheetContent}>
            <TouchableOpacity
              style={[
                styles.sheetButton,
                selectedEvent?.status !== "ACTIVE" && { opacity: 0.5 },
              ]}
              onPress={() => {
                if (selectedEvent?.status === "ACTIVE") {
                  handleEventEdit(selectedEvent);
                } else {
                  Alert.alert("Only Active events can be changed");
                }
              }}
            >
              <CustomText style={styles.buttonText}>Edit</CustomText>
              <Icon name="edit" size={25} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetButton}
              onPress={() => handleManageRequests(selectedEvent)}
            >
              <CustomText style={styles.buttonText}>View Requests</CustomText>
              <Icon name="users" size={25} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sheetButton, { backgroundColor: "#ffdddd" }]}
              onPress={() => handleEventCancel(selectedEvent)}
              disabled={isLoadingCancelEvent}
            >
              <CustomText style={[styles.buttonText, { color: "red" }]}>
                {isLoadingCancelEvent ? "Cancelling..." : "Cancel Event"}
              </CustomText>
              <Icon name="trash-2" size={25} color="red" />
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
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
  cardRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 14,
    overflow: "hidden",
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfoWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 17,
    color: "#222",
    marginBottom: 2,
  },
  cardAddress: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 13,
    color: "#888",
    marginBottom: 2,
  },
  cardAttendees: {
    fontSize: 13,
    color: "#888",
  },
  cardMenuButton: {
    padding: 8,
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
  attendeesStatValue: {
    fontSize: 18,
    color: "#3fdc0bff",
  },
  pendingStatValue: {
    fontSize: 18,
    color: "#FF3B30",
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
    backgroundColor: "#989090ff",
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

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  date: { fontSize: 14, color: "gray", marginTop: 4 },
  sheetContent: { padding: 16, flex: 1, flexDirection: "column" },
  sheetTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  sheetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    justifyContent: "space-between",
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: { fontSize: 20, color: "#000" },
});
