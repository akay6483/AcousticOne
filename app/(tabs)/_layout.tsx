import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3dbeffff",
        tabBarStyle: {
          backgroundColor: "#25292e",
        },

        headerTintColor: "#3dbeffff",
        headerStyle: {
          backgroundColor: "#25292e",
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="device"
        options={{
          title: "Devices",
          tabBarIcon: ({ color, focused }) => (
            /*
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={24}
            />
            */
            <Ionicons
              name={focused ? "wifi-sharp" : "wifi-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-sharp"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
