import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
// --- Import BOTH modals ---
import { NetworkConnectModal } from "../../components/NetworkConnectModal";
import {
  ScanAndPairModal,
  ScannedSystem,
} from "../../components/ScanAndPairModal";
import { useTheme } from "../../theme/ThemeContext";
import { lightColors } from "../../theme/colors";

// --- DATABASE IMPORTS ---
import {
  Device,
  addDevice,
  deleteDevice,
  getDevices,
  initDB,
  updateDeviceModelCode,
} from "../../services/database";

type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

// --- Test/Production switch ---
const SSID_PREFIX_FILTER: string[] | null = null; // null = Test Mode

// --- REUSABLE BUTTON COMPONENT (Unchanged) ---
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

  const [isDirectModalVisible, setIsDirectModalVisible] = useState(false);
  const [isNetworkModalVisible, setIsNetworkModalVisible] = useState(false);

  const [pairedSystems, setPairedSystems] = useState<Device[]>([]);
  const [connectedSystem, setConnectedSystem] = useState<Device | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

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
        setSelectedSystemId(devicesFromDB[0].id);
      }
    } catch (error) {
      console.error("Failed to load devices:", error);
    }
  };

  const fetchModelCode = async (
    ipAddress: string
  ): Promise<string | undefined> => {
    try {
      const response = await fetch(`http://${ipAddress}/getSerial/`);
      const text = await response.text();
      if (text.startsWith("serial/")) {
        const parts = text.split("/");
        if (parts.length >= 3) {
          return parts[1];
        }
      }
    } catch (e) {
      console.error("Failed to fetch model code:", e);
    }
    return undefined;
  };

  // --- 👇 REFACTORED Connection Logic ---
  const performConnection = async (
    ipAddress: string
  ): Promise<string | undefined> => {
    setConnectionStatus("connecting");
    try {
      // 1. Check if device is responsive
      const response = await fetch(`http://${ipAddress}/isthere/`);
      const text = await response.text(); // Expected: "YES/MODEL_CODE/"

      if (text.startsWith("YES/")) {
        setConnectionStatus("connected");
        // 2. Fetch and return model code
        return await fetchModelCode(ipAddress);
      } else {
        throw new Error("Device did not respond correctly");
      }
    } catch (error) {
      console.error("Connection failed:", error);
      setConnectionStatus("error");
      setConnectedSystem(null);
      Alert.alert("Connection Failed", "Could not connect to the device.");
    }
    return undefined;
  };
  // --- END OF REFACTOR ---

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

  // --- 👇 Updated to use performConnection ---
  const handleAddNewSystem = async (scannedSystem: ScannedSystem) => {
    setIsDirectModalVisible(false);

    // 1. Connect and get model code
    const modelCode = await performConnection("192.168.4.1"); // Direct connect IP

    if (modelCode) {
      // 2. Create the full Device object
      const newDevice: Device = {
        id: scannedSystem.id,
        name: scannedSystem.name,
        ssid: scannedSystem.ssid,
        modelCode: modelCode,
      };

      try {
        // 3. Save to DB
        await addDevice(newDevice);
        await loadDevices();
        setSelectedSystemId(newDevice.id);
        // 4. Set as connected
        setConnectedSystem(newDevice);
      } catch (error) {
        console.error("Failed to add new system:", error);
        Alert.alert("Error", "Failed to add new system. It may already exist.");
      }
    }
  };
  // --- END OF UPDATE ---

  // --- 👇 Updated to use performConnection ---
  const handleNetworkConnect = async (ipAddress: string, name: string) => {
    setIsNetworkModalVisible(false);

    // 1. Connect and get model code
    const modelCode = await performConnection(ipAddress);

    if (modelCode) {
      // 2. Set as connected (as a temporary system, not saved to DB)
      setConnectedSystem({
        id: ipAddress, // Use IP as the ID for this session
        name: name,
        ssid: "Network",
        modelCode: modelCode,
      });
    }
  };
  // --- END OF UPDATE ---

  // --- 👇 Updated to use performConnection ---
  const onConnectPress = async () => {
    if (selectedSystem) {
      // TODO: This logic needs to be smarter.
      // 1. Check current WiFi SSID.
      // 2. If current SSID === selectedSystem.ssid, use IP "192.168.4.1".
      // 3. If not, trigger SSDP scan to find the IP for selectedSystem.id.
      // 4. For now, we assume Direct Connect IP.
      const ipToUse = "192.168.4.1";

      const modelCode = await performConnection(selectedSystem, ipToUse);

      if (modelCode) {
        // 5. Set as connected
        setConnectedSystem({ ...selectedSystem, modelCode });
        // 6. Update DB if model code was missing
        if (!selectedSystem.modelCode) {
          await updateDeviceModelCode(selectedSystem.id, modelCode);
          await loadDevices(); // Refresh list
        }
      }
    }
  };
  // --- END OF UPDATE ---

  const onForgetPress = () => {
    if (selectedSystem) {
      handleForget(selectedSystem);
    }
  };

  const onInfoPress = () => {
    if (selectedSystem) {
      Alert.alert(
        "Device Info",
        `Name: ${selectedSystem.name}\nSSID: ${selectedSystem.ssid}\nID: ${
          selectedSystem.id
        }\nModel: ${selectedSystem.modelCode ?? "Unknown"}`
      );
    }
  };

  const onRenamePress = () => {
    if (selectedSystem) {
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
              // await updateDeviceName(selectedSystem.id, newName.trim());
              await loadDevices();
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
    // ... (No changes here, it will work as is) ...
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

    // --- DISCONNECTED OR ERROR STATE ---
    return (
      <View style={styles.statusContent}>
        <Text style={styles.statusEmptyText}>
          {connectionStatus === "error"
            ? "Connection failed. Please check device and network."
            : "No device connected. Tap "}
          {connectionStatus !== "error" && (
            <Text
              style={styles.addTextLink}
              onPress={() => setIsDirectModalVisible(true)}
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
    // ... (No changes here, it will work as is) ...
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

        {/* --- Connector Section UPDATED --- */}
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
              onPress={() => setIsDirectModalVisible(true)} // Opens ScanAndPairModal
            >
              <Text style={styles.connectorButtonText}>Direct Connect</Text>
            </Pressable>
            <Pressable
              style={styles.connectorButton}
              onPress={() => setIsNetworkModalVisible(true)} // 👈 Opens new modal
            >
              <Text style={styles.connectorButtonText}>Network Connect</Text>
            </Pressable>
          </View>
        </View>
        {/* --- END OF UPDATE --- */}

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
            keyExtractor={(item) => item.id}
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
        visible={isDirectModalVisible}
        onClose={() => setIsDirectModalVisible(false)}
        onPairSuccess={handleAddNewSystem}
        pairedSystemIds={pairedSystems.map((s) => s.id)}
        ssidPrefixes={SSID_PREFIX_FILTER}
      />

      {/* --- NEW NETWORK MODAL --- */}
      <NetworkConnectModal
        visible={isNetworkModalVisible}
        onClose={() => setIsNetworkModalVisible(false)}
        onConnectPress={handleNetworkConnect}
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
      backgroundColor: colors.background,
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
      lineHeight: 22,
      textAlign: "center",
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
    buttonsScrollView: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
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
