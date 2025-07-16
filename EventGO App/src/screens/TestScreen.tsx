import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheetModal from "../components/BottomSheetModal";

const TestScreen = () => {
  const [date, setDate] = useState(new Date(1598051730000));
  const [mode, setMode] = useState<"date" | "time">("date");
  const [show, setShow] = useState(false);
  const [modalType, setModalType] = useState<
    "bottom" | "center" | "top" | "fullscreen"
  >("bottom");
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const onChange = (_event: any, selectedDate?: Date) => {
    const currentDate = selectedDate;
    setShow(false);
    if (currentDate) {
      setDate(currentDate);
    }
  };

  const showMode = (currentMode: "date" | "time") => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };

  const showModalWithType = (
    type: "bottom" | "center" | "top" | "fullscreen"
  ) => {
    setModalType(type);
    setShow(true);
  };

  const getModalStyle = () => {
    switch (modalType) {
      case "bottom":
        return styles.bottomModal;
      case "center":
        return styles.centerModal;
      case "top":
        return styles.topModal;
      case "fullscreen":
        return styles.fullscreenModal;
      default:
        return styles.bottomModal;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Modal Test Screen</Text>

      <View style={styles.buttonContainer}>
        <Button onPress={showDatepicker} title="Show Date Picker" />
        <Button onPress={showTimepicker} title="Show Time Picker" />

        <Text style={styles.sectionTitle}>Modal Types:</Text>
        <Button
          title="Bottom Modal"
          onPress={() => showModalWithType("bottom")}
        />
        <Button
          title="Center Modal"
          onPress={() => showModalWithType("center")}
        />
        <Button title="Top Modal" onPress={() => showModalWithType("top")} />
        <Button
          title="Fullscreen Modal"
          onPress={() => showModalWithType("fullscreen")}
        />

        <Text style={styles.sectionTitle}>BottomSheet Modal:</Text>
        <Button
          title="Show BottomSheet"
          onPress={() => setShowBottomSheet(true)}
        />
      </View>

      <Text style={styles.selectedDate}>Selected: {date.toLocaleString()}</Text>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          onChange={onChange}
        />
      )}

      <Modal
        isVisible={show}
        onBackdropPress={() => setShow(false)}
        onBackButtonPress={() => setShow(false)}
        style={getModalStyle()}
        animationIn={
          modalType === "top"
            ? "slideInDown"
            : modalType === "bottom"
            ? "slideInUp"
            : "fadeIn"
        }
        animationOut={
          modalType === "top"
            ? "slideOutUp"
            : modalType === "bottom"
            ? "slideOutDown"
            : "fadeOut"
        }
        backdropOpacity={0.5}
        useNativeDriver
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Modal Content ({modalType})</Text>
          <Text style={styles.modalText}>
            Bu modal {modalType} tipinde konumlandırılmış
          </Text>
          <Text style={styles.modalText}>
            Bu modal {modalType} tipinde konumlandırılmış
          </Text>
          <Text style={styles.modalText}>
            Bu modal {modalType} tipinde konumlandırılmış
          </Text>
          <Text style={styles.modalText}>
            Bu modal {modalType} tipinde konumlandırılmış
          </Text>
          <Button title="Close Modal" onPress={() => setShow(false)} />
        </View>
      </Modal>

      <BottomSheetModal
        visible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        title="Center Modal Example"
        maxHeight={400}
      >
        <View style={{ padding: 20 }}>
          <Text style={styles.modalText}>
            Bu bir BottomSheetModal örneğidir
          </Text>
          <Button title="Kapat" onPress={() => setShowBottomSheet(false)} />
        </View>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default TestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 10,
    color: "#333",
  },
  selectedDate: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  // Modal Styles
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  centerModal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },
  topModal: {
    justifyContent: "flex-start",
    margin: 0,
    marginTop: 50,
    height: "50%",
  },
  fullscreenModal: {
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
});
