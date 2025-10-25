import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext"; // Import global theme
import { lightColors } from "../theme/colors"; // Import type
import { Knob } from "./Knob";

interface AttenuationModalProps {
  visible: boolean;
  onClose: () => void;
  frontLeft: number;
  setFrontLeft: (value: number) => void;
  frontRight: number;
  setFrontRight: (value: number) => void;
  subwoofer: number;
  setSubwoofer: (value: number) => void;
  center: number;
  setCenter: (value: number) => void;
  rearLeft: number;
  setRearLeft: (value: number) => void;
  rearRight: number;
  setRearRight: (value: number) => void;
}

// --- Local theme REMOVED ---
// const theme = { ... };

const { width } = Dimensions.get("window");

export const AttenuationModal: React.FC<AttenuationModalProps> = ({
  visible,
  onClose,
  frontLeft,
  setFrontLeft,
  frontRight,
  setFrontRight,
  subwoofer,
  setSubwoofer,
  center,
  setCenter,
  rearLeft,
  setRearLeft,
  rearRight,
  setRearRight,
}) => {
  const { colors } = useTheme(); // Use global theme
  const styles = useMemo(() => getStyles(colors), [colors]); // Memoize styles

  const KNOB_SIZE = width * 0.38;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalBody}>
            {/* Header Section */}
            <View style={styles.header}>
              <MaterialIcons
                name="speaker"
                size={24}
                color={colors.icon} // Use theme color
                style={styles.headerIcon}
              />
              <Text style={styles.headerTitle}>Attenuation</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={26} color={colors.text} />
              </Pressable>
            </View>

            {/* Knobs Grid (no change) */}
            <View style={styles.gridContainer}>
              <Knob
                label="Front Left"
                size={KNOB_SIZE}
                initialValue={frontLeft}
                onValueChange={setFrontLeft}
              />
              <Knob
                label="Front Right"
                size={KNOB_SIZE}
                initialValue={frontRight}
                onValueChange={setFrontRight}
              />
              <Knob
                label="Subwoofer"
                size={KNOB_SIZE}
                initialValue={subwoofer}
                onValueChange={setSubwoofer}
              />
              <Knob
                label="Center"
                size={KNOB_SIZE}
                initialValue={center}
                onValueChange={setCenter}
              />
              <Knob
                label="Rear Left"
                size={KNOB_SIZE}
                initialValue={rearLeft}
                onValueChange={setRearLeft}
              />
              <Knob
                label="Rear Right"
                size={KNOB_SIZE}
                initialValue={rearRight}
                onValueChange={setRearRight}
              />
            </View>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
};

// --- Style factory function ---
const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.modalOverlay, // Use theme color
    },
    modalBody: {
      backgroundColor: colors.modalBackground, // Use theme color
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingVertical: 20,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    header: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
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
      justifyContent: "space-evenly",
      width: "100%",
    },
  });
