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

// --- PRESET DATA TYPES ---
type Preset = {
  id: string;
  name: string;
};

// --- PRESET DATA ---
const GTZAN_PRESETS: Preset[] = [
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

const DUMMY_CUSTOM_PRESETS: Preset[] = [
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

  // State for presets
  const [customPresets, setCustomPresets] = useState(DUMMY_CUSTOM_PRESETS);
  const [activePresetId, setActivePresetId] = useState<string | null>("c1");

  // State for confirmation dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<Preset | null>(null);

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const [showLoadConfirm, setShowLoadConfirm] = useState(false);
  const [presetToLoad, setPresetToLoad] = useState<Preset | null>(null);

  // --- Handlers ---

  // LOAD
  const handleLoadPress = (preset: Preset) => {
    setPresetToLoad(preset);
    setShowLoadConfirm(true);
  };
  const confirmLoad = () => {
    if (!presetToLoad) return;
    console.log("Loading preset:", presetToLoad.id);
    setActivePresetId(presetToLoad.id);
    // Add actual load logic here
    cancelLoad();
  };
  const cancelLoad = () => {
    setShowLoadConfirm(false);
    setPresetToLoad(null);
  };

  // SAVE
  const handleSavePress = () => {
    if (presetName.trim().length === 0) {
      alert("Please enter a preset name.");
      return;
    }
    setShowSaveConfirm(true);
  };
  const confirmSave = () => {
    console.log("Saving preset:", presetName);
    const newPreset = { id: Date.now().toString(), name: presetName };
    setCustomPresets([...customPresets, newPreset]);
    setActivePresetId(newPreset.id);
    setPresetName("Custom 1"); // Reset input
    cancelSave();
    setActiveTab("load"); // Switch to load tab after saving
  };
  const cancelSave = () => {
    setShowSaveConfirm(false);
  };

  // DELETE
  const handleDeletePress = (preset: Preset) => {
    setPresetToDelete(preset);
    setShowDeleteConfirm(true);
  };
  const confirmDelete = () => {
    if (!presetToDelete) return;
    console.log("Deleting preset:", presetToDelete.id);
    setCustomPresets(customPresets.filter((p) => p.id !== presetToDelete.id));
    if (activePresetId === presetToDelete.id) {
      setActivePresetId(null);
    }
    cancelDelete();
  };
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPresetToDelete(null);
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
          {/* --- Header --- */}
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

          {/* --- Tabs with Icons --- */}
          <View style={styles.tabContainer}>
            <TabButton
              label="Load"
              icon={<FontAwesome5 name="file-upload" size={18} />}
              isActive={activeTab === "load"}
              onPress={() => setActiveTab("load")}
            />
            <TabButton
              label="Save"
              icon={<FontAwesome5 name="file-download" size={18} />}
              isActive={activeTab === "save"}
              onPress={() => setActiveTab("save")}
            />
            <TabButton
              label="Delete"
              icon={<Ionicons name="trash-outline" size={20} />}
              isActive={activeTab === "delete"}
              onPress={() => setActiveTab("delete")}
            />
          </View>

          {/* --- Content --- */}
          <View style={styles.contentContainer}>
            {/* Show Save UI only on Save tab */}
            {activeTab === "save" && (
              <SaveView
                presetName={presetName}
                setPresetName={setPresetName}
                onSave={handleSavePress} // Triggers confirmation
              />
            )}

            {/* Always show the unified list */}
            <PresetListView
              customPresets={customPresets}
              defaultPresets={GTZAN_PRESETS}
              onLoadPress={handleLoadPress} // Triggers confirmation
              onDeletePress={handleDeletePress} // Triggers confirmation
              activePresetId={activePresetId}
              mode={activeTab} // Pass 'load', 'save', or 'delete'
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- SUB-COMPONENTS ---

// --- TabButton (No Change) ---
type TabButtonProps = {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
};
const TabButton: React.FC<TabButtonProps> = ({
  label,
  icon,
  isActive,
  onPress,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);

  const iconColor = isActive ? colors.background : colors.text;
  const textColor = isActive ? colors.background : colors.text;

  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      {React.cloneElement(icon as React.ReactElement, {
        color: iconColor,
      })}
      <Text style={[styles.tabButtonText, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
};

// --- Preset List Item (reused by Load and Delete) ---
type PresetItemProps = {
  preset: Preset;
  isActive: boolean;
  isInteractive: boolean;
  onItemPress: () => void;
};
const PresetItem: React.FC<PresetItemProps> = ({
  preset,
  isActive,
  isInteractive,
  onItemPress,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);

  return (
    <View style={styles.presetItem}>
      <Pressable
        style={styles.presetNameButton}
        onPress={onItemPress}
        disabled={!isInteractive}
      >
        <Text style={[styles.presetName, isActive && styles.presetNameActive]}>
          {preset.name}
        </Text>
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
  mode: ActiveTab;
};
const PresetListView: React.FC<PresetListViewProps> = ({
  customPresets,
  defaultPresets,
  onLoadPress,
  onDeletePress,
  activePresetId,
  mode,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getModalStyles(colors), [colors]);

  return (
    <ScrollView
      style={[styles.presetList, mode === "save" && styles.presetListSaveMode]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* --- Custom Presets --- */}
      {customPresets.map((preset) => {
        // Interactive if in 'load' mode OR 'delete' mode
        const isInteractive = mode === "load" || mode === "delete";
        // Action changes based on the mode
        const tapAction =
          mode === "load"
            ? () => onLoadPress(preset)
            : () => onDeletePress(preset);

        return (
          <PresetItem
            key={preset.id}
            preset={preset}
            isActive={activePresetId === preset.id}
            isInteractive={isInteractive}
            onItemPress={tapAction}
          />
        );
      })}

      {/* --- Separator --- */}
      {defaultPresets.length > 0 && customPresets.length > 0 && (
        <View style={styles.listSeparator}>
          <Text style={styles.listSeparatorText}>Default Presets</Text>
        </View>
      )}

      {/* --- Default Presets --- */}
      {defaultPresets.map((preset) => {
        // ONLY interactive in 'load' mode
        const isInteractive = mode === "load";
        // Action is *always* load
        const tapAction = () => onLoadPress(preset);

        return (
          <PresetItem
            key={preset.id}
            preset={preset}
            isActive={activePresetId === preset.id}
            isInteractive={isInteractive}
            onItemPress={tapAction}
          />
        );
      })}
    </ScrollView>
  );
};

// --- Save View (No Change) ---
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

// --- STYLES ---
const getModalStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.modalOverlay,
    },
    container: {
      height: "85%",
      backgroundColor: colors.modalBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    // --- Header Styles ---
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerIcon: {
      padding: 4,
      width: 32,
    },
    title: {
      flex: 1,
      textAlign: "center",
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
    },
    closeButton: {
      padding: 4,
      width: 32,
    },
    // --- Tab Styles ---
    tabContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 20,
      marginBottom: 20,
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 4,
    },
    tabButton: {
      flex: 1,
      flexDirection: "row", // To align icon and text
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center", // Center icon and text
    },
    tabButtonActive: {
      backgroundColor: colors.primary,
    },
    tabButtonText: {
      // color is set inline
      fontWeight: "600",
      fontSize: 16,
      marginLeft: 8, // Space between icon and text
    },
    contentContainer: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 10,
      overflow: "hidden", // Ensures list scrolls within container
    },
    // --- Save View Styles ---
    saveContainer: {
      padding: 10,
      borderBottomWidth: 1, // Separate Save UI from list
      borderBottomColor: colors.border,
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
    // --- Preset List Styles ---
    presetList: {
      flex: 1, // Take remaining space
    },
    presetListSaveMode: {
      flexGrow: 1, // Allow list to take space but not push save view
    },
    presetItem: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
    },
    presetNameButton: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 10,
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
    // --- List Separator ---
    listSeparator: {
      paddingVertical: 10,
      marginTop: 5,
      marginBottom: 5,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    listSeparatorText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      textTransform: "uppercase",
    },
  });
