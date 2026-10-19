import { Animated, Easing, View } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { LayoutChangeEvent } from "react-native";
import { useMotion } from "./Motion";

const DRIVER = { useNativeDriver: true } as const;
const FALLBACK_WIDTH = 1200;

type MarqueeProps = {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
};

/**
 * Ticker seamless: satu baris diukur lalu dirender dua kali, digeser
 * tepat satu lebar baris, lalu diulang.
 *
 * Perulangan dibuat manual lewat `onEnd` — bukan `Animated.loop` — karena
 * di react-native-web loop hanya memutar satu iterasi lalu berhenti di
 * nilai akhir, sehingga ticker diam dan teksnya tergeser keluar area clip.
 *
 * Kalau onLayout tidak pernah memberi lebar (mis. belum ter-mount atau
 * ter-measure 0 saat Fast Refresh), tetap ada fallback supaya ticker
 * tidak pernah diam selamanya.
 */
export function Marquee({
  children,
  duration = 26,
  reverse = false,
  className = "",
}: MarqueeProps) {
  const { reduceMotion } = useMotion();
  const [width, setWidth] = useState(0);
  const x = useRef(new Animated.Value(0)).current;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setWidth((prev) => (prev === w ? prev : w));
  }, []);

  useEffect(() => {
    if (width === 0) return;
    const t = setTimeout(() => setWidth((prev) => prev || FALLBACK_WIDTH), 900);
    return () => clearTimeout(t);
  }, [width]);

  useEffect(() => {
    if (reduceMotion || width === 0) return;

    let alive = true;
    let running = true;

    const step = () => {
      if (!alive || !running) return;
      // Arah kanan harus mulai dari -width lalu naik ke 0. Kalau mulai dari 0
      // menuju +width, ada momen seluruh konten berada di luar area clip
      // sehingga pita terlihat kosong.
      x.setValue(reverse ? -width : 0);
      Animated.timing(x, {
        toValue: reverse ? 0 : -width,
        duration: (duration * (width / FALLBACK_WIDTH)) * 1000,
        easing: Easing.linear,
        ...DRIVER,
      }).start(() => {
        if (alive && running) step();
      });
    };

    const onVisibility = () => {
      if (typeof document === "undefined") return;
      if (document.hidden) {
        running = false;
      } else if (!running) {
        running = true;
        step();
      }
    };

    step();
    document?.addEventListener?.("visibilitychange", onVisibility);
    return () => {
      alive = false;
      running = false;
      document?.removeEventListener?.("visibilitychange", onVisibility);
    };
  }, [width, reduceMotion, duration, reverse, x]);

  const row = (hidden?: boolean) => (
    <View
      onLayout={hidden ? undefined : onLayout}
      className="flex-row"
      aria-hidden={hidden || undefined}
    >
      {children}
    </View>
  );

  return (
    <View className={`overflow-hidden ${className}`}>
      <Animated.View
        style={[{ flexDirection: "row" }, { transform: [{ translateX: x }] }]}
      >
        {row(false)}
        {row(true)}
      </Animated.View>
    </View>
  );
}