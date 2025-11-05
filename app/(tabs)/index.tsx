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
import { AttenuationModal } from "../../components/AttenuationModel";
import { Knob } from "../../components/Knob";
import { ModeSelector } from "../../components/ModeSelector";
import { PresetModal } from "../../components/PresetModal";
import { RemoteModal } from "../../components/RemoteModal";
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
// ... (SwitchControl and ModalButton components remain unchanged)
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

// --- 1. REMOVED: All mapping helper functions ---

// --- Main Screen Component ---
const ControlScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getScreenStyles(colors), [colors]);

  // --- 2. MODIFIED: State now stores the STEP INDEX ---
  const [volume, setVolume] = useState(75); // Index 0-79 (Value 0 to 79)
  const [bass, setBass] = useState(7); // Index 0-14 (Value -14 to +14, 7 is 0dB)
  const [treble, setTreble] = useState(7); // Index 0-14 (Value -14 to +14, 7 is 0dB)
  const [mid, setMid] = useState(7); // Index 0-14 (Value -14 to +14, 7 is 0dB)

  // Attenuation States (store index)
  const [frontLeft, setFrontLeft] = useState(14); // Index 0-14 (Value -14 to 0, 14 is 0dB)
  const [frontRight, setFrontRight] = useState(14); // Index 0-14
  const [subwoofer, setSubwoofer] = useState(50); // Index 0-100 (Assuming 0-100 range)
  const [center, setCenter] = useState(14); // Index 0-14
  const [rearLeft, setRearLeft] = useState(14); // Index 0-14
  const [rearRight, setRearRight] = useState(14); // Index 0-14

  const [prologic, setPrologic] = useState(false);
  const [tone, setTone] = useState(true);
  const [surround, setSurround] = useState(false);
  const [mixed, setMixed] = useState(true);
  const [mode, setMode] = useState("AUX2");

  const [modalVisible, setModalVisible] = useState<string | null>(null);
  const openModal = (name: string) => setModalVisible(name);
  const closeModal = () => setModalVisible(null);

  // --- 3. MODIFIED: applyPreset (direct assignment of index) ---
  const applyPreset = (preset: Preset) => {
    if (preset.preset_values) {
      setVolume(preset.preset_values.volume);
      setBass(preset.preset_values.bass);
      setTreble(preset.preset_values.treble);
      setMid(preset.preset_values.mid);
      setPrologic(preset.preset_values.prologic);
      setTone(preset.preset_values.tone);
      setSurround(preset.preset_values.surround);
      setMixed(preset.preset_values.mixed);
      setFrontLeft(preset.preset_values.frontLeft);
      setFrontRight(preset.preset_values.frontRight);
      setSubwoofer(preset.preset_values.subwoofer);
      setCenter(preset.preset_values.center);
      setRearLeft(preset.preset_values.rearLeft);
      setRearRight(preset.preset_values.rearRight);
      setMode(preset.preset_values.mode);
    }
  };

  const handleClosePresetModal = (preset?: Preset) => {
    if (preset) {
      applyPreset(preset);
    }
    closeModal();
  };

  // --- 4. MODIFIED: currentSettings (direct assignment of index) ---
  const currentSettings: Preset["preset_values"] = {
    volume,
    bass,
    treble,
    mid,
    prologic,
    tone,
    surround,
    mixed,
    frontLeft,
    frontRight,
    subwoofer,
    center,
    rearLeft,
    rearRight,
    mode,
  };

  // --- Knob Sizes (Unchanged) ---
  const LARGE_KNOB_SIZE = width * 0.45;
  const SMALL_KNOB_SIZE = width * 0.3;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
          <ScrollView contentContainerStyle={styles.mainScrollView}>
            {/* --- BUTTONS SECTION (Unchanged) --- */}
            {/* ... (ModalButton components) ... */}
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

            {/* --- 5. MODIFIED: KNOBS SECTION (using valueIndex/onIndexChange) --- */}
            <View style={styles.knobsSection}>
              {/* Row 1: Large Volume Knob (Centered) */}
              <View style={styles.knobRowCenter}>
                <Knob
                  label="Volume"
                  size={LARGE_KNOB_SIZE}
                  valueIndex={volume}
                  onIndexChange={setVolume}
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
                  valueIndex={bass}
                  onIndexChange={setBass}
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
                  valueIndex={treble}
                  onIndexChange={setTreble}
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
                  valueIndex={mid}
                  onIndexChange={setMid}
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
            {/* ... (SwitchControl components) ... */}
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
          {/* ... (RemoteModal) ... */}
          <RemoteModal
            visible={modalVisible === "Remote"}
            onClose={closeModal}
          />

          {/* Note: Props for AttenuationModal are unchanged, as the state
               variables (e.g., frontLeft) are already the indices */}
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
          {/* ... (PresetModal) ... */}
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

// --- 6. MODIFIED: STYLES (Simplified layout styles) ---
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
    // REMOVED knobRowRight and knobRowBottom
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

// ... (getModalButtonStyles and getSwitchStyles remain unchanged)
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
