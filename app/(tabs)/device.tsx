import React, { useEffect, useMemo, useState } from "react";
import { Alert, SafeAreaView, StatusBar, StyleSheet, View } from "react-native";

// --- Import WifiManager
import WifiManager from "react-native-wifi-reborn";

// --- Import Custom Components ---
import { ConnectorCard } from "../../components/ConnectorCard";
import { ManagerCard } from "../../components/ManagerCard";
import { NetworkConnectModal } from "../../components/NetworkConnectModal";
import {
  ScanAndPairModal,
  ScannedSystem,
} from "../../components/ScanAndPairModal";
import { StatusCard } from "../../components/StatusCard";

// --- Import Theme ---
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
  updateDeviceName, // 👈 Import new DB function
} from "../../services/database";

// --- Import storage helpers ---
import {
  getLastConnectedDeviceID,
  storeLastConnectedDeviceID,
} from "../../services/storage";

type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

// --- Test/Production switch ---
const SSID_PREFIX_FILTER: string[] | null = null; // null = Test Mode

// --- MAIN SCREEN COMPONENT ---
export default function DeviceScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors, isDark]);

  // Modal Visibility
  const [isDirectModalVisible, setIsDirectModalVisible] = useState(false);
  const [isNetworkModalVisible, setIsNetworkModalVisible] = useState(false);

  // Device & Connection State
  const [pairedSystems, setPairedSystems] = useState<Device[]>([]);
  const [connectedSystem, setConnectedSystem] = useState<Device | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  // Derived State
  const selectedSystem = useMemo(
    () => pairedSystems.find((s) => s.id === selectedSystemId),
    [pairedSystems, selectedSystemId]
  );

  // --- 1. APP INITIALIZATION ---
  useEffect(() => {
    const initializeApp = async () => {
      // 1. Load all paired devices from the DB
      const devicesFromDB = await loadDevices();

      // 2. Get the ID of the last device we connected to
      const lastConnectedID = await getLastConnectedDeviceID();

      if (lastConnectedID) {
        // 3. Find that device in our paired list
        const lastDevice = devicesFromDB.find((d) => d.id === lastConnectedID);

        if (lastDevice) {
          console.log("Attempting to auto-connect to:", lastDevice.name);
          setSelectedSystemId(lastDevice.id);
          // 4. Try to connect
          await onConnectPress(lastDevice);
        }
      }
    };

    initializeApp();
  }, []);

  // --- 2. CORE LOGIC FUNCTIONS ---

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
        // Default selection to the first device
        setSelectedSystemId(devicesFromDB[0].id);
      }
      return devicesFromDB; // Return the list for auto-connect
    } catch (error) {
      console.error("Failed to load devices:", error);
      return []; // Return empty on error
    }
  };

  const fetchModelCode = async (
    ipAddress: string
  ): Promise<string | undefined> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`http://${ipAddress}/getSerial/`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
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

  const performConnection = async (
    ipAddress: string
  ): Promise<string | undefined> => {
    setConnectionStatus("connecting");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`http://${ipAddress}/isthere/`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const text = await response.text(); // Expected: "YES/MODEL_CODE/"
      if (text.startsWith("YES/")) {
        setConnectionStatus("connected");
        return await fetchModelCode(ipAddress);
      } else {
        throw new Error("Device did not respond correctly");
      }
    } catch (error) {
      console.error("Connection failed:", error);
      setConnectionStatus("error");
      setConnectedSystem(null);
    }
    return undefined;
  };

  // --- 3. EVENT HANDLERS ---

  /**
   * (From ScanAndPairModal)
   * Called after successfully connecting to a NEW device's WiFi.
   * This function saves it to the DB and updates the status.
   */
  const handleAddNewSystem = async (scannedSystem: ScannedSystem) => {
    setIsDirectModalVisible(false);

    // 1. Connect to the device's hard-coded IP and get its model code
    const modelCode = await performConnection("192.168.4.1"); // Direct connect IP

    if (modelCode) {
      // 2. Create the full Device object
      const newDevice: Device = {
        id: scannedSystem.id, // The BSSID
        name: scannedSystem.name, // The SSID
        ssid: scannedSystem.ssid,
        modelCode: modelCode,
      };

      try {
        // 3. Save to DB
        await addDevice(newDevice);
        // 4. Save this as the last connected device
        await storeLastConnectedDeviceID(newDevice.id);
        // 5. Refresh the list from DB
        await loadDevices();
        // 6. Set this new device as active and connected
        setSelectedSystemId(newDevice.id);
        setConnectedSystem(newDevice);
      } catch (error) {
        console.error("Failed to add new system:", error);
        Alert.alert("Error", "Failed to add new system. It may already exist.");
      }
    }
  };

  /**
   * (From NetworkConnectModal)
   * Called when tapping a device found via SSDP.
   * Connects to it but does NOT save to DB.
   */
  const handleNetworkConnect = async (ipAddress: string, name: string) => {
    setIsNetworkModalVisible(false);
    const modelCode = await performConnection(ipAddress);

    if (modelCode) {
      setConnectedSystem({
        id: ipAddress, // Use IP as the ID for this session
        name: name,
        ssid: "Network",
        modelCode: modelCode,
      });
    }
  };

  /**
   * (From ManagerCard)
   * Connects to an ALREADY PAIRED device.
   */
  const onConnectPress = async (systemToConnect?: Device) => {
    const device = systemToConnect || selectedSystem;
    if (!device) return;

    let ipToUse: string | undefined = undefined;

    // 1. Check if we are already on the device's Direct Connect WiFi
    try {
      const currentSSID = await WifiManager.getCurrentWifiSSID();
      if (currentSSID === device.ssid) {
        ipToUse = "192.168.4.1";
      }
    } catch (e) {
      console.warn("Could not get current SSID", e);
    }

    // 2. If not, this is a Network Connect, we need to find its IP via SSDP
    if (!ipToUse) {
      // This is the placeholder for your Network Connect logic
      Alert.alert(
        "Network Connect",
        "Please connect to the device's WiFi hotspot first (`Direct Connect`). Network discovery (SSDP) is not fully implemented yet."
      );
      setConnectionStatus("disconnected");
      return;
    }

    // 3. Perform the connection
    const modelCode = await performConnection(ipToUse);

    if (modelCode) {
      // 4. Set as connected
      const connectedDevice = { ...device, modelCode };
      setConnectedSystem(connectedDevice);
      // 5. Save as last connected device
      await storeLastConnectedDeviceID(device.id);

      // 6. Update DB if model code was missing
      if (!device.modelCode) {
        await updateDeviceModelCode(device.id, modelCode);
        setPairedSystems((prev) =>
          prev.map((d) => (d.id === device.id ? connectedDevice : d))
        );
      }
    }
  };

  const onForgetPress = () => {
    if (selectedSystem) {
      Alert.alert(
        "Forget System",
        `Are you sure you want to forget ${selectedSystem.name}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Forget",
            style: "destructive",
            onPress: async () => {
              try {
                if (connectedSystem?.id === selectedSystem.id) {
                  setConnectedSystem(null);
                  setConnectionStatus("disconnected");
                }
                if (selectedSystemId === selectedSystem.id) {
                  setSelectedSystemId(null);
                }
                await deleteDevice(selectedSystem.id);
                await loadDevices();
              } catch (error) {
                console.error("Failed to forget device:", error);
              }
            },
          },
        ]
      );
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

  // --- 👇 RENAMED FUNCTION (Implemented) ---
  const onRenamePress = () => {
    if (!selectedSystem) return;

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
            // 1. Update the name in the database
            await updateDeviceName(selectedSystem.id, newName.trim());

            // 2. Refresh the list from the database
            await loadDevices();

            // 3. If the renamed device was connected, update its name in the status card
            if (connectedSystem?.id === selectedSystem.id) {
              setConnectedSystem((prev) =>
                prev ? { ...prev, name: newName.trim() } : null
              );
            }
          } catch (error) {
            console.error("Failed to rename device:", error);
            Alert.alert("Error", "Could not rename device.");
          }
        }
      },
      "plain-text",
      selectedSystem.name
    );
  };
  // --- END OF UPDATE ---

  // --- 4. RENDER ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={styles.container}>
        <StatusCard
          connectionStatus={connectionStatus}
          connectedSystem={connectedSystem}
          onAddDevice={() => setIsDirectModalVisible(true)}
        />

        <ConnectorCard
          onDirectConnect={() => setIsDirectModalVisible(true)}
          onNetworkConnect={() => setIsNetworkModalVisible(true)}
        />

        <ManagerCard
          pairedSystems={pairedSystems}
          selectedSystemId={selectedSystemId}
          isConnectDisabled={
            !selectedSystem || connectionStatus === "connecting"
          }
          onSelectSystem={setSelectedSystemId}
          onConnect={() => onConnectPress()}
          onInfo={onInfoPress}
          onRename={onRenamePress}
          onForget={onForgetPress}
        />
      </View>

      {/* --- MODALS --- */}
      <ScanAndPairModal
        visible={isDirectModalVisible}
        onClose={() => setIsDirectModalVisible(false)}
        onPairSuccess={handleAddNewSystem}
        pairedSystemIds={pairedSystems.map((s) => s.id)}
        ssidPrefixes={SSID_PREFIX_FILTER}
      />

      <NetworkConnectModal
        visible={isNetworkModalVisible}
        onClose={() => setIsNetworkModalVisible(false)}
        onConnectPress={handleNetworkConnect}
      />
    </SafeAreaView>
  );
}

// --- STYLES ---
const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 16,
    },
  });
