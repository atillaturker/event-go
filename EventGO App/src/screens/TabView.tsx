import React from "react";
import { StyleSheet, Text, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabBar, TabView } from "react-native-tab-view";

const TabViewScreen = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const routes = [
    { key: "Deneme", title: "Deneme" },
    { key: "Movies", title: "Movies" },
  ];

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case "Deneme":
        return <Text>Deneme Scene</Text>;
      case "Movies":
        return <Text>Movies Scene</Text>;
      default:
        return (
          <SafeAreaView>
            <Text>Default Scene</Text>
          </SafeAreaView>
        );
    }
  };

  const renderTabBar = (props: any) => {
    return (
      <TabBar
        {...props}
        indicatorStyle={{
          height: 2,
          backgroundColor: "#861717ff",
        }}
        style={styles.tabBar}
        labelStyle={styles.label}
        activeColor="#007AFF"
        inactiveColor="red"
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={renderTabBar}
        initialLayout={{ width: layout.width }}
        swipeEnabled={true}
      />
    </SafeAreaView>
  );
};

export default TabViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: "#ffffff",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
    textTransform: "none",
  },
});
