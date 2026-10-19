import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Defs, LinearGradient as SvgGradient, Rect, Stop } from "react-native-svg";
import { splash as splashCopy } from "@/data/content";
import { useMotion, useWide } from "./motion/Motion";
import { Display } from "./ui";
import { Asterisk } from "./decor/Shape";

/**
 * ScrollExpand — port React Native, dipakai di Android/iOS.
 *
 * Di web komponen ini TIDAK dipakai; lihat `ScrollExpandDom.tsx` untuk
 * Penjelasan kenapa (ringkas: `clip-path` + `position: sticky` tidak ada di
 * RN, sehingga port ini harus menganimasikan layout properties).
 */

type Size = { w: number; h: number };
const ZERO: Size = { w: 0, h: 0 };

/**
 * Ukuran stage untuk ScrollExpand.
 *
 * Di web sengaja TIDAK memakai `useWindowDimensions()` untuk render pertama.
 * Saat static export, server merender dengan komposisi mobile sementara render
 * pertama client sudah tahu viewport asli. Bedanya pada geometry yang
 * interpolated (width/height/radius) memicu React error #418, yang membuat
 * React membuang HTML server lalu render ulang dari nol — semua animasi
 * ter-reset. Pola yang sama sudah dipakai `useWide()` di Motion.tsx.
 */
function useStageSize(): Size {
  const { width, height } = useWindowDimensions();
  const [measured, setMeasured] = useState<Size | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const read = () =>
      setMeasured({
        w: window.innerWidth || 0,
        h: window.innerHeight || 0,
      });
    read();
    window.addEventListener("resize", read);
    window.addEventListener("orientationchange", read);
    return () => {
      window.removeEventListener("resize", read);
      window.removeEventListener("orientationchange", read);
    };
  }, []);

  if (Platform.OS === "web") return measured ?? ZERO;
  return { w: width, h: height };
}

export type ScrollExpandProps = {
  /**
   * Nilai scroll Y mentah dari JS thread (dari `listener` pada
   * `Animated.event`), BUKAN progress 0–1. Komponen ini yang melakukan
   * smoothing-nya sendiri.
   *
   * Harus di-feed lewat `listener`, karena width/height/borderRadius tidak
   * aman untuk native driver dan nilai native-driven tidak bisa dibaca di
   * JS thread.
   */
  scrollY: Animated.Value;
  src?: string;
  alt?: string;
  title?: string;
  scrollHint?: string;
  /**
   * Lebar frame saat diam, dalam persen dari stage. Default mengikuti
   * breakpoint: 42% terlalu sempit untuk layar 390px (cuma ~164px), jadi
   * mobile memakai frame yang lebih lebar dan lebih pendek.
   */
  startWidth?: number;
  /** Tinggi frame saat diam, dalam persen dari stage. */
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  /** Media mulai over-zoom lalu easing balik ke 1 saat frame terbuka. */
  mediaZoom?: number;
  /** Panjang scroll untuk ekspansi, kelipatan tinggi stage. */
  scrollDistance?: number;
  /** Scroll tambahan yang ditahan full-bleed sebelum dilepas. */
  holdDistance?: number;
  overlayScrim?: number;
  /** Waktu follow dalam detik. `0` mengunci frame ke scrollbar. */
  smoothing?: number;
  enabled?: boolean;
  children?: ReactNode;
};

export default function ScrollExpand({
  scrollY,
  src,
  alt = "",
  title = splashCopy.title,
  scrollHint = splashCopy.hint,
  startWidth,
  startHeight,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 0.8,
  holdDistance = 0.2,
  overlayScrim = 0.45,
  smoothing = 0.1,
  enabled = true,
  children,
}: ScrollExpandProps) {
  const { reduceMotion } = useMotion();
  const wide = useWide();
  const stage = useStageSize();

  const restWPercent = startWidth ?? (wide ? 42 : 74);
  const restHPercent = startHeight ?? (wide ? 58 : 52);

  const held = reduceMotion || !enabled;
  const ready = stage.w > 0 && stage.h > 0;

  // Nilai tetap di 1 supaya semua interpolasi dievaluasi pada kondisi
  // "terbuka penuh" tanpa animasi yang menempel ke scroll.
  const forced = useRef(new Animated.Value(1)).current;
  // Ekspansi (width/height/radius/media/overlay) memakai nilai yang di-lerp.
  const progress = useRef(new Animated.Value(0)).current;
  const expansion = held ? forced : progress;
  // Pin TIDAK boleh di-lerp — lihat catatan di bawah `pinY`.
  const pinDriver = held ? forced : scrollY;

  const smoothingRef = useRef(smoothing);
  smoothingRef.current = smoothing;

  /**
   * Smoothing (lerp) ala React Bits.
   *
   * Tanpa ini frame dikunci persis ke scrollbar, dan di perangkat yang
   * scroll-nya tidak stabil 60fps jawabannya terlihat patah-putar. Di sini
   * scroll mentah disimpan di ref lalu dikejar di loop rAF, memakai rumus
   * yang sama:
   *
   *   k = 1 - exp(-1 / (60 * smoothing))
   *   current += (target - current) * k
   *
   * Loop hanya hidup ketika ada beda (di-kick oleh listener scroll) dan
   * berhenti sendiri begitu konvergen, jadi tidak membakar frame saat idle.
   */
  useEffect(() => {
    if (held) {
      progress.setValue(0);
      return;
    }

    const raw = { current: 0 };
    const cur = { current: 0 };
    let raf = 0;

    const tick = () => {
      const s = smoothingRef.current;
      const target = raw.current;
      if (s <= 0) {
        cur.current = target;
        progress.setValue(target);
        raf = 0;
        return;
      }
      const k = 1 - Math.exp(-1 / (60 * s));
      const next = cur.current + (target - cur.current) * k;
      // 0.25px sudah di bawah satu piksel, jadi boleh berhenti.
      if (Math.abs(target - next) < 0.25) {
        cur.current = target;
        progress.setValue(target);
        raf = 0;
        return;
      }
      cur.current = next;
      progress.setValue(next);
      raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    const id = scrollY.addListener(({ value }) => {
      raw.current = value;
      kick();
    });

    return () => {
      scrollY.removeListener(id);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollY, held, progress]);

  const scrollDist = Math.max(0.01, scrollDistance);
  const span = stage.h * scrollDist;
  const maxPin = span + stage.h * Math.max(0, holdDistance);
  const trackH = held
    ? stage.h
    : stage.h * (1 + scrollDist + Math.max(0, holdDistance));

  const restW = stage.w * (restWPercent / 100);
  const restH = stage.h * (restHPercent / 100);

  // p = 0..1 sepanjang span ekspansi.
  const p = expansion.interpolate({
    inputRange: [0, span || 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // smoothstep(t) ≈ bezier(0.42, 0, 0.58, 1)
  const e = p.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  });

  const frameW = e.interpolate({ inputRange: [0, 1], outputRange: [restW, stage.w] });
  const frameH = e.interpolate({ inputRange: [0, 1], outputRange: [restH, stage.h] });
  const frameR = e.interpolate({ inputRange: [0, 1], outputRange: [startRadius, endRadius] });

  // Asal `inset(iy% ix%)` memusatkan frame dengan menyisakan jarak sama di
  // semua sisi. Di sini dua sisipan itu jadi offset kiri/atas yang ikut
  // interpolate: dari offset tengah → 0 saat frame jadi full-bleed.
  const frameLeft = e.interpolate({
    inputRange: [0, 1],
    outputRange: [(stage.w - restW) / 2, 0],
  });
  const frameTop = e.interpolate({
    inputRange: [0, 1],
    outputRange: [(stage.h - restH) / 2, 0],
  });

  const mediaScale = e.interpolate({ inputRange: [0, 1], outputRange: [mediaZoom, 1] });
  const scrimOpacity = e.interpolate({ inputRange: [0, 1], outputRange: [0, overlayScrim] });

  // Rekonstruksi `position: sticky`: track berada di content-y 0, sehingga
  // frame absolute di top:0 punya viewport-y = -scrollY. Menambah scrollY
  // (dibatasi maxPin) mengembalikan viewport-y ke 0 → frame terkunci di atas.
  //
  // PENTING: ini memakai scrollY mentah, BUKAN nilai yang sudah di-lerp.
  // Kalau pin ikut di-lerp, saat scroll turun nilai `cur` selalu tertinggal
  // dari `raw`, sehingga viewport-y = -raw + cur menjadi negatif dan frame
  // terlihat "naik ke atas" keluar layar lalu menyusul. Di React Bits asli
  // ini tidak terjadi karena `position: sticky` ditangani browser, terpisah
  // dari lerp yang cuma menggerakkan clip-path.
  const pinY = pinDriver.interpolate({
    inputRange: [0, maxPin || 1],
    outputRange: [0, maxPin],
    extrapolate: "clamp",
  });

  // smoothstep(0.4, 0.88, p) — judul terangkat menjauh saat frame terbuka.
  const titleOpacity = p.interpolate({
    inputRange: [0, 0.4, 0.88, 1],
    outputRange: [1, 1, 0, 0],
    extrapolate: "clamp",
  });
  const titleY = p.interpolate({
    inputRange: [0, 0.4, 0.88, 1],
    outputRange: [0, 0, -28, -28],
    extrapolate: "clamp",
  });
  const titleScale = p.interpolate({
    inputRange: [0, 0.4, 0.88, 1],
    outputRange: [1, 1, 1.06, 1.06],
    extrapolate: "clamp",
  });

  const hintOpacity = p.interpolate({
    inputRange: [0, 0.12, 1],
    outputRange: [1, 0, 0],
    extrapolate: "clamp",
  });
  const hintY = p.interpolate({
    inputRange: [0, 0.12, 1],
    outputRange: [0, 8, 8],
    extrapolate: "clamp",
  });

  const overlayOpacity = p.interpolate({
    inputRange: [0, 0.68, 1],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });
  const overlayY = p.interpolate({
    inputRange: [0, 0.68, 1],
    outputRange: [18, 18, 0],
    extrapolate: "clamp",
  });

  const titleSize = Math.max(20, Math.min(84, stage.w * 0.075));

  return (
    <View
      nativeID="scroll-expand"
      pointerEvents="none"
      style={{ height: trackH, backgroundColor: "#ff2f11", overflow: "hidden" }}
    >
      <Animated.View
        nativeID="scroll-expand-frame"
        style={{
          position: "absolute",
          top: frameTop,
          left: frameLeft,
          width: frameW,
          height: frameH,
          borderRadius: frameR,
          overflow: "hidden",
          opacity: ready ? 1 : 0,
          backgroundColor: "#3600a9",
          transform: [{ translateY: pinY }],
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: mediaScale }],
          }}
        >
          {src ? (
            <Image
              source={{ uri: src }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
              accessible
              accessibilityLabel={alt}
            />
          ) : (
            <View
              style={{
                flex: 1,
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Svg width="100%" height="100%" preserveAspectRatio="none">
                <Defs>
                  <SvgGradient id="seBg" x1="0" y1="0" x2="0.6" y2="1">
                    {splashCopy.gradient.map((c, i) => (
                      <Stop
                        key={c}
                        offset={i / (splashCopy.gradient.length - 1)}
                        stopColor={c}
                      />
                    ))}
                  </SvgGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#seBg)" />
              </Svg>
              <View style={{ position: "absolute" }}>
                <Asterisk
                  size={Math.min(stage.w, stage.h) * 0.26}
                  color="#e4fc51"
                  strokeWidth={7}
                />
              </View>
            </View>
          )}
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: scrimOpacity,
          }}
        >
          <Svg width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <SvgGradient id="seScrim" x1="0" y1="1" x2="0" y2="0">
                <Stop offset="0" stopColor="#000000" stopOpacity="0.75" />
                <Stop offset="0.45" stopColor="#000000" stopOpacity="0.1" />
                <Stop offset="1" stopColor="#000000" stopOpacity="0.35" />
              </SvgGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#seScrim)" />
          </Svg>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
            opacity: overlayOpacity,
            transform: [{ translateY: overlayY }],
          }}
        >
          {children ?? (
            <Display level="h4" color="text-paper" className="text-center">
              {splashCopy.body}
            </Display>
          )}
        </Animated.View>
      </Animated.View>

      {title ? (
        <Animated.View
          nativeID="scroll-expand-title"
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: stage.h,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
            opacity: titleOpacity,
            transform: [{ translateY: Animated.add(titleY, pinY) }, { scale: titleScale }],
          }}
        >
          <Text
            maxFontSizeMultiplier={1.05}
            numberOfLines={1}
            adjustsFontSizeToFit
            className="font-display uppercase text-paper"
            style={{
              fontSize: titleSize,
              lineHeight: titleSize,
              letterSpacing: -titleSize * 0.03,
              textAlign: "center",
              textShadowColor: "rgba(0,0,0,0.45)",
              textShadowRadius: 12,
              textShadowOffset: { width: 0, height: 2 },
            }}
          >
            {title}
          </Text>
        </Animated.View>
      ) : null}

      {scrollHint ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: stage.h - 44,
            alignItems: "center",
            opacity: hintOpacity,
            transform: [{ translateY: Animated.add(hintY, pinY) }],
          }}
        >
          <Text
            maxFontSizeMultiplier={1.2}
            className="font-mono text-paper"
            style={{ fontSize: 13, letterSpacing: 0.2, opacity: 0.55 }}
          >
            {scrollHint}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}
