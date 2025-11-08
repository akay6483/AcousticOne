import { FontAwesome, Ionicons } from "@expo/vector-icons";
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
  // Styles are now inspired by PresetModal
  const styles = useMemo(() => getModalStyles(colors), [colors]);

  const renderModelItem = (model: Devices) => {
    const isSelected = selectedModel?.modelCode === model.modelCode;

    return (
      <TouchableOpacity
        key={model.modelCode}
        style={[
          styles.listItemContainer, // Uses border-bottom like PresetModal
          { borderBottomColor: colors.border },
        ]}
        onPress={() => onSelectModel(model)}
      >
        {/* Model Name - Styled based on selection */}
        <Text
          style={[
            styles.modelName,
            isSelected && styles.modelNameActive, // Use active style
          ]}
        >
          {model.modelName}
        </Text>

        {/* --- CHECKMARK REMOVED --- */}
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
            <FontAwesome name="exchange" size={20} color={colors.icon} />
            <Text style={styles.title}>Model</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.icon} />
            </Pressable>
          </View>

          {/* --- List Container (Consistent with PresetModal) --- */}
          <View
            style={[
              styles.listContainer, // This wrapper now has the card style
              { backgroundColor: colors.card },
            ]}
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

// --- STYLES (Copied from PresetModal.tsx for consistency) ---
const getModalStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.modalOverlay,
    },
    container: {
      height: "85%", // Matches PresetModal height
      backgroundColor: colors.modalBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    // --- Header Styles ---
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 10,
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
    // --- List Styles (Copied from PresetModal) ---
    listContainer: {
      flex: 1,
      backgroundColor: colors.card, // The list is on a card
      borderRadius: 12,
      marginTop: 20, // Space from header
      overflow: "hidden", // Ensures list scrolls within container
    },
    listContent: {
      paddingVertical: 0, // List items handle their own padding
    },
    listItemContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1, // This is the separator
      // borderBottomColor is passed inline
      paddingVertical: 16,
      paddingHorizontal: 15, // Match preset item padding
    },
    modelName: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "500",
      flex: 1,
    },
    modelNameActive: {
      color: colors.primary, // Selection color
      fontWeight: "700", // Selection weight
    },
  });
