import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
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

// --- ManagerButton component REMOVED ---

// --- MAIN SCREEN COMPONENT ---
export default function DeviceScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [isModalVisible, setIsModalVisible] = useState(false);

  // --- States for device management ---
  const [pairedSystems, setPairedSystems] = useState<Device[]>([]);
  const [connectedSystem, setConnectedSystem] = useState<Device | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  // --- State for the selected device in the list ---
  const [selectedSystemId, setSelectedSystemId] = useState<number | null>(null);

  // --- Derived state to get the full selected system object ---
  const selectedSystem = useMemo(
    () => pairedSystems.find((s) => s.id === selectedSystemId),
    [pairedSystems, selectedSystemId]
  );

  // --- Load devices from DB on mount ---
  useEffect(() => {
    loadDevices();
  }, []);

  /**
   * Fetches devices from DB and updates state
   */
  const loadDevices = async () => {
    try {
      await initDB(); // Ensure DB is initialized
      const devicesFromDB = await getDevices();
      setPairedSystems(devicesFromDB);

      // If no devices, clear selection and connection
      if (devicesFromDB.length === 0) {
        setConnectedSystem(null);
        setConnectionStatus("disconnected");
        setSelectedSystemId(null);
      }
    } catch (error) {
      console.error("Failed to load devices:", error);
    }
  };

  // --- Handlers ---
  const handleConnect = (system: Device) => {
    console.log("Connecting to:", system.name);
    setConnectionStatus("connecting");
    // Simulate connection
    setTimeout(() => {
      setConnectedSystem(system);
      setConnectionStatus("connected");
      console.log("Connected");
    }, 1000);
  };

  /**
   * Deletes a device from the DB and reloads the list
   */
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
              // Disconnect if it's the active device
              if (connectedSystem?.id === systemToForget.id) {
                setConnectedSystem(null);
                setConnectionStatus("disconnected");
              }
              // Clear selection if it's the selected device
              if (selectedSystemId === systemToForget.id) {
                setSelectedSystemId(null);
              }
              await deleteDevice(systemToForget.id);
              await loadDevices(); // Refresh list from DB
            } catch (error) {
              console.error("Failed to forget device:", error);
            }
          },
        },
      ]
    );
  };

  /**
   * Adds a new device to the DB and reloads the list
   */
  const handleAddNewSystem = async (newSystem: PASystem) => {
    try {
      await addDevice(newSystem); // Add to DB
      await loadDevices(); // Refresh list from DB
    } catch (error) {
      console.error("Failed to add new system:", error);
      Alert.alert("Error", "Failed to add new system. It may already exist.");
    } finally {
      setIsModalVisible(false);
    }
  };

  // --- Button Press Handlers ---
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

  // --- RENDER SUB-COMPONENTS ---

  const renderStatusSection = () => {
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
              onPress={() => setIsModalVisible(true)} // Open modal
            >
              <Text style={styles.connectorButtonText}>Direct Connect</Text>
            </Pressable>
            <Pressable
              style={styles.connectorButton}
              onPress={() => setIsModalVisible(true)} // Open modal
            >
              <Text style={styles.connectorButtonText}>Network Connect</Text>
            </Pressable>
          </View>
        </View>

        {/* --- 3. MANAGER SECTION --- */}
        <View style={[styles.sectionContainer, styles.managerSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Manager</Text>
            <MaterialCommunityIcons
              name="devices"
              size={24}
              color={colors.icon}
            />
          </View>

          {/* --- Horizontally Scrolling Buttons REMOVED --- */}
          {/* --- New Button Container (like PresetModal) --- */}
          <View style={styles.managerButtonContainer}>
            <Pressable
              style={[
                styles.managerButton,
                !selectedSystem && styles.managerButtonDisabled,
              ]}
              disabled={!selectedSystem}
              onPress={onConnectPress}
            >
              <Ionicons
                name="sync"
                size={16}
                color={!selectedSystem ? colors.textMuted : colors.text}
              />
              <Text
                style={[
                  styles.managerButtonText,
                  !selectedSystem && styles.managerButtonTextDisabled,
                ]}
              >
                Connect
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.managerButton,
                !selectedSystem && styles.managerButtonDisabled,
              ]}
              disabled={!selectedSystem}
              onPress={onInfoPress}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={!selectedSystem ? colors.textMuted : colors.text}
              />
              <Text
                style={[
                  styles.managerButtonText,
                  !selectedSystem && styles.managerButtonTextDisabled,
                ]}
              >
                Info
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.managerButton,
                !selectedSystem && styles.managerButtonDisabled,
              ]}
              disabled={!selectedSystem}
              onPress={onRenamePress}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={16}
                color={!selectedSystem ? colors.textMuted : colors.text}
              />
              <Text
                style={[
                  styles.managerButtonText,
                  !selectedSystem && styles.managerButtonTextDisabled,
                ]}
              >
                Rename
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.managerButton,
                !selectedSystem && styles.managerButtonDisabled,
              ]}
              disabled={!selectedSystem}
              onPress={onForgetPress}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={!selectedSystem ? colors.textMuted : colors.text}
              />
              <Text
                style={[
                  styles.managerButtonText,
                  !selectedSystem && styles.managerButtonTextDisabled,
                ]}
              >
                Forget
              </Text>
            </Pressable>
          </View>

          {/* --- Device List (will now scroll correctly) --- */}
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

// --- getManagerButtonStyles function REMOVED ---

// Main component styles
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
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    managerSection: {
      flex: 1,
      minHeight: 0,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 12,
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    // --- Status Section Styles ---
    statusContent: {
      flexDirection: "row",
      paddingVertical: 8,
      minHeight: 100,
      alignItems: "center",
    },
    statusEmptyText: {
      fontSize: 16,
      color: colors.textMuted,
      lineHeight: 24,
    },
    addTextLink: {
      color: colors.primary,
      fontWeight: "600",
    },
    statusImagePlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 8,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
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
      paddingVertical: 2,
    },
    statusLabel: {
      fontSize: 15,
      color: colors.textMuted,
      fontWeight: "500",
    },
    statusValue: {
      fontSize: 15,
      color: colors.text,
      fontWeight: "600",
    },
    // --- Connector Button Styles ---
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
      marginBottom: 16,
    },
    connectorButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      paddingVertical: 12,
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
    // --- Manager Button Styles (modeled after PresetModal tabs) ---
    managerButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      backgroundColor: colors.card, // Container is card color
      borderRadius: 10,
      padding: 4,
      marginBottom: 16,
      gap: 4, // Space between buttons
    },
    managerButton: {
      flex: 1, // Each button takes equal space
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background, // Inactive tab color
      paddingVertical: 10,
      paddingHorizontal: 8, // Adjust padding to fit 4
      borderRadius: 8, // Rounded corners for the button
    },
    managerButtonText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 13, // Smaller font to fit
      marginLeft: 6, // Space from icon
    },
    managerButtonDisabled: {
      backgroundColor: colors.inactiveTint,
      opacity: 0.7,
    },
    managerButtonTextDisabled: {
      color: colors.textMuted,
    },
    // --- buttonsScrollView style REMOVED ---
    // --- Device List Styles ---
    deviceListItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "transparent",
    },
    deviceListItemSelected: {
      backgroundColor: colors.background,
      borderColor: colors.primary,
    },
    deviceListInfo: {
      flex: 1,
      gap: 4,
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
