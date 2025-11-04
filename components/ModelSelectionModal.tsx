import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- THEME IMPORTS ---
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";

// --- Import Types ---
import { Devices } from "../services/database";

// --- PROPS ---
type ModelSelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  models: Devices[]; // All available models from the DB
  selectedModel: Devices | null;
  onSelectModel: (model: Devices) => void;
};

// --- MAIN COMPONENT ---
export const ModelSelectionModal: React.FC<ModelSelectionModalProps> = ({
  visible,
  onClose,
  models,
  selectedModel,
  onSelectModel,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);

  const renderModelItem = (model: Devices) => {
    const isSelected = selectedModel?.modelCode === model.modelCode;

    return (
      <TouchableOpacity
        key={model.modelCode}
        style={[
          styles.listItemContainer,
          { borderBottomColor: colors.border, marginLeft: 0 }, // Removed margin to span full width
        ]}
        onPress={() => onSelectModel(model)}
      >
        {/* Model Name - Styled based on selection */}
        <Text
          style={[
            styles.modelName,
            {
              color: isSelected ? colors.primary : colors.text,
              fontWeight: isSelected ? "700" : "500", // Bold if selected
            },
          ]}
        >
          {model.modelName}
        </Text>

        {/* Checkmark icon on the right */}
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.modalBackground },
          ]}
        >
          {/* --- Header (Consistent with PresetModal) --- */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <MaterialCommunityIcons
              name="format-list-bulleted-square" // Icon similar to preset-screenshot.jpg
              size={25}
              color={colors.icon}
              style={styles.headerIcon}
            />
            <Text style={styles.title}>Model</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.icon} />
            </Pressable>
          </View>

          {/* --- List Container (Consistent with PresetModal) --- */}
          <View
            style={[styles.listContainer, { backgroundColor: colors.card }]}
          >
            <ScrollView contentContainerStyle={styles.listContent}>
              {models.map(renderModelItem)}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- STYLES (Updated for PresetModal consistency) ---
const getModalStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.modalOverlay,
    },
    container: {
      height: "80%", // Matches PresetModal height
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    // --- Header Styles ---
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 10, // Increased padding to match PresetModal header height
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerIcon: {
      padding: 4,
      width: 32,
    },
    title: {
      flex: 1,
      textAlign: "center",
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
    },
    closeButton: {
      padding: 4,
      width: 32,
    },
    // --- List Styles (Modified to match PresetModal list view) ---
    listContainer: {
      flex: 1,
      borderRadius: 12,
      marginTop: 10,
      overflow: "hidden",
      backgroundColor: colors.card, // Set BG to card color
    },
    listContent: {
      paddingVertical: 0, // List items handle their own padding
    },
    listItemContainer: {
      flexDirection: "row",
      alignItems: "center",
      // Match PresetModal item padding
      paddingHorizontal: 15,
      paddingVertical: 15,
      borderBottomWidth: 1,
      // The border color is passed inline
    },
    modelName: {
      fontSize: 18, // Matches PresetModal text size
      flex: 1,
    },
  });
