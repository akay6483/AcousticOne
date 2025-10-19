import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const KNOB_SIZE = width * 0.8;
const CENTER = { x: KNOB_SIZE / 2, y: KNOB_SIZE / 2 };

type KnobProps = {
  initialValue?: number;
  onValueChange?: (value: number) => void;
};

const getValueFromAngle = (angle: number): number => {
  "worklet";
  const positiveAngle = (angle + 360) % 360;
  return Math.floor(positiveAngle / 3.6);
};

const getAngleFromValue = (value: number): number => {
  "worklet";
  return value * 3.6;
};

export const Knob: React.FC<KnobProps> = ({
  initialValue = 0,
  onValueChange,
}) => {
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

  const textStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.knobContainer}>
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

      <Animated.View style={[styles.textWrapper, textStyle]}>
        <Text style={styles.textValue}>{derivedValue.value}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  knobContainer: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  knobImage: {
    position: "absolute",
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    resizeMode: "contain",
  },
  indicator: {
    position: "absolute",
  },
  textWrapper: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  textValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
});
