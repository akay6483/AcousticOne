import React, { useEffect, useMemo } from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
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

// --- 1. MODIFIED: Prop Types ---
type KnobProps = {
  size: number;
  label: string;
  value: number; // This is now the *actual* value (e.g., -5), not 0-100
  onValueChange?: (value: number) => void;
  dialBaseImage?: ImageSourcePropType;
  indicatorImage?: ImageSourcePropType;
  min?: number; // New prop
  max?: number; // New prop
  step?: number; // New prop
  valueSuffix?: string; // New prop (e.g., "dB")
};

// --- Angle Constants (Unchanged) ---
const MIN_DEAD_ZONE_DEG = 135;
const MAX_DEAD_ZONE_DEG = 225;
const DEAD_ZONE_SWEEP = 90;
const LIVE_ZONE_SWEEP = 270;
const START_ANGLE = MAX_DEAD_ZONE_DEG;
const END_ANGLE = MIN_DEAD_ZONE_DEG;

// --- 2. MODIFIED: Helper Functions ---

/**
 * Calculates the percentage (0.0 to 1.0) from a value within a range.
 */
const getPercentFromValue = (
  value: number,
  min: number,
  max: number
): number => {
  "worklet";
  const clampedValue = Math.min(Math.max(value, min), max);
  return (clampedValue - min) / (max - min);
};

/**
 * Calculates the knob's angle from an actual value.
 */
const getAngleFromActualValue = (
  value: number,
  min: number,
  max: number
): number => {
  "worklet";
  const percent = getPercentFromValue(value, min, max);
  const angle = (START_ANGLE + percent * LIVE_ZONE_SWEEP) % 360;
  return angle;
};

/**
 * Calculates the actual value (snapped to step) from a knob angle.
 */
const getActualValueFromAngle = (
  angle: number,
  min: number,
  max: number,
  step: number
): number => {
  "worklet";
  const relativeAngle = (angle - START_ANGLE + 360) % 360;
  const percent = relativeAngle / LIVE_ZONE_SWEEP;
  const rawValue = min + percent * (max - min);

  // Snap to the nearest step
  const snappedValue = Math.round(rawValue / step) * step;

  // Clamp to min/max
  return Math.min(Math.max(snappedValue, min), max);
};

// --- MODIFIED: Main Component ---
export const Knob: React.FC<KnobProps> = ({
  size,
  label,
  value,
  onValueChange,
  dialBaseImage,
  indicatorImage,
  // 3. Add defaults for new props
  min = 0,
  max = 100,
  step = 1,
  valueSuffix = "",
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const CENTER = { x: size / 2, y: size / 2 };

  // 4. Update rotation to use new helper
  const rotation = useSharedValue(getAngleFromActualValue(value, min, max));

  // 5. Update derived value to use new helper
  const derivedActualValue = useDerivedValue(() => {
    return getActualValueFromAngle(rotation.value, min, max, step);
  });

  // 6. Update useEffect to use new helper
  useEffect(() => {
    rotation.value = getAngleFromActualValue(value, min, max);
  }, [value, min, max, rotation]);

  // --- panGesture ---
  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onUpdate((event) => {
      // (Gesture angle logic is unchanged)
      const x = event.x - CENTER.x;
      const y = event.y - CENTER.y;
      const angleRad = Math.atan2(x, -y);
      let newAngle = ((angleRad * 180) / Math.PI + 360) % 360;
      const previousAngle = rotation.value;
      const touchInDeadZone =
        newAngle >= MIN_DEAD_ZONE_DEG && newAngle <= MAX_DEAD_ZONE_DEG;

      if (touchInDeadZone) {
        if (previousAngle < 180) {
          newAngle = MIN_DEAD_ZONE_DEG;
        } else {
          newAngle = MAX_DEAD_ZONE_DEG;
        }
      } else {
        const knobWasParked =
          previousAngle === MIN_DEAD_ZONE_DEG ||
          previousAngle === MAX_DEAD_ZONE_DEG;

        if (knobWasParked) {
          let angleDiff = newAngle - previousAngle;
          if (angleDiff > 180) angleDiff -= 360;
          if (angleDiff < -180) angleDiff += 360;

          if (Math.abs(angleDiff) > DEAD_ZONE_SWEEP) {
            newAngle = previousAngle;
          }
        }
      }

      rotation.value = newAngle;

      // 7. Call prop with the *actual* value
      if (onValueChange) {
        const newValue = getActualValueFromAngle(
          rotation.value,
          min,
          max,
          step
        );
        runOnJS(onValueChange)(newValue);
      }
    });

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // 8. Update valueText to format the actual value
  const valueText = useDerivedValue(() => {
    const val = derivedActualValue.value;
    // Show decimals if step is fractional
    const decimals = step < 1 ? 1 : 0;
    return `${val.toFixed(decimals)}${valueSuffix}`;
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={{ width: size, height: size }}>
          <Image
            source={
              dialBaseImage
                ? dialBaseImage
                : isDark
                ? require("../assets/images/dial-base.png")
                : require("../assets/images/dial-base-dark.png")
            }
            style={styles.knobImage}
          />
          <Animated.Image
            source={
              indicatorImage || require("../assets/images/knob-indicator.png")
            }
            style={[styles.knobImage, styles.indicator, indicatorStyle]}
          />
        </Animated.View>
      </GestureDetector>

      <Text style={styles.labelText}>{label.toUpperCase()}</Text>
      {/* 9. Render the new formatted value text */}
      <Text style={styles.valueText}>{valueText.value}</Text>
    </View>
  );
};

// --- Dynamic Style Factory Function (No Change) ---
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
      color: colors.icon,
    },
    valueText: {
      fontSize: 16,
      color: colors.textMuted,
      marginTop: 2,
    },
  });
