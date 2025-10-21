import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors"; // Import type

// --- PROPS ---
type PresetModalProps = {
  visible: boolean;
  onClose: () => void;
};

// --- PRESET DATA ---
// Hard-coded default presets from your CSV file
const GTZAN_PRESETS = [
  { id: "gtzan-1", name: "Blues" },
  { id: "gtzan-2", name: "Classical" },
  { id: "gtzan-3", name: "Country" },
  { id: "gtzan-4", name: "Disco" },
  { id: "gtzan-5", name: "Hiphop" },
  { id: "gtzan-6", name: "Jazz" },
  { id: "gtzan-7", name: "Metal" },
  { id: "gtzan-8", name: "Pop" },
  { id: "gtzan-9", name: "Reggae" },
  { id: "gtzan-10", name: "Rock" },
];

// Dummy custom presets for demonstration
const DUMMY_CUSTOM_PRESETS = [
  { id: "c1", name: "My Custom 1" },
  { id: "c2", name: "Bass Boosted" },
];

type ActiveTab = "load" | "save" | "delete";

// --- MAIN COMPONENT ---
export const PresetModal: React.FC<PresetModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);

  // State for tabs and inputs
  const [activeTab, setActiveTab] = useState<ActiveTab>("load");
  const [presetName, setPresetName] = useState("Custom 1");

  // Separate state for custom vs. default presets
  const [customPresets, setCustomPresets] = useState(DUMMY_CUSTOM_PRESETS);
  const [activePresetId, setActivePresetId] = useState<string | null>("c1"); // 'c1' is active by default

  // --- Handlers ---
  const handleLoad = (id: string) => {
    console.log("Loading preset:", id);
    setActivePresetId(id); // Set the active ID
    // Add actual load logic here
  };

  const handleSave = () => {
    console.log("Saving preset:", presetName);
    // Add save logic here
    const newPreset = { id: Date.now().toString(), name: presetName };
    setCustomPresets([...customPresets, newPreset]);
    setActivePresetId(newPreset.id); // Set new preset as active
    setPresetName("Custom 1"); // Reset input
    setActiveTab("load"); // Switch to load tab
  };

  const handleDelete = (id: string) => {
    console.log("Deleting preset:", id);
    // Add delete logic here
    setCustomPresets(customPresets.filter((p) => p.id !== id));
    // If deleting the active preset, reset active ID
    if (activePresetId === id) {
      setActivePresetId(null);
    }
  };

  // --- RENDER ---
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* --- Header (Aligned like AttenuationModel) --- */}
          <View style={styles.header}>
            <Ionicons
              name="save"
              size={24}
              color={colors.icon}
              style={styles.headerIcon}
            />
            <Text style={styles.title}>Preset</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.icon} />
            </Pressable>
          </View>

          {/* --- Tabs --- */}
          <View style={styles.tabContainer}>
            <TabButton
              label="Load"
              isActive={activeTab === "load"}
              onPress={() => setActiveTab("load")}
            />
            <TabButton
              label="Save"
              isActive={activeTab === "save"}
              onPress={() => setActiveTab("save")}
            />
            <TabButton
              label="Delete"
              isActive={activeTab === "delete"}
              onPress={() => setActiveTab("delete")}
            />
          </View>

          {/* --- Content --- */}
          <View style={styles.contentContainer}>
            {activeTab === "load" && (
              <LoadView
                customPresets={customPresets}
                defaultPresets={GTZAN_PRESETS}
                onLoad={handleLoad}
                activePresetId={activePresetId}
              />
            )}
            {activeTab === "save" && (
              <SaveView
                presetName={presetName}
                setPresetName={setPresetName}
                onSave={handleSave}
              />
            )}
            {activeTab === "delete" && (
              <DeleteView
                presets={customPresets} // Only pass custom presets
                onDelete={handleDelete}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- SUB-COMPONENTS ---

type TabButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onPress }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text
        style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// --- Preset List Item (reused by Load and Delete) ---
type PresetItemProps = {
  name: string;
  icon: React.ReactNode;
  onPress: () => void;
  isActive?: boolean; // Optional: used for highlighting in LoadView
};

const PresetItem: React.FC<PresetItemProps> = ({
  name,
  icon,
  onPress,
  isActive,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);

  let finalIcon = icon;

  // Clone the icon element to apply conditional coloring
  if (isActive !== undefined) {
    // Used by LoadView: apply active or default color
    finalIcon = React.cloneElement(icon as React.ReactElement, {
      color: isActive ? colors.primary : colors.icon,
    });
  } else {
    // Used by DeleteView: apply default color
    finalIcon = React.cloneElement(icon as React.ReactElement, {
      color: colors.icon,
    });
  }

  return (
    <View style={styles.presetItem}>
      <Text style={[styles.presetName, isActive && styles.presetNameActive]}>
        {name}
      </Text>
      <Pressable style={styles.iconButton} onPress={onPress}>
        {finalIcon}
      </Pressable>
    </View>
  );
};

// --- Load View ---
type LoadViewProps = {
  customPresets: typeof DUMMY_CUSTOM_PRESETS;
  defaultPresets: typeof GTZAN_PRESETS;
  onLoad: (id: string) => void;
  activePresetId: string | null;
};
const LoadView: React.FC<LoadViewProps> = ({
  customPresets,
  defaultPresets,
  onLoad,
  activePresetId,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);
  return (
    <ScrollView
      style={styles.presetList}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* --- Custom Presets --- */}
      {customPresets.map((preset) => (
        <PresetItem
          key={preset.id}
          name={preset.name}
          icon={<FontAwesome5 name="file-upload" size={20} />}
          onPress={() => onLoad(preset.id)}
          isActive={activePresetId === preset.id}
        />
      ))}

      {/* --- Separator --- */}
      {defaultPresets.length > 0 && customPresets.length > 0 && (
        <View style={styles.listSeparator}>
          <Text style={styles.listSeparatorText}>Default Presets</Text>
        </View>
      )}

      {/* --- Default Presets --- */}
      {defaultPresets.map((preset) => (
        <PresetItem
          key={preset.id}
          name={preset.name}
          icon={<FontAwesome5 name="file-upload" size={20} />}
          onPress={() => onLoad(preset.id)}
          isActive={activePresetId === preset.id}
        />
      ))}
    </ScrollView>
  );
};

// --- Save View ---
type SaveViewProps = {
  presetName: string;
  setPresetName: (name: string) => void;
  onSave: () => void;
};
const SaveView: React.FC<SaveViewProps> = ({
  presetName,
  setPresetName,
  onSave,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);
  return (
    <View style={styles.saveContainer}>
      <Text style={styles.saveLabel}>Save current mapping as :</Text>
      <View style={styles.saveInputContainer}>
        <TextInput
          style={styles.textInput}
          value={presetName}
          onChangeText={setPresetName}
          placeholder="Enter preset name"
          placeholderTextColor={colors.inactiveTint}
        />
        <Pressable style={styles.saveButton} onPress={onSave}>
          <FontAwesome5
            name="file-download"
            size={20}
            color={colors.background} // White text on primary button
          />
        </Pressable>
      </View>
    </View>
  );
};

// --- Delete View ---
type DeleteViewProps = {
  presets: typeof DUMMY_CUSTOM_PRESETS;
  onDelete: (id: string) => void;
};
const DeleteView: React.FC<DeleteViewProps> = ({ presets, onDelete }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);

  if (presets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No custom presets to delete.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.presetList}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {presets.map((preset) => (
        <PresetItem
          key={preset.id}
          name={preset.name}
          icon={<Ionicons name="trash-outline" size={22} />}
          onPress={() => onDelete(preset.id)}
          // No isActive prop passed
        />
      ))}
    </ScrollView>
  );
};

// --- STYLES ---
const getModalStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.modalOverlay,
    },
    container: {
      height: "85%", // Make modal taller
      backgroundColor: colors.modalBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20, // Updated padding
    },
    // --- Header Styles (from AttenuationModel) ---
    header: {
      flexDirection: "row",
      justifyContent: "space-between", // This spaces [Icon] [Title] [Close]
      alignItems: "center",
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerIcon: {
      // Sizing for the left icon
      padding: 4,
      width: 32, // Balance the close button
    },
    title: {
      flex: 1, // Allows title to take center space
      textAlign: "center", // Centers the text
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
    },
    closeButton: {
      // Sizing for the right icon
      padding: 4,
      width: 32, // Balance the header icon
    },
    // --- Tab Styles ---
    tabContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 20, // Added margin
      marginBottom: 20,
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 4,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: "center",
    },
    tabButtonActive: {
      backgroundColor: colors.primary,
    },
    tabButtonText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 16,
    },
    tabButtonTextActive: {
      color: colors.background, // Use background for high contrast
    },
    contentContainer: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 10,
    },
    // --- Save View Styles ---
    saveContainer: {
      padding: 10,
    },
    saveLabel: {
      color: colors.text,
      fontSize: 16,
      marginBottom: 10,
      fontWeight: "500",
    },
    saveInputContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    textInput: {
      flex: 1,
      backgroundColor: colors.background,
      color: colors.text,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 14,
      fontSize: 16,
      marginRight: 10,
    },
    saveButton: {
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    // --- Load/Delete View Styles ---
    presetList: {
      flex: 1,
    },
    presetItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 10,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
    },
    presetName: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "500",
    },
    presetNameActive: {
      color: colors.primary,
      fontWeight: "700",
    },
    iconButton: {
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    // --- List Separator ---
    listSeparator: {
      paddingVertical: 10,
      marginTop: 5, // Small space
      marginBottom: 5,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background, // Slightly different bg
    },
    listSeparatorText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      textTransform: "uppercase",
    },
    // --- Empty State ---
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 16,
    },
  });
