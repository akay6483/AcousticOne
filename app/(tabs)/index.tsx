import { AttenuationModal } from "@/components/AttenuationModel";
import { ModeSelector } from "@/components/ModeSelector";
import { PresetModal } from "@/components/PresetModal";
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
// Import the *updated* Preset type
import { Preset } from "../../services/database";

// --- IMPORT THEME ---
import { useTheme } from "../../theme/ThemeContext";
import { lightColors } from "../../theme/colors"; // Import type

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

// --- Reusable Sub-components (Unchanged) ---
const SwitchControl: React.FC<SwitchControlProps> = ({
  label,
  value,
  onValueChange,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getSwitchStyles(colors), [colors]);

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
  const { colors } = useTheme();
  const styles = useMemo(() => getModalButtonStyles(colors), [colors]);

  return (
    <Pressable style={styles.modalButton} onPress={onPress}>
      {icon}
      <Text style={styles.modalButtonText}>{label}</Text>
    </Pressable>
  );
};

// --- 1. MODIFIED: New Helper Functions ---
// We replace mapValue with two functions that calculate step index.

/**
 * Converts an actual value (e.g., -12) to its step index (e.g., 1).
 * Example: (-12 - (-14)) / 2 = 1
 */
const getStepIndexFromValue = (
  value: number,
  min: number,
  step: number
): number => {
  return Math.round((value - min) / step);
};

/**
 * Converts a step index (e.g., 1) back to its actual value (e.g., -12).
 * Example: (1 * 2) + (-14) = -12
 */
const getValueFromStepIndex = (
  index: number,
  min: number,
  step: number
): number => {
  return index * step + min;
};

// --- Main Screen Component ---
const ControlScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getScreenStyles(colors), [colors]);

  // --- State (values are now actuals, not 0-100) ---
  const [volume, setVolume] = useState(75); // 0 to 79
  const [bass, setBass] = useState(0); // -14 to +14 (step 2)
  const [treble, setTreble] = useState(0); // -14 to +14 (step 2)
  const [mid, setMid] = useState(0); // -14 to +14 (step 2)

  // Attenuation States (values are actuals)
  const [frontLeft, setFrontLeft] = useState(0); // -14 to 0 (step 1)
  const [frontRight, setFrontRight] = useState(0); // -14 to 0 (step 1)
  const [subwoofer, setSubwoofer] = useState(50); // Unused? Assuming 0-100
  const [center, setCenter] = useState(0); // -14 to 0 (step 1)
  const [rearLeft, setRearLeft] = useState(0); // -14 to 0 (step 1)
  const [rearRight, setRearRight] = useState(0); // -14 to 0 (step 1)

  const [prologic, setPrologic] = useState(false);
  const [tone, setTone] = useState(true);
  const [surround, setSurround] = useState(false);
  const [mixed, setMixed] = useState(true);
  const [mode, setMode] = useState("AUX2");

  const [modalVisible, setModalVisible] = useState<string | null>(null);
  const openModal = (name: string) => setModalVisible(name);
  const closeModal = () => setModalVisible(null);

  // --- 2. MODIFIED: applyPreset (uses getValueFromStepIndex) ---
  const applyPreset = (preset: Preset) => {
    if (preset.preset_values) {
      // The preset stores the *index* (0-79), convert it back to *value*
      setVolume(getValueFromStepIndex(preset.preset_values.volume, 0, 1));

      // The preset stores the *index* (0-14), convert it back to *value* (-14 to +14)
      setBass(getValueFromStepIndex(preset.preset_values.bass, -14, 2));
      setTreble(getValueFromStepIndex(preset.preset_values.treble, -14, 2));
      setMid(getValueFromStepIndex(preset.preset_values.mid, -14, 2));

      setPrologic(preset.preset_values.prologic);
      setTone(preset.preset_values.tone);
      setSurround(preset.preset_values.surround);
      setMixed(preset.preset_values.mixed);

      // Attenuation: preset stores *index* (0-14), convert back to *value* (-14 to 0)
      setFrontLeft(
        getValueFromStepIndex(preset.preset_values.frontLeft, -14, 1)
      );
      setFrontRight(
        getValueFromStepIndex(preset.preset_values.frontRight, -14, 1)
      );
      setCenter(getValueFromStepIndex(preset.preset_values.center, -14, 1));
      setRearLeft(getValueFromStepIndex(preset.preset_values.rearLeft, -14, 1));
      setRearRight(
        getValueFromStepIndex(preset.preset_values.rearRight, -14, 1)
      );

      // Assuming Subwoofer is 0-100 (not specified in modals)
      setSubwoofer(getValueFromStepIndex(preset.preset_values.subwoofer, 0, 1));

      setMode(preset.preset_values.mode);
    }
  };

  const handleClosePresetModal = (preset?: Preset) => {
    if (preset) {
      applyPreset(preset);
    }
    closeModal();
  };

  // --- 3. MODIFIED: currentSettings (uses getStepIndexFromValue) ---
  const currentSettings: Preset["preset_values"] = {
    // Convert *value* (0-79) to *step index* (0-79)
    volume: getStepIndexFromValue(volume, 0, 1),

    // Convert *value* (-14 to +14) to *step index* (0-14)
    bass: getStepIndexFromValue(bass, -14, 2),
    treble: getStepIndexFromValue(treble, -14, 2),
    mid: getStepIndexFromValue(mid, -14, 2),

    prologic,
    tone,
    surround,
    mixed,

    // Convert *value* (-14 to 0) to *step index* (0-14)
    frontLeft: getStepIndexFromValue(frontLeft, -14, 1),
    frontRight: getStepIndexFromValue(frontRight, -14, 1),
    center: getStepIndexFromValue(center, -14, 1),
    rearLeft: getStepIndexFromValue(rearLeft, -14, 1),
    rearRight: getStepIndexFromValue(rearRight, -14, 1),

    // Assuming Subwoofer is 0-100
    subwoofer: getStepIndexFromValue(subwoofer, 0, 1),

    mode,
  };

  // --- Knob Sizes (Unchanged from your last version) ---
  const LARGE_KNOB_SIZE = width * 0.45;
  const SMALL_KNOB_SIZE = width * 0.3;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
          <ScrollView contentContainerStyle={styles.mainScrollView}>
            {/* --- BUTTONS SECTION (Unchanged) --- */}
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
                    color={colors.icon}
                  />
                }
              />
              <ModalButton
                label="Attenuation"
                onPress={() => openModal("Attenuation")}
                icon={
                  <MaterialIcons name="speaker" size={20} color={colors.icon} />
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
                    color={colors.icon}
                  />
                }
              />
            </ScrollView>

            <ModeSelector mode={mode} onModeChange={setMode} />

            {/* --- 4. MODIFIED: KNOBS SECTION (Simplified Layout) --- */}
            <View style={styles.knobsSection}>
              {/* Row 1: Large Volume Knob (Centered) */}
              <View style={styles.knobRowCenter}>
                <Knob
                  label="Volume"
                  size={LARGE_KNOB_SIZE}
                  value={volume}
                  onValueChange={setVolume}
                  min={0}
                  max={79}
                  step={1}
                  valueSuffix="dB"
                  dialBaseImage={require("../../assets/images/dial-base.png")}
                  indicatorImage={require("../../assets/images/knob-indicator.png")}
                />
              </View>

              {/* Row 2: Two Smaller Knobs (Apart) */}
              <View style={styles.knobRowApart}>
                <Knob
                  label="Bass"
                  size={SMALL_KNOB_SIZE}
                  value={bass}
                  onValueChange={setBass}
                  min={-14}
                  max={14}
                  step={2}
                  valueSuffix="dB"
                  dialBaseImage={require("../../assets/images/dial-base.png")}
                  indicatorImage={require("../../assets/images/dial-indicator-blue.png")}
                />
                <Knob
                  label="Treble"
                  size={SMALL_KNOB_SIZE}
                  value={treble}
                  onValueChange={setTreble}
                  min={-14}
                  max={14}
                  step={2}
                  valueSuffix="dB"
                  dialBaseImage={require("../../assets/images/dial-base.png")}
                  indicatorImage={require("../../assets/images/dial-indicator-red.png")}
                />
              </View>

              {/* Row 3: One Smaller Knob (Centered) */}
              <View style={styles.knobRowCenter}>
                <Knob
                  label="Mid"
                  size={SMALL_KNOB_SIZE}
                  value={mid}
                  onValueChange={setMid}
                  min={-14}
                  max={14}
                  step={2}
                  valueSuffix="dB"
                  dialBaseImage={require("../../assets/images/dial-base.png")}
                  indicatorImage={require("../../assets/images/dial-indicator-green.png")}
                />
              </View>
            </View>

            {/* --- SWITCHES SECTION (Unchanged) --- */}
            <View style={styles.switchesSection}>
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
            </View>
          </ScrollView>

          {/* --- MODALS (Unchanged) --- */}
          <RemoteModal
            visible={modalVisible === "Remote"}
            onClose={closeModal}
          />
          <AttenuationModal
            visible={modalVisible === "Attenuation"}
            onClose={closeModal}
            frontLeft={frontLeft}
            setFrontLeft={setFrontLeft}
            frontRight={frontRight}
            setFrontRight={setFrontRight}
            subwoofer={subwoofer}
            setSubwoofer={setSubwoofer}
            center={center}
            setCenter={setCenter}
            rearLeft={rearLeft}
            setRearLeft={setRearLeft}
            rearRight={rearRight}
            setRearRight={setRearRight}
          />
          <PresetModal
            visible={modalVisible === "Presets"}
            onClose={handleClosePresetModal}
            currentSettings={currentSettings}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default ControlScreen;

// --- 5. MODIFIED: STYLES ---
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
      paddingVertical: 15,
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    // Style for rows with two knobs, spaced evenly
    knobRowApart: {
      flexDirection: "row",
      justifyContent: "space-around", // This will space them evenly
      alignItems: "center",
      width: "100%",
      paddingVertical: 10, // Add some padding
    },
    // Style for rows with one knob, centered
    knobRowCenter: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      paddingVertical: 10, // Add some padding
    },
    // REMOVED knobRowRight and knobRowBottom as they are no longer needed
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

// (getModalButtonStyles and getSwitchStyles are unchanged)
// ... (paste getModalButtonStyles and getSwitchStyles here)
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
