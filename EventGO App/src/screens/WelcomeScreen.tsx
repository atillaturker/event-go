import { NavigationProp, useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "../components/CustomText";
import EventsFlatList from "../components/EventsFlatList";

export type RootStackParamList = {
  WelcomeScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
};

type WelcomeScreenNavigationProp = NavigationProp<
  RootStackParamList,
  "WelcomeScreen"
>;

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const data = [
    {
      id: "1",
      image: require("../assets/images/list1.png"),
      title: "Music Concert",
      text: "Join us for an unforgettable night of music and fun!",
    },
    {
      id: "2",
      image: require("../assets/images/list2.png"),
      title: "Art Exhibition",
      text: "Explore the beauty of art and creativity.",
    },
    {
      id: "3",
      image: require("../assets/images/list3.png"),
      title: "Food Festival",
      text: "Indulge in a culinary journey with delicious food and great company.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/images/header.png")}
        style={styles.headerImage}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <CustomText fontWeight="800" style={styles.title}>
          Discover events near you
        </CustomText>
        <View style={styles.listContainer}>
          <EventsFlatList data={data} />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("LoginScreen")}
            style={styles.signInButton}
          >
            <CustomText fontWeight="600" style={styles.ButtonText}>
              Sign In
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("RegisterScreen")}
            style={styles.registerButton}
          >
            <CustomText fontWeight="600" style={styles.ButtonText}>
              Register
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerImage: {
    width: "100%",
    height: 225,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 20,
  },
  listContainer: {
    flex: 1,
    marginBottom: 20,
  },
  buttonContainer: {
    paddingBottom: 10,
  },
  signInButton: {
    backgroundColor: "#38E078",
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 15,
  },
  ButtonText: {
    fontSize: 16,
    color: "#0D1A12",
  },
  registerButton: {
    backgroundColor: "#F0FDF4",
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8F2ED",
  },
});
