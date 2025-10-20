import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeContext"; // Import useTheme
import { lightColors } from "../../theme/colors"; // Import color type

export default function Index() {
  const { colors } = useTheme(); // Get theme colors
  const styles = getStyles(colors); // Create styles dynamically

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Testing Expo</Text>
    </View>
  );
}

// Factory function to generate styles based on colors
const getStyles = (colors: typeof lightColors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Use theme color
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      color: colors.text, // Use theme color
    },
    button: {
      fontSize: 25,
      textDecorationLine: "underline",
      color: colors.error, // Use theme color
    },
  });
};
