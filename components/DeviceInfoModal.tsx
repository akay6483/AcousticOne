import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Added MaterialCommunityIcons
import React, { useMemo } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// --- THEME IMPORTS ---
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";

// --- Import Types ---
import { Devices } from "../services/database";

const MODEL_IMAGES: { [key: string]: any } = {
  // Placeholder images: replace with your actual asset paths
  pe_pro: require("../assets/images/favicon.png"),
  pv_pro: require("../assets/images/splash-icon.png"),
};

// --- PROPS ---
type DeviceInfoModalProps = {
  visible: boolean;
  onClose: () => void;
  model: Devices;
  showPassword: boolean; // Pass the state from parent to control password visibility
  toggleShowPassword: () => void;
};

// --- MAIN COMPONENT ---
export const DeviceInfoModal: React.FC<DeviceInfoModalProps> = ({
  visible,
  onClose,
  model,
  showPassword,
  toggleShowPassword,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getDeviceInfoModalStyles(colors), [colors]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.modalBackground },
          ]}
        >
          {/* --- Header (Consistent with PresetModal) --- */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <MaterialCommunityIcons
              name="server-network" // Appropriate icon for device details
              size={25}
              color={colors.icon}
              style={styles.headerIcon}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              Device Details
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.icon} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Model Image */}
            {MODEL_IMAGES[model.modelImage] ? (
              <Image
                source={MODEL_IMAGES[model.modelImage]}
                style={styles.modelImage}
              />
            ) : (
              <View
                style={[
                  styles.modelAvatar,
                  { backgroundColor: colors.inactiveTint },
                ]}
              >
                <Text style={styles.modelAvatarText}>
                  {model.modelName.substring(0, 1)}
                </Text>
              </View>
            )}

            {/* General Info */}
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              General Information
            </Text>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                Model Code:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {model.modelCode}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                Description:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {model.desc || "No description available."}
              </Text>
            </View>

            {/* Wi-Fi Info */}
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Wi-Fi Details (SoftAP)
            </Text>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                Network (SSID):
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {model.ssid}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                Password:
              </Text>
              <View style={styles.passwordContainer}>
                <Text
                  style={[styles.detailValue, { color: colors.text, flex: 1 }]}
                >
                  {showPassword ? model.password : "•••••"}
                </Text>
                <Pressable onPress={toggleShowPassword} style={styles.eyeIcon}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.inactiveTint}
                  />
                </Pressable>
              </View>
            </View>

            {/* Additional Help Text */}
            {model.help_text && (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                  Troubleshooting Tip
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: colors.textMuted, textAlign: "left" },
                  ]}
                >
                  {model.help_text}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// --- STYLES (Adjusted for consistency) ---
const getDeviceInfoModalStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.modalOverlay,
    },
    container: {
      height: "80%", // Taller to fit more info
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    // --- Header Styles (Consistent with PresetModal) ---
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerIcon: {
      padding: 4,
      width: 32, // Fixed width for alignment
    },
    title: {
      flex: 1,
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
    },
    closeButton: {
      padding: 4,
      width: 32, // Fixed width for alignment
    },
    content: {
      paddingVertical: 10,
    },
    modelImage: {
      width: 80,
      height: 80,
      borderRadius: 16,
      alignSelf: "center",
      marginBottom: 20,
    },
    modelAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      marginBottom: 20,
    },
    modelAvatarText: {
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: 32,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      marginTop: 20,
      marginBottom: 10,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
      paddingVertical: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    detailLabel: {
      fontSize: 15,
      fontWeight: "500",
      flex: 1,
    },
    detailValue: {
      fontSize: 15,
      fontWeight: "600",
      flex: 2,
      textAlign: "right",
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 2,
      justifyContent: "flex-end",
    },
    eyeIcon: {
      marginLeft: 10,
      padding: 2,
    },
  });
