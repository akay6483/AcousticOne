import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
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
  frontLeft: number; // This is now an index
  setFrontLeft: (value: number) => void; // This sets an index
  frontRight: number; // This is now an index
  setFrontRight: (value: number) => void; // This sets an index
  subwoofer: number; // This is now an index
  setSubwoofer: (value: number) => void; // This sets an index
  center: number; // This is now an index
  setCenter: (value: number) => void; // This sets an index
  rearLeft: number; // This is now an index
  setRearLeft: (value: number) => void; // This sets an index
  rearRight: number; // This is now an index
  setRearRight: (value: number) => void; // This sets an index
}

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
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

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
            {/* Header Section (Unchanged) */}
            <View style={styles.header}>
              <MaterialIcons
                name="speaker"
                size={24}
                color={colors.icon}
                style={styles.headerIcon}
              />
              <Text style={styles.headerTitle}>Attenuation</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={26} color={colors.text} />
              </Pressable>
            </View>

            {/* --- MODIFIED: Knobs Grid (using valueIndex/onIndexChange) --- */}
            <View style={styles.gridContainer}>
              <Knob
                label="Front Left"
                size={KNOB_SIZE}
                valueIndex={frontLeft}
                onIndexChange={setFrontLeft}
                min={-14}
                max={0}
                step={1}
                valueSuffix="dB" // Added suffix
                dialBaseImage={require("../assets/images/dial-base.png")}
                indicatorImage={require("../assets/images/dial-indicator-green.png")}
              />
              <Knob
                label="Front Right"
                size={KNOB_SIZE}
                valueIndex={frontRight}
                onIndexChange={setFrontRight}
                min={-14}
                max={0}
                step={1}
                valueSuffix="dB" // Added suffix
                dialBaseImage={require("../assets/images/dial-base.png")}
                indicatorImage={require("../assets/images/dial-indicator-green.png")}
              />
            </View>

            <View style={styles.gridContainer}>
              <Knob
                label="Center"
                size={KNOB_SIZE}
                valueIndex={center}
                onIndexChange={setCenter}
                min={-14}
                max={0}
                step={1}
                valueSuffix="dB"
                dialBaseImage={require("../assets/images/dial-base.png")}
                indicatorImage={require("../assets/images/knob-indicator.png")}
              />
            </View>
            <View style={styles.gridContainer}>
              <Knob
                label="Rear Left"
                size={KNOB_SIZE}
                valueIndex={rearLeft}
                onIndexChange={setRearLeft}
                min={-14}
                max={0}
                step={1}
                valueSuffix="dB" // Added suffix
                dialBaseImage={require("../assets/images/dial-base.png")}
                indicatorImage={require("../assets/images/dial-indicator-blue.png")}
              />
              <Knob
                label="Rear Right"
                size={KNOB_SIZE}
                valueIndex={rearRight}
                onIndexChange={setRearRight}
                min={-14}
                max={0}
                step={1}
                valueSuffix="dB" // Added suffix
                dialBaseImage={require("../assets/images/dial-base.png")}
                indicatorImage={require("../assets/images/dial-indicator-blue.png")}
              />
            </View>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
};

// --- Style factory function (Unchanged) ---
const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.modalOverlay,
    },
    modalBody: {
      backgroundColor: colors.modalBackground,
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
      justifyContent: "space-evenly",
      width: "100%",
    },
  });
