import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";

interface ConnectorCardProps {
  onDirectConnect: () => void;
  onNetworkConnect: () => void;
}

export const ConnectorCard: React.FC<ConnectorCardProps> = ({
  onDirectConnect,
  onNetworkConnect,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Connector</Text>
        <MaterialCommunityIcons
          name="swap-horizontal"
          size={24}
          color={colors.icon}
        />
      </View>
      <View style={styles.buttonRow}>
        <Pressable style={styles.connectorButton} onPress={onDirectConnect}>
          <Text style={styles.connectorButtonText}>Direct Connect</Text>
        </Pressable>
        <Pressable style={styles.connectorButton} onPress={onNetworkConnect}>
          <Text style={styles.connectorButtonText}>Network Connect</Text>
        </Pressable>
      </View>
    </View>
  );
};

const getStyles = (colors: typeof lightColors, isDark: boolean) =>
  StyleSheet.create({
    sectionContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.1 : 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 8,
      marginBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },
    connectorButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    connectorButtonText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 13,
      textAlign: "center",
    },
  });
