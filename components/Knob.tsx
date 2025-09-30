// Knob.tsx
import React, { useCallback, useMemo, useRef } from "react";
import { Dimensions, PanResponder, StyleSheet, View } from "react-native";
import { Circle, G, Svg, Text as SvgText } from "react-native-svg";

// --- Type Definitions for Props ---
interface KnobProps {
  value: number;
  onValueChange: (value: number) => void;
  size?: number;
  strokeWidth?: number;
  min?: number;
  max?: number;
  trackColor?: string;
  progressColor?: string;
  thumbColor?: string;
  textColor?: string;
}

// --- Helper Functions ---
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const valueToAngle = (value: number, min: number, max: number): number => {
  // Map value to a 0-360 degree range
  return ((value - min) * 360) / (max - min);
};

const angleToValue = (angle: number, min: number, max: number): number => {
  // Map angle (0-360) to the min-max range
  const value = (angle / 360) * (max - min) + min;
  return Math.round(value);
};

// --- Main Component ---
export const Knob: React.FC<KnobProps> = React.memo(
  ({
    value,
    onValueChange,
    size = Dimensions.get("window").width,
    strokeWidth = 15,
    min = 0,
    max = 100,
    trackColor = "#e0e0e0",
    progressColor = "#007bff",
    thumbColor = "#ffffff",
    textColor = "#333",
  }) => {
    const knobRef = useRef<View>(null);
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;

    // --- Gesture Handling ---
    const handleMove = useCallback(
      (evt: any) => {
        knobRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
          const touchX = evt.nativeEvent.pageX - pageX;
          const touchY = evt.nativeEvent.pageY - pageY;

          // Calculate angle from center to touch point
          const dX = touchX - center;
          const dY = touchY - center;
          const angleRad = Math.atan2(dY, dX);
          let angleDeg = (angleRad * 180) / Math.PI + 90;

          // Normalize angle to be 0-360
          if (angleDeg < 0) {
            angleDeg += 360;
          }

          const newValue = angleToValue(angleDeg, min, max);

          // Prevent jerky movements by checking if the change is too large (crossing the 0/360 boundary)
          if (Math.abs(newValue - value) < (max - min) / 2) {
            onValueChange(newValue);
          }
        });
      },
      [center, min, max, onValueChange, value]
    );

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => handleMove(evt),
        onPanResponderMove: (evt) => handleMove(evt),
      })
    ).current;

    // --- SVG Rendering Calculations ---
    const currentAngle = useMemo(
      () => valueToAngle(value, min, max),
      [value, min, max]
    );
    const thumbPosition = useMemo(
      () => polarToCartesian(center, center, radius, currentAngle),
      [center, radius, currentAngle]
    );

    return (
      <View
        style={styles.container}
        ref={knobRef}
        {...panResponder.panHandlers}
      >
        <Svg width={size} height={size}>
          <G>
            {/* Background Track */}

            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={trackColor}
              strokeWidth={strokeWidth - 1}
              fill="black"
            />
            {/* Progress Indicator */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={progressColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${2 * Math.PI * radius}`}
              strokeDashoffset={2 * Math.PI * radius * (1 - currentAngle / 360)}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90, ${center}, ${center})`}
            />
            {/* Thumb/Handle */}
            <Circle
              cx={thumbPosition.x}
              cy={thumbPosition.y}
              r={strokeWidth * 0.5} // Make thumb slightly larger than track
              fill={thumbColor}
              stroke={progressColor}
              strokeWidth={4}
            />

            {/* Value Text */}
            <SvgText
              x={center}
              y={center}
              textAnchor="middle"
              dy=".3em"
              fontSize={size / 4}
              fontWeight="bold"
              fill={textColor}
            >
              {value}
            </SvgText>
          </G>
        </Svg>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
