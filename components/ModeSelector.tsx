// src/components/ModeSelector.tsx

import {
  AntDesign,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons"; // 👈 Import new libraries
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";

// --- TYPES ---
// Define the available icon libraries
type IconLibrary =
  | "Ionicons"
  | "AntDesign"
  | "MaterialIcons"
  | "MaterialCommunityIcons"
  | "FontAwesome5";

// Define the new data structure for modes
interface ModeData {
  label: string;
  icon: {
    library: IconLibrary;
    name: string; // Icon name as a string
  };
}
<MaterialCommunityIcons
  name="audio-input-stereo-minijack"
  size={24}
  color="black"
/>;
// -------------------------------------------------------------------
// --- 1. CONFIGURE YOUR MODES HERE ---
// You can now specify the library and icon name for each mode.
// -------------------------------------------------------------------
const MODES_DATA: ModeData[] = [
  {
    label: "AUX1",
    icon: {
      library: "MaterialCommunityIcons",
      name: "audio-input-stereo-minijack",
    },
  },
  {
    label: "AUX2",
    icon: { library: "MaterialCommunityIcons", name: "audio-input-rca" },
  },
  {
    label: "AUX3",
    icon: { library: "MaterialIcons", name: "settings-input-component" },
  },
  {
    label: "USB/BT",
    icon: { library: "AntDesign", name: "usb" },
  },
  {
    label: "5.1 Analogue",
    icon: { library: "MaterialCommunityIcons", name: "surround-sound-5-1" },
  },
];
// -------------------------------------------------------------------

// --- 2. DYNAMIC ICON COMPONENT ---
// This helper component renders the correct icon based on the 'library' prop
// -------------------------------------------------------------------
interface DynamicIconProps {
  library: IconLibrary;
  name: string;
  size: number;
  color: string;
  style?: object;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({
  library,
  name,
  size,
  color,
  style,
}) => {
  switch (library) {
    case "Ionicons":
      return (
        <Ionicons name={name as any} size={size} color={color} style={style} />
      );
    case "AntDesign":
      return (
        <AntDesign name={name as any} size={size} color={color} style={style} />
      );
    case "MaterialIcons":
      return (
        <MaterialIcons
          name={name as any}
          size={size}
          color={color}
          style={style}
        />
      );
    case "MaterialCommunityIcons":
      return (
        <MaterialCommunityIcons
          name={name as any}
          size={size}
          color={color}
          style={style}
        />
      );
    case "FontAwesome5":
      return (
        <FontAwesome5
          name={name as any}
          size={size}
          color={color}
          style={style}
        />
      );
    default:
      return null;
  }
};
// -------------------------------------------------------------------

// --- Styles (Unchanged, but renamed for clarity) ---
const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 20,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },
    content: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: 10,
    },
    modeSelectionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    modeOption: {
      alignItems: "center",
      paddingHorizontal: 5,
    },
    modeText: {
      fontSize: 12,
      fontWeight: "500",
      marginTop: 4,
      color: colors.text,
    },
    iconContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 24,
      width: 24,
      marginBottom: 2,
    },
    modeIcon: {
      // Style for the icon itself, if needed
    },
  });

// --- Component Props (Unchanged) ---
interface ModeSelectorProps {
  mode: string;
  onModeChange: (mode: string) => void;
}

// --- 3. MAIN COMPONENT (Updated to use DynamicIcon) ---
export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  onModeChange,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleModePress = (newMode: string) => {
    onModeChange(newMode);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Pressable
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.title}>Mode</Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={colors.text}
        />
      </Pressable>

      {/* Collapsible Content */}
      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.modeSelectionContainer}>
            {/* Map over the new MODES_DATA array */}
            {MODES_DATA.map((modeItem) => {
              const isSelected = modeItem.label === mode;
              return (
                <Pressable
                  key={modeItem.label}
                  style={styles.modeOption}
                  onPress={() => handleModePress(modeItem.label)}
                >
                  <View style={styles.iconContainer}>
                    {/* --- Use the new DynamicIcon component --- */}
                    <DynamicIcon
                      library={modeItem.icon.library}
                      name={modeItem.icon.name}
                      size={20}
                      color={isSelected ? colors.primary : colors.inactiveTint}
                      style={styles.modeIcon}
                    />
                  </View>
                  <Text
                    style={[
                      styles.modeText,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                  >
                    {modeItem.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};
