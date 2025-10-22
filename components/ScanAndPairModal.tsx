import { useTheme } from "@/theme/ThemeContext"; // 👈 Using your project's alias
import { lightColors } from "@/theme/colors"; // 👈 Using your project's alias
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

// --- TYPE DEFINITIONS (from SRS/Class Diagram) ---
export type PASystem = {
  id: string; // Unique ID, e.g., MAC address
  name: string; // User-friendly name, e.g., "Living Room PA"
  ssid: string; // Network SSID
};

// --- MOCK DATA ---
const MOCK_AVAILABLE_SYSTEMS: PASystem[] = [
  { id: "3", name: "Garage PA", ssid: "AcousticsOne-GRG-5G" },
  { id: "4", name: "Basement System", ssid: "AcousticsOne-BSMT-2.4G" },
  { id: "1", name: "Living Room Speaker", ssid: "AcousticsOne-LR-5G" },
];

// --- MODAL COMPONENT (UC-01: Wireless Connect) ---
interface ScanModalProps {
  visible: boolean;
  onClose: () => void;
  onPairSuccess: (system: PASystem) => void;
  pairedSystemIds: string[];
}

export const ScanAndPairModal: React.FC<ScanModalProps> = ({
  visible,
  onClose,
  onPairSuccess,
  pairedSystemIds,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors, isDark]);

  const [isScanning, setIsScanning] = useState(false);
  const [availableSystems, setAvailableSystems] = useState<PASystem[]>([]);

  // Simulates scanning for devices
  const handleScan = (scanEnabled: boolean) => {
    if (scanEnabled) {
      setIsScanning(true);
      console.log("Scanning for systems...");

      // Simulate network delay (fulfills SRS "scan within 20s")
      setTimeout(() => {
        // Filter out systems that are *already* paired
        const newSystems = MOCK_AVAILABLE_SYSTEMS.filter(
          (s) => !pairedSystemIds.includes(s.id)
        );
        setAvailableSystems(newSystems);
        setIsScanning(false);
        console.log("Scan complete.");
      }, 2000);
    } else {
      setIsScanning(false);
      setAvailableSystems([]);
    }
  };

  // Simulates pairing (fulfills SRS "secure pairing process")
  const handleSelectSystem = (system: PASystem) => {
    Alert.alert(
      "Pair System",
      `A PIN will be displayed on ${system.name}. Please enter it here.`,
      [
        { text: "Cancel", style: "cancel" },
        // This would open a text input, but we'll simulate success
        {
          text: "Pair",
          onPress: () => {
            console.log("Pairing successful:", system.name);
            onPairSuccess(system); // Send paired system back to main screen
          },
        },
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Find System
            </Text>
            <Switch
              trackColor={{ false: colors.inactiveTint, true: colors.primary }}
              thumbColor={colors.thumbColor}
              onValueChange={handleScan}
              value={isScanning}
            />
          </View>
          <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
            Available PA Systems nearby
          </Text>

          {/* Device List */}
          <FlatList
            data={availableSystems}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyListContainer}>
                {isScanning ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text
                    style={[styles.emptyListText, { color: colors.textMuted }]}
                  >
                    No new systems found. (UC-01 / E1)
                  </Text>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                style={styles.deviceItem}
                onPress={() => handleSelectSystem(item)}
              >
                <Ionicons name="wifi" size={22} color={colors.icon} />
                <Text style={[styles.deviceItemText, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>
            )}
          />

          {/* Footer Button */}
          <Pressable
            style={[styles.modalButton, { backgroundColor: colors.background }]}
            onPress={onClose}
          >
            <Text style={[styles.modalButtonText, { color: colors.text }]}>
              Close
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// --- STYLESHEET ---
const getModalStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    // Modal Styles
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      paddingBottom: 32, // Extra padding for home bar
      maxHeight: "75%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 8,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
    },
    modalSubtitle: {
      fontSize: 14,
      marginTop: 4,
      marginBottom: 20,
      paddingHorizontal: 8,
    },
    deviceItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 8,
      gap: 16,
    },
    deviceItemText: {
      flex: 1, // Pushes lock icon to the end
      fontSize: 16,
    },
    emptyListContainer: {
      padding: 20,
      alignItems: "center",
    },
    emptyListText: {
      fontSize: 14,
    },
    modalButton: {
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginTop: 16,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
  });
