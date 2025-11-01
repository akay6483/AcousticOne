import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

// --- Import NEW libraries ---
import NetInfo from "@react-native-community/netinfo";
import DeviceInfo from "react-native-device-info";

// --- Import Custom Components ---
import { ManagerCard } from "../../components/ManagerCard";
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
  updateDeviceName,
} from "../../services/database";

// --- Import storage helpers ---
import {
  getLastConnectedDeviceID, // 👈 FIX 1: Import this
  storeLastConnectedDeviceID,
} from "../../services/storage";

type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

// --- Test/Production switch ---
const SSID_PREFIX_FILTER: string[] | null = ["PE PRO "];
const DEVICE_HOTSPOT_IP = "192.168.4.1";

// --- MAIN SCREEN COMPONENT ---
export default function DeviceScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors, isDark]);

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
      // 1. Load all paired devices from the DB and set selected
      await loadDevices();
      // 2. Attempt to auto-connect to the *current* network
      await handleConnectionAttempt();
    };

    initializeApp();
  }, []);

  // --- 2. CORE LOGIC FUNCTIONS ---

  const loadDevices = async () => {
    try {
      await initDB();
      const devicesFromDB = await getDevices();
      setPairedSystems(devicesFromDB);

      const lastConnectedId = await getLastConnectedDeviceID(); // 👈 FIX 2: Get last ID

      if (devicesFromDB.length === 0) {
        setConnectedSystem(null);
        setConnectionStatus("disconnected");
        setSelectedSystemId(null);
      } else {
        // 👈 FIX 3: Smarter selection logic
        const lastDevice = devicesFromDB.find((d) => d.id === lastConnectedId);
        if (lastDevice) {
          setSelectedSystemId(lastDevice.id);
        } else if (!selectedSystemId) {
          // Default selection to the first device if last connected is not found
          setSelectedSystemId(devicesFromDB[0].id);
        }
      }
      return devicesFromDB;
    } catch (error) {
      console.error("Failed to load devices:", error);
      return [];
    }
  };

  /**
   * Fetches the Model Code and *Serial Code* from the device.
   * The Serial Code is now our unique ID.
   */
  const fetchDeviceInfo = async (
    ipAddress: string
  ): Promise<{ modelCode: string; serialCode: string } | undefined> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`http://${ipAddress}/getSerial/`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const text = await response.text();
      // .ino file sends: "serial/MODEL_CODE/SERIAL_CODE/"
      if (text.startsWith("serial/")) {
        const parts = text.split("/");
        if (parts.length >= 3) {
          // parts[1] is modelCode, parts[2] is serialCode
          return { modelCode: parts[1], serialCode: parts[2] };
        }
      }
    } catch (e) {
      console.error("Failed to fetch device info:", e);
    }
    return undefined;
  };

  /**
   * Pings the device, and if successful, fetches its info.
   */
  const performConnection = async (
    ipAddress: string
  ): Promise<{ modelCode: string; serialCode: string } | undefined> => {
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
        // Now that we know it's there, get the full info
        return await fetchDeviceInfo(ipAddress);
      } else {
        throw new Error("Device did not respond correctly");
      }
    } catch (error) {
      console.error("Connection failed:", error);
      setConnectionStatus("error");
      setConnectedSystem(null);
      if (error instanceof Error) {
        if (
          !(error as any).message?.includes("Abort") // Don't alert on timeout
        ) {
          Alert.alert(
            "Connection Failed",
            `Could not connect: ${error.message}`
          );
        }
      } else {
        Alert.alert("Connection Failed", "Could not connect to the device.");
      }
    }
    return undefined;
  };

  /**
   * Requests Android's location permission, which is required
   * to read the WiFi SSID.
   */
  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission Required",
            message:
              "This app needs location access to read your WiFi network name (SSID) and find the device.",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS doesn't require this
  };

  // --- 3. EVENT HANDLERS ---

  /**
   * This is the main connection logic.
   * It checks the current WiFi and connects/pairs if it's a device.
   */
  const handleConnectionAttempt = async () => {
    setConnectionStatus("connecting");

    // 1. Check permissions
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        "Permission Required",
        "Location permission is needed to read the WiFi network name."
      );
      setConnectionStatus("error");
      return;
    }

    // 2. Check if on WiFi
    const netState = await NetInfo.fetch();
    if (netState.type !== "wifi") {
      Alert.alert(
        "Not on WiFi",
        "Please connect to your device's WiFi hotspot and tap Refresh."
      );
      setConnectionStatus("disconnected");
      return;
    }

    // 3. Get current WiFi SSID
    let ssid: string | null = null;
    try {
      ssid = await DeviceInfo.getSsid();
    } catch (e) {
      console.error("Could not get SSID:", e);
      Alert.alert("Error", "Could not read WiFi SSID. Is location on?");
      setConnectionStatus("error");
      return;
    }

    // 4. Check if it's one of our devices
    const isDeviceHotspot =
      ssid &&
      (SSID_PREFIX_FILTER === null
        ? true
        : SSID_PREFIX_FILTER.some((prefix) => ssid.startsWith(prefix)));

    if (!isDeviceHotspot || !ssid) {
      Alert.alert(
        "Wrong WiFi",
        `You are on "${
          ssid || "an unknown network"
        }". Please connect to your device's WiFi (e.g., "PE PRO ...") and tap Refresh.`
      );
      setConnectionStatus("disconnected");
      return;
    }

    // 5. We are on the correct WiFi, connect to the hardcoded IP
    const deviceInfo = await performConnection(DEVICE_HOTSPOT_IP);

    if (deviceInfo) {
      const { modelCode, serialCode } = deviceInfo;

      // 6. Check if this device is already paired (using serialCode as ID)
      const existingDevice = pairedSystems.find((d) => d.id === serialCode);

      if (existingDevice) {
        // --- Device is ALREADY PAIRED ---
        setConnectedSystem(existingDevice);
        setConnectionStatus("connected");
        setSelectedSystemId(existingDevice.id);
        await storeLastConnectedDeviceID(existingDevice.id);
      } else {
        // --- This is a NEW DEVICE, let's pair it ---
        const newDevice: Device = {
          id: serialCode, // ❗️ Use serialCode as the ID
          name: ssid, // Use the SSID as the default name
          ssid: ssid,
          modelCode: modelCode,
        };

        try {
          await addDevice(newDevice);
          await storeLastConnectedDeviceID(newDevice.id);
          setConnectedSystem(newDevice);
          setConnectionStatus("connected");
          setSelectedSystemId(newDevice.id);
          await loadDevices(); // Reload list to include new device
        } catch (error) {
          console.error("Failed to add new system:", error);
          Alert.alert("Error", "Failed to save new system.");
        }
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
                await loadDevices(); // Reload the list
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
        `Name: ${selectedSystem.name}\nSSID: ${selectedSystem.ssid}\nSerial: ${
          selectedSystem.id
        }\nModel: ${selectedSystem.modelCode ?? "Unknown"}`
      );
    }
  };

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
            await updateDeviceName(selectedSystem.id, newName.trim());
            await loadDevices(); // Refresh the list from the database
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
          onRefresh={handleConnectionAttempt}
        />

        {/* ConnectorCard has been removed */}

        <ManagerCard
          pairedSystems={pairedSystems}
          selectedSystemId={selectedSystemId}
          // 👈 FIX 4: Removed isConnectDisabled prop
          onSelectSystem={setSelectedSystemId}
          onInfo={onInfoPress}
          onRename={onRenamePress}
          onForget={onForgetPress}
        />
      </View>

      {/* Modals have been removed */}
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
