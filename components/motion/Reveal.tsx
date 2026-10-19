import { Animated, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMotion } from "./Motion";

type Measurable = {
  measureInWindow?: (
    cb: (x: number, y: number, w: number, h: number) => void,
  ) => void;
};

/**
 * onLayout hanya memberi offset dari parent, jadi untuk elemen bersarang
 * nilainya tidak bisa dipakai untuk animasi scroll. Di sini diukur lewat
 * measureInWindow supaya dapat posisi terhadap halaman.
 */
export function useContentY() {
  const [pageY, setPageY] = useState<number | null>(null);

  const measure = useCallback((fallback: number, node?: unknown) => {
    const target = node as Measurable | undefined;
    if (target?.measureInWindow) {
      target.measureInWindow((_x, y) => setPageY(y));
    } else {
      setPageY(fallback);
    }
  }, []);

  return { pageY, measure };
}

/**
 * CATATAN: react-native-web membuang className pada Animated.View, jadi node
 * luar memakai View biasa (pemegang className + layout) dan hanya node
 * dalam yang dianimasikan. Karena itu Animated.View tidak boleh punya
 * className, dan wrap ini hanya aman untuk konten yang flow-nya vertikal.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 30,
  offset = 190,
  className = "",
  fill = false,
  style,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  offset?: number;
  className?: string;
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { scrollY, viewportH, reduceMotion } = useMotion();
  const { pageY, measure } = useContentY();

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => measure(e.nativeEvent.layout.y, e.target),
    [measure],
  );

  const animated = useMemo<StyleProp<ViewStyle>>(() => {
    if (reduceMotion || pageY == null) {
      return { opacity: 1, transform: [{ translateY: 0 }] };
    }
    const raw = Animated.add(
      scrollY,
      viewportH * 0.86 + pageY - delay * 70 - offset,
    );
    const p = raw.interpolate({
      inputRange: [-offset, 0],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });
    return {
      opacity: p,
      transform: [
        {
          translateY: p.interpolate({
            inputRange: [0, 1],
            outputRange: [distance, 0],
          }),
        },
      ],
    };
  }, [scrollY, pageY, delay, distance, offset, viewportH, reduceMotion]);

  return (
    <View onLayout={onLayout} className={className} style={style}>
      <Animated.View style={fill ? [{ flex: 1 }, animated] : animated}>
        {children}
      </Animated.View>
    </View>
  );
}

export function RevealItem({
  index,
  children,
  className = "",
  fill = false,
  style,
}: {
  index: number;
  children: ReactNode;
  className?: string;
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Reveal delay={index} className={className} fill={fill} style={style}>
      {children}
    </Reveal>
  );
}
