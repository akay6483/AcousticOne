// src/components/ModeSelector.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";

// --- TYPES (from ModeModal) ---
// Define the available modes
const MODES = ["AUX1", "AUX2", "AUX3", "USB/BT", "5.1 Analogue"]; //

// --- Styles ---
const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    // This is the main container, styled like the knobsSection
    container: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 20, // Add space from the button row above
      overflow: "hidden", // Ensures content stays within rounded corners
    },
    // The pressable header bar
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
    // This is the content area that expands/collapses
    content: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: 10, // Add some padding at the bottom
    },
    // --- Styles copied from ModeModal ---
    modeSelectionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      paddingVertical: 10,
      paddingHorizontal: 15, // Added horizontal padding
    }, //
    modeOption: {
      alignItems: "center",
      paddingHorizontal: 5,
    }, //
    modeText: {
      fontSize: 12,
      fontWeight: "500",
      marginTop: 4,
      color: colors.text,
    }, //
    starContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    }, //
    starIcon: {
      marginHorizontal: 2,
    }, //
  });

// --- NEW PROPS ---
interface ModeSelectorProps {
  mode: string;
  onModeChange: (mode: string) => void;
}

// --- Component ---
export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  onModeChange,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  // State to manage if the dropdown is open
  const [isExpanded, setIsExpanded] = useState(false);

  const handleModePress = (newMode: string) => {
    onModeChange(newMode);
    // You might want to close the dropdown on selection
    // setIsExpanded(false);
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
            {MODES.map((modeOption) => {
              const isSelected = modeOption === mode; // Use prop 'mode'
              return (
                <Pressable
                  key={modeOption}
                  style={styles.modeOption}
                  onPress={() => handleModePress(modeOption)} // Use handler
                >
                  <View style={styles.starContainer}>
                    <Ionicons
                      name="star"
                      size={20}
                      color={isSelected ? colors.primary : colors.inactiveTint}
                      style={styles.starIcon}
                    />
                  </View>
                  <Text
                    style={[
                      styles.modeText,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                  >
                    {modeOption}
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
