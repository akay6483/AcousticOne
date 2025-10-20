import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { lightColors } from "../../theme/colors"; // For the style function type

export default function Profile() {
  const { colors } = useTheme();
  const styles = getStyles(colors); // Create dynamic styles

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile</Text>
    </View>
  );
}

// This function generates the styles using the theme colors
const getStyles = (colors: typeof lightColors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Use theme color
      justifyContent: "center",
      alignItems: "center",
    },
    text: {
      color: colors.text, // Use theme color
    },
  });
};
