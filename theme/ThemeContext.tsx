import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors } from "./colors";

// 1. Define the types for the user's selection
export type ThemeMode = "auto" | "light" | "dark";
const STORAGE_KEY = "APP_THEME_MODE";

// 2. Define the shape of your context's value
type Theme = {
  isDark: boolean;
  colors: typeof lightColors;
  mode: ThemeMode; // The user's stored preference
  setMode: (mode: ThemeMode) => void; // Function to change the preference
};

const ThemeContext = createContext<Theme | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 3. Store the user's *preference* (e.g., 'auto')
  const [mode, setMode] = useState<ThemeMode>("auto");

  // 4. Get the *system's* theme
  const systemScheme = useColorScheme();

  // 5. Load the stored preference from storage on app launch
  useEffect(() => {
    const loadMode = async () => {
      try {
        const storedMode = (await AsyncStorage.getItem(
          STORAGE_KEY
        )) as ThemeMode;
        if (storedMode) {
          setMode(storedMode);
        }
      } catch (e) {
        console.error("Failed to load theme mode from storage", e);
      }
    };
    loadMode();
  }, []);

  // 6. Create the function to change and *save* the preference
  const updateMode = (newMode: ThemeMode) => {
    try {
      AsyncStorage.setItem(STORAGE_KEY, newMode);
      setMode(newMode);
    } catch (e) {
      console.error("Failed to save theme mode to storage", e);
    }
  };

  // 7. This is the core logic!
  // Determine if dark mode is *actually* active
  const isDark = useMemo(() => {
    if (mode === "auto") {
      return systemScheme === "dark";
    }
    return mode === "dark";
  }, [mode, systemScheme]);

  // 8. Memoize the final theme object
  const theme = useMemo(
    () => ({
      isDark,
      colors: isDark ? darkColors : lightColors,
      mode,
      setMode: updateMode,
    }),
    [isDark, mode]
  );

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

// Custom hook remains the same, but now returns the new shape
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
