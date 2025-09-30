import { Knob } from "@/components/Knob"; // Assuming Knob.tsx is in the same directory
import React, { useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";

export default function Example() {
  const [volume, setVolume] = useState<number>(25);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <Knob
        value={volume}
        onValueChange={setVolume}
        strokeWidth={20}
        min={0}
        max={100}
        trackColor="#9ebcdfff"
        progressColor="#4a90e2"
        thumbColor="#90e4f1ff"
        textColor="white"
      />

      <Text style={styles.valueText}>
        Current Value: <Text style={styles.boldValue}>{volume}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 10,
    backgroundColor: "#ffffffff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "lime",
  },
  valueText: {
    marginTop: 40,
    fontSize: 20,
    color: "#d6b4b4ff",
  },
  boldValue: {
    color: "#04111fff",
  },
});
