import AsyncStorage from "@react-native-async-storage/async-storage";
import { Preset } from "./database"; // Import the Preset type
// Import ThemeMode type
import { ThemeMode } from "../theme/ThemeContext";

// Use the preset_values type to define our settings structure
export type LastSettings = Preset["preset_values"];

// --- Storage Keys ---
const LAST_SETTINGS_KEY = "@AcousticOne:LastSettings";
const HAPTICS_STORAGE_KEY = "@AcousticOne:HapticsEnabled";
const THEME_STORAGE_KEY = "APP_THEME_MODE"; // --- ADDED ---

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

// --- Theme Settings Functions (NEW) ---

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
