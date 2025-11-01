import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
// --- Import react-native-wifi-reborn ---
import WifiManager, { WifiEntry } from "react-native-wifi-reborn";
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";

// --- TYPE DEFINITION ---
export type ScannedSystem = {
  id: string; // BSSID (MAC Address)
  name: string; // User-friendly name (SSID initially)
  ssid: string; // Network SSID
};

// --- MODAL COMPONENT ---
interface ScanModalProps {
  visible: boolean;
  onClose: () => void;
  onPairSuccess: (system: ScannedSystem) => void;
  pairedSystemIds: string[];
  ssidPrefixes: string[] | null;
}

export const ScanAndPairModal: React.FC<ScanModalProps> = ({
  visible,
  onClose,
  onPairSuccess,
  pairedSystemIds,
  ssidPrefixes,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors, isDark]);

  const [isScanning, setIsScanning] = useState(false);
  const [availableSystems, setAvailableSystems] = useState<ScannedSystem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectingSystemId, setConnectingSystemId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!visible) {
      setIsScanning(false);
      setAvailableSystems([]);
      setError(null);
      setConnectingSystemId(null);
    }
  }, [visible]);

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
    return true;
  };

  const handleScan = useCallback(
    async (scanEnabled: boolean) => {
      if (!scanEnabled) {
        setIsScanning(false);
        setAvailableSystems([]);
        setError(null);
        return;
      }

      setIsScanning(true);
      setError(null);
      setAvailableSystems([]);

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError("Location permission is required to scan for networks.");
        setIsScanning(false);
        return;
      }

      try {
        const wifiListResult: WifiEntry[] | unknown =
          await WifiManager.reScanAndLoadWifiList();

        // --- 👇 CRITICAL BUG FIX (More Robust) ---
        // Check if the result is actually an array before filtering
        if (!Array.isArray(wifiListResult)) {
          // Check if it's the Android throttle error
          if (
            typeof wifiListResult === "string" &&
            wifiListResult.includes("4 times per 2 minuts")
          ) {
            console.error("Android WiFi scan throttled:", wifiListResult);
            throw new Error(
              "Android scan limit reached. Please wait 2 minutes."
            );
          }
          // Otherwise, it's some other invalid data
          console.error("wifiListResult is not an array:", wifiListResult);
          throw new Error("Invalid data received from WiFi scan.");
        }
        // --- END OF BUG FIX ---

        const wifiList: WifiEntry[] = wifiListResult as WifiEntry[]; // Now safe to use

        const newSystems = wifiList
          .filter((entry) => {
            const hasMatchingPrefix =
              ssidPrefixes === null
                ? true
                : ssidPrefixes.some((prefix) => entry.SSID.startsWith(prefix));

            const isHiddenSSID =
              entry.SSID === "(hidden SSID)" || entry.SSID === "";

            if (ssidPrefixes === null && isHiddenSSID) {
              return !pairedSystemIds.includes(entry.BSSID);
            }

            const isAlreadyPaired = pairedSystemIds.includes(entry.BSSID);
            return hasMatchingPrefix && !isAlreadyPaired && !isHiddenSSID;
          })
          .map(
            (entry): ScannedSystem => ({
              id: entry.BSSID,
              name: entry.SSID,
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
    [pairedSystemIds, ssidPrefixes]
  );

  useEffect(() => {
    if (visible) {
      handleScan(true);
    }
  }, [visible, handleScan]);

  const handleSelectSystem = (system: ScannedSystem) => {
    if (connectingSystemId) return;

    const connect = async (password: string) => {
      setConnectingSystemId(system.id);
      try {
        // 1. Attempt to connect
        await WifiManager.connectToProtectedSSID(
          system.ssid,
          password,
          false // isWEP
        );

        // 2. Force usage for Android (no internet)
        if (Platform.OS === "android") {
          await WifiManager.forceWifiUsageWithOptions(true, {
            noInternet: true,
          });
        }

        // 3. Alert user
        Alert.alert("Success", `Successfully connected to ${system.name}.`);

        // 4. Call onPairSuccess to trigger save in device.tsx
        onPairSuccess(system);
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

    Alert.prompt(
      "Enter Password",
      `Enter the password for ${system.name}\n(Default: "PrasadDigital")`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Connect",
          onPress: (password) => {
            connect(password || "PrasadDigital");
          },
        },
      ],
      Platform.OS === "ios" ? "secure-text" : "plain-text",
      "PrasadDigital"
    );
  };

  const renderEmptyState = () => {
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
          No networks found. Ensure the device is on.
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

// --- STYLESHEET (Unchanged) ---
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
