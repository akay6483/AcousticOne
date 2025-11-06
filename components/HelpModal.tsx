import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// --- THEME IMPORTS ---
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";

// --- Import Types ---
import { Devices } from "../services/database";

// --- PROPS ---
type HelpModalProps = {
  visible: boolean;
  onClose: () => void;
  model: Devices;
};

// --- MAIN COMPONENT ---
export const HelpModal: React.FC<HelpModalProps> = ({
  visible,
  onClose,
  model,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getHelpModalStyles(colors), [colors]);

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
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Ionicons
              name="help-circle-outline"
              size={28}
              color={colors.icon}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              Connection Help
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.icon} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.stepTitle, { color: colors.primary }]}>
              Connection Steps: Direct Mode (SoftAP)
            </Text>

            <Text style={[styles.stepText, { color: colors.text }]}>
              1. **Power Cycle** your device (if necessary) to ensure it is
              broadcasting its Wi-Fi network.
            </Text>
            <Text style={[styles.stepText, { color: colors.text }]}>
              2. Go to your phone's Wi-Fi settings and find the device's
              network. The SSID and Password for the current model is displayed
              on the main screen.
            </Text>

            <Text style={[styles.stepText, { color: colors.text }]}>
              3. **Connect** to this network. Your phone may show "No Internet,"
              which is expected, as it is a local connection.
            </Text>
            <Text style={[styles.stepText, { color: colors.text }]}>
              4. Return to this app. The Status should update to "Connected"
              shortly.
            </Text>

            {/* --- New Section: Indirect/Infrastructure Mode --- */}

            <Text style={[styles.stepTitle, { color: colors.primary }]}>
              Connection Steps: Indirect Mode (STA)
            </Text>

            <Text style={[styles.stepText, { color: colors.text }]}>
              1. Ensure the device is **already configured** to connect to your
              home Wi-Fi network.
            </Text>
            <Text style={[styles.stepText, { color: colors.text }]}>
              2. Connect your phone to the **same home Wi-Fi network**.
            </Text>
            <Text style={[styles.stepText, { color: colors.text }]}>
              3. The app will attempt to **discover and connect** to the device
              automatically over your local network.
            </Text>
            <Text style={[styles.stepText, { color: colors.text }]}>
              4. If connection fails, check your router settings or ensure the
              device and phone are on the same subnet.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const getHelpModalStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.modalOverlay,
    },
    container: {
      height: "85%",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 10,
      borderBottomWidth: 1,
      marginBottom: 10,
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      // Reduced marginLeft from 32 to 0 so the title centers properly
      // when a help button is added to the left of it (in the tab bar).
      marginLeft: 0,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      paddingVertical: 10,
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginTop: 15,
      marginBottom: 8,
    },
    stepText: {
      fontSize: 15,
      lineHeight: 24,
      marginBottom: 4,
    },
  });
