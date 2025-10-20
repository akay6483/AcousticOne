// app/(drawer)/setting.tsx (Example)
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function SettingsMenu() {
  const { mode, setMode, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>Select Theme</Text>

      {/* Example Button for 'Light' */}
      <Pressable
        onPress={() => setMode("light")}
        style={[
          styles.button,
          {
            backgroundColor:
              mode === "light" ? colors.primary : colors.background,
          },
          { borderColor: colors.primary },
        ]}
      >
        <Text style={{ color: mode === "light" ? "#fff" : colors.text }}>
          Light
        </Text>
      </Pressable>

      {/* Example Button for 'Dark' */}
      <Pressable
        onPress={() => setMode("dark")}
        style={[
          styles.button,
          {
            backgroundColor:
              mode === "dark" ? colors.primary : colors.background,
          },
          { borderColor: colors.primary },
        ]}
      >
        <Text style={{ color: mode === "dark" ? "#fff" : colors.text }}>
          Dark
        </Text>
      </Pressable>

      {/* Example Button for 'Auto' */}
      <Pressable
        onPress={() => setMode("auto")}
        style={[
          styles.button,
          {
            backgroundColor:
              mode === "auto" ? colors.primary : colors.background,
          },
          { borderColor: colors.primary },
        ]}
      >
        <Text style={{ color: mode === "auto" ? "#fff" : colors.text }}>
          Automatic
        </Text>
      </Pressable>
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
  button: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 10,
  },
});
