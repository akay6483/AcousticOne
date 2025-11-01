import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Device } from "../services/database";
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";

type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

interface StatusCardProps {
  connectionStatus: ConnectionStatus;
  connectedSystem: Device | null;
  onRefresh: () => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  connectionStatus,
  connectedSystem,
  onRefresh,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const renderStatusContent = () => {
    if (connectionStatus === "connecting") {
      return (
        <View style={styles.statusContent}>
          <Text style={styles.statusEmptyText}>Connecting...</Text>
        </View>
      );
    }
    if (connectionStatus === "connected" && connectedSystem) {
      return (
        <View style={styles.statusContent}>
          <View style={styles.statusImagePlaceholder}>
            <Text style={{ color: colors.textMuted }}>Product Image</Text>
          </View>
          <View style={styles.statusInfoContainer}>
            <View style={styles.statusInfoRow}>
              <Text style={styles.statusLabel}>Strength :</Text>
              <MaterialCommunityIcons
                name="wifi-strength-4"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.statusInfoRow}>
              <Text style={styles.statusLabel}>Model :</Text>
              <Text style={styles.statusValue}>
                {connectedSystem.modelCode ?? "Loading..."}
              </Text>
            </View>
            <View style={styles.statusInfoRow}>
              <Text style={styles.statusLabel}>SSID :</Text>
              <Text style={styles.statusValue}>{connectedSystem.ssid}</Text>
            </View>
            <View style={styles.statusInfoRow}>
              <Text style={styles.statusLabel}>Name :</Text>
              <Text style={styles.statusValue}>{connectedSystem.name}</Text>
            </View>
          </View>
        </View>
      );
    }

    // --- ❗️ FIX IS HERE ---
    // This block now renders a clear message with a visible "Refresh"
    // link for both 'disconnected' and 'error' states.
    return (
      <View style={styles.statusContent}>
        <Text style={styles.statusEmptyText}>
          {connectionStatus === "error"
            ? "Connection failed. Check network and tap "
            : "No device connected. Connect to device WiFi and tap "}
          <Pressable onPress={onRefresh}>
            <Text style={styles.addTextLink}>Refresh</Text>
          </Pressable>
          .
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Status</Text>
        <MaterialCommunityIcons name="wifi" size={24} color={colors.icon} />
      </View>
      {renderStatusContent()}
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
    statusContent: {
      flexDirection: "row",
      paddingVertical: 4,
      minHeight: 70,
      alignItems: "center",
      paddingHorizontal: 4,
    },
    statusEmptyText: {
      flex: 1,
      fontSize: 16,
      color: colors.textMuted,
      lineHeight: 24, // Added for better line spacing
      textAlign: "center",
    },
    addTextLink: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 16,
      lineHeight: 24, // Match the empty text
    },
    statusImagePlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 6,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    statusInfoContainer: {
      flex: 1,
      justifyContent: "space-around",
    },
    statusInfoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 1,
    },
    statusLabel: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: "500",
    },
    statusValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "600",
      flexShrink: 1,
      textAlign: "right",
    },
  });
