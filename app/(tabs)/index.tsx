import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Preset } from "../../services/database";
// --- MODIFIED: Import new device service ---
import * as deviceService from "../../services/deviceService";
// --- MODIFIED: Added LastSettings import ---
import {
  LastSettings,
  loadLastSettings,
  saveLastSettings,
} from "../../services/storage";
import { useTheme } from "../../theme/ThemeContext";
import { lightColors } from "../../theme/colors";

const { width } = Dimensions.get("window");
const DEBOUNCE_SAVE_MS = 500; // Debounce for *saving* to storage only
const INPUT_MODES_MAP = ["AUX1", "AUX2", "AUX3", "USB/BT", "5.1 Analogue"]; // Make sure this matches service

// --- Reusable Debounce Hook ---
// Defined *outside* the component to fix React errors
const useDebouncedApiCall = (
  value: any,
  apiFunction: (host: string, value: any) => Promise<void>,
  host: string // Host is now passed in
) => {
  // Use 'number' for React Native timers, not 'NodeJS.Timeout'
  const timerRef = useRef<number | null>(null);
  const initialMountRef = useRef(true);

  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return; // Don't fire on mount
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      console.log(`Sending API call for value: ${value}`);
      apiFunction(host, value).catch((e) =>
        console.error("API call failed", e)
      );
    }, 300); // 300ms debounce

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, apiFunction, host]);
};

// ... (SwitchControl and ModalButton components remain unchanged)
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

// --- Main Screen Component ---
const ControlScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getScreenStyles(colors), [colors]);

  // --- State Definitions (Default Values) ---
  const [volume, setVolume] = useState(75);
  const [bass, setBass] = useState(7);
  const [treble, setTreble] = useState(7);
  const [mid, setMid] = useState(7);
  const [frontLeft, setFrontLeft] = useState(14);
  const [frontRight, setFrontRight] = useState(14);
  const [subwoofer, setSubwoofer] = useState(50);
  const [center, setCenter] = useState(14);
  const [rearLeft, setRearLeft] = useState(14);
  const [rearRight, setRearRight] = useState(14);
  const [prologic, setPrologic] = useState(false);
  const [tone, setTone] = useState(true);
  const [surround, setSurround] = useState(false);
  const [mixed, setMixed] = useState(true);
  const [mode, setMode] = useState("AUX2");
  const [modalVisible, setModalVisible] = useState<string | null>(null);
  const openModal = (name: string) => setModalVisible(name);
  const closeModal = () => setModalVisible(null);

  // --- Apply Settings Function ---
  const applySettings = (settings: LastSettings) => {
    setVolume(settings.volume);
    setBass(settings.bass);
    setTreble(settings.treble);
    setMid(settings.mid);
    setPrologic(settings.prologic);
    setTone(settings.tone);
    setSurround(settings.surround);
    setMixed(settings.mixed);
    setFrontLeft(settings.frontLeft);
    setFrontRight(settings.frontRight);
    setSubwoofer(settings.subwoofer);
    setCenter(settings.center);
    setRearLeft(settings.rearLeft);
    setRearRight(settings.rearRight);
    setMode(settings.mode);
  };

  const handleClosePresetModal = (preset?: Preset) => {
    if (preset && preset.preset_values) {
      applySettings(preset.preset_values);
      // --- When a preset is applied, queue all settings ---
      deviceService.sendAllParameters(preset.preset_values);
    }
    closeModal();
  };

  // --- Current Settings Object ---
  const currentSettings: LastSettings = {
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

  // --- Load settings on component mount ---
  useEffect(() => {
    const load = async () => {
      const loadedSettings = await loadLastSettings();
      if (loadedSettings) {
        applySettings(loadedSettings);
      }
    };
    load();
  }, []);

  // --- *** NEW: Debounced Save to Storage *** ---
  // This saves to storage 500ms after you stop changing *anything*.
  const debounceSaveTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    if (debounceSaveTimerRef.current) {
      clearTimeout(debounceSaveTimerRef.current);
    }

    debounceSaveTimerRef.current = setTimeout(() => {
      console.log("Debounce timer fired. Saving settings to storage...");
      saveLastSettings(currentSettings);
    }, DEBOUNCE_SAVE_MS);

    return () => {
      if (debounceSaveTimerRef.current) {
        clearTimeout(debounceSaveTimerRef.current);
      }
    };
  }, [currentSettings]); // This dependency array is key

  // --- Knob Sizes ---
  const LARGE_KNOB_SIZE = width * 0.45;
  const SMALL_KNOB_SIZE = width * 0.3;

  // --- *** NEW: Simplified State Handlers *** ---
  // These now just update state AND call the queue.

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    deviceService.sendMasterVolume(value);
  };
  const handleBassChange = (value: number) => {
    setBass(value);
    deviceService.sendBass(value);
  };
  const handleTrebleChange = (value: number) => {
    setTreble(value);
    deviceService.sendTreble(value);
  };
  const handleMidChange = (value: number) => {
    setMid(value);
    deviceService.sendMid(value);
  };
  const handleToneChange = (value: boolean) => {
    setTone(value);
    deviceService.sendTone(value ? 1 : 0);
  };
  const handleSurroundChange = (value: boolean) => {
    setSurround(value);
    deviceService.sendSurround(value ? 1 : 0);
  };
  const handleModeChange = (value: string) => {
    setMode(value);
    const modeIndex = INPUT_MODES_MAP.indexOf(value);
    if (modeIndex > -1) {
      deviceService.sendInput(modeIndex);
    }
  };
  // Attenuation Modal Handlers
  const handleFLChange = (value: number) => {
    setFrontLeft(value);
    deviceService.sendFrontLeft(value);
  };
  const handleFRChange = (value: number) => {
    setFrontRight(value);
    deviceService.sendFrontRight(value);
  };
  const handleCChange = (value: number) => {
    setCenter(value);
    deviceService.sendCenter(value);
  };
  const handleRLChange = (value: number) => {
    setRearLeft(value);
    deviceService.sendRearLeft(value);
  };
  const handleRRChange = (value: number) => {
    setRearRight(value);
    deviceService.sendRearRight(value);
  };

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

            <ModeSelector mode={mode} onModeChange={handleModeChange} />

            <View style={styles.knobsSection}>
              <View style={styles.knobRowCenter}>
                <Knob
                  label="Volume"
                  size={LARGE_KNOB_SIZE}
                  valueIndex={volume}
                  onIndexChange={handleVolumeChange}
                  min={0}
                  max={79}
                  step={1}
                  valueSuffix="dB"
                  dialBaseImage={require("../../assets/images/dial-base.png")}
                  indicatorImage={require("../../assets/images/knob-indicator.png")}
                />
              </View>
              <View style={styles.knobRowApart}>
                <Knob
                  label="Bass"
                  size={SMALL_KNOB_SIZE}
                  valueIndex={bass}
                  onIndexChange={handleBassChange}
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
                  onIndexChange={handleTrebleChange}
                  min={-14}
                  max={14}
                  step={2}
                  valueSuffix="dB"
                  dialBaseImage={require("../../assets/images/dial-base.png")}
                  indicatorImage={require("../../assets/images/dial-indicator-red.png")}
                />
              </View>
              <View style={styles.knobRowCenter}>
                <Knob
                  label="Mid"
                  size={SMALL_KNOB_SIZE}
                  valueIndex={mid}
                  onIndexChange={handleMidChange}
                  min={-14}
                  max={14}
                  step={2}
                  valueSuffix="dB"
                  dialBaseImage={require("../../assets/images/dial-base.png")}
                  indicatorImage={require("../../assets/images/dial-indicator-green.png")}
                />
              </View>
            </View>

            {/* --- SWITCHES SECTION --- */}
            <View style={styles.switchesSection}>
              <SwitchControl
                label="Tone"
                value={tone}
                onValueChange={handleToneChange}
              />
              <SwitchControl
                label="Surround Enhance"
                value={surround}
                onValueChange={handleSurroundChange}
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
            frontLeft={frontLeft}
            setFrontLeft={handleFLChange}
            frontRight={frontRight}
            setFrontRight={handleFRChange}
            subwoofer={subwoofer}
            setSubwoofer={setSubwoofer} // No API call for subwoofer
            center={center}
            setCenter={handleCChange}
            rearLeft={rearLeft}
            setRearLeft={handleRLChange}
            rearRight={rearRight}
            setRearRight={handleRRChange}
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

// --- STYLES ---
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
    knobRowApart: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: "100%",
      paddingVertical: 10,
    },
    knobRowCenter: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      paddingVertical: 10,
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
