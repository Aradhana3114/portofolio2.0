import { useEffect, useRef, useState } from "react";
import { Animated, Linking, Platform, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { nav, profile, socials } from "@/data/content";
import { useSectionScroll } from "./SectionScroll";
import { Press } from "./motion/Press";
import { useMotion, useWide } from "./motion/Motion";
import { Display } from "./ui";

const DRIVER = { useNativeDriver: true } as const;

function OverlayLink({
  label,
  index,
  progress,
  wide,
  onPress,
}: {
  label: string;
  index: number;
  progress: Animated.Value;
  wide: boolean;
  onPress: () => void;
}) {
  const distance = 18 + index * 12;
  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          {
            translateY: Animated.multiply(
              Animated.add(new Animated.Value(distance), Animated.multiply(progress, -distance)),
              1,
            ),
          },
        ],
      }}
    >
      <Press onPress={onPress}>
        <View
          className="rounded-pill px-4 py-2"
          style={{ marginLeft: index % 2 === 1 ? (wide ? 56 : 16) : 0 }}
        >
          <Text
            maxFontSizeMultiplier={1.1}
            className="font-display uppercase text-paper"
            style={{ fontSize: wide ? 56 : 34, lineHeight: wide ? 46 : 30 }}
          >
            {label}
          </Text>
        </View>
      </Press>
    </Animated.View>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const { scrollTo } = useSectionScroll();
  const wide = useWide();
  const { reduceMotion } = useMotion();
  const isWeb = Platform.OS === "web";
  const progress = useRef(new Animated.Value(0)).current;

  const go = (id: string) => {
    setOpen(false);
    Animated.timing(progress, {
      toValue: 0,
      duration: reduceMotion ? 0 : 180,
      ...DRIVER,
    }).start();
    requestAnimationFrame(() => scrollTo(id));
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    Animated.timing(progress, {
      toValue: next ? 1 : 0,
      duration: reduceMotion ? 0 : next ? 240 : 180,
      ...DRIVER,
    }).start();
  };

  useEffect(() => {
    progress.setValue(open ? 1 : 0);
  }, [progress, open]);

  // Header disembunyikan saat scroll ke bawah supaya tidak selalu menutupi
  // konten, dan muncul lagi saat scroll ke atas. Web-only: di native header
  // memakai position absolute sehingga sudah ikut ter-scroll.
  const hidden = useRef(new Animated.Value(0)).current;
  // Status yang sedang dituju (false = terlihat, true = tersembunyi). Dipakai
  // supaya animasi hanya dimulai saat status benar-benar berubah.
  const hiddenState = useRef(false);

  useEffect(() => {
    if (!isWeb) return;
    let last: number | null = null;
    let shown = hiddenState.current;

    const onScroll = (e: Event) => {
      if (open) return;
      const target = e.target as HTMLElement | null;
      const y = target && typeof target.scrollTop === "number" ? target.scrollTop : 0;
      if (last === null) {
        last = y;
        return;
      }
      const dy = y - last;
      const show = y < 48 || dy < -4;
      const hide = dy > 6 && y > 96;
      // `null` berarti event ini tidak memutuhkan perubahan apa pun. Tanpa
      // penyaringan ini setiap frame scroll ke bawah memulai `Animated.timing`
      // baru, jadi animasi restart dari nol terus-menerus saat scroll cepat.
      const next = show ? false : hide ? true : null;
      if (next !== null && next !== shown) {
        shown = next;
        hiddenState.current = next;
        Animated.timing(hidden, {
          toValue: next ? 1 : 0,
          duration: reduceMotion ? 0 : 180,
          ...DRIVER,
        }).start();
      }
      last = y;
    };

    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", onScroll, { capture: true } as never);
  }, [hidden, open, isWeb, reduceMotion]);

  const chrome = {
    opacity: hidden.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
    transform: [
      {
        translateY: hidden.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -88],
        }),
      },
    ],
  };

  const overlay = {
    opacity: progress,
    transform: [
      {
        translateY: Animated.multiply(
          new Animated.Value(-24),
          Animated.add(new Animated.Value(1), Animated.multiply(progress, -1)),
        ),
      },
    ],
  };

  const rootStyle = {
    position: isWeb ? ("fixed" as const) : ("absolute" as const),
    left: 0,
    right: 0,
    top: 0,
    paddingTop: 8,
    zIndex: 50,
  };

  return (
    <Animated.View
      style={
        [
          rootStyle,
          isWeb ? chrome : undefined,
        ] as unknown as StyleProp<ViewStyle>
      }
      pointerEvents={open ? "auto" : "box-none"}
    >
      <View
        pointerEvents="box-none"
        className="w-full flex-row items-center justify-between px-5"
        style={{ maxWidth: 1472, alignSelf: "center" }}
      >
        <Press onPress={() => go("home")} accessibilityRole="link">
          <View className="rounded-pill bg-ground px-4 py-3">
            <Text
              maxFontSizeMultiplier={1.1}
              className="font-display text-sm uppercase text-ink"
            >
              {profile.logo}
            </Text>
          </View>
        </Press>

        <Press
          onPress={toggle}
          accessibilityRole="button"
          accessibilityLabel={open ? "Tutup menu" : "Buka menu"}
        >
          <View className="flex-row items-center gap-3 rounded-pill bg-ground px-5 py-3">
            <Text
              maxFontSizeMultiplier={1.1}
              className="font-display text-sm uppercase text-ink"
            >
              {open ? "Tutup" : "Menu"}
            </Text>
            <View className="h-3 w-3 rounded-pill bg-ink" />
          </View>
        </Press>
      </View>

      {open && (
        <View className="mt-2 min-h-[100vh] bg-ink px-5 pb-16 pt-6">
          <Animated.View style={overlay}>
            <View className="gap-1">
              {nav.map((n, i) => (
                <OverlayLink
                  key={n.href}
                  label={n.label}
                  index={i}
                  progress={progress}
                  wide={wide}
                  onPress={() => go(n.href)}
                />
              ))}
            </View>

            <View className="mt-14 flex-row flex-wrap gap-3">
              {socials.map((s) => (
                <Press key={s.label} onPress={() => Linking.openURL(s.href)}>
                  <View className="rounded-pill bg-paper px-4 py-2">
                    <Text className="font-sans text-sm text-ink">{s.label}</Text>
                  </View>
                </Press>
              ))}
            </View>

            <Display level="h3" color="text-lime" className="mt-16">
              {profile.email}
            </Display>
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
}