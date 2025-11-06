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

// --- Remote Button (Refactored to use useTheme) ---
const RemoteButton: React.FC<RemoteButtonProps> = ({
  label,
  icon,
  onPress,
  buttonType = "default",
  textColor,
}) => {
  // --- 2. GET HAPTICS SETTING FROM USE THEME ---
  const { colors, isHapticsEnabled } = useTheme(); // Button gets its own theme
  const styles = useMemo(() => getButtonStyles(colors), [colors]); // Memoized styles
  const sourceImage = buttonImages[buttonType];

  // --- 3. CREATE A WRAPPED PRESS HANDLER ---
  const handlePress = () => {
    // Fire haptics if enabled
    if (isHapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Call the original onPress function
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.75 : 1 }]}
      // --- 4. USE THE NEW WRAPPED HANDLER ---
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
              { color: textColor || colors.remoteButtonText }, // Use theme color
            ]}
          >
            {label}
          </Text>
        )}
      </ImageBackground>
    </Pressable>
  );
};

// --- Remote Modal (Refactored to use useTheme) ---
export const RemoteModal: React.FC<RemoteModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme(); // Modal gets the theme
  const styles = useMemo(() => getModalStyles(colors), [colors]); // Memoized styles

  const handleButtonPress = (action: string) => {
    console.log(`Remote button pressed: ${action}`);
  };

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
                color={colors.icon} // Use theme color
                style={styles.headerIcon}
              />
              <Text style={styles.headerTitle}>Remote</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={26} color={colors.text} />
              </Pressable>
            </View>

            {/* Buttons Grid (Updated icon/text colors) */}
            <View style={styles.gridContainer}>
              {/* Row 1 */}
              <RemoteButton
                onPress={() => handleButtonPress("Power")}
                buttonType="red"
                icon={
                  <MaterialCommunityIcons
                    name="power"
                    size={32}
                    color={colors.remotePowerText} // Use theme color
                  />
                }
              />
              <RemoteButton
                label="Mode"
                onPress={() => handleButtonPress("Mode")}
              />
              <RemoteButton
                onPress={() => handleButtonPress("Mute")}
                icon={
                  <MaterialCommunityIcons
                    name="volume-off"
                    size={30}
                    color={colors.remoteButtonText} // Use theme color
                  />
                }
              />

              {/* Row 2 */}
              <RemoteButton
                onPress={() => handleButtonPress("Play/Pause")}
                buttonType="blue"
                icon={
                  <Ionicons
                    name="play"
                    size={28}
                    color={colors.remotePlayText} // Use theme color
                  />
                }
              />
              <RemoteButton
                onPress={() => handleButtonPress("Previous")}
                icon={
                  <Ionicons
                    name="play-skip-back"
                    size={24}
                    color={colors.remoteButtonText} // Use theme color
                  />
                }
              />
              <RemoteButton
                onPress={() => handleButtonPress("Next")}
                icon={
                  <Ionicons
                    name="play-skip-forward"
                    size={24}
                    color={colors.remoteButtonText} // Use theme color
                  />
                }
              />

              {/* Row 3 */}
              <RemoteButton
                label="EQ"
                onPress={() => handleButtonPress("EQ")}
                buttonType="purple"
                textColor={colors.remoteEqText} // Use theme color
              />
              <RemoteButton
                label="VOL-"
                onPress={() => handleButtonPress("Vol-")}
              />
              <RemoteButton
                label="VOL+"
                onPress={() => handleButtonPress("Vol+")}
              />

              {/* Row 4 (no change) */}
              <RemoteButton label="0" onPress={() => handleButtonPress("0")} />
              <RemoteButton
                label="RPT"
                onPress={() => handleButtonPress("Repeat")}
              />
              <RemoteButton
                label="U/SD"
                onPress={() => handleButtonPress("U/SD")}
              />

              {/* Number Pad (no change) */}
              {Array.from({ length: 9 }, (_, i) => (
                <RemoteButton
                  key={i + 1}
                  label={`${i + 1}`}
                  onPress={() => handleButtonPress(`${i + 1}`)}
                />
              ))}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
};

// --- Style factory for the MODAL ---
const getModalStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay, // Use theme color
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: colors.remoteModalBg, // Use theme color
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      paddingBottom: 40,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#555", // This could also be themed: colors.border
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
      color: colors.text, // Use theme color
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

// --- Style factory for the BUTTON ---
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
