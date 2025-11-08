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
import { setApiHost } from "../../services/deviceService";
import {
  ConnectionMode,
  loadConnectionMode,
  saveConnectionMode,
} from "../../services/storage";

const MODEL_IMAGES: { [key: string]: any } = {
  pe_pro: require("../../assets/images/favicon.png"),
  pv_pro: require("../../assets/images/splash-icon.png"),
};

export default function DeviceConnectScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getScreenStyles(colors), [colors]);

  const [models, setModels] = useState<Devices[]>([]);
  const [selectedModel, setSelectedModel] = useState<Devices | null>(null);

  const [connectionMode, setConnectionMode] =
    useState<ConnectionMode>("AP_MODE");

  const [isModelModalVisible, setIsModelModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [isDeviceInfoModalVisible, setIsDeviceInfoModalVisible] =
    useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  // --- Handler for ModelSelectionModal ---
  const handleSelectModel = (model: Devices) => {
    setSelectedModel(model);
    setIsModelModalVisible(false);
  };

  // --- Effects ---
  useEffect(() => {
    // Load device models from SQLite
    loadDevices();

    // Load last connection mode from AsyncStorage
    const loadMode = async () => {
      const savedMode = await loadConnectionMode();
      setConnectionMode(savedMode);
    };
    loadMode();
  }, []);

  // Effect to update the API host
  useEffect(() => {
    if (!selectedModel) {
      return;
    }

    if (connectionMode === "AP_MODE") {
      setApiHost(selectedModel.apHost);
    } else {
      setApiHost(selectedModel.staHost);
    }

    // Also save the new mode selection to storage
    saveConnectionMode(connectionMode);
  }, [connectionMode, selectedModel]);

  // --- Rendering Functions ---

  const renderModelItem = (model: Devices) => (
    // This row is styled like setting.tsx's switchRow
    <View style={styles.cardRow}>
      <Image
        source={MODEL_IMAGES[model.modelImage] || MODEL_IMAGES["pv_pro"]} // Fallback image
        style={styles.modelImage}
        resizeMode="contain"
      />
      <View style={styles.modelTextContainer}>
        <Text style={styles.modelNameText}>{model.modelName}</Text>
        <Text style={styles.modelCodeText}>Model: {model.modelCode}</Text>
      </View>

      {/* Grouped buttons, all using colors.icon */}
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => setIsHelpModalVisible(true)}
      >
        <Ionicons name="help-circle-outline" size={26} color={colors.icon} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => setIsDeviceInfoModalVisible(true)}
      >
        <Ionicons
          name="information-circle-outline"
          size={26}
          color={colors.icon}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => setIsModelModalVisible(true)}
      >
        <FontAwesome name="exchange" size={22} color={colors.icon} />
      </TouchableOpacity>
    </View>
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
      contentContainerStyle={styles.scrollContentContainer}
    >
      <Text style={[styles.label, { color: colors.text }]}>
        Selected Device
      </Text>
      {renderModelItem(selectedModel)}

      <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>
        Connection Mode
      </Text>

      {/* This container is styled like setting.tsx's tabContainer */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            connectionMode === "AP_MODE" && [
              styles.tabButtonActive,
              { backgroundColor: colors.primary },
            ],
          ]}
          onPress={() => {
            setConnectionMode("AP_MODE");
          }}
        >
          <Ionicons
            name="wifi-outline"
            size={18}
            color={connectionMode === "AP_MODE" ? colors.card : colors.icon}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.modeButtonText,
              {
                color: connectionMode === "AP_MODE" ? colors.card : colors.icon,
              },
            ]}
          >
            AP Connect
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            connectionMode === "NETWORK_MODE" && [
              styles.tabButtonActive,
              { backgroundColor: colors.primary },
            ],
          ]}
          onPress={() => {
            setConnectionMode("NETWORK_MODE");
          }}
        >
          <Ionicons
            name="globe-outline"
            size={18}
            color={
              connectionMode === "NETWORK_MODE" ? colors.card : colors.icon
            }
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.modeButtonText,
              {
                color:
                  connectionMode === "NETWORK_MODE" ? colors.card : colors.icon,
              },
            ]}
          >
            Network Connect
          </Text>
        </TouchableOpacity>
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

// --- STYLES ---
// (Heavily inspired by setting.tsx)
const getScreenStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    scrollContentContainer: {
      paddingBottom: 40, // Ensure content doesn't hide behind tab bar
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 10,
      color: colors.textMuted,
      fontSize: 16,
    },
    // Label style from setting.tsx
    label: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
    },
    // cardRow style from setting.tsx's switchRow
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    headerButton: {
      marginLeft: 12,
      padding: 4,
    },
    modelImage: {
      width: 40, // Smaller to fit the row
      height: 40,
      marginRight: 16,
    },
    modelTextContainer: {
      flex: 1,
    },
    modelNameText: {
      color: colors.text,
      fontSize: 18, // Slightly smaller to match settings
      fontWeight: "bold",
    },
    modelCodeText: {
      color: colors.textMuted,
      fontSize: 14,
      marginTop: 2,
    },
    // tabContainer style from setting.tsx
    tabContainer: {
      flexDirection: "row",
      borderRadius: 10,
      padding: 4,
      justifyContent: "space-around",
    },
    // modeButton style from setting.tsx's tabButton
    modeButton: {
      flex: 1,
      flexDirection: "row", // Keep icon and text
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 8,
      marginHorizontal: 2, // Add slight margin
    },
    tabButtonActive: {
      // backgroundColor is set inline
    },
    modeButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
  });
