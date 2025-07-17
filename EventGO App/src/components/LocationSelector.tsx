import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import BottomSheetModal from "./BottomSheetModal";
import CustomText from "./CustomText";

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
  const [selectedLocation, setSelectedLocation] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [mapRegion, setMapRegion] = React.useState({
    latitude: 41.015137,
    longitude: 28.97953,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

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

  const handleMapPress = (event: any) => {
    console.log(event.nativeEvent.coordinate);
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const reverseGeocode = React.useCallback(
    React.useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return (latitude: number, longitude: number) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          try {
            const result = await Location.reverseGeocodeAsync({
              latitude,
              longitude,
            });
            console.log("Result:", result);
            if (result.length > 0) {
              const address = result[0];
              const formattedAddress = [
                address.name,
                address.street,
                address.city,
                address.region,
                address.country,
              ]
                .filter(Boolean)
                .join(", ");
              setTempAddress(formattedAddress);
            } else {
              setTempAddress(
                `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              );
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            setTempAddress(
              `Location:${latitude.toFixed(6)},${longitude.toFixed(6)}`
            );
          }
        }, 500);
      };
    }, []),
    []
  );

  //   const getCurrentLocation = async () => {
  //     try {
  //       Alert.alert(
  //         "Info",
  //         "Current location feature will be implemented with expo-location"
  //       );
  //     } catch (error) {
  //       Alert.alert("Error", "Could not get current location");
  //     }
  //   };

  const confrimMapSelection = () => {
    if (selectedLocation) {
      handleLocationSelect(
        tempAddress,
        selectedLocation.latitude,
        selectedLocation.longitude
      );
    } else {
      Alert.alert("Error", "Please select a lcoation on the map");
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
      maxHeight={700}
    >
      <View style={styles.container}>
        {/* Manual Address Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Address</Text>
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

        {/* Map for user to select location */}
        <View>
          <CustomText fontWeight="600" style={styles.sectionTitle}>
            Pick from Map
          </CustomText>
          <CustomText fontWeight="600" style={styles.mapInstruction}>
            Tap on the map to select a location
          </CustomText>

          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Selected Location"
                description="Tap 'Confirm Selection' to use this location"
                pinColor="#6366f1"
              />
            )}
          </MapView>

          {selectedLocation && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={confrimMapSelection}
              >
                <Ionicons name="location" size={20} color="#6366f1" />
                <Text style={styles.actionText}>Select Location</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Buttons */}

        {/* Popular Locations */}
        {/* <View style={styles.section}>
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
        </View> */}
      </View>
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
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  mapInstruction: {
    color: "#666",
    fontSize: 14,
    marginBottom: 8,
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
  map: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
  },

  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366f1",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },

  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default LocationSelector;
