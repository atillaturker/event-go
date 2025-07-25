import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import EventDetailScreen from "../components/EventDetailScreen";
import LoadingView from "../components/LoadingView";
import { useAppDispatch } from "../hooks/redux";
import LoginScreen from "../screens/LoginScreen";
import EventRequestScreen from "../screens/organizer/EventRequest";
import RegisterScreen from "../screens/RegisterScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import { checkAuthToken } from "../store/authSlice";
import { RootState } from "../store/reduxStore";
import { TabNavigator } from "./TabNavigator";

const Stack = createStackNavigator();

const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, isInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    dispatch(checkAuthToken());
  }, [dispatch]);

  console.log("Auth state:", { isAuthenticated, isLoading, isInitialized });

  if (isLoading || !isInitialized) {
    return <LoadingView />;
  }

  console.log("Rendering navigation, isAuthenticated:", isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="bottomTab" component={TabNavigator} />
            <Stack.Screen
              name="EventDetailScreen"
              component={EventDetailScreen}
            />
            <Stack.Screen
              name="EventRequestsScreen"
              component={EventRequestScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
