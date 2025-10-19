import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Image, useColorScheme } from "react-native";

function LogoTitle() {
  const colorScheme = useColorScheme();
  return (
    <Image
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
      }}
      resizeMode="contain"
      source={
        colorScheme === "dark"
          ? require("../assets/images/darkAO.png")
          : require("../assets/images/lightAO.png")
      }
    />
  );
}

export default function RootLayout() {
  return (
    <Drawer
      initialRouteName="(tabs)"
      screenOptions={{
        headerTitle: LogoTitle,
        headerTitleAlign: "left",
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
          title: "Return",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="arrow-back-outline" color={color} size={size} />
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
    </Drawer>
  );
}
