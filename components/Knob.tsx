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
  useAnimatedStyle, // Kept for the rotation animation
  useSharedValue,
} from "react-native-reanimated";

// --- Theme Imports ---
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";

// --- Prop Types (Unchanged) ---
type KnobProps = {
  size: number;
  label: string;
  valueIndex: number; // CHANGED: This is now the step index (e.g., 0, 1, 2...)
  onIndexChange?: (valueIndex: number) => void; // CHANGED: This returns the step index
  dialBaseImage?: ImageSourcePropType;
  indicatorImage?: ImageSourcePropType;
  min?: number;
  max?: number;
  step?: number;
  valueSuffix?: string;
};

// --- Angle Constants (Unchanged) ---
const MIN_DEAD_ZONE_DEG = 135;
const MAX_DEAD_ZONE_DEG = 225;
const DEAD_ZONE_SWEEP = 90;
const LIVE_ZONE_SWEEP = 270;
const START_ANGLE = MAX_DEAD_ZONE_DEG;
const END_ANGLE = MIN_DEAD_ZONE_DEG;

// --- Helper Functions (Unchanged) ---
// ... (getValueFromIndex, getIndexFromAngle, etc. are all unchanged)
const getValueFromIndex = (
  index: number,
  min: number,
  step: number
): number => {
  "worklet";
  return index * step + min;
};
const getIndexFromValue = (
  value: number,
  min: number,
  step: number
): number => {
  "worklet";
  return Math.round((value - min) / step);
};
const getPercentFromValue = (
  value: number,
  min: number,
  max: number
): number => {
  "worklet";
  const clampedValue = Math.min(Math.max(value, min), max);
  return (clampedValue - min) / (max - min);
};
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
  const snappedValue = Math.round(rawValue / step) * step;
  return Math.min(Math.max(snappedValue, min), max);
};
const getIndexFromAngle = (
  angle: number,
  min: number,
  max: number,
  step: number
): number => {
  "worklet";
  const actualValue = getActualValueFromAngle(angle, min, max, step);
  return getIndexFromValue(actualValue, min, step);
};

// --- MODIFIED: Main Component ---
export const Knob: React.FC<KnobProps> = ({
  size,
  label,
  valueIndex, // CHANGED
  onIndexChange, // CHANGED
  dialBaseImage,
  indicatorImage,
  min = 0,
  max = 100,
  step = 1,
  valueSuffix = "",
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const CENTER = { x: size / 2, y: size / 2 };

  // This `actualValue` is on the JS thread and updates when `valueIndex` prop changes
  const actualValue = useMemo(
    () => getValueFromIndex(valueIndex, min, step),
    [valueIndex, min, step]
  );

  // This `rotation` is on the UI thread for the gesture
  const rotation = useSharedValue(
    getAngleFromActualValue(actualValue, min, max)
  );

  // This effect syncs the prop change to the UI thread (for the indicator)
  useEffect(() => {
    const newActualValue = getValueFromIndex(valueIndex, min, step);
    rotation.value = getAngleFromActualValue(newActualValue, min, max);
  }, [valueIndex, min, max, step, rotation]);

  // --- panGesture (Unchanged) ---
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

      // Call prop with the *step index*
      if (onIndexChange) {
        const newIndex = getIndexFromAngle(rotation.value, min, max, step);
        runOnJS(onIndexChange)(newIndex);
      }
    });

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // *** --- THIS IS THE FIX --- ***
  // 1. REMOVED the `useDerivedValue` for `derivedActualValue` and `valueText`.
  // 2. CREATED a new `valueText` using `useMemo`. This variable is on the
  //    JS thread and will update *whenever `actualValue` changes*.
  const valueText = useMemo(() => {
    const val = actualValue; // Use the JS-thread `actualValue`
    const decimals = step < 1 ? 1 : 0;
    return `${val.toFixed(decimals)}${valueSuffix}`;
  }, [actualValue, step, valueSuffix]); // Dependencies

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

      {/* 3. Render the new JS-thread `valueText` variable. */}
      <Text style={styles.valueText}>{valueText}</Text>
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
