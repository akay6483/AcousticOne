import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { DeviceInfoModal } from "../../components/DeviceInfoModal"; // NEW IMPORT
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

export default function DeviceConnectScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getScreenStyles(colors), [colors]);

  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "checking" | "connected"
  >("disconnected");
  const [connectedSSID, setConnectedSSID] = useState<string | null>(null);
  const [models, setModels] = useState<Devices[]>([]);
  const [selectedModel, setSelectedModel] = useState<Devices | null>(null);

  // New state for connection mode
  const [connectionMode, setConnectionMode] =
    useState<ConnectionMode>("AP_MODE"); // Default to AP Mode

  // Modals
  const [isModelModalVisible, setIsModelModalVisible] = useState(false);
  // Help Modal (formerly info)
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  // Device Info Modal (the new "info" modal)
  const [isDeviceInfoModalVisible, setIsDeviceInfoModalVisible] =
    useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // Connection control
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);
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

  const checkConnection = async () => {
    if (!selectedModel) return;

    setConnectionStatus("checking");
    setConnectedSSID(null);

    let host = "";
    if (connectionMode === "AP_MODE") {
      host = ESP_HOST_AP;
    } else {
      // Placeholder for Network Mode logic
      host = ESP_HOST_STA;
      if (host === "http://<YOUR_DEVICE_IP>") {
        Alert.alert(
          "Network Mode",
          "Please configure the device IP for Network Mode."
        );
        setConnectionStatus("disconnected");
        return;
      }
    }

    try {
      const r = await fetchWithTimeout(`${host}/getssid`, 2500);
      if (!r.ok) throw new Error("HTTP " + r.status);

      const txt = await r.text();
      setConnectedSSID(txt);
      setConnectionStatus("connected");
    } catch (e: any) {
      setConnectionStatus("disconnected");
      setConnectedSSID(null);
      if (e.name !== "AbortError") {
        console.log("Connection check failed:", e.message);
      }
    }
  };

  const onPing = async () => {
    let host = "";
    if (connectionMode === "AP_MODE") {
      host = ESP_HOST_AP;
    } else {
      host = ESP_HOST_STA;
      if (host === "http://<YOUR_DEVICE_IP>") {
        Alert.alert(
          "Network Mode",
          "Please configure the device IP for Network Mode before pinging."
        );
        return;
      }
    }

    try {
      const r = await fetchWithTimeout(`${host}/ping`, 2500);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const txt = await r.text();
      Alert.alert("Ping Success", "Received: " + txt);
    } catch (e: any) {
      Alert.alert("Ping Failed", e.message ?? String(e));
    }
  };

  // --- Handler passed to the ModelSelectionModal ---
  const handleSelectModel = (model: Devices) => {
    setSelectedModel(model);
    setIsModelModalVisible(false);
    // Force re-check connection status status for the newly selected device
    setIsInitialCheckDone(false);
  };

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    // 1. Initial Check on First Load or when mode/model changes
    if (selectedModel && !isInitialCheckDone) {
      console.log("Initial connection check running...");
      checkConnection();
      setIsInitialCheckDone(true);
    }

    // 2. AppState Listener: Only check connection when returning to the app
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log(
          "App has come to the foreground, explicitly checking connection..."
        );
        checkConnection();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [selectedModel, isInitialCheckDone, connectionMode]); // Re-run effect on mode change

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
              Checking connection...
            </Text>
          </View>
        );
      case "connected":
        return (
          <View style={styles.statusContent}>
            <Ionicons name="checkmark-circle" size={20} color="#34d399" />
            <Text style={[styles.statusText, { color: colors.text }]}>
              Connected to: {connectedSSID}
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

        {/* SSID Line */}
        <View style={styles.wifiDetailRow}>
          <Text style={[styles.wifiLabel, { color: colors.textMuted }]}>
            Network (SSID):
          </Text>
          <Text style={[styles.wifiValue, { color: colors.text }]}>
            {model.ssid}
          </Text>
        </View>

        {/* Password Line with Toggle */}
        <View style={styles.wifiDetailRow}>
          <Text style={[styles.wifiLabel, { color: colors.textMuted }]}>
            Password:
          </Text>
          <View style={styles.passwordContainer}>
            <Text
              style={[styles.wifiValue, { color: colors.text, marginRight: 5 }]}
            >
              {showPassword ? model.password : "••••••••••••"}
            </Text>
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={16}
                color={colors.inactiveTint}
              />
            </TouchableOpacity>
          </View>
        </View>
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
      {/* --- Model Selector Card (with Info Icon) --- */}
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
        <View style={styles.cardContent}>{renderModelItem(selectedModel)}</View>
      </View>

      {/* --- Status Card (with Mode Selector) --- */}
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
            {/* Refresh/Reconnect button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={checkConnection}
              disabled={connectionStatus === "checking"}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={
                  connectionStatus === "checking"
                    ? colors.inactiveTint
                    : colors.primary
                }
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardContent}>
          {renderStatusContent()}

          {/* Connection Mode Selector */}
          <View style={styles.modeSelectorContainer}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                connectionMode === "AP_MODE" && styles.modeButtonSelected,
                {
                  backgroundColor:
                    connectionMode === "AP_MODE"
                      ? colors.primary
                      : colors.background, // Use primary for selection, card for background
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => {
                setConnectionMode("AP_MODE");
                setIsInitialCheckDone(false); // Force re-check on mode switch
              }}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color:
                      connectionMode === "AP_MODE"
                        ? colors.card // buttonText
                        : colors.text,
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
                      : colors.background, // Use primary for selection, card for background
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => {
                setConnectionMode("NETWORK_MODE");
                setIsInitialCheckDone(false); // Force re-check on mode switch
              }}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color:
                      connectionMode === "NETWORK_MODE"
                        ? colors.card // buttonText
                        : colors.text,
                  },
                ]}
              >
                Network Connect
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* --- PING Button (for testing) --- */}
      <TouchableOpacity
        style={[
          styles.pingButton,
          { backgroundColor: colors.primary, shadowColor: colors.primary },
        ]}
        onPress={onPing}
      >
        <Text style={[styles.pingButtonText, { color: colors.card }]}>
          Test Ping
        </Text>
        <Ionicons name="paper-plane-outline" size={16} color={colors.card} />
      </TouchableOpacity>

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
    // New styles for 2-line Wi-Fi info
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
      marginBottom: 16, // Added space before selector
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
    // Ping Button
    pingButton: {
      borderRadius: 10,
      padding: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 6,
      elevation: 5,
      marginBottom: 40,
    },
    pingButtonText: {
      fontSize: 16,
      fontWeight: "600",
      marginRight: 8,
    },
    // Modal Styles (Outer container styles, remaining here)
    modalBackdrop: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
  });
