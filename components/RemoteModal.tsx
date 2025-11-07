import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext"; // Import global theme
import { lightColors } from "../theme/colors"; // Import type

// --- 1. IMPORT HAPTICS ---
import * as Haptics from "expo-haptics";

// --- 2. IMPORT DEVICE SERVICE ---
import * as deviceService from "../services/deviceService";

// --- Button Images (no change) ---
const buttonImages = {
  default: require("../assets/images/button-default.png"),
  red: require("../assets/images/button-red.png"),
  blue: require("../assets/images/button-blue.png"),
  purple: require("../assets/images/button-purple.png"),
};

// --- Props (no change) ---
interface RemoteButtonProps {
  label?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  buttonType?: "default" | "red" | "blue" | "purple";
  textColor?: string;
}

interface RemoteModalProps {
  visible: boolean;
  onClose: () => void;
}

// --- Remote Button (Unchanged) ---
const RemoteButton: React.FC<RemoteButtonProps> = ({
  label,
  icon,
  onPress,
  buttonType = "default",
  textColor,
}) => {
  const { colors, isHapticsEnabled } = useTheme();
  const styles = useMemo(() => getButtonStyles(colors), [colors]);
  const sourceImage = buttonImages[buttonType];

  const handlePress = () => {
    if (isHapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.75 : 1 }]}
      onPress={handlePress}
    >
      <ImageBackground
        source={sourceImage}
        style={styles.buttonBackground}
        imageStyle={styles.buttonImageStyle}
        resizeMode="cover"
      >
        {icon}
        {label && (
          <Text
            style={[
              styles.buttonText,
              { color: textColor || colors.remoteButtonText },
            ]}
          >
            {label}
          </Text>
        )}
      </ImageBackground>
    </Pressable>
  );
};

// --- Remote Modal ---
export const RemoteModal: React.FC<RemoteModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);

  return (
    <SafeAreaProvider>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <MaterialCommunityIcons
                name="remote"
                size={24}
                color={colors.icon}
                style={styles.headerIcon}
              />
              <Text style={styles.headerTitle}>Remote</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={26} color={colors.text} />
              </Pressable>
            </View>

            {/* --- BUTTONS GRID (Updated with 1-based string codes from old app) --- */}
            <View style={styles.gridContainer}>
              {/* Row 1 (Codes: 1, 2, and Mute) */}
              <RemoteButton
                onPress={() => deviceService.sendIR("1")} // Power
                buttonType="red"
                icon={
                  <MaterialCommunityIcons
                    name="power"
                    size={32}
                    color={colors.remotePowerText}
                  />
                }
              />
              <RemoteButton
                label="Mode"
                onPress={() => deviceService.sendIR("2")} // Mode
              />
              <RemoteButton
                onPress={deviceService.sendMute} // Mute (Using direct /mut/ command)
                icon={
                  <MaterialCommunityIcons
                    name="volume-off"
                    size={30}
                    color={colors.remoteButtonText}
                  />
                }
              />

              {/* Row 2 (Codes: 4, 5, 6) */}
              <RemoteButton
                onPress={() => deviceService.sendIR("4")} // Play/Pause
                buttonType="blue"
                icon={
                  <Ionicons
                    name="play"
                    size={28}
                    color={colors.remotePlayText}
                  />
                }
              />
              <RemoteButton
                onPress={() => deviceService.sendIR("5")} // Previous
                icon={
                  <Ionicons
                    name="play-skip-back"
                    size={24}
                    color={colors.remoteButtonText}
                  />
                }
              />
              <RemoteButton
                onPress={() => deviceService.sendIR("6")} // Next
                icon={
                  <Ionicons
                    name="play-skip-forward"
                    size={24}
                    color={colors.remoteButtonText}
                  />
                }
              />

              {/* Row 3 (Codes: 7, 8, 9) */}
              <RemoteButton
                label="EQ"
                onPress={() => deviceService.sendIR("7")} // EQ
                buttonType="purple"
                textColor={colors.remoteEqText}
              />
              <RemoteButton
                label="VOL-"
                onPress={() => deviceService.sendIR("8")} // VOL-
              />
              <RemoteButton
                label="VOL+"
                onPress={() => deviceService.sendIR("9")} // VOL+
              />

              {/* Row 4 (Codes: 10, 11, 12) */}
              <RemoteButton
                label="0"
                onPress={() => deviceService.sendIR("10")} // 0
              />
              <RemoteButton
                label="RPT"
                onPress={() => deviceService.sendIR("11")} // Repeat
              />
              <RemoteButton
                label="U/SD"
                onPress={() => deviceService.sendIR("12")} // U/SD
              />

              {/* Number Pad (Codes: 13-21) */}
              <RemoteButton
                label="1"
                onPress={() => deviceService.sendIR("13")}
              />
              <RemoteButton
                label="2"
                onPress={() => deviceService.sendIR("14")}
              />
              <RemoteButton
                label="3"
                onPress={() => deviceService.sendIR("15")}
              />
              <RemoteButton
                label="4"
                onPress={() => deviceService.sendIR("16")}
              />
              <RemoteButton
                label="5"
                onPress={() => deviceService.sendIR("17")}
              />
              <RemoteButton
                label="6"
                onPress={() => deviceService.sendIR("18")}
              />
              <RemoteButton
                label="7"
                onPress={() => deviceService.sendIR("19")}
              />
              <RemoteButton
                label="8"
                onPress={() => deviceService.sendIR("20")}
              />
              <RemoteButton
                label="9"
                onPress={() => deviceService.sendIR("21")}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
};

// --- STYLES (Unchanged) ---
const getModalStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: colors.remoteModalBg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      paddingBottom: 40,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#555",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 12,
    },
    header: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    headerIcon: {
      flex: 1,
      textAlign: "left",
    },
    headerTitle: {
      flex: 2,
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    closeButton: {
      flex: 1,
      alignItems: "flex-end",
    },
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      maxWidth: 340,
      marginTop: 10,
    },
  });

const getButtonStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    button: {
      width: 80,
      height: 80,
      borderRadius: 40,
      margin: 10,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 4,
    },
    buttonBackground: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    buttonImageStyle: {
      borderRadius: 40,
    },
    buttonText: {
      fontSize: 20,
      fontWeight: "600",
      marginTop: 2,
    },
  });
