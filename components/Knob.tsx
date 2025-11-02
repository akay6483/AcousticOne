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

// --- Prop Types (Unchanged) ---
type KnobProps = {
  size: number;
  label: string;
  value: number;
  onValueChange?: (value: number) => void;
  dialBaseImage?: ImageSourcePropType;
  indicatorImage?: ImageSourcePropType;
};

// --- Angle Constants (Unchanged) ---
const MIN_DEAD_ZONE_DEG = 135;
const MAX_DEAD_ZONE_DEG = 225;
const DEAD_ZONE_SWEEP = 90;
const LIVE_ZONE_SWEEP = 270;
const START_ANGLE = MAX_DEAD_ZONE_DEG;
const END_ANGLE = MIN_DEAD_ZONE_DEG;

// --- Helper Functions (Unchanged) ---
const getValueFromAngle = (angle: number): number => {
  "worklet";
  const relativeAngle = (angle - START_ANGLE + 360) % 360;
  const percent = relativeAngle / LIVE_ZONE_SWEEP;
  return Math.min(Math.floor(percent * 100), 100);
};

const getAngleFromValue = (value: number): number => {
  "worklet";
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const percent = clampedValue / 100;
  const angle = (START_ANGLE + percent * LIVE_ZONE_SWEEP) % 360;
  return angle;
};

// --- MODIFIED: Main Component ---
export const Knob: React.FC<KnobProps> = ({
  size,
  label,
  value,
  onValueChange,
  dialBaseImage,
  indicatorImage,
}) => {
  // --- MODIFIED: Style & Theme Hook ---
  // We now pull `isDark` from the hook
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  // --- Animation Logic (Unchanged) ---
  const CENTER = { x: size / 2, y: size / 2 };
  const rotation = useSharedValue(getAngleFromValue(value));
  const derivedValue = useDerivedValue(() => {
    return getValueFromAngle(rotation.value);
  });

  useEffect(() => {
    rotation.value = getAngleFromValue(value);
  }, [value, rotation]);

  // --- panGesture (Unchanged) ---
  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onUpdate((event) => {
      // (Gesture logic is unchanged)
      // 1. Calculate coordinates
      const x = event.x - CENTER.x;
      const y = event.y - CENTER.y;

      // 2. Calculate touch angle
      const angleRad = Math.atan2(x, -y);
      let newAngle = ((angleRad * 180) / Math.PI + 360) % 360; // This is the touch angle

      // 3. Get knob's current position
      const previousAngle = rotation.value;

      // 4. Check if touch is in dead zone
      const touchInDeadZone =
        newAngle >= MIN_DEAD_ZONE_DEG && newAngle <= MAX_DEAD_ZONE_DEG;

      if (touchInDeadZone) {
        // --- Touch is in the dead zone ---
        if (previousAngle < 180) {
          newAngle = MIN_DEAD_ZONE_DEG; // Park at 135
        } else {
          newAngle = MAX_DEAD_ZONE_DEG; // Park at 225
        }
      } else {
        // --- Touch is in the live zone ---
        const knobWasParked =
          previousAngle === MIN_DEAD_ZONE_DEG ||
          previousAngle === MAX_DEAD_ZONE_DEG;

        if (knobWasParked) {
          // Check for "skip"
          let angleDiff = newAngle - previousAngle;
          if (angleDiff > 180) angleDiff -= 360;
          if (angleDiff < -180) angleDiff += 360;

          if (Math.abs(angleDiff) > DEAD_ZONE_SWEEP) {
            newAngle = previousAngle; // It's a skip! Don't move.
          }
        }
      }

      // 5. Update shared value
      rotation.value = newAngle;

      // 6. Call prop
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
          {/* --- MODIFIED: Base Image --- */}
          <Image
            source={
              dialBaseImage // 1. Use prop if provided
                ? dialBaseImage
                : isDark // 2. Otherwise, check theme
                ? require("../assets/images/dial-base.png") // 3. Dark theme -> light dial
                : require("../assets/images/dial-base-dark.png") // 4. Light theme -> dark dial
            }
            style={styles.knobImage}
          />

          {/* 2. Indicator Image (Unchanged) */}
          <Animated.Image
            source={
              indicatorImage || require("../assets/images/knob-indicator.png")
            }
            style={[styles.knobImage, styles.indicator, indicatorStyle]}
          />
        </Animated.View>
      </GestureDetector>

      <Text style={styles.labelText}>{label.toUpperCase()}</Text>
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
