import { StyleSheet, Text, View } from "react-native";

export default function DSP() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>DSP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c3deffff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "black",
  },
  button: {
    fontSize: 25,
    textDecorationLine: "underline",
    color: "red",
  },
});
