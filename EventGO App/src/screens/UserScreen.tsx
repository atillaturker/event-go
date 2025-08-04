import React, { useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import CustomText from "../components/CustomText";
import ScreenHeader from "../components/ScreenHeader";
import { useGetUserNotificationsQuery } from "../services/eventsApi";
import { logoutAsync } from "../store/authSlice";
import { AppDispatch, RootState } from "../store/reduxStore";
import { NotificationTypes } from "../types/notification";

const UserScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [modalVisible, setModalVisible] = useState(false);

  const {
    data,
    isError,
    isLoading: isUserNotificationLoading,
  } = useGetUserNotificationsQuery();

  console.log("Data", JSON.stringify(data, null, 2));

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  const getNotificationStyle = (type: NotificationTypes) => {
    switch (type) {
      case NotificationTypes.EVENT_CANCELLED:
        return { backgroundColor: "#FFE6E6", borderColor: "#FF4444" };
      case NotificationTypes.EVENT_UPDATED:
        return { backgroundColor: "#E6F3FF", borderColor: "#4285F4" };
      default:
        return { backgroundColor: "#F0F4FF", borderColor: "#4285F4" };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Profile" showBackButton={false} />
      <View style={styles.content}>
        <CustomText style={styles.title}>User Screen</CustomText>

        {user && (
          <View style={styles.userInfo}>
            <CustomText style={styles.label}>Name: {user.name}</CustomText>
            <CustomText style={styles.label}>Email: {user.email}</CustomText>
            <CustomText style={styles.label}>Role: {user.role}</CustomText>
          </View>
        )}

        <TouchableOpacity
          style={styles.notificationsButton}
          onPress={() => setModalVisible(true)}
        >
          <CustomText style={styles.notificationsText}>
            Bildirimlerim
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            isLoading && styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <CustomText style={styles.logoutText}>
            {isLoading ? "Logging out..." : "Logout"}
          </CustomText>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText style={styles.modalTitle}>Bildirimlerim</CustomText>
            <FlatList
              data={data?.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.notificationItem,
                    getNotificationStyle(item.notification.type),
                  ]}
                >
                  <CustomText style={styles.notificationTitle}>
                    {item.notification.title}
                  </CustomText>
                  <CustomText style={styles.notificationMessage}>
                    {item.notification.message}
                  </CustomText>
                </View>
              )}
              ListEmptyComponent={
                <CustomText>Hiç bildiriminiz yok.</CustomText>
              }
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <CustomText style={styles.closeButtonText}>Kapat</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default UserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  userInfo: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    width: "100%",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  notificationsButton: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  notificationsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#FF4444",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  logoutButtonDisabled: {
    backgroundColor: "#FFAAAA",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxHeight: "70%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  notificationItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F0F4FF",
    borderRadius: 8,
    width: "100%",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#333",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#4285F4",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
