import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheetModal from "./BottomSheetModal";

interface LocationSelectorProps {
  visible: boolean;
  onClose: () => void;
  currentAddress: string;
  onLocationSelect: (
    address: string,
    latitude?: number,
    longitude?: number
  ) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  visible,
  onClose,
  currentAddress,
  onLocationSelect,
}) => {
  const [tempAddress, setTempAddress] = React.useState(currentAddress);

  React.useEffect(() => {
    setTempAddress(currentAddress);
  }, [currentAddress]);

  const handleLocationSelect = (
    address: string,
    latitude?: number,
    longitude?: number
  ) => {
    onLocationSelect(address, latitude, longitude);
    onClose();
  };

  const getCurrentLocation = async () => {
    try {
      Alert.alert(
        "Info",
        "Current location feature will be implemented with expo-location"
      );
    } catch (error) {
      Alert.alert("Error", "Could not get current location");
    }
  };

  const popularLocations = [
    "Taksim Square, Istanbul",
    "Galata Tower, Istanbul",
    "Bosphorus Bridge, Istanbul",
    "Sultanahmet, Istanbul",
  ];

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="Select Location"
      maxHeight={500}
    >
      <ScrollView style={styles.container}>
        {/* Manual Address Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Address Manually</Text>
          <TextInput
            style={styles.textInput}
            value={tempAddress}
            onChangeText={setTempAddress}
            placeholder="Type your event address here..."
            placeholderTextColor="#999"
            multiline
            onBlur={() => handleLocationSelect(tempAddress)}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={getCurrentLocation}
          >
            <Ionicons name="location" size={20} color="#6366f1" />
            <Text style={styles.actionText}>Use Current Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                "Info",
                "Map picker will be implemented with react-native-maps"
              );
            }}
          >
            <Ionicons name="map" size={20} color="#6366f1" />
            <Text style={styles.actionText}>Pick from Map</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Locations</Text>
          {popularLocations.map((location) => (
            <TouchableOpacity
              key={location}
              style={styles.popularLocationItem}
              onPress={() => handleLocationSelect(location)}
            >
              <Text style={styles.popularLocationText}>{location}</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
    color: "#000",
    minHeight: 80,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#6366f1",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 14,
    color: "#6366f1",
    marginLeft: 8,
    fontWeight: "500",
  },
  popularLocationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginHorizontal: -16,
  },
  popularLocationText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
});

export default LocationSelector;
