import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";

// --- Import SSDP and NetInfo ---
import NetInfo from "@react-native-community/netinfo";
import { Client as SsdpClient } from "react-native-ssdp";

// This is a temporary type for a device found on the network
export type DiscoveredSystem = {
  id: string; // Use IP address as the ID
  name: string; // The "modelName" from the device
  ipAddress: string;
};

interface NetworkConnectModalProps {
  visible: boolean;
  onClose: () => void;
  // This callback will pass the IP and Name of the device to connect to
  onConnectPress: (ipAddress: string, name: string) => void;
}

export const NetworkConnectModal: React.FC<NetworkConnectModalProps> = ({
  visible,
  onClose,
  onConnectPress,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundSystems, setFoundSystems] = useState<DiscoveredSystem[]>([]);

  // The main SSDP discovery logic
  const handleScan = useCallback(async () => {
    // Check if phone is on WiFi first
    const netState = await NetInfo.fetch();
    if (netState.type !== "wifi" || !netState.details?.ipAddress) {
      setError("Please connect to your home WiFi network first.");
      return;
    }

    setIsScanning(true);
    setError(null);
    setFoundSystems([]);

    // Create a new SSDP client
    const client = new SsdpClient({
      // Provide the phone's IP to scan the correct subnet
      explicitSocketBind: true,
      bindAddress: netState.details.ipAddress,
    });

    // This is the "Search Target" the device responds to.
    // "ssdp:all" is broad but will find your device.
    const searchTarget = "ssdp:all";

    client.on("response", (headers: SsdpHeaders, statusCode: number) => {
      // We found a device. Now we check if it's ours.
      const location = headers.LOCATION || "";
      const server = headers.SERVER || "";
      const st = headers.ST || "";

      // Your .ino file sets ModelName to "PE PRO Digital 5.1 Amplifier"
      // We can look for this in the "SERVER" header or create a more
      // specific search target if needed. This is a good starting point.
      if (server.includes("PE PRO")) {
        // Extract IP from LOCATION URL (e.g., http://192.168.1.55:80/...)
        try {
          const url = new URL(location);
          const ipAddress = url.hostname;
          const system: DiscoveredSystem = {
            id: ipAddress,
            ipAddress: ipAddress,
            name: server.split("/")[0].trim(), // "PE PRO Digital 5.1 Amplifier"
          };

          // Add to list, ensuring no duplicates
          setFoundSystems((prev) => {
            if (prev.find((s) => s.id === system.id)) return prev;
            return [...prev, system];
          });
        } catch (e) {
          console.error("Failed to parse SSDP location:", e);
        }
      }
    });

    client.search(searchTarget);

    // Stop scanning after 5 seconds
    setTimeout(() => {
      setIsScanning(false);
      client.stop();
      if (foundSystems.length === 0) {
        setError("No amplifier systems found on this network.");
      }
    }, 5000);
  }, []);

  // Scan automatically when the modal opens
  useEffect(() => {
    if (visible) {
      handleScan();
    } else {
      // Clear list when modal is closed
      setFoundSystems([]);
      setIsScanning(false);
      setError(null);
    }
  }, [visible, handleScan]);

  const renderEmptyState = () => {
    if (isScanning) {
      return (
        <View style={styles.emptyListContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.emptyListText, { marginTop: 10 }]}>
            Scanning for devices on your network...
          </Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.emptyListContainer}>
          <Text style={[styles.emptyListText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyListContainer}>
        <Text style={[styles.emptyListText, { color: colors.textMuted }]}>
          No devices found.
        </Text>
      </View>
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
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Network Connect
            </Text>
            <Pressable
              style={styles.refreshButton}
              onPress={() => handleScan()}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons
                  name="refresh"
                  size={24}
                  color={isScanning ? colors.inactiveTint : colors.icon}
                />
              )}
            </Pressable>
          </View>

          {/* Device List */}
          <FlatList
            data={foundSystems}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyState}
            renderItem={({ item }) => (
              <Pressable
                style={styles.deviceItem}
                onPress={() => onConnectPress(item.ipAddress, item.name)}
              >
                <Ionicons
                  name="md-disc-outline"
                  size={24}
                  color={colors.icon}
                />
                <View style={styles.deviceItemInfo}>
                  <Text style={styles.deviceItemText}>{item.name}</Text>
                  <Text style={styles.deviceItemSubText}>{item.ipAddress}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
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

// --- STYLESHEET (Similar to ScanAndPairModal) ---
const getModalStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      paddingBottom: 32,
      height: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 8,
      marginBottom: 12,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
    },
    refreshButton: {
      padding: 4,
      justifyContent: "center",
      alignItems: "center",
    },
    deviceItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      marginVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    deviceItemInfo: {
      flex: 1,
      marginLeft: 16,
    },
    deviceItemText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    deviceItemSubText: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    emptyListContainer: {
      padding: 20,
      alignItems: "center",
      marginTop: 20,
    },
    emptyListText: {
      fontSize: 14,
      textAlign: "center",
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
