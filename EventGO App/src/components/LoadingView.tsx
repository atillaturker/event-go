import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface LoadingViewProps {
  size?: "small" | "large";
  color?: string;
}

const LoadingView: React.FC<LoadingViewProps> = ({
  size = "large",
  color = "#007AFF",
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});

export default LoadingView;
