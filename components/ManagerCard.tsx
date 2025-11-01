import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  FlatList,
  Pressable, // 👈 This will be removed from the component
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Device } from "../services/database";
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";

// --- Manager Button ---
type ManagerButtonProps = {
  label: string;
  onPress: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
};
const ManagerButton: React.FC<ManagerButtonProps> = ({
  label,
  onPress,
  icon,
  disabled,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getButtonStyles(colors), [colors]);
  const iconColor = disabled ? colors.textMuted : colors.text;
  const textColor = disabled ? colors.textMuted : colors.text;

  return (
    <Pressable
      style={[styles.managerButton, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      {React.cloneElement(icon as React.ReactElement, {
        color: iconColor,
      })}
      <Text
        style={[styles.managerButtonText, disabled && { color: textColor }]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

// --- Device List Item ---
// ... (This component is unchanged) ...
interface DeviceListItemProps {
  item: Device;
  isSelected: boolean;
  onSelect: (id: string) => void;
}
const DeviceListItem: React.FC<DeviceListItemProps> = ({
  item,
  isSelected,
  onSelect,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getListStyles(colors), [colors]);

  return (
    <Pressable
      style={[
        styles.deviceListItem,
        isSelected && styles.deviceListItemSelected,
      ]}
      onPress={() => onSelect(item.id)}
    >
      <View style={styles.deviceListInfo}>
        <Text
          style={[styles.deviceName, isSelected && styles.deviceNameSelected]}
        >
          {item.name}
        </Text>
        <Text style={styles.deviceSsid}>
          {item.ssid} {item.modelCode ? `(${item.modelCode})` : ""}
        </Text>
      </View>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      )}
    </Pressable>
  );
};

// --- Main Card Component ---
interface ManagerCardProps {
  pairedSystems: Device[];
  selectedSystemId: string | null;
  onSelectSystem: (id: string) => void;
  onInfo: () => void;
  onRename: () => void;
  onForget: () => void;
}

export const ManagerCard: React.FC<ManagerCardProps> = ({
  pairedSystems,
  selectedSystemId,
  onSelectSystem,
  onInfo,
  onRename,
  onForget,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getCardStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={[styles.sectionContainer, styles.managerSection]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Manager</Text>
        <MaterialCommunityIcons name="devices" size={24} color={colors.icon} />
      </View>

      {/* --- ❗️ FIX IS HERE --- */}
      {/* Replaced ScrollView with a View to allow buttons to space out */}
      <View style={styles.buttonsRow}>
        <ManagerButton
          label="Info"
          icon={<Ionicons name="information-circle-outline" size={16} />}
          onPress={onInfo}
          disabled={!selectedSystemId}
        />
        <ManagerButton
          label="Rename"
          icon={<MaterialCommunityIcons name="pencil-outline" size={16} />}
          onPress={onRename}
          disabled={!selectedSystemId}
        />
        <ManagerButton
          label="Forget"
          icon={<Ionicons name="trash-outline" size={16} />}
          onPress={onForget}
          disabled={!selectedSystemId}
        />
      </View>
      {/* --- END OF FIX --- */}

      <FlatList
        data={pairedSystems}
        renderItem={({ item }) => (
          <DeviceListItem
            item={item}
            isSelected={item.id === selectedSystemId}
            onSelect={onSelectSystem}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No paired devices.</Text>
            <Text style={styles.emptyListText}>
              Connect to a device's WiFi and tap 'Refresh' to add one.
            </Text>
          </View>
        }
      />
    </View>
  );
};

// --- STYLES ---
const getButtonStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    managerButton: {
      flex: 1, // 👈 Added this to make buttons fill space
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center", // 👈 Added this to center content
      backgroundColor: colors.card,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      // marginRight: 8, // 👈 Removed this
    },
    managerButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
    },
    disabledButton: {
      backgroundColor: colors.background,
      opacity: 0.6,
    },
  });

const getListStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    // ... (This style function is unchanged) ...
    deviceListItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 4,
      borderWidth: 1,
      borderColor: "transparent",
      backgroundColor: colors.background,
    },
    deviceListItemSelected: {
      borderColor: colors.primary,
    },
    deviceListInfo: {
      flex: 1,
      marginRight: 8,
      gap: 2,
    },
    deviceName: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    deviceNameSelected: {
      color: colors.primary,
      fontWeight: "600",
    },
    deviceSsid: {
      fontSize: 14,
      color: colors.textMuted,
    },
  });

const getCardStyles = (colors: typeof lightColors, isDark: boolean) =>
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
    managerSection: {
      flex: 1,
      minHeight: 0,
      marginBottom: 0,
      padding: 12,
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
    // ❗️ RENAMED this style
    buttonsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 8, // 👈 Added gap for spacing
    },
    emptyListContainer: {
      padding: 20,
      alignItems: "center",
      marginTop: 10,
    },
    emptyListText: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: "center",
    },
  });
