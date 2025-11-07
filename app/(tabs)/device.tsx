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

  // --- FIX: Corrected shadow style to not use colors.shadow ---
  const cardShadowStyle = useMemo(
    () => ({
      shadowColor: "#000", // Hardcoded shadow color
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3, // for Android
    }),
    [] // This shadow is static and doesn't depend on colors
  );

  const renderModelItem = (model: Devices) => (
    <View style={styles.modelItemContainer}>
      <Image
        source={MODEL_IMAGES[model.modelImage] || MODEL_IMAGES["pv_pro"]} // Fallback image
        style={styles.modelImage}
        resizeMode="contain"
      />
      <View style={styles.modelTextContainer}>
        <Text style={styles.modelNameText}>{model.modelName}</Text>
        <Text style={styles.modelCodeText}>Model: {model.modelCode}</Text>
      </View>
      <TouchableOpacity onPress={() => setIsModelModalVisible(true)}>
        <FontAwesome name="exchange" size={20} color={colors.primary} />
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
    >
      <View style={[styles.card, cardShadowStyle]}>
        {/* Header with Help and Info buttons */}
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsHelpModalVisible(true)}
          >
            <Ionicons
              name="help-circle-outline"
              size={26}
              color={colors.icon}
            />
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
    card: {
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
      borderRadius: 12,
      backgroundColor: colors.card,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingTop: 12,
      paddingHorizontal: 12,
    },
    headerButton: {
      marginLeft: 12,
      padding: 4,
    },
    cardContent: {
      padding: 16,
      paddingTop: 8,
    },
    modelItemContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    modelImage: {
      width: 60,
      height: 60,
      marginRight: 16,
    },
    modelTextContainer: {
      flex: 1,
    },
    modelNameText: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "bold",
    },
    modelCodeText: {
      color: colors.textMuted,
      fontSize: 14,
      marginTop: 2,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 20,
    },
    modeSelectorContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    modeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1.5,
      marginHorizontal: 6,
    },
    modeButtonSelected: {
      // This is a marker style, the actual styling is done inline
    },
    modeButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
  });
