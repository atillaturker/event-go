import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategorySelector from "../components/CategorySelector";
import CustomText from "../components/CustomText";
import DateTimeSelector from "../components/DateTimeSelector";
import LocationSelector from "../components/LocationSelector";
import { useCreateEventMutation } from "../services/eventsApi";
import { CreateEventRequest, EventCategory } from "../types/events";

const CreateEventScreen = () => {
  const navigation = useNavigation();
  const [createEvent, { isLoading }] = useCreateEventMutation();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [formData, setFormData] = useState<CreateEventRequest>({
    title: "",
    description: "",
    date: new Date().toISOString(),
    location: {
      latitude: 41.0082,
      longitude: 28.9784,
      address: "",
    },
    category: "",
    capacity: null,
    imageUrl: "",
  });

  const handleDateChange = (selectedDate: Date) => {
    setSelectedDate(selectedDate);
    setFormData({
      ...formData,
      date: selectedDate.toISOString(),
    });
  };

  const formatDate = (date: string) => {
    if (!date) return "Select date and time";
    const d = new Date(date);
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const handleLocationSelect = (
    address: string,
    latitude?: number,
    longitude?: number
  ) => {
    setFormData({
      ...formData,
      location: {
        address,
        latitude: latitude || 41.0082,
        longitude: longitude || 28.9784,
      },
    });
    setShowLocationModal(false);
  };

  const handleCreateEvent = async () => {
    try {
      // Basit validasyon
      if (
        !formData.title ||
        !formData.description ||
        !formData.date ||
        !formData.location.address ||
        !formData.capacity
      ) {
        Alert.alert("Error", "Please fill all required fields");
        return;
      }

      // Date formatını kontrol et
      if (!formData.date) {
        Alert.alert("Error", "Please select a date and time");
        return;
      }

      const eventDate = new Date(formData.date);
      if (isNaN(eventDate.getTime())) {
        Alert.alert("Error", "Please select a valid date");
        return;
      }

      await createEvent({
        ...formData,
        date: eventDate.toISOString(),
        capacity: formData.capacity || 0,
      }).unwrap();

      Alert.alert("Success", "Event created successfully!");

      // Form'u temizle
      setFormData({
        title: "",
        description: "",
        date: "",
        location: {
          latitude: 41.0082,
          longitude: 28.9784,
          address: "",
        },
        category: EventCategory.OTHER,
        capacity: null,
        imageUrl: "",
      });
      setSelectedDate(new Date());
    } catch (error: any) {
      console.error("Create event error:", error);
      Alert.alert("Error", error?.data?.error || "Failed to create event");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle} fontWeight="800">
          Create Event
        </CustomText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Fill out the details below to create your event.
          </Text>

          {/* Event Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Title</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter event title"
              placeholderTextColor="#999"
            />
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              placeholder="Describe your event"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Date & Time */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date & Time</Text>
            <TouchableOpacity
              onPress={() => setShowDateModal(true)}
              style={styles.dateInput}
            >
              <Text
                style={[
                  styles.dateInputText,
                  !formData.date && { color: "#999" },
                ]}
              >
                {formatDate(formData.date)}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity
              style={styles.locationInput}
              onPress={() => setShowLocationModal(true)}
            >
              <Text
                style={[
                  styles.locationInputText,
                  !formData.location.address && { color: "#999" },
                ]}
              >
                {formData.location.address || "Enter location or pick on map"}
              </Text>
              <Ionicons name="location-outline" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Category */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.categoryInput}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text
                style={[
                  styles.categoryInputText,
                  !formData.category && { color: "#999" },
                ]}
              >
                {formData.category || "Select category"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Capacity */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Capacity</Text>
            <TouchableOpacity style={styles.capacityInput}>
              <TextInput
                style={styles.capacityInputText}
                value={formData.capacity?.toString() || ""}
                onChangeText={(text) => {
                  if (text === "") {
                    setFormData({ ...formData, capacity: null });
                  } else {
                    const numValue = parseInt(text, 10);
                    if (!isNaN(numValue)) {
                      setFormData({ ...formData, capacity: numValue });
                    }
                  }
                }}
                placeholder="Enter capacity"
                placeholderTextColor="#999"
                keyboardType="numeric"
                editable={true}
              />
              <Ionicons name="people-outline" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Upload Event Image */}
          <View style={styles.uploadContainer}>
            <Text style={styles.uploadTitle}>Upload Event Image</Text>
            <Text style={styles.uploadSubtitle}>
              Optional: Add an image to make your event stand out.
            </Text>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              isLoading && styles.createButtonDisabled,
            ]}
            onPress={handleCreateEvent}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? "Creating..." : "Create"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <CategorySelector
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        selectedCategory={formData.category}
        onCategorySelect={(category) => setFormData({ ...formData, category })}
      />

      <LocationSelector
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentAddress={formData.location.address}
        onLocationSelect={handleLocationSelect}
      />

      <DateTimeSelector
        visible={showDateModal}
        onClose={() => setShowDateModal(false)}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
    </SafeAreaView>
  );
};

export default CreateEventScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
    color: "#000",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  datePickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  datePicker: {
    width: "100%",
  },
  dateInputText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  locationInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  locationInputText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  categoryInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  categoryInputText: {
    fontSize: 16,
    color: "#000",
  },
  capacityInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  capacityInputText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  uploadContainer: {
    marginVertical: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  createButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  createButtonDisabled: {
    backgroundColor: "#ccc",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
