import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable, // 👈 Switch removed, Pressable kept
  StyleSheet,
  // Switch, // 👈 Removed
  Text,
  View,
} from "react-native";
// --- Import react-native-wifi-reborn ---
import WifiManager, { WifiEntry } from "react-native-wifi-reborn";
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";

// --- UPDATED TYPE DEFINITION (matches simplified Device, without modelCode) ---
export type ScannedSystem = {
  id: string; // BSSID (MAC Address)
  name: string; // User-friendly name (SSID initially)
  ssid: string; // Network SSID
};
// --- END OF UPDATE ---

// --- MODAL COMPONENT (UC-01: Wireless Connect) ---
interface ScanModalProps {
  visible: boolean;
  onClose: () => void;
  onPairSuccess: (system: ScannedSystem) => void; // Uses the updated type
  pairedSystemIds: string[];
  ssidPrefixes: string[] | null; // 👈 New prop for filtering
}

export const ScanAndPairModal: React.FC<ScanModalProps> = ({
  visible,
  onClose,
  onPairSuccess,
  pairedSystemIds,
  ssidPrefixes, // 👈 Destructure the new prop
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors, isDark]);

  const [isScanning, setIsScanning] = useState(false);
  const [availableSystems, setAvailableSystems] = useState<ScannedSystem[]>([]); // Uses updated type
  const [error, setError] = useState<string | null>(null);
  const [connectingSystemId, setConnectingSystemId] = useState<string | null>(
    null
  );

  /**
   * Clears state when the modal is closed.
   */
  useEffect(() => {
    if (!visible) {
      setIsScanning(false);
      setAvailableSystems([]);
      setError(null);
      setConnectingSystemId(null);
    }
  }, [visible]);

  /**
   * Requests Android location permissions, required for WiFi scanning.
   */
  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission Required",
            message:
              "This app needs location access to scan for WiFi networks.",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS doesn't require this
  };

  /**
   * Scans for WiFi networks, filters for amplifier systems, and updates state.
   */
  const handleScan = useCallback(
    async (scanEnabled: boolean) => {
      // This function is now only called with `true`
      if (!scanEnabled) {
        // Clear list if scan is "cancelled" (though not used)
        setIsScanning(false);
        setAvailableSystems([]);
        setError(null);
        return;
      }

      setIsScanning(true);
      setError(null);
      setAvailableSystems([]);

      // 1. Check permissions
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError("Location permission is required to scan for networks.");
        setIsScanning(false);
        return;
      }

      // 2. Load WiFi list
      try {
        const wifiList: WifiEntry[] = await WifiManager.loadWifiList();

        // --- UPDATED FILTER LOGIC ---
        const newSystems = wifiList
          .filter((entry) => {
            // 1. Prefix Check
            const hasMatchingPrefix =
              ssidPrefixes === null // Test mode: show all
                ? true
                : ssidPrefixes.some(
                    (
                      prefix // Production mode: check list
                    ) => entry.SSID.startsWith(prefix)
                  );

            // 2. Paired Check (Same as before)
            const isAlreadyPaired = pairedSystemIds.includes(entry.BSSID);

            return hasMatchingPrefix && !isAlreadyPaired;
          })
          // --- END OF UPDATE ---
          .map(
            (entry): ScannedSystem => ({
              id: entry.BSSID,
              name: entry.SSID, // Default name to SSID
              ssid: entry.SSID,
            })
          );

        if (newSystems.length === 0) {
          setError("No new systems found. Try refreshing.");
        }
        setAvailableSystems(newSystems);
      } catch (err: any) {
        console.error("Failed to load WiFi list:", err);
        setError(
          err.message || "An error occurred while scanning for networks."
        );
      } finally {
        setIsScanning(false);
      }
    },
    [pairedSystemIds, ssidPrefixes] // 👈 Add new dependency
  );

  // --- 👇 NEW: Scan automatically when modal opens ---
  useEffect(() => {
    if (visible) {
      handleScan(true);
    }
  }, [visible, handleScan]); // Run when modal becomes visible

  /**
   * Attempts to connect to the selected system.
   * This logic remains the same and will work for test networks.
   */
  const handleSelectSystem = (system: ScannedSystem) => {
    if (connectingSystemId) return; // Already connecting

    const connect = async (password: string) => {
      setConnectingSystemId(system.id);
      try {
        // Attempt to connect.
        await WifiManager.connectToProtectedSSID(
          system.ssid,
          password,
          false // isWEP
        );

        // --- Android "No Internet" Handling ---
        if (Platform.OS === "android") {
          await WifiManager.forceWifiUsageWithOptions(true, {
            noInternet: true,
          });
        }

        Alert.alert("Success", `Successfully connected to ${system.name}.`);
        onPairSuccess(system); // Send simplified system back to device.tsx
      } catch (err: any) {
        console.error("Failed to connect:", err);
        Alert.alert(
          "Connection Failed",
          "Please check the password and try again."
        );
      } finally {
        setConnectingSystemId(null);
      }
    };

    // --- Password Prompt ---
    Alert.prompt(
      "Enter Password",
      `Enter the password for ${system.name}\n(Default: "PrasadDigital")`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Connect",
          onPress: (password) => {
            // Use default password if user submits empty string
            connect(password || "PrasadDigital");
          },
        },
      ],
      Platform.OS === "ios" ? "secure-text" : "plain-text", // Use secure-text on iOS
      "PrasadDigital" // Default value from your .ino file
    );
  };

  // --- Render logic (no changes) ---
  const renderEmptyState = () => {
    // ... (no changes needed here) ...
    if (isScanning) {
      return (
        <View style={styles.emptyListContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.emptyListText, { marginTop: 10 }]}>
            Scanning...
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
          Toggle the switch to scan for systems.
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
          {/* --- 👇 HEADER UPDATED --- */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Connect
            </Text>
            <Pressable
              style={styles.refreshButton}
              onPress={() => handleScan(true)}
              disabled={isScanning || !!connectingSystemId}
            >
              {isScanning ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons
                  name="refresh"
                  size={24}
                  color={
                    isScanning || !!connectingSystemId
                      ? colors.inactiveTint
                      : colors.icon
                  }
                />
              )}
            </Pressable>
          </View>
          {/* --- 👆 END OF HEADER UPDATE --- */}

          {/* --- 👇 SUBTITLE REMOVED --- */}
          {/* <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
            Available PA Systems nearby
          </Text> 
          */}
          {/* --- 👆 END OF REMOVAL --- */}

          {/* Device List */}
          <FlatList
            data={availableSystems}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyState}
            renderItem={({ item }) => {
              const isConnecting = connectingSystemId === item.id;
              return (
                <Pressable
                  style={[
                    styles.deviceItem,
                    isConnecting && styles.deviceItemSelected,
                  ]}
                  onPress={() => handleSelectSystem(item)}
                  disabled={!!connectingSystemId}
                >
                  <Ionicons
                    name="wifi"
                    size={24}
                    color={isConnecting ? colors.primary : colors.icon}
                  />
                  <View style={styles.deviceItemInfo}>
                    <Text
                      style={[
                        styles.deviceItemText,
                        isConnecting && styles.deviceItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {/* --- Display BSSID (id) instead of serial --- */}
                    <Text style={styles.deviceItemSubText}>{item.id}</Text>
                  </View>
                  {isConnecting ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={colors.textMuted}
                    />
                  )}
                </Pressable>
              );
            }}
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

// --- STYLESHEET (Updated) ---
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
      height: "80%", // Keep 80% height
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 8,
      marginBottom: 12, // 👈 Added margin to replace subtitle
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
    },
    // --- 👇 REFRESH BUTTON STYLE ---
    refreshButton: {
      padding: 4, // Hitbox
      justifyContent: "center",
      alignItems: "center",
    },
    // --- 👆 END OF NEW STYLE ---
    // --- 👇 SUBTITLE REMOVED ---
    // modalSubtitle: { ... },
    // --- 👆 END OF REMOVAL ---

    // MIUI-inspired styles
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
    deviceItemSelected: {
      backgroundColor: colors.card,
      borderColor: colors.primary,
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
    deviceItemTextSelected: {
      color: colors.primary,
    },
    deviceItemSubText: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    // ---
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
