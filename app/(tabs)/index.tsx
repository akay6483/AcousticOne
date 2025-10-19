import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
// This wrapper is required for react-native-gesture-handler
import { GestureHandlerRootView } from "react-native-gesture-handler";

// 1. Import your Knob component
// (Adjust the path if your index.tsx is not in the same folder as the 'components' folder)
import { Knob } from "../../components/Knob";

export default function App() {
  // You can hold the knob's value in state if you need it
  const [knobValue, setKnobValue] = useState(0);

  return (
    // 2. Wrap your entire app (or at least this screen)
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>My Knob</Text>

        {/* 3. Render the Knob component */}
        <Knob
          initialValue={25} // Set a starting value
          onValueChange={(value) => {
            // This function runs every time the value changes
            setKnobValue(value);
            console.log(value);
          }}
        />

        {/* Optional: Display the value from state */}
        <Text style={styles.valueText}>Current Value: {knobValue}</Text>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // This is for GestureHandlerRootView
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 40,
  },
  valueText: {
    fontSize: 20,
    marginTop: 30,
    color: "#333",
  },
});
