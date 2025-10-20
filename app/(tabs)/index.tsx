import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// Import the icon libraries
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Knob } from "../../components/Knob";

const { width } = Dimensions.get("window");

// --- App Theme ---
const theme = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#E1E1E1",
  primary: "#007AFF",
  border: "#2C2C2E",
  icon: "#D0D0D0",
};

// --- Prop Types ---
type SwitchControlProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};
type ModalButtonProps = {
  label: string;
  onPress: () => void;
  icon: React.ReactNode; // To accept icon components
};

// --- Reusable Sub-components ---
const SwitchControl: React.FC<SwitchControlProps> = ({
  label,
  value,
  onValueChange,
}) => (
  <View style={styles.switchContainer}>
    <Text style={styles.switchLabel}>{label}</Text>
    <Switch
      trackColor={{ false: "#767577", true: theme.primary }}
      thumbColor={"#f4f3f4"}
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);

const ModalButton: React.FC<ModalButtonProps> = ({ label, onPress, icon }) => (
  <Pressable style={styles.modalButton} onPress={onPress}>
    {icon}
    <Text style={styles.modalButtonText}>{label}</Text>
  </Pressable>
);

// --- Main Screen Component ---
export default function ControlScreen() {
  const [volume, setVolume] = useState(75);
  const [bass, setBass] = useState(38);
  const [treble, setTreble] = useState(60);
  const [mid, setMid] = useState(19);

  const [prologic, setPrologic] = useState(false);
  const [tone, setTone] = useState(true);
  const [surround, setSurround] = useState(false);
  const [mixed, setMixed] = useState(true);

  const [modalVisible, setModalVisible] = useState<string | null>(null);
  const openModal = (name: string) => setModalVisible(name);
  const closeModal = () => setModalVisible(null);

  const KNOB_SIZE = width * 0.4; // All knobs are now the same size

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* --- BUTTONS SECTION (MOVED TO TOP) --- */}
          <View style={styles.buttonsSection}>
            <ModalButton
              label="Remote"
              onPress={() => openModal("Remote")}
              icon={
                <MaterialCommunityIcons
                  name="remote"
                  size={20}
                  color={theme.icon}
                />
              }
            />
            <ModalButton
              label="Presets"
              onPress={() => openModal("Presets")}
              icon={
                <Ionicons name="save-outline" size={20} color={theme.icon} />
              }
            />
            <ModalButton
              label="Sample"
              onPress={() => openModal("Sample")}
              icon={
                <FontAwesome name="microphone" size={20} color={theme.icon} />
              }
            />
          </View>

          {/* --- KNOBS SECTION --- */}
          <View style={styles.knobsSection}>
            <View style={styles.knobRow}>
              <Knob
                label="Volume"
                size={KNOB_SIZE}
                initialValue={volume}
                onValueChange={setVolume}
              />
              <Knob
                label="Treble"
                size={KNOB_SIZE}
                initialValue={treble}
                onValueChange={setTreble}
              />
            </View>
            <View style={styles.knobRow}>
              <Knob
                label="Mid"
                size={KNOB_SIZE}
                initialValue={mid}
                onValueChange={setMid}
              />
              <Knob
                label="Bass"
                size={KNOB_SIZE}
                initialValue={bass}
                onValueChange={setBass}
              />
            </View>
          </View>

          {/* --- SWITCHES SECTION --- */}
          <View style={styles.switchesSection}>
            <SwitchControl
              label="Prologic"
              value={prologic}
              onValueChange={setPrologic}
            />
            <SwitchControl label="Tone" value={tone} onValueChange={setTone} />
            <SwitchControl
              label="Surround Enhance"
              value={surround}
              onValueChange={setSurround}
            />
            <SwitchControl
              label="Mixed Channel"
              value={mixed}
              onValueChange={setMixed}
            />
          </View>
        </ScrollView>

        {/* --- MODAL --- */}
        <Modal visible={!!modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{modalVisible}</Text>
              <Pressable onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollViewContent: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  // --- Buttons (now at top) ---
  buttonsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalButtonText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  // --- Knobs ---
  knobsSection: {
    paddingVertical: 10,
    backgroundColor: theme.card,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  knobRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  // --- Switches ---
  switchesSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: theme.card,
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  switchContainer: {
    width: "50%",
    alignItems: "center",
    paddingVertical: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: theme.text,
  },
  // --- Modal Styles ---
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: theme.card,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: theme.text,
  },
  closeButton: {
    backgroundColor: theme.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
