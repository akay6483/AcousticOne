import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// --- THEME IMPORTS ---
import { useTheme } from "../../theme/ThemeContext";
import { lightColors } from "../../theme/colors";

// --- Import Components & Database ---
import { DeviceInfoModal } from "../../components/DeviceInfoModal";
import { HelpModal } from "../../components/HelpModal";
import { ModelSelectionModal } from "../../components/ModelSelectionModal";
import { Devices, getDevices } from "../../services/database";

const MODEL_IMAGES: { [key: string]: any } = {
  // Placeholder images: replace with your actual asset paths
  pe_pro: require("../../assets/images/favicon.png"),
  pv_pro: require("../../assets/images/splash-icon.png"),
};

const ESP_HOST_AP = "http://192.168.4.1"; // ESP softAP default
const ESP_HOST_STA = "http://<YOUR_DEVICE_IP>"; // Placeholder for STA mode IP
const PING_INTERVAL_MS = 30000; // 30 seconds for the continuous loop
const PING_DELAY_MS = 1000; // New: 1 second delay to prevent successive button spamming

// --- CONNECTION MODES ---
type ConnectionMode = "AP_MODE" | "NETWORK_MODE";

// --- Fetch Utility ---
async function fetchWithTimeout(url: string, timeoutMs = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Helper to add a delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function DeviceConnectScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getScreenStyles(colors), [colors]);

  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "checking" | "connected"
  >("disconnected");
  const [models, setModels] = useState<Devices[]>([]);
  const [selectedModel, setSelectedModel] = useState<Devices | null>(null);

  const [connectionMode, setConnectionMode] =
    useState<ConnectionMode>("AP_MODE"); // Default to AP Mode

  // New state to control the ping loop
  const [isConnecting, setIsConnecting] = useState(false);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPingTimeRef = useRef(0); // For robustness check

  // Modals
  const [isModelModalVisible, setIsModelModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [isDeviceInfoModalVisible, setIsDeviceInfoModalVisible] =
    useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // Connection control
  const appState = useRef(AppState.currentState);

  // --- Data Loading Function ---
  const loadDevices = async () => {
    try {
      const deviceList = await getDevices();
      setModels(deviceList);
      if (deviceList.length > 0) {
        setSelectedModel(deviceList[0]);
      }
    } catch (error) {
      console.error("Failed to load devices from DB:", error);
      Alert.alert("Error", "Could not load device models from the database.");
    }
  };

  /**
   * Pings the device and updates the connection status.
   * Returns true on success, false on failure.
   * @param isLoopPing Indicates if this is part of the 30s loop (affects error handling).
   */
  const pingDevice = useCallback(
    async (isLoopPing: boolean = false) => {
      if (!selectedModel) return false;

      // Check for robustness: Prevent spamming if it's a manual refresh and the last ping was too recent
      if (
        !isLoopPing &&
        Date.now() - lastPingTimeRef.current < PING_DELAY_MS * 2
      ) {
        console.log("Ping skipped: Too soon after last attempt.");
        return connectionStatus === "connected"; // Return current status if skipping
      }

      lastPingTimeRef.current = Date.now();
      setConnectionStatus("checking");

      let host = "";
      if (connectionMode === "AP_MODE") {
        host = ESP_HOST_AP;
      } else {
        host = ESP_HOST_STA;
        if (host === "http://<YOUR_DEVICE_IP>") {
          if (!isConnecting) {
            Alert.alert(
              "Network Mode Configuration",
              "Please configure the device IP for Network Mode."
            );
          }
          setConnectionStatus("disconnected");
          return false;
        }
      }

      try {
        // 1. Delay before ping to allow device to settle
        await sleep(PING_DELAY_MS);

        // 2. Perform the ping
        const r = await fetchWithTimeout(`${host}/ping`, 2500);
        if (!r.ok) throw new Error("HTTP " + r.status);
        await r.text(); // Consume response body "pong"

        // 3. Delay after successful ping before allowing new requests
        await sleep(PING_DELAY_MS);

        setConnectionStatus("connected");
        return true;
      } catch (e: any) {
        setConnectionStatus("disconnected");
        if (isConnecting || isLoopPing) {
          console.log("Ping failed in connection loop/check. Stopping loop.");
        } else {
          // Only show alert for a single, manual ping/initial connect attempt
          Alert.alert(
            "Ping Failed",
            "The device is unreachable. Check your Wi-Fi."
          );
        }
        return false;
      }
    },
    [selectedModel, connectionMode, isConnecting, connectionStatus]
  );

  // --- Loop Control Functions ---

  const stopConnectionLoop = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (isConnecting) {
      setIsConnecting(false);
      console.log("Connection loop stopped.");
    }
  };

  const startConnectionLoop = async () => {
    // If already connecting, treat button press as 'Stop'
    if (isConnecting) {
      stopConnectionLoop();
      return;
    }

    setIsConnecting(true);
    console.log("Starting connection loop...");

    // 1. Initial Ping
    const initialPingSucceeded = await pingDevice(true); // Treat initial as loop ping for error handling

    if (!initialPingSucceeded) {
      stopConnectionLoop();
      Alert.alert(
        "Connection Attempt Failed",
        "The device did not respond. Check your Wi-Fi settings."
      );
      return;
    }

    // 2. Set up the interval only if the initial ping succeeds
    pingIntervalRef.current = setInterval(async () => {
      const succeeded = await pingDevice(true);
      if (!succeeded) {
        stopConnectionLoop();
        Alert.alert("Connection Lost", "Device connection was lost.");
      }
    }, PING_INTERVAL_MS);
  };

  // --- Handler passed to the ModelSelectionModal ---
  const handleSelectModel = (model: Devices) => {
    setSelectedModel(model);
    setIsModelModalVisible(false);
    // Stop the connection loop when model changes
    stopConnectionLoop();
  };

  // --- Effects ---

  useEffect(() => {
    loadDevices();
  }, []);

  // Effect for AppState Listener and Cleanup
  useEffect(() => {
    // Stop loop if connection mode or model changes
    stopConnectionLoop();

    // AppState Listener: Perform a one-off ping when returning to the app
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log(
          "App has come to the foreground, explicitly checking connection..."
        );
        // Ping device on foreground entry to update status
        pingDevice();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      // Ensure loop stops on component unmount
      stopConnectionLoop();
    };
  }, [pingDevice]);

  // --- Hook Order Fix: useMemo must be called unconditionally ---
  const cardShadowStyle = useMemo(
    () => ({
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    }),
    [colors]
  );

  // --- Render Functions for UI ---

  const renderStatusContent = () => {
    switch (connectionStatus) {
      case "checking":
        return (
          <View style={styles.statusContent}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textMuted }]}>
              {isConnecting
                ? "Checking (Loop Active)..."
                : "Checking connection..."}
            </Text>
          </View>
        );
      case "connected":
        return (
          <View style={styles.statusContent}>
            <Ionicons name="checkmark-circle" size={20} color="#34d399" />
            <Text style={[styles.statusText, { color: colors.text }]}>
              {isConnecting ? "Connected (Loop Active)" : "Connected"}
            </Text>
          </View>
        );
      case "disconnected":
      default:
        return (
          <View style={styles.statusContent}>
            <Ionicons name="close-circle" size={20} color={colors.error} />
            <Text style={[styles.statusText, { color: colors.text }]}>
              No device connected
            </Text>
          </View>
        );
    }
  };

  // Reusable component logic for the currently selected model card
  const renderModelItem = (model: Devices) => (
    <TouchableOpacity
      key={model.modelCode}
      style={styles.modelItem}
      // Open model selection modal when model area is clicked
      onPress={() => setIsModelModalVisible(true)}
    >
      {/* Model Image/Avatar */}
      {MODEL_IMAGES[model.modelImage] ? (
        <Image
          source={MODEL_IMAGES[model.modelImage]}
          style={styles.modelImage}
        />
      ) : (
        <View
          style={[styles.modelAvatar, { backgroundColor: colors.inactiveTint }]}
        >
          <Text style={styles.modelAvatarText}>
            {model.modelName.substring(0, 1)}
          </Text>
        </View>
      )}

      {/* Model Name and Wi-Fi Details (Now 2 lines) */}
      <View style={styles.modelDetails}>
        <Text style={styles.modelName}>{model.modelName}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render loading state (Must be AFTER all hooks)
  if (!selectedModel) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Loading Devices...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* --- Model Selector Card (with Connect Button) --- */}
      <View style={[styles.card, cardShadowStyle]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>
            Model Selector
          </Text>
          <View style={styles.cardHeaderIcons}>
            {/* NEW: Info button to open DeviceInfoModal */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsDeviceInfoModalVisible(true)}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
            {/* Exchange icon for Model Selection Modal */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsModelModalVisible(true)}
            >
              <FontAwesome name="exchange" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardContent}>
          {renderModelItem(selectedModel)}

          {/* Connection Mode Selector (MOVED HERE) */}
          <View style={[styles.modeSelectorContainer, { marginTop: 16 }]}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                connectionMode === "AP_MODE" && styles.modeButtonSelected,
                {
                  backgroundColor:
                    connectionMode === "AP_MODE"
                      ? colors.primary
                      : colors.background,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => {
                setConnectionMode("AP_MODE");
                stopConnectionLoop(); // Stop loop on mode switch
              }}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color:
                      connectionMode === "AP_MODE" ? colors.card : colors.text,
                  },
                ]}
              >
                AP Connect
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                connectionMode === "NETWORK_MODE" && styles.modeButtonSelected,
                {
                  backgroundColor:
                    connectionMode === "NETWORK_MODE"
                      ? colors.primary
                      : colors.background,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => {
                setConnectionMode("NETWORK_MODE");
                stopConnectionLoop(); // Stop loop on mode switch
              }}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color:
                      connectionMode === "NETWORK_MODE"
                        ? colors.card
                        : colors.text,
                  },
                ]}
              >
                Network Connect
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CONNECT/STOP BUTTON (New requirement location) */}
        <TouchableOpacity
          style={[
            styles.connectButton,
            {
              backgroundColor: isConnecting ? colors.error : colors.primary,
            },
          ]}
          onPress={startConnectionLoop}
        >
          <Ionicons
            name={isConnecting ? "close-circle" : "wifi"}
            size={20}
            color={colors.card}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.connectButtonText, { color: colors.card }]}>
            {isConnecting ? "Stop Connection Check" : "Start Connection Check"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- Status Card (with Ping Button/Refresh) --- */}
      <View style={[styles.card, cardShadowStyle]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>
            Status
          </Text>
          <View style={styles.cardHeaderIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsHelpModalVisible(true)}
            >
              <Ionicons
                name="help-circle-outline"
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
            {/* Refresh/Ping button (Now using pingDevice for one-off check) */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => pingDevice(false)} // Use pingDevice for a single check/refresh
              disabled={connectionStatus === "checking" || isConnecting}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={
                  connectionStatus === "checking" || isConnecting
                    ? colors.inactiveTint
                    : colors.primary
                }
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardContent}>
          {renderStatusContent()}
          {/* REMOVED Connection Mode Selector from here */}
        </View>
      </View>

      {/* --- Modals --- */}
      {models.length > 0 && selectedModel && (
        <ModelSelectionModal
          visible={isModelModalVisible}
          onClose={() => setIsModelModalVisible(false)}
          models={models}
          selectedModel={selectedModel}
          onSelectModel={handleSelectModel}
        />
      )}

      {selectedModel && (
        <HelpModal
          visible={isHelpModalVisible}
          onClose={() => setIsHelpModalVisible(false)}
          model={selectedModel}
        />
      )}

      {selectedModel && (
        <DeviceInfoModal
          visible={isDeviceInfoModalVisible}
          onClose={() => setIsDeviceInfoModalVisible(false)}
          model={selectedModel}
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
        />
      )}
    </ScrollView>
  );
}

const getScreenStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
    },
    card: {
      // styles dynamically applied inline
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600",
    },
    cardHeaderIcons: {
      flexDirection: "row",
    },
    iconButton: {
      padding: 4,
      marginLeft: 8,
    },
    cardContent: {
      padding: 16,
    },
    // Model Item
    modelItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
    },
    modelImage: {
      width: 40,
      height: 40,
      borderRadius: 8,
      marginRight: 12,
    },
    modelAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    modelAvatarText: {
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: 18,
    },
    modelDetails: {
      flex: 1,
      justifyContent: "center",
    },
    modelName: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    // Wi-Fi details (no changes, but keeping for reference)
    wifiDetailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 2,
    },
    wifiLabel: {
      fontSize: 13,
      fontWeight: "500",
      width: 130,
    },
    wifiValue: {
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    passwordToggle: {
      padding: 4,
    },
    // Status Content
    statusContent: {
      flexDirection: "row",
      alignItems: "center",
      height: 30,
      // Removed marginBottom: 16 since mode selector moved
    },
    statusText: {
      fontSize: 16,
      marginLeft: 8,
    },
    // Connection Mode Selector Styles (NEW)
    modeSelectorContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 10,
      overflow: "hidden",
    },
    modeButton: {
      flex: 1,
      paddingVertical: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    modeButtonSelected: {
      // styles are set inline
    },
    modeButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    // Connect Button (New Style for the button inside the Model Selector Card)
    connectButton: {
      padding: 12,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    connectButtonText: {
      fontSize: 16,
      fontWeight: "700",
    },
    // REMOVED: Old pingButton styles
    modalBackdrop: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
  });
