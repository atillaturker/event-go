import React from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import CustomText from "../components/CustomText";
import { logoutAsync } from "../store/authSlice";
import { AppDispatch, RootState } from "../store/reduxStore";

const UserScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  return (
    <SafeAreaView style={styles.container}>
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
});
