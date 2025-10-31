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
// --- 👇 Import ScannedSystem type alongside the Modal ---
import {
  ScanAndPairModal,
  ScannedSystem,
} from "../../components/ScanAndPairModal";
import { useTheme } from "../../theme/ThemeContext";
import { lightColors } from "../../theme/colors";

// --- DATABASE IMPORTS (Import new update function) ---
import {
  Device, // Use the simplified Device type from database.ts
  addDevice,
  deleteDevice,
  getDevices,
  initDB,
  updateDeviceModelCode, // 👈 New function
} from "../../services/database";

type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

// --- 👇 THIS IS YOUR NEW TEST/PRODUCTION SWITCH ---
// Set to `null` to show ALL networks for testing
// Set to ["AcousticsOne-", "PE PRO"] for production
const SSID_PREFIX_FILTER: string[] | null = null;

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

// --- MAIN SCREEN COMPONENT ---
export default function DeviceScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pairedSystems, setPairedSystems] = useState<Device[]>([]); // Uses simplified Device type
  const [connectedSystem, setConnectedSystem] = useState<Device | null>(null); // Uses simplified Device type
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null); // ID is now string (BSSID)

  // Memoized selected system based on string ID
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
      } else if (!selectedSystemId && devicesFromDB.length > 0) {
        // Auto-select the first device if none is selected
        setSelectedSystemId(devicesFromDB[0].id);
      }
    } catch (error) {
      console.error("Failed to load devices:", error);
    }
  };

  // --- 👇 Function to fetch Model Code (FIXED) ---
  const fetchModelCode = async (
    ipAddress: string
  ): Promise<string | undefined> => {
    try {
      // This function calls the /getSerial/ endpoint of the ESP8266
      const response = await fetch(`http://${ipAddress}/getSerial/`);
      const text = await response.text(); // Expected: "serial/MODEL_CODE/SERIAL_CODE/"

      // Parse the response to find the model code
      if (text.startsWith("serial/")) {
        const parts = text.split("/");
        if (parts.length >= 3) {
          return parts[1]; // Return the model code (e.g., "38B14")
        }
      }
    } catch (e) {
      console.error("Failed to fetch model code:", e);
    }
    return undefined;
  };
  // --- END OF FIX ---

  // --- 👇 Updated handleConnect ---
  const handleConnect = async (system: Device) => {
    console.log("Connecting to:", system.name);
    setConnectionStatus("connecting");
    // TODO: Replace setTimeout with actual connection logic
    // For Direct Connect, the IP is likely 192.168.4.1 (after WifiManager connects)
    // For Network Connect, you'll need the IP from SSDP/UPnP discovery
    const ipToUse = "192.168.4.1"; // Example for Direct Connect

    try {
      // Simple check to see if device responds
      const response = await fetch(`http://${ipToUse}/isthere/`); //
      const text = await response.text(); // Expected: "YES/MODEL_CODE/"

      if (text.startsWith("YES/")) {
        setConnectedSystem(system);
        setConnectionStatus("connected");

        // --- Fetch and update modelCode if missing ---
        if (!system.modelCode) {
          const modelCode = await fetchModelCode(ipToUse);
          if (modelCode) {
            await updateDeviceModelCode(system.id, modelCode);
            // Optionally reload devices or update state locally
            setPairedSystems((prev) =>
              prev.map((d) => (d.id === system.id ? { ...d, modelCode } : d))
            );
            setConnectedSystem((prev) =>
              prev ? { ...prev, modelCode } : null
            );
          }
        }
        // --- End of modelCode fetch ---
      } else {
        throw new Error("Device did not respond correctly");
      }
    } catch (error) {
      console.error("Connection failed:", error);
      setConnectionStatus("error");
      Alert.alert("Connection Failed", "Could not connect to the device.");
    }
  };
  // --- END OF UPDATE ---

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
              await loadDevices(); // Reload the list
            } catch (error) {
              console.error("Failed to forget device:", error);
            }
          },
        },
      ]
    );
  };

  // --- 👇 Updated handleAddNewSystem ---
  const handleAddNewSystem = async (scannedSystem: ScannedSystem) => {
    // Convert ScannedSystem to Device (modelCode is initially unknown)
    const newDevice: Device = {
      id: scannedSystem.id,
      name: scannedSystem.name,
      ssid: scannedSystem.ssid,
      modelCode: undefined, // Will be fetched on first connect
    };

    try {
      await addDevice(newDevice);
      await loadDevices(); // Reload devices from DB
      setSelectedSystemId(newDevice.id); // Select the newly added device
    } catch (error) {
      console.error("Failed to add new system:", error);
      Alert.alert("Error", "Failed to add new system. It may already exist.");
    } finally {
      setIsModalVisible(false);
    }
  };
  // --- END OF UPDATE ---

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
      // --- 👇 Updated Info Alert ---
      Alert.alert(
        "Device Info",
        `Name: ${selectedSystem.name}\nSSID: ${selectedSystem.ssid}\nID: ${
          selectedSystem.id
        }\nModel: ${selectedSystem.modelCode ?? "Unknown"}`
      );
      // --- END OF UPDATE ---
    }
  };

  const onRenamePress = () => {
    if (selectedSystem) {
      // Basic rename prompt
      Alert.prompt(
        "Rename Device",
        "Enter a new name:",
        async (newName) => {
          if (
            newName &&
            newName.trim() !== "" &&
            newName !== selectedSystem.name
          ) {
            try {
              // await updateDeviceName(selectedSystem.id, newName.trim()); // Assumes you have this DB function
              await loadDevices(); // Reload to show the new name
            } catch (error) {
              console.error("Failed to rename device:", error);
              Alert.alert("Error", "Could not rename device.");
            }
          }
        },
        "plain-text",
        selectedSystem.name
      );
    }
  };

  // --- RENDER SUB-COMPONENTS ---
  const renderStatusSection = () => {
    if (connectionStatus === "connecting") {
      // --- CONNECTING STATE ---
      return (
        <View style={styles.statusContent}>
          <Text style={styles.statusEmptyText}>Connecting...</Text>
        </View>
      );
    }
    if (connectionStatus === "connected" && connectedSystem) {
      // --- CONNECTED STATE (Show Model Code) ---
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
            {/* --- 👇 Display Model Code --- */}
            <View style={styles.statusInfoRow}>
              <Text style={styles.statusLabel}>Model :</Text>
              <Text style={styles.statusValue}>
                {connectedSystem.modelCode ?? "Loading..."}
              </Text>
            </View>
            {/* --- END OF UPDATE --- */}
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

    // --- DISCONNECTED OR ERROR STATE ---
    return (
      <View style={styles.statusContent}>
        <Text style={styles.statusEmptyText}>
          {connectionStatus === "error"
            ? "Connection failed. Please check device and network."
            : "No device connected. Tap "}
          {connectionStatus !== "error" && ( // Only show link if not in error state
            <Text
              style={styles.addTextLink}
              onPress={() => setIsModalVisible(true)}
            >
              add(+)
            </Text>
          )}
          {connectionStatus !== "error" && " to scan for devices."}
        </Text>
      </View>
    );
  };

  const renderDeviceListItem = ({ item }: { item: Device }) => {
    // Uses simplified Device type
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
          {/* --- 👇 Show Model Code if available --- */}
          <Text style={styles.deviceSsid}>
            {item.ssid} {item.modelCode ? `(${item.modelCode})` : ""}
          </Text>
          {/* --- END OF UPDATE --- */}
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
        {/* Status Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Status</Text>
            <MaterialCommunityIcons name="wifi" size={24} color={colors.icon} />
          </View>
          {renderStatusSection()}
        </View>

        {/* Connector Section */}
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
              onPress={() => setIsModalVisible(true)} // Opens ScanAndPairModal
            >
              <Text style={styles.connectorButtonText}>Direct Connect</Text>
            </Pressable>
            <Pressable
              style={styles.connectorButton}
              // TODO: onPress={() => { /* Implement Network Connect (SSDP) */ }}
              disabled // Disable until SSDP is implemented
            >
              <Text style={styles.connectorButtonText}>Network Connect</Text>
            </Pressable>
          </View>
        </View>

        {/* Manager Section */}
        <View style={[styles.sectionContainer, styles.managerSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Manager</Text>
            <MaterialCommunityIcons
              name="devices"
              size={24}
              color={colors.icon}
            />
          </View>

          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonsScrollView}
          >
            <ManagerButton
              label="Connect"
              icon={<Ionicons name="sync" size={16} />}
              onPress={onConnectPress}
              disabled={!selectedSystem || connectionStatus === "connecting"}
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

          <FlatList
            data={pairedSystems}
            renderItem={renderDeviceListItem}
            keyExtractor={(item) => item.id} // ID is now string
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

      {/* --- 👇 SCANNING MODAL (passing new prop) --- */}
      <ScanAndPairModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onPairSuccess={handleAddNewSystem}
        pairedSystemIds={pairedSystems.map((s) => s.id)} // Pass BSSIDs of paired systems
        ssidPrefixes={SSID_PREFIX_FILTER}
      />
    </SafeAreaView>
  );
}

// --- STYLESHEETS (Unchanged) ---
const getManagerButtonStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    managerButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    managerButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
    },
    disabledButton: {
      backgroundColor: colors.background, // Make disabled look different
      opacity: 0.6,
    },
  });

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
      padding: 12,
      marginBottom: 12,
      borderWidth: StyleSheet.hairlineWidth, // Use Hairline for subtlety
      borderColor: colors.border,
      // Add subtle shadow for depth
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
      borderBottomWidth: StyleSheet.hairlineWidth, // Use Hairline
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
      paddingVertical: 4,
      minHeight: 70,
      alignItems: "center",
      // Add padding if needed when content is present
      paddingHorizontal: 4,
    },
    statusEmptyText: {
      flex: 1, // Allow text to wrap
      fontSize: 16,
      color: colors.textMuted,
      lineHeight: 22,
      textAlign: "center", // Center empty text
    },
    addTextLink: {
      color: colors.primary,
      fontWeight: "600",
    },
    statusImagePlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 6,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
      borderWidth: StyleSheet.hairlineWidth, // Use Hairline
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
      flexShrink: 1, // Allow text to shrink if needed
      textAlign: "right", // Align value to the right
    },
    // --- Connector Button Styles ---
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
      borderWidth: StyleSheet.hairlineWidth, // Use Hairline
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
      marginBottom: 12,
    },
    // --- Device List Styles ---
    deviceListItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 4,
      borderWidth: 1, // Keep border for selection indicator
      borderColor: "transparent", // Default to transparent
      backgroundColor: colors.background, // Give items a background
    },
    deviceListItemSelected: {
      // backgroundColor: colors.background, // Already has background
      borderColor: colors.primary, // Highlight border when selected
    },
    deviceListInfo: {
      flex: 1,
      marginRight: 8, // Add spacing before checkmark
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
      marginTop: 10,
    },
    emptyListText: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: "center",
    },
  });
