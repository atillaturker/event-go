import Ionicons from "@expo/vector-icons/build/Ionicons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";
import NotificationHeaderIcon from "./NotificationHeader";

interface ScreenHeaderProps {
  onBackPress?: () => void;
  showBackButton?: boolean;
  title: string;
  titleStyle?: object;
}

export const ScreenHeader = ({
  onBackPress,
  showBackButton = false,
  title,
  titleStyle,
}: ScreenHeaderProps) => {
  return (
    <View style={styles.header}>
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
      )}
      <CustomText
        fontWeight="700"
        style={titleStyle ? titleStyle : styles.headerTitle}
      >
        {title}
      </CustomText>
      <NotificationHeaderIcon />
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
  backButton: {},
  headerTitle: {
    flex: 1,
    fontSize: 25,
    textAlign: "center",
    marginLeft: 10,
  },
});
