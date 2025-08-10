import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ScreenHeader";
import UserEventsTab from "../../components/UserEventsTab";

const UserEventsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="My Events" onBackPress={() => navigation.goBack()} />
      <UserEventsTab />
    </SafeAreaView>
  );
};

export default UserEventsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
