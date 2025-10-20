import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ Updated import
import { Knob } from "./Knob";

interface AttenuationModalProps {
  visible: boolean;
  onClose: () => void;
}

const theme = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#E1E1E1",
  primary: "#007AFF",
  border: "#2C2C2E",
  icon: "#D0D0D0",
};

const { width } = Dimensions.get("window");

export const AttenuationModal: React.FC<AttenuationModalProps> = ({
  visible,
  onClose,
}) => {
  const [frontLeft, setFrontLeft] = useState(50);
  const [frontRight, setFrontRight] = useState(50);
  const [subwoofer, setSubwoofer] = useState(65);
  const [center, setCenter] = useState(70);
  const [rearLeft, setRearLeft] = useState(40);
  const [rearRight, setRearRight] = useState(40);

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
                color={theme.icon}
                style={styles.headerIcon}
              />
              <Text style={styles.headerTitle}>Attenuation</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={26} color={theme.text} />
              </Pressable>
            </View>

            {/* Knobs Grid */}
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

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalBody: {
    backgroundColor: "#2a2a2e",
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
    justifyContent: "space-between", // ✅ Evenly space items
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
    color: theme.text,
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
