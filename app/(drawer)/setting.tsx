import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function SettingsMenu() {
  const { mode, setMode, colors, isHapticsEnabled, setHapticsEnabled } =
    useTheme();

  const iconSize = 24; // Define icon size

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>Display Theme</Text>

      {/* --- REPLACED: Text with Icons --- */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            mode === "light" && [
              styles.tabButtonActive,
              { backgroundColor: colors.primary },
            ],
          ]}
          onPress={() => setMode("light")}
        >
          <Ionicons
            name="sunny-outline"
            size={iconSize}
            color={mode === "light" ? colors.card : colors.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            mode === "dark" && [
              styles.tabButtonActive,
              { backgroundColor: colors.primary },
            ],
          ]}
          onPress={() => setMode("dark")}
        >
          <Ionicons
            name="moon-outline"
            size={iconSize}
            color={mode === "dark" ? colors.card : colors.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            mode === "auto" && [
              styles.tabButtonActive,
              { backgroundColor: colors.primary },
            ],
          ]}
          onPress={() => setMode("auto")}
        >
          <Ionicons
            name="contrast-outline"
            size={iconSize}
            color={mode === "auto" ? colors.card : colors.icon}
          />
        </TouchableOpacity>
      </View>

      {/* --- Haptics Toggle (Unchanged) --- */}
      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>
        Preferences
      </Text>

      <View style={[styles.switchRow, { backgroundColor: colors.card }]}>
        <Ionicons
          name="pulse-outline"
          size={22}
          color={colors.text}
          style={styles.switchIcon}
        />
        <Text style={[styles.switchLabel, { color: colors.text }]}>
          Haptic Feedback
        </Text>
        <Switch
          trackColor={{ false: colors.inactiveTint, true: colors.primary }}
          thumbColor={colors.thumbColor || "#ffffff"}
          onValueChange={setHapticsEnabled}
          value={isHapticsEnabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    justifyContent: "space-around",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    // backgroundColor is set inline
  },
  // --- REMOVED: tabButtonText and tabButtonTextActive styles ---
  separator: {
    height: 1,
    width: "100%",
    marginTop: 20,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  switchIcon: {
    marginRight: 12,
  },
  switchLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
});
