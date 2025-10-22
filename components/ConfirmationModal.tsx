import React, { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors"; // Import type

type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmButtonLabel: string;
  confirmButtonColor?: string; // Optional: for the delete button
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmButtonLabel,
  confirmButtonColor,
  onCancel,
  onConfirm,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);

  // Use the passed-in color, or default to the primary theme color
  const finalConfirmColor = confirmButtonColor || colors.primary;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: finalConfirmColor },
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmButtonLabel}</Text>
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
    confirmButton: {
      // backgroundColor is set inline
    },
    confirmButtonText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 16,
    },
  });
