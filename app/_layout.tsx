import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Drawer } from "expo-router/drawer";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { initDB } from "../services/database"; //adjust import path to your db file
import { ThemeProvider, useTheme } from "../theme/ThemeContext";

//import { resetDB } from "../services/database";
// LogoTitle using theme
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

function ThemedDrawer() {
  const { colors } = useTheme();

  return (
    <Drawer
      initialRouteName="(tabs)"
      screenOptions={{
        headerTitle: LogoTitle,
        headerTitleAlign: "left",
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
        name="(drawer)/info"
        options={{
          title: "Info",
          drawerIcon: ({ color, size }) => (
            <AntDesign name="info-circle" color={color} size={size} />
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
        name="(drawer)/support"
        options={{
          title: "Support",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-buoy-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="(drawer)/privacy"
        options={{
          title: "Privacy Policy",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="shield-checkmark-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Drawer>
  );
}

// --- Main RootLayout ---
export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const setupDB = async () => {
      try {
        //await resetDB(); // 👈 reset your database if needed
        await initDB(); // 👈 initialize your database before UI loads
        setDbReady(true);
      } catch (err) {
        console.error("DB initialization failed:", err);
      }
    };
    setupDB();
  }, []);

  if (!dbReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#121212",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#3dbeff" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <ThemedDrawer />
    </ThemeProvider>
  );
}
