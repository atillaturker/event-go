import Ionicons from "@expo/vector-icons/build/Ionicons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";

interface ScreenHeaderProps {
  onBackPress?: () => void;
  title: string;
}

export const ScreenHeader = ({ onBackPress, title }: ScreenHeaderProps) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Ionicons name="arrow-back" size={20} color="#000" />
      </TouchableOpacity>
      <CustomText style={styles.headerTitle} fontWeight="800">
        {title}
      </CustomText>
    </View>
  );
};

export default ScreenHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    textAlign: "center",
    marginRight: 35,
  },
});
