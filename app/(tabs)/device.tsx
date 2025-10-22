import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../theme/ThemeContext"; // 👈 Corrected path
import { lightColors } from "../../theme/colors"; // 👈 Corrected path
// 👇 Import the modal and type from the new file
import { PASystem, ScanAndPairModal } from "../../components/ScanAndPairModal";
// (Adjust this path if you place the modal elsewhere)

// --- MOCK DATA ---
const MOCK_PAIRED_SYSTEMS: PASystem[] = [
  { id: "1", name: "Living Room Speaker", ssid: "AcousticsOne-LR-5G" },
  { id: "2", name: "Bedroom Amp", ssid: "AcousticsOne-BR-2.4G" },
  { id: "3", name: "Garage PA", ssid: "AcousticsOne-GRG-5G" },
  { id: "4", name: "Basement System", ssid: "AcousticsOne-BSMT-2.4G" },
];

type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

// --- REUSABLE SUB-COMPONENTS ---

/**
 * Header component for a section (e.g., "Connection Status")
 */
interface SectionHeaderProps {
  title: string;
  children?: React.ReactNode; // For icons/buttons
}
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, children }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors, false), [colors]); // isDark doesn't matter here
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.sectionIcons}>{children}</View>
    </View>
  );
};

/**
 * Card displaying the currently connected device and its status.
 */
interface SystemStatusCardProps {
  system: PASystem | null;
  status: ConnectionStatus;
}
const SystemStatusCard: React.FC<SystemStatusCardProps> = ({
  system,
  status,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const getStatusText = () => {
    if (!system) return "Not Connected";
    switch (status) {
      case "connected":
        return "Connected";
      case "connecting":
      default:
        return "Disconnected";
    }
  };

  return (
    <View
      style={[
        styles.deviceCard,
        styles.statusCard, // Specific style for the status card
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: isDark ? "#000" : "#C5C6C9",
        },
      ]}
    >
      <View
        style={[
          styles.deviceIconContainer,
          {
            backgroundColor: system ? colors.primary : colors.background,
            borderColor: system ? colors.primary : colors.border,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="speaker"
          size={28}
          color={system ? colors.card : colors.icon}
        />
      </View>
      <View style={styles.deviceInfo}>
        <Text style={[styles.deviceName, { color: colors.text }]}>
          Name: {system?.name ?? "N/A"}
        </Text>
        <Text style={[styles.deviceSsid, { color: colors.textMuted }]}>
          SSID: {system?.ssid ?? "N/A"}
        </Text>
      </View>
    </View>
  );
};

/**
 * Pressable list item for a paired device.
 */
interface PairedDeviceItemProps {
  item: PASystem;
  onConnect: () => void;
  onForget: () => void;
  isForgetMode: boolean;
}
const PairedDeviceItem: React.FC<PairedDeviceItemProps> = ({
  item,
  onConnect,
  onForget,
  isForgetMode,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  return (
    <View
      style={[
        styles.deviceCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: isDark ? "#000" : "#C5C6C9",
        },
      ]}
    >
      <View
        style={[
          styles.deviceIconContainer,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <MaterialCommunityIcons name="speaker" size={28} color={colors.icon} />
      </View>
      <View style={styles.deviceInfo}>
        <Text style={[styles.deviceName, { color: colors.text }]}>
          Device name: {item.name}
        </Text>
        <Text style={[styles.deviceSsid, { color: colors.textMuted }]}>
          SSID: {item.ssid}
        </Text>
      </View>

      {/* Conditional Connect/Forget Button */}
      {isForgetMode ? (
        <Pressable
          style={[styles.deviceButton, { backgroundColor: colors.error }]}
          onPress={onForget}
        >
          <Text style={[styles.buttonText, { color: colors.remotePowerText }]}>
            Forget
          </Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.deviceButton, { backgroundColor: colors.primary }]}
          onPress={onConnect}
        >
          <Text style={[styles.buttonText, { color: colors.remotePowerText }]}>
            Connect
          </Text>
        </Pressable>
      )}
    </View>
  );
};

// --- MAIN SCREEN COMPONENT ---
export default function DeviceScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isForgetMode, setIsForgetMode] = useState(false); // New state for forget mode
  const [pairedSystems, setPairedSystems] =
    useState<PASystem[]>(MOCK_PAIRED_SYSTEMS);

  // --- Mock Connection State ---
  const [connectedSystem, setConnectedSystem] = useState<PASystem | null>(
    MOCK_PAIRED_SYSTEMS[0]
  );
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connected");

  // --- Handlers ---
  const handleConnect = (system: PASystem) => {
    console.log("Connecting to:", system.name);
    setConnectionStatus("connecting");
    // Simulate connection
    setTimeout(() => {
      setConnectedSystem(system);
      setConnectionStatus("connected");
    }, 1000);
  };

  const handleForget = (systemToForget: PASystem) => {
    Alert.alert(
      "Forget System",
      `Are you sure you want to forget ${systemToForget.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Forget",
          style: "destructive",
          onPress: () => {
            if (connectedSystem?.id === systemToForget.id) {
              setConnectedSystem(null);
              setConnectionStatus("disconnected");
            }
            setPairedSystems(
              pairedSystems.filter((s) => s.id !== systemToForget.id)
            );
          },
        },
      ]
    );
  };

  const handleAddNewSystem = (newSystem: PASystem) => {
    setPairedSystems((currentSystems) => {
      if (currentSystems.find((s) => s.id === newSystem.id)) {
        return currentSystems;
      }
      return [...currentSystems, newSystem];
    });
    setIsModalVisible(false);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* --- Main content wrapper --- */}
      <View style={styles.container}>
        {/* --- 1. CONNECTION STATUS --- */}
        <View style={styles.section}>
          <SectionHeader title="Connection Status">
            <Pressable onPress={() => Alert.alert("Connection Status Info")}>
              <Ionicons
                name="information-circle-outline"
                size={26}
                color={colors.icon}
              />
            </Pressable>
          </SectionHeader>
          <SystemStatusCard
            system={connectedSystem}
            status={connectionStatus}
          />
        </View>

        {/* --- 2. CONNECTION MANAGER --- */}
        <View style={[styles.section, styles.managerSection]}>
          <SectionHeader title="Connection Manager">
            <View style={styles.sectionIcons}>
              <Pressable onPress={() => Alert.alert("Device Manager Info")}>
                <Ionicons
                  name="information-circle-outline"
                  size={26}
                  color={colors.icon}
                  style={styles.headerIcon}
                />
              </Pressable>
              <Pressable onPress={() => setIsModalVisible(true)}>
                <AntDesign
                  name="plus"
                  size={26}
                  color={colors.icon}
                  style={styles.headerIcon}
                />
              </Pressable>
              <Pressable onPress={() => setIsForgetMode(!isForgetMode)}>
                <AntDesign
                  name="minus"
                  size={26}
                  color={isForgetMode ? colors.error : colors.icon}
                  style={styles.headerIcon}
                />
              </Pressable>
            </View>
          </SectionHeader>

          {/* --- SCROLLABLE LIST --- */}
          <FlatList
            data={pairedSystems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PairedDeviceItem
                item={item}
                onConnect={() => handleConnect(item)}
                onForget={() => handleForget(item)}
                isForgetMode={isForgetMode}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyListContainer}>
                <Text style={{ color: colors.textMuted }}>
                  No paired devices.
                </Text>
                <Text style={{ color: colors.textMuted, marginTop: 4 }}>
                  Press '+' to add one.
                </Text>
              </View>
            }
          />
        </View>
      </View>

      {/* --- SCANNING MODAL --- */}
      <ScanAndPairModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onPairSuccess={handleAddNewSystem}
        pairedSystemIds={pairedSystems.map((s) => s.id)}
      />
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const getStyles = (colors: typeof lightColors, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 16,
    },
    managerSection: {
      flex: 1, // This makes the section take up remaining space
      minHeight: 0, // Important for FlatList to scroll
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
    },
    sectionIcons: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerIcon: {
      marginLeft: 16,
    },
    deviceCard: {
      flexDirection: "row", // Added
      alignItems: "center", // Added
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 2,
    },
    statusCard: {
      // Styles specific to the top status card, if any
    },
    deviceIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      borderWidth: 1,
    },
    deviceInfo: {
      flex: 1, // Takes up available space
      gap: 4,
    },
    deviceName: {
      fontSize: 16,
      fontWeight: "500",
    },
    deviceSsid: {
      fontSize: 14,
    },
    deviceButton: {
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    buttonText: {
      fontWeight: "600",
      fontSize: 14,
    },
    emptyListContainer: {
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
    },
  });
