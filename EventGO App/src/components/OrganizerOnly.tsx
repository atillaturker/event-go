import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "../store/reduxStore";
import CustomText from "./CustomText";

const OrganizerOnly = ({ children }: { children: React.ReactNode }) => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user || user.role !== "ORGANIZER") {
    return (
      <SafeAreaView style={styles.container}>
        <CustomText fontFamily="Inter" fontWeight="700" style={styles.title}>
          Access Denied
        </CustomText>
        <CustomText fontFamily="Inter" fontWeight="300" style={styles.message}>
          You do not have permission to view this page.
        </CustomText>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <CustomText
            fontFamily="Inter"
            fontWeight="500"
            style={styles.buttonText}
          >
            Go Back
          </CustomText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  return children;
};

export default OrganizerOnly;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 48,
    color: "#000000",
    textAlign: "center",
    marginVertical: 20,
  },
  message: {
    fontSize: 32,
    textAlign: "center",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#gray",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#000000",
    textAlign: "center",
    fontSize: 32,
  },
});
