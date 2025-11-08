import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef } from "react";
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
  useSharedValue,
} from "react-native-reanimated";

// --- Theme Imports ---
import { useTheme } from "../theme/ThemeContext";
import { lightColors } from "../theme/colors";
// import { useHaptics } from "../theme/HapticsContext"; // --- 1. REMOVED this incorrect line ---

// --- Audio Service Import (NEW) ---
import * as AudioService from "../services/audioService";

// --- Prop Types (Unchanged) ---
type KnobProps = {
  size: number;
  label: string;
  valueIndex: number;
  onIndexChange?: (valueIndex: number) => void;
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
  valueIndex,
  onIndexChange,
  dialBaseImage,
  indicatorImage,
  min = 0,
  max = 100,
  step = 1,
  valueSuffix = "",
}) => {
  // --- 2. FIXED: Get haptics AND audio settings from useTheme ---
  const { colors, isDark, isHapticsEnabled, isAudioEnabled } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const CENTER = { x: size / 2, y: size / 2 };

  const actualValue = useMemo(
    () => getValueFromIndex(valueIndex, min, step),
    [valueIndex, min, step]
  );
  const rotation = useSharedValue(
    getAngleFromActualValue(actualValue, min, max)
  );

  const previousIndex = useRef(valueIndex);

  // --- Load Audio Sound on Mount (NEW) ---
  useEffect(() => {
    // Load the sound when the component mounts
    AudioService.loadTickSound();

    // We will not unload it, so it stays ready for the app's lifetime
  }, []);

  useEffect(() => {
    const newActualValue = getValueFromIndex(valueIndex, min, step);
    rotation.value = getAngleFromActualValue(newActualValue, min, max);
    previousIndex.current = valueIndex;
  }, [valueIndex, min, max, step, rotation]);

  // --- 3. This haptics AND audio logic is now correct ---
  const handleIndexChange = (newIndex: number) => {
    if (onIndexChange) {
      onIndexChange(newIndex);
    }

    // Only trigger feedback if the index *actually* changed
    if (newIndex !== previousIndex.current) {
      if (isHapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      if (isAudioEnabled) {
        // This is already on the JS thread due to runOnJS
        AudioService.playTickSound();
      }
    }
    previousIndex.current = newIndex;
  };

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

      if (onIndexChange) {
        const newIndex = getIndexFromAngle(rotation.value, min, max, step);
        runOnJS(handleIndexChange)(newIndex);
      }
    });

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Text value calculation (Unchanged)
  const valueText = useMemo(() => {
    const val = actualValue;
    const decimals = step < 1 ? 1 : 0;
    return `${val.toFixed(decimals)}${valueSuffix}`;
  }, [actualValue, step, valueSuffix]);

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

      <Text style={styles.valueText}>{valueText}</Text>
    </View>
  );
};

// --- Styles (Unchanged) ---
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
