import AsyncStorage from "@react-native-async-storage/async-storage";
import { Preset } from "./database"; // Import the Preset type

// Use the preset_values type to define our settings structure
export type LastSettings = Preset["preset_values"];

// A constant for our storage key
const LAST_SETTINGS_KEY = "@AcousticOne:LastSettings";

/**
 * Saves the user's last settings to AsyncStorage.
 * @param settings The settings object to save.
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
 * @returns The settings object, or null if none are found or an error occurs.
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
