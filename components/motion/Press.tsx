import {
  Animated,
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { ReactNode } from "react";
import { useCallback, useMemo, useRef } from "react";

const DRIVER = { useNativeDriver: true } as const;

/**
 * Nilai konstan 1. Tidak pernah diubah, jadi aman dipakai bersama oleh
 * semua tombol — tanpa ini tiap render membuat `Animated.Value` dan graf
 * animasi baru untuk setiap tombol yang sedang dirender ulang.
 */
const ONE = new Animated.Value(1);

type HoverHandlers = {
  onHoverIn?: () => void;
  onHoverOut?: () => void;
};

/** Nilai 0 = idle, 1 = hover. */
export function useHover() {
  const hovered = useRef(new Animated.Value(0)).current;

  const setHovered = useCallback(
    (v: boolean) => {
      Animated.spring(hovered, {
        toValue: v ? 1 : 0,
        damping: 18,
        stiffness: 190,
        mass: 0.5,
        ...DRIVER,
      }).start();
    },
    [hovered],
  );

  const handlers: HoverHandlers = useMemo(
    () => ({
      onHoverIn: () => setHovered(true),
      onHoverOut: () => setHovered(false),
    }),
    [setHovered],
  );

  return { hovered, handlers };
}

type PressProps = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  hoverScale?: number;
  pressScale?: number;
} & Omit<PressableProps, "style" | "children">;

export function Press({
  children,
  className = "",
  style,
  hoverScale = 0.975,
  pressScale = 0.94,
  style: pressableStyle,
  onPressIn,
  onPressOut,
  ...rest
}: PressProps) {
  const pressed = useRef(new Animated.Value(0)).current;
  const { hovered, handlers } = useHover();

  const scale = useMemo(
    () =>
      Animated.add(
        Animated.add(ONE, Animated.multiply(hovered, hoverScale - 1)),
        Animated.multiply(pressed, pressScale - 1),
      ),
    [hovered, pressed, hoverScale, pressScale],
  );

  return (
    <View className={className} style={style}>
      <Animated.View
        style={{ flexDirection: "row", transform: [{ scale }] }}
      >
        <Pressable
          {...rest}
          {...handlers}
          style={[{ flexShrink: 1 }, pressableStyle]}
          onPressIn={(e) => {
            Animated.timing(pressed, {
              toValue: 1,
              duration: 90,
              ...DRIVER,
            }).start();
            onPressIn?.(e);
          }}
          onPressOut={(e) => {
            Animated.timing(pressed, {
              toValue: 0,
              duration: 130,
              ...DRIVER,
            }).start();
            onPressOut?.(e);
          }}
        >
          {children}
        </Pressable>
      </Animated.View>
    </View>
  );
}
