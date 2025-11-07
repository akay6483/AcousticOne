import { Image, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { lightColors } from "../../theme/colors"; // For the style function type

export default function Info() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.logo}
          resizeMode="contain"
          source={
            isDark
              ? require("../../assets/images/darkAO.png")
              : require("../../assets/images/lightAO.png")
          }
        />
        <Text style={styles.appName}>AcousticOne</Text>
      </View>

      <Text style={styles.label}>App Information</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>App Version</Text>
          <Text style={styles.rowValue}>1.0.0 (Build 1)</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Developer</Text>
          <Text style={styles.rowValue}>AcousticOne Team</Text>
        </View>
      </View>

      <Text style={styles.footerText}>
        © 2025 AcousticOne. All rights reserved.
      </Text>
    </View>
  );
}

// This function generates the styles using the theme colors
const getStyles = (colors: typeof lightColors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Use theme color
      padding: 20,
    },
    header: {
      alignItems: "center",
      marginBottom: 30,
      marginTop: 20,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 16,
      marginBottom: 12,
    },
    appName: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    label: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
      color: colors.text,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 8,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    rowLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    rowValue: {
      fontSize: 16,
      color: colors.inactiveTint,
      fontWeight: "500",
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    footerText: {
      textAlign: "center",
      marginTop: "auto",
      paddingBottom: 20,
      color: colors.inactiveTint,
      fontSize: 12,
    },
  });
};
