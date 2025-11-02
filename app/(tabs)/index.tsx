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

// --- Main Screen Component (Unchanged) ---
const ControlScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getScreenStyles(colors), [colors]);

  // --- State (No Change) ---
  const [volume, setVolume] = useState(75);
  const [bass, setBass] = useState(38);
  const [treble, setTreble] = useState(60);
  const [mid, setMid] = useState(19);

  const [frontLeft, setFrontLeft] = useState(50);
  const [frontRight, setFrontRight] = useState(50);
  const [subwoofer, setSubwoofer] = useState(65);
  const [center, setCenter] = useState(70);
  const [rearLeft, setRearLeft] = useState(40);
  const [rearRight, setRearRight] = useState(40);

  const [prologic, setPrologic] = useState(false);
  const [tone, setTone] = useState(true);
  const [surround, setSurround] = useState(false);
  const [mixed, setMixed] = useState(true);
  const [mode, setMode] = useState("AUX2");

  const [modalVisible, setModalVisible] = useState<string | null>(null);
  const openModal = (name: string) => setModalVisible(name);
  const closeModal = () => setModalVisible(null);

  // --- Functions (Unchanged) ---
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

  // --- 1. MODIFIED: KNOB SIZES ---
  const LARGE_KNOB_SIZE = width * 0.35; // For the main Volume knob
  const SMALL_KNOB_SIZE = width * 0.25; // For Bass, Treble, Mid

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

            {/* --- 2. MODIFIED: KNOBS SECTION (1-2-1 Layout) --- */}
            <View style={styles.knobsSection}>
              {/* Row 1: Large Volume Knob (Centered) */}
              <View style={styles.knobRowCenter}>
                <Knob
                  label="Volume"
                  size={LARGE_KNOB_SIZE}
                  value={volume}
                  onValueChange={setVolume}
                  dialBaseImage={require("../../assets/images/dial-base.png")}
                  indicatorImage={require("../../assets/images/knob-indicator.png")}
                />
              </View>

              {/* Row 2: Two Smaller Knobs (Apart) */}
              <View style={styles.knobRowApart}>
                <View>
                  <Knob
                    label="Bass"
                    size={SMALL_KNOB_SIZE}
                    value={bass}
                    onValueChange={setBass}
                    dialBaseImage={require("../../assets/images/dial-base.png")}
                    indicatorImage={require("../../assets/images/dial-indicator-blue.png")}
                  />
                </View>

                <View style={styles.knobRowRight}>
                  <Knob
                    label="Treble"
                    size={SMALL_KNOB_SIZE}
                    value={treble}
                    onValueChange={setTreble}
                    dialBaseImage={require("../../assets/images/dial-base.png")}
                    indicatorImage={require("../../assets/images/dial-indicator-red.png")}
                  />
                </View>
              </View>

              {/* Row 3: One Smaller Knob (Centered) */}
              <View style={styles.knobRowBottom}>
                <Knob
                  label="Mid"
                  size={SMALL_KNOB_SIZE}
                  value={mid}
                  onValueChange={setMid}
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

// --- 3. MODIFIED: STYLES ---
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
      paddingVertical: 15, // Increased padding for larger knobs
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    // Style for rows with two knobs, spaced apart
    knobRowApart: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    knobRowRight: {
      justifyContent: "flex-end", // Use space-around for better spacing
      alignItems: "center",
      width: "100%",
    },

    // Style for rows with one knob, centered
    knobRowCenter: {
      flexDirection: "row",
      justifyContent: "center",
      //alignItems: "center",
      width: "100%",
      paddingVertical: 0, // Add some vertical padding
    },
    knobRowBottom: {
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      width: "100%",
      paddingVertical: -20, // Add some vertical padding
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
