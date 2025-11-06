import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { lightColors } from "../../theme/colors";

import { DeviceInfoModal } from "../../components/DeviceInfoModal";
import { HelpModal } from "../../components/HelpModal";
import { ModelSelectionModal } from "../../components/ModelSelectionModal";
import { Devices, getDevices } from "../../services/database";

// --- API and STORAGE ---
// --- All API calls and connection logic have been removed ---

const MODEL_IMAGES: { [key: string]: any } = {
  pe_pro: require("../../assets/images/favicon.png"),
  pv_pro: require("../../assets/images/splash-icon.png"),
};

const ESP_HOST_AP = "http://192.168.4.1";
const ESP_HOST_STA = "http://<YOUR_DEVICE_IP>";

type ConnectionMode = "AP_MODE" | "NETWORK_MODE";

export default function DeviceConnectScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getScreenStyles(colors), [colors]);

  const [models, setModels] = useState<Devices[]>([]);
  const [selectedModel, setSelectedModel] = useState<Devices | null>(null);
  const [connectionMode, setConnectionMode] =
    useState<ConnectionMode>("AP_MODE");

  // --- All connection state and refs are removed ---
  // - connectionStatus
  // - isConnecting
  // - pingIntervalRef
  // - hostRef
  // - AppState listener

  const [isModelModalVisible, setIsModelModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false); // We keep this
  const [isDeviceInfoModalVisible, setIsDeviceInfoModalVisible] =
    useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Data Loading Function (unchanged) ---
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

  // --- All connection functions are removed ---
  // - syncDeviceState
  // - stopConnectionLoop
  // - startConnectionLoop

  // --- Handler for ModelSelectionModal (unchanged) ---
  const handleSelectModel = (model: Devices) => {
    setSelectedModel(model);
    setIsModelModalVisible(false);
  };

  // --- Effects (Simplified) ---
  useEffect(() => {
    loadDevices();
  }, []);

  // --- AppState useEffect removed ---

  // --- Rendering Functions ---
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

  const renderModelItem = (model: Devices) => (
    <TouchableOpacity
      key={model.modelCode}
      style={styles.modelItem}
      onPress={() => setIsModelModalVisible(true)}
    >
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
      <View style={styles.modelDetails}>
        <Text style={styles.modelName}>{model.modelName}</Text>
      </View>
    </TouchableOpacity>
  );

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
      <View style={[styles.card, cardShadowStyle]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>
            Model Selector
          </Text>
          <View style={styles.cardHeaderIcons}>
            {/* --- MODIFIED: Help button moved here --- */}
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

          <View style={styles.separator} />

          <View style={styles.modeSelectorContainer}>
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
                Alert.alert(
                  "Mode Set",
                  `AP Mode selected. Host will be ${ESP_HOST_AP}`
                );
              }}
            >
              <Ionicons
                name="wifi-outline"
                size={18}
                color={connectionMode === "AP_MODE" ? colors.card : colors.text}
                style={{ marginRight: 8 }}
              />
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
                Alert.alert(
                  "Mode Set",
                  `Network Mode selected. Host will be ${ESP_HOST_STA}`
                );
              }}
            >
              <Ionicons
                name="globe-outline"
                size={18}
                color={
                  connectionMode === "NETWORK_MODE" ? colors.card : colors.text
                }
                style={{ marginRight: 8 }}
              />
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
      </View>

      {/* --- MODIFIED: "Status" card completely REMOVED --- */}

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

// --- STYLES ---
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
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
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
      color: colors.textMuted,
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
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
    statusContent: {
      // Kept for the "Help & Info" card's text
      flexDirection: "row",
      alignItems: "center",
      height: 30,
    },
    statusText: {
      // Kept for the "Help & Info" card's text
      fontSize: 16,
      marginLeft: 8,
    },
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
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    modeButtonSelected: {
      backgroundColor: colors.primary,
    },
    modeButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
  });
