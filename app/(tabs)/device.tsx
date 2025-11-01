import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Network from "expo-network";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusCard } from "../../components/StatusCard";
import {
  addDevice,
  deleteDevice,
  Device,
  getDevices,
  updateDeviceModelCode,
} from "../../services/database";
import {
  getLastConnectedDeviceID,
  storeLastConnectedDeviceID,
} from "../../services/storage";
import { lightColors } from "../../theme/colors";
import { useTheme } from "../../theme/ThemeContext";

type ConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "error"
  | "connected (manual)"
  | "connected (last)";

export default function DeviceScreen(): JSX.Element {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedSystem, setConnectedSystem] = useState<Device | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [loading, setLoading] = useState<boolean>(true);

  /* --- Load Devices from DB --- */
  const loadDevices = useCallback(async (): Promise<Device[]> => {
    try {
      const list = await getDevices();
      setDevices(list);
      return list;
    } catch (err) {
      console.warn("Error loading devices:", err);
      return [];
    }
  }, []);

  /* --- Detect and Sync Device --- */
  const detectAndSyncDevice = useCallback(async (): Promise<void> => {
    try {
      setConnectionStatus("connecting");

      const networkState = await Network.getNetworkStateAsync();
      const ssid =
        (networkState.details as { ssid?: string })?.ssid ?? "<unknown ssid>";

      if (!ssid || ssid === "<unknown ssid>") {
        // Load last connected device if available
        const lastId = await getLastConnectedDeviceID();
        if (lastId) {
          const existing = (await getDevices()).find((d) => d.id === lastId);
          if (existing) {
            setConnectedSystem(existing);
            setConnectionStatus("connected (last)");
            return;
          }
        }

        setConnectedSystem(null);
        setConnectionStatus("disconnected");
        return;
      }

      console.log("📡 Connected SSID:", ssid);

      // Match known device naming pattern
      const match = ssid.match(/(PE|ACOUSTIC|PRO)\s?(\w+)/i);
      if (!match) {
        setConnectionStatus("disconnected");
        setConnectedSystem(null);
        return;
      }

      const modelCode = match[2];
      const deviceId = modelCode.toUpperCase();
      const newDevice: Device = {
        id: deviceId,
        name: ssid,
        ssid,
        modelCode,
      };

      const existingDevices = await loadDevices();
      const existing = existingDevices.find((d) => d.id === deviceId);

      if (!existing) {
        await addDevice(newDevice);
        console.log("🆕 Device added:", newDevice.name);
      } else {
        await updateDeviceModelCode(deviceId, modelCode);
      }

      setConnectedSystem(newDevice);
      setConnectionStatus("connected");
      await storeLastConnectedDeviceID(newDevice.id);
      setDevices(await loadDevices());
    } catch (err) {
      console.warn("WiFi detection error:", err);
      setConnectionStatus("error");
    }
  }, [loadDevices]);

  /* --- Initial Load --- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadDevices();
      await detectAndSyncDevice();
      setLoading(false);
    })();
  }, [loadDevices, detectAndSyncDevice]);

  /* --- Delete Device --- */
  const handleDeleteDevice = async (id: string): Promise<void> => {
    Alert.alert("Remove Device", "Do you want to remove this device?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await deleteDevice(id);
          setDevices(await loadDevices());
          if (connectedSystem?.id === id) {
            setConnectedSystem(null);
            setConnectionStatus("disconnected");
          }
        },
      },
    ]);
  };

  /* --- Render --- */
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* --- STATUS CARD --- */}
      <StatusCard
        connectionStatus={connectionStatus}
        connectedSystem={connectedSystem}
        onRefresh={detectAndSyncDevice}
      />

      {/* --- DEVICE MANAGER --- */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Device Manager</Text>
          <Pressable onPress={detectAndSyncDevice}>
            <MaterialCommunityIcons
              name="refresh"
              size={22}
              color={colors.icon}
            />
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : devices.length === 0 ? (
          <Text style={styles.emptyText}>No devices found.</Text>
        ) : (
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.deviceCard,
                  {
                    borderColor:
                      connectedSystem?.id === item.id
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <View>
                  <Text style={styles.deviceName}>{item.name}</Text>
                  <Text style={styles.deviceSub}>{item.ssid}</Text>
                </View>
                <Pressable onPress={() => handleDeleteDevice(item.id)}>
                  <MaterialCommunityIcons
                    name="delete-outline"
                    size={22}
                    color={colors.error}
                  />
                </Pressable>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

/* --- THEME STYLES (Strictly Palette Based) --- */
const getStyles = (colors: typeof lightColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    sectionContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: colors.border,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.1 : 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 8,
      marginBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    emptyText: {
      textAlign: "center",
      color: colors.textMuted,
      fontSize: 14,
      paddingVertical: 10,
    },
    deviceCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 10,
      marginBottom: 8,
      borderWidth: StyleSheet.hairlineWidth,
    },
    deviceName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    deviceSub: {
      fontSize: 13,
      color: colors.textMuted,
    },
  });
