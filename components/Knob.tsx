import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

// --- Theme Imports ---
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";

// --- Prop Types (No Change) ---
type KnobProps = {
  size: number;
  label: string;
  initialValue?: number;
  onValueChange?: (value: number) => void;
};

// --- Helper Functions (No Change) ---
const getValueFromAngle = (angle: number): number => {
  "worklet";
  const positiveAngle = (angle + 360) % 360;
  return Math.floor(positiveAngle / 3.6);
};

const getAngleFromValue = (value: number): number => {
  "worklet";
  return value * 3.6;
};

// --- Main Component (Refactored) ---
export const Knob: React.FC<KnobProps> = ({
  size,
  label,
  initialValue = 0,
  onValueChange,
}) => {
  // --- Style & Theme Hook ---
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  // --- Animation Logic (No Change) ---
  const CENTER = { x: size / 2, y: size / 2 };
  const rotation = useSharedValue(getAngleFromValue(initialValue));
  const derivedValue = useDerivedValue(() => {
    return getValueFromAngle(rotation.value);
  });
  const lastAngle = useSharedValue(rotation.value);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      lastAngle.value = rotation.value;
    })
    .onUpdate((event) => {
      const x = event.x - CENTER.x;
      const y = event.y - CENTER.y;
      const angleRad = Math.atan2(y, x);
      const angleDeg = (angleRad * 180) / Math.PI + 90;
      const startAngleRad = Math.atan2(
        event.translationY + y,
        event.translationX + x
      );
      const startAngleDeg = (startAngleRad * 180) / Math.PI + 90;
      rotation.value = lastAngle.value + (angleDeg - startAngleDeg);
      if (onValueChange) {
        runOnJS(onValueChange)(getValueFromAngle(rotation.value));
      }
    });

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const valueText = useDerivedValue(() => {
    return String(derivedValue.value);
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={{ width: size, height: size }}>
          <Image
            source={require("../assets/images/dial-base.png")}
            style={styles.knobImage}
          />
          <Animated.Image
            source={require("../assets/images/knob-indicator.png")}
            style={[styles.knobImage, styles.indicator, indicatorStyle]}
          />
        </Animated.View>
      </GestureDetector>

      {/* --- Text components now use themed styles --- */}
      <Text style={styles.labelText}>{label.toUpperCase()}</Text>
      <Text style={styles.valueText}>{valueText.value}</Text>
    </View>
  );
};

// --- Dynamic Style Factory Function ---
const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      padding: 10,
    },
    knobImage: {
      position: "absolute",
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },
    indicator: {
      position: "absolute",
    },
    labelText: {
      marginTop: 4,
      fontSize: 14,
      fontWeight: "bold",
      color: colors.icon, // Use theme color
    },
    valueText: {
      fontSize: 16,
      color: colors.textMuted, // Use new theme color
      marginTop: 2,
    },
  });
