import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import EventsScreen from "../screens/EventsScreen";
import CreateEventScreen from "../screens/organizer/CreateEventScreen";

import NotificationHeaderIcon from "../components/NotificationHeader";
import MyEventsScreen from "../screens/organizer/OrganizerEventsScreen";
import UserEventsScreen from "../screens/user/UserEventsScreen";
import UserScreen from "../screens/UserScreen";
import { RootState } from "../store/reduxStore";

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role?.toUpperCase();
  const isOrganizer = userRole === "ORGANIZER";
  const isUser = userRole === "USER";

  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({
          focused,
          color,
        }: {
          focused: boolean;
          color: string;
        }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case "Events":
              iconName = focused ? "calendar" : "calendar-outline";
              break;
            case "Create":
              iconName = focused ? "add-circle" : "add-circle-outline";
              break;
            case "MyEvents":
              iconName = focused ? "list" : "list-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "calendar-outline";
          }

          return <Ionicons name={iconName} size={26} color={color} />;
        },
        tabBarActiveTintColor: "#673ab7",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0.5,
          borderTopColor: "#E5E5E7",
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
        headerStyle: {
          backgroundColor: "#FFFFFF",
          elevation: 0,
          shadowOpacity: 0,
          height: 80,
        },
        headerTitle: () => <></>, // Hide the title
        headerRight: () => <NotificationHeaderIcon />,
      })}
    >
      {isUser && (
        <>
          <Tab.Screen
            name="Events"
            component={EventsScreen}
            options={{
              tabBarLabel: "Events",
            }}
          />

          <>
            <Tab.Screen
              name="MyEvents"
              component={UserEventsScreen}
              options={{
                tabBarLabel: "MyEvents",
              }}
            />
          </>
        </>
      )}

      {isOrganizer && (
        <>
          <>
            <Tab.Screen
              name="Events"
              component={EventsScreen}
              options={{
                tabBarLabel: "Events",
              }}
            />
          </>
          <Tab.Screen
            name="Create"
            component={CreateEventScreen}
            options={{
              tabBarLabel: "Create Event",
            }}
          />

          <Tab.Screen
            name="MyEvents"
            component={MyEventsScreen}
            options={{
              tabBarLabel: "Manage Events",
            }}
          />
        </>
      )}

      <Tab.Screen
        name="Profile"
        component={UserScreen}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
};
