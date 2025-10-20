import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { useTheme } from "../../theme/ThemeContext"; // Import useTheme

export default function TabLayout() {
  const { colors } = useTheme(); // Get the current theme colors

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary, // Use theme color
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground, // Use theme color
        },
        headerTintColor: colors.primary, // Use theme color
        headerStyle: {
          backgroundColor: colors.headerBackground, // Use theme color
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="device"
        options={{
          title: "Devices",
          tabBarIcon: ({ color, focused }) => (
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
          title: "Control",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="surround-sound"
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="dsp"
        options={{
          title: "DSP",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "sine-wave" : "square-wave"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
