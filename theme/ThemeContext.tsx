import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors } from "./colors";
// --- 1. IMPORT all storage functions ---
import {
  loadHapticsSetting,
  loadThemeSetting,
  saveHapticsSetting,
  saveThemeSetting,
} from "../services/storage"; // Assuming storage.ts is in ../services/

// Define the types for the user's selection
export type ThemeMode = "auto" | "light" | "dark";
// const THEME_STORAGE_KEY = "APP_THEME_MODE"; // --- REMOVED (now in storage.ts)

// Define the shape of your context's value
type Theme = {
  isDark: boolean;
  colors: typeof lightColors;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isHapticsEnabled: boolean;
  setHapticsEnabled: (isEnabled: boolean) => void;
};

const ThemeContext = createContext<Theme | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("auto");
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(true);

  const systemScheme = useColorScheme();

  // Load all stored preferences from storage on app launch
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // --- 2. MODIFIED: Load Theme via storage function ---
        const storedMode = await loadThemeSetting();
        setMode(storedMode);

        // Load Haptics
        const haptics = await loadHapticsSetting();
        setIsHapticsEnabled(haptics);
      } catch (e) {
        console.error("Failed to load settings from storage", e);
      }
    };
    loadSettings();
  }, []);

  // --- 3. MODIFIED: Function to save theme setting via storage function ---
  const updateMode = (newMode: ThemeMode) => {
    saveThemeSetting(newMode); // Save to storage
    setMode(newMode); // Update state
  };

  // Function to save haptics setting via storage function
  const updateHaptics = (isEnabled: boolean) => {
    saveHapticsSetting(isEnabled); // Save to storage
    setIsHapticsEnabled(isEnabled); // Update state
  };

  // Determine if dark mode is *actually* active
  const isDark = useMemo(() => {
    if (mode === "auto") {
      return systemScheme === "dark";
    }
    return mode === "dark";
  }, [mode, systemScheme]);

  // Memoize the final theme object
  const theme = useMemo(
    () => ({
      isDark,
      colors: isDark ? darkColors : lightColors,
      mode,
      setMode: updateMode,
      isHapticsEnabled,
      setHapticsEnabled: updateHaptics,
    }),
    [isDark, mode, isHapticsEnabled]
  );

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

// Custom hook remains the same
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
