import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
  return (
    <Drawer
      initialRouteName="(tabs)"
      screenOptions={{
        headerTintColor: "#3dbeffff",
        headerStyle: { backgroundColor: "#25292e" },
        drawerStyle: { backgroundColor: "#1b1d21" },
        drawerActiveTintColor: "#3dbeffff",
        drawerInactiveTintColor: "#ccc",
        drawerPosition: "right",
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Return", // 1. Title changed from "Home" to "Return"
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="arrow-back-outline" // 2. Icon changed from "home"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="(drawer)/setting"
        options={{
          title: "Settings",
          drawerIcon: ({ color, size }) => (
            <Ionicons name={"settings-outline"} color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="(drawer)/profile"
        options={{
          title: "Profile",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="(drawer)/help"
        options={{
          title: "Help",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="(drawer)/info"
        options={{
          title: "Info",
          drawerIcon: ({ color, size }) => (
            <AntDesign name="info-circle" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="+not-found" // <-- Remove .tsx
        options={{
          href: null,
        }}
      />
    </Drawer>
  );
}
