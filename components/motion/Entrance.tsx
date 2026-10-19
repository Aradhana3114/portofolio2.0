import { Animated, Easing, View, type StyleProp, type ViewStyle } from "react-native";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useMotion } from "./Motion";

const DRIVER = { useNativeDriver: true } as const;

/**
 * Jaring pengaman: kalau animasi tidak pernah berjalan (mis. efek tidak
 * tereksekusi karena remount saat Fast Refresh), konten tetap harus
 * terlihat. Tanpa ini satu node yang macet di opacity 0 = blok hilang.
 */
function useRevealSafety(value: Animated.Value, ms: number) {
  const done = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if (!done.current) value.setValue(1);
    }, ms);
    return () => clearTimeout(t);
  }, [value, ms]);
}

/**
 * Entrance satu kali saat mount. `delay` dalam milidetik.
 * Selalu berakhir di opacity 1.
 */
export function useEntrance(delay = 0, distance = 26) {
  const { reduceMotion } = useMotion();
  const p = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useRevealSafety(p, 1800 + delay);

  useEffect(() => {
    if (reduceMotion) {
      p.setValue(1);
      return;
    }
    const anim = Animated.timing(p, {
      toValue: 1,
      duration: 620,
      delay,
      easing: Easing.out(Easing.cubic),
      ...DRIVER,
    });
    anim.start(() => p.setValue(1));
    return () => anim.stop();
  }, [delay, p, reduceMotion]);

  return {
    opacity: p,
    transform: [
      { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
    ],
  };
}

export function Entrance({
  children,
  delay = 0,
  distance = 26,
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const animated = useEntrance(delay, distance);
  return (
    <View className={className} style={style}>
      <Animated.View style={animated}>{children}</Animated.View>
    </View>
  );
}

/** Berhenti sejenak saat tab tidak aktif agar tidak membebani CPU. */
const LOOP = { iterations: -1, resetBeforeIteration: true } as const;

/**
 * Animasi berulang.
 *
 *Tidak memakai Animated.loop: di react-native-web loop hanya memutar satu
 * iterasi lalu berhenti di nilai akhir (ticker diam, teksnya keluar dari
 * area clip). Pola di bawah memakai onEnd untuk memulai siklus berikutnya
 * secara eksplisit, jadi tidak bergantung perilaku internal loop.
 */
export function useRepeat(
  build: (v: Animated.Value) => Animated.CompositeAnimation,
  deps: unknown[],
  enabled = true,
  restart: (v: Animated.Value) => void = () => {},
) {
  const { reduceMotion } = useMotion();
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion || !enabled) return;
    let alive = true;
    let running = true;

    const step = () => {
      if (!alive || !running) return;
      build(v).start(() => {
        if (alive && running) step();
      });
    };

    const onVisibility = () => {
      if (typeof document === "undefined") return;
      if (document.hidden) {
        running = false;
      } else if (!running) {
        running = true;
        restart(v);
        step();
      }
    };

    restart(v);
    step();
    document?.addEventListener?.("visibilitychange", onVisibility);
    return () => {
      alive = false;
      running = false;
      document?.removeEventListener?.("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v, reduceMotion, enabled, ...deps]);

  return v;
}

export function useSpin(
  degreesPerTurn: number,
  seconds: number,
  reverse = false,
  enabled = true,
) {
  const p = useRepeat(
    (v) =>
      Animated.timing(v, {
        toValue: reverse ? -degreesPerTurn : degreesPerTurn,
        duration: seconds * 1000,
        easing: Easing.linear,
        ...DRIVER,
      }),
    [degreesPerTurn, seconds, reverse],
    enabled,
  );

  return {
    transform: [
      {
        rotate: p.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${degreesPerTurn}deg`],
        }),
      },
    ],
  };
}

export function useDrift(dx: number, dy: number, seconds = 9, enabled = true) {
  const p = useRepeat(
    (v) =>
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: seconds * 1000, easing: Easing.inOut(Easing.sin), ...DRIVER }),
        Animated.timing(v, { toValue: 0, duration: seconds * 1000, easing: Easing.inOut(Easing.sin), ...DRIVER }),
      ]),
    [dx, dy, seconds],
    enabled,
  );

  return {
    transform: [
      { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
      { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [dy, 0] }) },
      { rotate: p.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "6deg"] }) },
    ],
  };
}

export function useFadeTo(active: boolean, duration = 240) {
  const { reduceMotion } = useMotion();
  const p = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(p, {
      toValue: active ? 1 : 0,
      duration: reduceMotion ? 0 : duration,
      ...DRIVER,
    }).start();
  }, [active, p, duration, reduceMotion]);

  return p;
}
