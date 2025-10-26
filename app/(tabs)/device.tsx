import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView, // ScrollView for Manager Buttons
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PASystem, ScanAndPairModal } from "../../components/ScanAndPairModal";
import { useTheme } from "../../theme/ThemeContext";
import { lightColors } from "../../theme/colors";

// --- DATABASE IMPORTS ---
import {
  Device,
  addDevice,
  deleteDevice,
  getDevices,
  initDB,
} from "../../services/database";

type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

// --- REUSABLE BUTTON COMPONENT (Unchanged Functionally) ---
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
  const styles = useMemo(() => getManagerButtonStyles(colors), [colors]);

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

// --- MAIN SCREEN COMPONENT (Logic Unchanged) ---
export default function DeviceScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pairedSystems, setPairedSystems] = useState<Device[]>([]);
  const [connectedSystem, setConnectedSystem] = useState<Device | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [selectedSystemId, setSelectedSystemId] = useState<number | null>(null);

  const selectedSystem = useMemo(
    () => pairedSystems.find((s) => s.id === selectedSystemId),
    [pairedSystems, selectedSystemId]
  );

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      await initDB();
      const devicesFromDB = await getDevices();
      setPairedSystems(devicesFromDB);

      if (devicesFromDB.length === 0) {
        setConnectedSystem(null);
        setConnectionStatus("disconnected");
        setSelectedSystemId(null);
      }
    } catch (error) {
      console.error("Failed to load devices:", error);
    }
  };

  const handleConnect = (system: Device) => {
    console.log("Connecting to:", system.name);
    setConnectionStatus("connecting");
    setTimeout(() => {
      setConnectedSystem(system);
      setConnectionStatus("connected");
    }, 1000);
  };

  const handleForget = (systemToForget: Device) => {
    Alert.alert(
      "Forget System",
      `Are you sure you want to forget ${systemToForget.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Forget",
          style: "destructive",
          onPress: async () => {
            try {
              if (connectedSystem?.id === systemToForget.id) {
                setConnectedSystem(null);
                setConnectionStatus("disconnected");
              }
              if (selectedSystemId === systemToForget.id) {
                setSelectedSystemId(null);
              }
              await deleteDevice(systemToForget.id);
              await loadDevices();
            } catch (error) {
              console.error("Failed to forget device:", error);
            }
          },
        },
      ]
    );
  };

  const handleAddNewSystem = async (newSystem: PASystem) => {
    try {
      await addDevice(newSystem);
      await loadDevices();
    } catch (error) {
      console.error("Failed to add new system:", error);
      Alert.alert("Error", "Failed to add new system. It may already exist.");
    } finally {
      setIsModalVisible(false);
    }
  };

  const onConnectPress = () => {
    if (selectedSystem) {
      handleConnect(selectedSystem);
    }
  };

  const onForgetPress = () => {
    if (selectedSystem) {
      handleForget(selectedSystem);
    }
  };

  const onInfoPress = () => {
    if (selectedSystem) {
      Alert.alert(
        "Device Info",
        `Name: ${selectedSystem.name}\nSSID: ${selectedSystem.ssid}`
      );
    }
  };

  const onRenamePress = () => {
    if (selectedSystem) {
      Alert.alert("Rename", "Rename functionality is not yet implemented.");
    }
  };

  // --- RENDER SUB-COMPONENTS (Unchanged) ---
  const renderStatusSection = () => {
    // ... (same as before)
    if (connectionStatus === "connected" && connectedSystem) {
      // --- CONNECTED STATE ---
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
              <Text style={styles.statusValue}>AcousticsOne-Amp</Text>
            </View>
            <View style={styles.statusInfoRow}>
              <Text style={styles.statusLabel}>SSID :</Text>
              <Text style={styles.statusValue}>{connectedSystem.ssid}</Text>
            </View>
            <View style={styles.statusInfoRow}>
              <Text style={styles.statusLabel}>Other Info :</Text>
              <Text style={styles.statusValue}>...</Text>
            </View>
          </View>
        </View>
      );
    }

    // --- DISCONNECTED STATE ---
    return (
      <View style={styles.statusContent}>
        <Text style={styles.statusEmptyText}>
          No device connected. Tap{" "}
          <Text
            style={styles.addTextLink}
            onPress={() => setIsModalVisible(true)}
          >
            add(+)
          </Text>{" "}
          to scan for devices.
        </Text>
      </View>
    );
  };

  const renderDeviceListItem = ({ item }: { item: Device }) => {
    // ... (same as before)
    const isSelected = item.id === selectedSystemId;
    return (
      <Pressable
        style={[
          styles.deviceListItem,
          isSelected && styles.deviceListItemSelected,
        ]}
        onPress={() => setSelectedSystemId(item.id)}
      >
        <View style={styles.deviceListInfo}>
          <Text
            style={[styles.deviceName, isSelected && styles.deviceNameSelected]}
          >
            {item.name}
          </Text>
          <Text style={styles.deviceSsid}>{item.ssid}</Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </Pressable>
    );
  };

  // --- RENDER MAIN COMPONENT ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={styles.container}>
        {/* --- 1. STATUS SECTION --- */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Status</Text>
            <MaterialCommunityIcons name="wifi" size={24} color={colors.icon} />
          </View>
          {renderStatusSection()}
        </View>

        {/* --- 2. CONNECTOR SECTION --- */}
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
            <Pressable
              style={styles.connectorButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Text style={styles.connectorButtonText}>Direct Connect</Text>
            </Pressable>
            <Pressable
              style={styles.connectorButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Text style={styles.connectorButtonText}>Network Connect</Text>
            </Pressable>
          </View>
        </View>

        {/* --- 3. MANAGER SECTION (flex: 1) --- */}
        <View style={[styles.sectionContainer, styles.managerSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Manager</Text>
            <MaterialCommunityIcons
              name="devices"
              size={24}
              color={colors.icon}
            />
          </View>

          {/* --- Horizontally Scrolling Buttons --- */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonsScrollView}
          >
            <ManagerButton
              label="Connect"
              icon={<Ionicons name="sync" size={16} />}
              onPress={onConnectPress}
              disabled={!selectedSystem}
            />
            <ManagerButton
              label="Info"
              icon={<Ionicons name="information-circle-outline" size={16} />}
              onPress={onInfoPress}
              disabled={!selectedSystem}
            />
            <ManagerButton
              label="Rename"
              icon={<MaterialCommunityIcons name="pencil-outline" size={16} />}
              onPress={onRenamePress}
              disabled={!selectedSystem}
            />
            <ManagerButton
              label="Forget"
              icon={<Ionicons name="trash-outline" size={16} />}
              onPress={onForgetPress}
              disabled={!selectedSystem}
            />
          </ScrollView>

          {/* --- Device List (Scrolling) --- */}
          <FlatList
            data={pairedSystems}
            renderItem={renderDeviceListItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>No paired devices.</Text>
                <Text style={styles.emptyListText}>
                  Tap 'Direct Connect' or 'Network Connect' to add one.
                </Text>
              </View>
            }
          />
        </View>
      </View>

      {/* --- SCANNING MODAL --- */}
      <ScanAndPairModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onPairSuccess={handleAddNewSystem}
        pairedSystemIds={pairedSystems.map((s) => s.id)}
      />
    </SafeAreaView>
  );
}

// --- STYLESHEET ---

// Styles for the new ManagerButton (Compact)
const getManagerButtonStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    managerButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      paddingVertical: 8, // 👈 Reduced
      paddingHorizontal: 12, // 👈 Reduced
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8, // 👈 Reduced
    },
    managerButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6, // 👈 Reduced
    },
    disabledButton: {
      backgroundColor: colors.inactiveTint,
      opacity: 0.7,
      borderColor: colors.border,
    },
  });

// Main component styles (Adjusted Spacing)
const getStyles = (colors: typeof lightColors, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 16,
    },
    sectionContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12, // 👈 Reduced overall padding for sections
      marginBottom: 12, // 👈 Reduced margin between sections
      borderWidth: 1,
      borderColor: colors.border,
    },
    managerSection: {
      flex: 1, // Takes remaining space
      minHeight: 0,
      marginBottom: 0, // No margin at the bottom for the last section
      padding: 12, // Keep manager padding consistent
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 8, // 👈 Reduced
      marginBottom: 8, // 👈 Reduced
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    // --- Status Section Styles (Shrunk) ---
    statusContent: {
      flexDirection: "row",
      paddingVertical: 4,
      minHeight: 70, // 👈 Further Reduced
      alignItems: "center",
    },
    statusEmptyText: {
      fontSize: 16,
      color: colors.textMuted,
      lineHeight: 22, // 👈 Reduced
    },
    addTextLink: {
      color: colors.primary,
      fontWeight: "600",
    },
    statusImagePlaceholder: {
      width: 50, // 👈 Further Reduced
      height: 50, // 👈 Further Reduced
      borderRadius: 6, // 👈 Reduced
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10, // 👈 Reduced
      borderWidth: 1,
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
      fontSize: 14, // 👈 Reduced
      color: colors.textMuted,
      fontWeight: "500",
    },
    statusValue: {
      fontSize: 14, // 👈 Reduced
      color: colors.text,
      fontWeight: "600",
    },
    // --- Connector Button Styles (Shrunk) ---
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
      // marginBottom removed (handled by sectionContainer margin)
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
      borderWidth: 1,
      borderColor: colors.border,
    },
    connectorButtonText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 13,
      textAlign: "center",
    },
    // --- Manager Button ScrollView Style ---
    buttonsScrollView: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12, // 👈 Reduced
    },
    // --- Device List Styles (Compact) ---
    deviceListItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10, // 👈 Reduced
      paddingHorizontal: 12, // 👈 Reduced
      borderRadius: 8,
      marginBottom: 4, // 👈 Reduced
      borderWidth: 1,
      borderColor: "transparent",
    },
    deviceListItemSelected: {
      backgroundColor: colors.background,
      borderColor: colors.primary,
    },
    deviceListInfo: {
      flex: 1,
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
    emptyListContainer: {
      padding: 20,
      alignItems: "center",
    },
    emptyListText: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: "center",
    },
  });
