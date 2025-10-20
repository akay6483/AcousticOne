import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Image } from "react-native";
import { ThemeProvider, useTheme } from "../theme/ThemeContext";

// LogoTitle now uses the useTheme hook for consistency
function LogoTitle() {
  const { isDark } = useTheme();
  return (
    <Image
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
      }}
      resizeMode="contain"
      source={
        isDark
          ? require("../assets/images/darkAO.png")
          : require("../assets/images/lightAO.png")
      }
    />
  );
}

// This is the new inner component that can access the theme
function ThemedDrawer() {
  const { colors } = useTheme();

  return (
    <Drawer
      initialRouteName="(tabs)"
      screenOptions={{
        headerTitle: LogoTitle,
        headerTitleAlign: "left",
        // Apply theme colors
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.headerBackground },
        drawerStyle: { backgroundColor: colors.drawerBackground },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.inactiveTint,
        drawerPosition: "right",
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Return",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="arrow-back-outline" color={color} size={size} />
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
        name="(drawer)/setting"
        options={{
          title: "Settings",
          drawerIcon: ({ color, size }) => (
            <Ionicons name={"settings-outline"} color={color} size={size} />
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
    </Drawer>
  );
}

// The main export remains simple, providing the theme and rendering the themed drawer
export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedDrawer />
    </ThemeProvider>
  );
}
