import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { lightColors } from "../../theme/colors"; // For the style function type

export default function Support() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleEmailPress = () => {
    Linking.openURL("mailto:pvacoustcis@gmail.com?subject=Support Request");
  };

  const handleIssuePress = () => {
    // Replace with your issue tracker or a "mailto" link
    Linking.openURL("mailto:pvacoustcis@gmail.com?subject=Bug Report");
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.label}>Get Help</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={handleEmailPress}>
          <Ionicons
            name="mail-outline"
            size={22}
            color={colors.text}
            style={styles.icon}
          />
          <Text style={styles.rowLabel}>Contact Support</Text>
          <Text style={styles.rowValue}>pvacoustcis@gmail.com</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Feedback</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={handleIssuePress}>
          <Ionicons
            name="bug-outline"
            size={22}
            color={colors.text}
            style={styles.icon}
          />
          <Text style={styles.rowLabel}>Report an Issue</Text>
          <Ionicons
            name="chevron-forward-outline"
            size={20}
            color={colors.inactiveTint}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        We typically respond within 24-48 hours.
      </Text>
    </ScrollView>
  );
}

// Using a getStyles function to dynamically apply theme colors
const getStyles = (colors: typeof lightColors) => {
  return StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flexGrow: 1,
      padding: 20,
    },
    label: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
      color: colors.text,
      marginTop: 10,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 8,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    icon: {
      marginRight: 16,
    },
    rowLabel: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    rowValue: {
      fontSize: 16,
      color: colors.inactiveTint,
      fontWeight: "500",
    },
    footerText: {
      textAlign: "center",
      marginTop: 20,
      color: colors.inactiveTint,
      fontSize: 12,
    },
  });
};
