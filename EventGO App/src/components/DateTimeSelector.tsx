import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import BottomSheetModal from "./BottomSheetModal";

interface DateTimeSelectorProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  visible,
  onClose,
  selectedDate,
  onDateChange,
}) => {
  const handleDateChange = (_event: any, date?: Date) => {
    if (date) {
      onDateChange(date);
      // Android'de değişiklik sonrası modal'ı kapat
      if (Platform.OS === "android") {
        onClose();
      }
    }
  };

  const formatSelectedDate = (date: Date) => {
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="Select Date & Time"
      maxHeight={Platform.OS === "ios" ? 400 : 300}
    >
      <View style={styles.container}>
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateLabel}>Selected Date & Time:</Text>
          <Text style={styles.selectedDateText}>
            {formatSelectedDate(selectedDate)}
          </Text>
        </View>

        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={selectedDate}
            mode="datetime"
            display={"inline"}
            onChange={handleDateChange}
            minimumDate={new Date()}
            style={styles.picker}
          />
        </View>

        {Platform.OS === "ios" && (
          <View style={styles.note}>
            <Text style={styles.noteText}>
              Scroll to adjust date and time, then tap outside to close
            </Text>
          </View>
        )}
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  selectedDateContainer: {
    backgroundColor: "#f8f9ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  selectedDateLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6366f1",
  },
  pickerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    height: Platform.OS === "ios" ? 200 : "auto",
  },
  note: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  noteText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default DateTimeSelector;
