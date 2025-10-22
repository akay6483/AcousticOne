import { AttenuationModal } from "@/components/AttenuationModel";
import { PresetModal } from "@/components/PresetModal"; // <-- FIXED: Was "PresetModel"
import { RemoteModal } from "@/components/RemoteModal";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
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
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Knob } from "../../components/Knob";

// --- IMPORT THEME ---
import { useTheme } from "../../theme/ThemeContext";
import { lightColors } from "../../theme/colors"; // Import type

// --- App Theme (REMOVED) ---
// const theme = { ... };

const { width } = Dimensions.get("window");

// --- Prop Types (No Change) ---
type SwitchControlProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};
type ModalButtonProps = {
  label: string;
  onPress: () => void;
  icon: React.ReactNode;
};

// --- Reusable Sub-components (Refactored to use useTheme) ---
const SwitchControl: React.FC<SwitchControlProps> = ({
  label,
  value,
  onValueChange,
}) => {
  const { colors } = useTheme(); // SwitchControl gets its own theme
  const styles = useMemo(() => getSwitchStyles(colors), [colors]); // Memoized styles

  return (
    <View style={styles.switchContainer}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        trackColor={{ false: colors.inactiveTint, true: colors.primary }}
        thumbColor={colors.thumbColor}
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );
};

const ModalButton: React.FC<ModalButtonProps> = ({ label, onPress, icon }) => {
  const { colors } = useTheme(); // ModalButton gets its own theme
  const styles = useMemo(() => getModalButtonStyles(colors), [colors]); // Memoized styles

  return (
    <Pressable style={styles.modalButton} onPress={onPress}>
      {icon}
      <Text style={styles.modalButtonText}>{label}</Text>
    </Pressable>
  );
};

// --- Main Screen Component (Refactored) ---
const ControlScreen: React.FC = () => {
  const { colors, isDark } = useTheme(); // Get theme colors and dark mode status
  const styles = useMemo(() => getScreenStyles(colors), [colors]); // Memoized styles

  // --- State (No Change) ---
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

  const KNOB_SIZE = width * 0.4;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
          <ScrollView contentContainerStyle={styles.mainScrollView}>
            {/* --- BUTTONS SECTION --- */}
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.buttonsScrollView}
            >
              <ModalButton
                label="Remote"
                onPress={() => openModal("Remote")}
                icon={
                  <MaterialCommunityIcons
                    name="remote"
                    size={20}
                    color={colors.icon} // Use theme color
                  />
                }
              />
              <ModalButton
                label="Attenuation"
                onPress={() => openModal("Attenuation")}
                icon={
                  <MaterialIcons
                    name="speaker"
                    size={20}
                    color={colors.icon} // Use theme color
                  />
                }
              />
              <ModalButton
                label="Presets"
                onPress={() => openModal("Presets")}
                icon={<Ionicons name="save" size={20} color={colors.icon} />}
              />
              <ModalButton
                label="Sample"
                onPress={() => openModal("Sample")}
                icon={
                  <FontAwesome
                    name="microphone"
                    size={20}
                    color={colors.icon} // Use theme color
                  />
                }
              />
            </ScrollView>

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
              <SwitchControl
                label="Tone"
                value={tone}
                onValueChange={setTone}
              />
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

          {/* --- MODALS --- */}
          <RemoteModal
            visible={modalVisible === "Remote"}
            onClose={closeModal}
          />
          <AttenuationModal
            visible={modalVisible === "Attenuation"}
            onClose={closeModal}
          />
          <PresetModal
            visible={modalVisible === "Presets"}
            onClose={closeModal}
          />
          {/* <-- 2. RENDER PRESET MODAL */}
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default ControlScreen;

// --- Stylesheet (REMOVED from top level) ---

// --- NEW DYNAMIC STYLE FUNCTIONS ---

// Styles for the main screen
const getScreenStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    mainScrollView: {
      paddingVertical: 20,
      paddingBottom: 40,
    },
    buttonsScrollView: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    knobsSection: {
      paddingVertical: 10,
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    knobRow: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
    },
    switchesSection: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignContent: "center",
      backgroundColor: colors.card,
      paddingVertical: 10,
      marginHorizontal: 16,
      borderRadius: 12,
      marginTop: 20,
    },
  });

// Styles for the ModalButton component
const getModalButtonStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    modalButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 12,
    },
    modalButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 8,
    },
  });

// Styles for the SwitchControl component
const getSwitchStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    switchContainer: {
      width: "50%",
      alignItems: "center",
      paddingVertical: 15,
    },
    switchLabel: {
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 8,
      color: colors.text,
    },
  });
