import AsyncStorage from "@react-native-async-storage/async-storage";
import { Preset } from "./database"; // Import the Preset type
// Import ThemeMode type
import { ThemeMode } from "../theme/ThemeContext";

// Use the preset_values type to define our settings structure
export type LastSettings = Preset["preset_values"];

// --- NEW: Export ConnectionMode so it can be shared ---
export type ConnectionMode = "AP_MODE" | "NETWORK_MODE";

// --- Storage Keys ---
const LAST_SETTINGS_KEY = "@AcousticOne:LastSettings";
const HAPTICS_STORAGE_KEY = "@AcousticOne:HapticsEnabled";
const THEME_STORAGE_KEY = "APP_THEME_MODE";
const CONNECTION_MODE_KEY = "@AcousticOne:ConnectionMode";
const AUDIO_STORAGE_KEY = "@AcousticOne:AudioEnabled"; // --- NEW KEY ---

// --- Last Settings Functions (Unchanged) ---
/**
 * Saves the user's last settings to AsyncStorage.
 */
export const saveLastSettings = async (
  settings: LastSettings
): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(LAST_SETTINGS_KEY, jsonValue);
    console.log("Last settings saved successfully.");
  } catch (e) {
    console.error("Failed to save last settings to storage", e);
  }
};

/**
 * Loads the user's last settings from AsyncStorage.
 */
export const loadLastSettings = async (): Promise<LastSettings | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(LAST_SETTINGS_KEY);
    if (jsonValue != null) {
      const settings = JSON.parse(jsonValue) as LastSettings;
      console.log("Last settings loaded successfully.");
      return settings;
    }
    console.log("No last settings found.");
    return null;
  } catch (e) {
    console.error("Failed to load last settings from storage", e);
    return null;
  }
};

// --- Haptics Settings Functions (Unchanged) ---
/**
 * Saves the user's haptic preference to AsyncStorage.
 */
export const saveHapticsSetting = async (isEnabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(HAPTICS_STORAGE_KEY, JSON.stringify(isEnabled));
    console.log("Haptics setting saved successfully.");
  } catch (e) {
    console.error("Failed to save haptics setting to storage", e);
  }
};

/**
 * Loads the user's haptic preference from AsyncStorage.
 */
export const loadHapticsSetting = async (): Promise<boolean> => {
  try {
    const storedValue = await AsyncStorage.getItem(HAPTICS_STORAGE_KEY);
    if (storedValue !== null) {
      console.log("Haptics setting loaded successfully.");
      return JSON.parse(storedValue);
    }
    console.log("No haptics setting found, defaulting to true.");
    return true;
  } catch (e) {
    console.error("Failed to load haptics setting, defaulting to true.", e);
    return true;
  }
};

// --- Theme Settings Functions (Unchanged) ---

/**
 * Saves the user's theme preference to AsyncStorage.
 * @param mode The theme mode ('auto', 'light', or 'dark').
 */
export const saveThemeSetting = async (mode: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    console.log("Theme setting saved successfully.");
  } catch (e) {
    console.error("Failed to save theme setting to storage", e);
  }
};

/**
 * Loads the user's theme preference from AsyncStorage.
 * @returns The theme mode, defaulting to `'auto'` if not found.
 */
export const loadThemeSetting = async (): Promise<ThemeMode> => {
  try {
    const storedValue = (await AsyncStorage.getItem(
      THEME_STORAGE_KEY
    )) as ThemeMode;
    if (storedValue) {
      console.log("Theme setting loaded successfully.");
      return storedValue;
    }
    console.log("No theme setting found, defaulting to 'auto'.");
    return "auto";
  } catch (e) {
    console.error("Failed to load theme setting, defaulting to 'auto'.", e);
    return "auto";
  }
};

// --- Connection Mode Functions (Unchanged) ---

/**
 * Saves the user's last selected connection mode.
 */
export const saveConnectionMode = async (
  mode: ConnectionMode
): Promise<void> => {
  try {
    await AsyncStorage.setItem(CONNECTION_MODE_KEY, mode);
    console.log("Connection mode saved:", mode);
  } catch (e) {
    console.error("Failed to save connection mode to storage", e);
  }
};

/**
 * Loads the user's last selected connection mode.
 * @returns The theme mode, defaulting to `'AP_MODE'` if not found.
 */
export const loadConnectionMode = async (): Promise<ConnectionMode> => {
  try {
    const storedValue = (await AsyncStorage.getItem(
      CONNECTION_MODE_KEY
    )) as ConnectionMode;
    if (storedValue) {
      console.log("Connection mode loaded:", storedValue);
      return storedValue;
    }
    console.log("No connection mode found, defaulting to 'AP_MODE'.");
    return "AP_MODE";
  } catch (e) {
    console.error(
      "Failed to load connection mode, defaulting to 'AP_MODE'.",
      e
    );
    return "AP_MODE";
  }
};

// --- Audio Settings Functions (NEW) ---

/**
 * Saves the user's audio preference to AsyncStorage.
 */
export const saveAudioSetting = async (isEnabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(isEnabled));
    console.log("Audio setting saved successfully.");
  } catch (e) {
    console.error("Failed to save audio setting to storage", e);
  }
};

/**
 * Loads the user's audio preference from AsyncStorage.
 */
export const loadAudioSetting = async (): Promise<boolean> => {
  try {
    const storedValue = await AsyncStorage.getItem(AUDIO_STORAGE_KEY);
    if (storedValue !== null) {
      console.log("Audio setting loaded successfully.");
      return JSON.parse(storedValue);
    }
    console.log("No audio setting found, defaulting to true.");
    return true; // Default to true
  } catch (e) {
    console.error("Failed to load audio setting, defaulting to true.", e);
    return true;
  }
};
