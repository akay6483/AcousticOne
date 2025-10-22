import React, { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors"; // Import type

type LoadConfirmationModalProps = {
  visible: boolean;
  presetName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export const LoadDialogueModal: React.FC<LoadConfirmationModalProps> = ({
  visible,
  presetName,
  onCancel,
  onConfirm,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Load Preset?</Text>
          <Text style={styles.message}>
            Are you sure you want to load "{presetName}"? Any unsaved changes
            will be lost.
          </Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.loadButton]}
              onPress={onConfirm}
            >
              <Text style={styles.loadButtonText}>Load</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getModalStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    container: {
      width: "85%",
      backgroundColor: colors.modalBackground,
      borderRadius: 12,
      padding: 20,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 10,
    },
    message: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: 20,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      marginHorizontal: 5,
    },
    cancelButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 16,
    },
    loadButton: {
      backgroundColor: colors.primary, // Use primary color
    },
    loadButtonText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 16,
    },
  });
