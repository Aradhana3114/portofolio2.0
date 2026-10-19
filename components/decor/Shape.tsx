import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

const BLOBS = [
  "M100 6c40 0 74 34 68 78 24 34 12 80-24 98-20 20-56 16-74-6-38 8-70-22-66-60-16-32 2-72 40-82C54 18 76 6 100 6Z",
  "M8 60C8 24 42 4 78 12c32-16 74-4 86 28 34 12 36 56 8 76-4 36-44 60-78 48-36 14-76-12-74-48C4 100 2 76 8 60Z",
  "M100 8c46 0 84 34 82 78 18 32 6 76-30 94-20 22-58 22-78 2-40 6-70-26-64-62C-4 88 12 48 50 40 60 18 78 8 100 8Z",
];

type ShapeProps = {
  color: string;
  /** 0–3, indeks bentuk organik. */
  variant?: 0 | 1 | 2;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: object;
  opacity?: number;
};

export function Blob({
  color,
  variant = 0,
  width = "100%",
  height,
  className = "",
  style,
  opacity = 1,
}: ShapeProps) {
  return (
    <View className={className} style={[{ width, height }, style]}>
      <Svg viewBox="0 0 200 200" width="100%" height="100%">
        <Path d={BLOBS[variant]} fill={color} opacity={opacity} />
      </Svg>
    </View>
  );
}

export function PlusSketch({
  size = 22,
  color = "#191717",
  strokeWidth = 5,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path
        d="M3.25 16.4 27.2 14.85M16.57 26.79 13.25 3.03"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function ArrowUpRight({
  size = 18,
  color = "#191717",
  strokeWidth = 3.4,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M7.29 6.35 17.73 6.84 18.23 17.28M17.5 7.17 6.9 17.78"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function ArrowDown({
  size = 20,
  color = "#191717",
  strokeWidth = 3.4,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 4.5v14M6.5 13l5.5 5.5L17.5 13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function SlantWedge({
  color = "#ff2f11",
  width,
  height = 48,
  flip = false,
}: {
  color?: string;
  width: number | string;
  height?: number;
  flip?: boolean;
}) {
  return (
    <Svg width={width as number} height={height} viewBox="0 0 100 6">
      <Path d={flip ? "M0 6 100 0H0Z" : "M0 0 100 6H0Z"} fill={color} />
    </Svg>
  );
}

export function Squiggle({
  width = 120,
  color = "#e4fc51",
  strokeWidth = 8,
}: {
  width?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={width} height={strokeWidth * 4} viewBox="0 0 120 32">
      <Path
        d="M2 22c10-18 20 12 30-4s20 14 30-2 20 10 30-6 18 6 26-2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function Asterisk({
  size = 26,
  color = "#e4fc51",
  strokeWidth = 5,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path
        d="M16 3v26M5 9.5l22 13M27 9.5l-22 13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function Lock({
  size = 22,
  color = "#191717",
  strokeWidth = 2.4,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4.6 10.4h14.8v10.2H4.6zM8.2 10.4V7.3a3.8 3.8 0 0 1 7.6 0v3.1"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M12 14v3.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function Eye({
  size = 20,
  color = "#191717",
  strokeWidth = 2.2,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M1.8 12S5.6 5.6 12 5.6 22.2 12 22.2 12 18.4 18.4 12 18.4 1.8 12 1.8 12Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M12 9.1a2.9 2.9 0 1 1 0 5.8 2.9 2.9 0 0 1 0-5.8Z"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
    </Svg>
  );
}

export function EyeOff({
  size = 20,
  color = "#191717",
  strokeWidth = 2.2,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M1.8 12S5.6 5.6 12 5.6c1.5 0 2.8.35 4 .9M22.2 12s-3.8 6.4-10.2 6.4c-1.6 0-3-.4-4.2-1"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M9.7 9.8a2.9 2.9 0 0 0 4.1 4.1M3.4 3.4l17.2 17.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}