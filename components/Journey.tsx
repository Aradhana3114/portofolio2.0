import { useCallback, useMemo, useState } from "react";
import { Animated, Text, View, type LayoutChangeEvent } from "react-native";
import { journey } from "@/data/content";
import { Reveal, useContentY } from "./motion/Reveal";
import { useSpin } from "./motion/Entrance";
import { useMotion, useWide } from "./motion/Motion";
import { useSectionAnchor } from "./SectionScroll";
import { Container, Display, Eyebrow, Mono } from "./ui";
import { Asterisk, Blob } from "./decor/Shape";

const CARD_BG = [
  "bg-ground",
  "bg-lavender",
  "bg-lime",
  "bg-ink",
  "bg-cream",
];
const CARD_TEXT = ["text-ink", "text-ink", "text-ink", "text-paper", "text-ink"];

export default function Journey() {
  const anchor = useSectionAnchor("journey");
  const wide = useWide();
  const { scrollY, viewportH } = useMotion();
  const spin = useSpin(360, 32, false, wide);

  const [height, setHeight] = useState(1);
  const { pageY, measure } = useContentY();

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      setHeight(Math.max(1, e.nativeEvent.layout.height));
      measure(e.nativeEvent.layout.y, e.target);
    },
    [measure],
  );

  const progress = useMemo(() => {
    if (pageY == null) return new Animated.Value(0);
    const raw = Animated.add(scrollY, viewportH * 0.6 - pageY);
    return raw.interpolate({
      inputRange: [0, height],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });
  }, [scrollY, viewportH, pageY, height]);

  const rail = { height: Animated.multiply(progress, new Animated.Value(height)) };
  const marker = {
    transform: [
      {
        translateY: Animated.multiply(
          progress,
          new Animated.Value(Math.max(0, height - 96)),
        ),
      },
    ],
  };

  return (
    <View {...anchor} className="overflow-hidden bg-paper">
      <Container className={wide ? "pb-28 pt-24" : "pb-20 pt-16"}>
        <View className={wide ? "flex-row items-end justify-between" : ""}>
          <View className={wide ? "w-[60%]" : ""}>
            <View className="flex-row items-center gap-3">
              <Asterisk size={18} color="#3600a9" strokeWidth={4} />
              <Eyebrow>Perjalanan</Eyebrow>
            </View>
            <Reveal className="mt-4">
              <Display level="h2" color="text-ink">
                Jejak
                {"\n"}
                <Text className="text-ground">belajar</Text>
              </Display>
            </Reveal>
          </View>

          {wide && (
              <View className="pb-6">
                <Animated.View style={spin}>
                  <Blob color="#e4fc51" width={190} variant={2} />
                </Animated.View>
              </View>
            )}
        </View>

        <View
          onLayout={onLayout}
          className={wide ? "mt-16 flex-row" : "mt-12"}
        >
          {wide && (
            <View className="w-16 justify-center">
              <View className="h-full w-1 self-center overflow-hidden rounded-pill bg-ink/15">
                <Animated.View
                  style={[{ width: 4, backgroundColor: "#ff2f11" }, rail]}
                />
              </View>
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    top: -8,
                    left: 22,
                    width: 24,
                    height: 24,
                    borderRadius: 400,
                    backgroundColor: "#191717",
                  },
                  marker,
                ]}
              />
            </View>
          )}

          <View className={wide ? "flex-1 gap-3" : "gap-3"}>
            {journey.map((j, n) => {
              const bg = CARD_BG[n % CARD_BG.length];
              const fg = CARD_TEXT[n % CARD_TEXT.length];
              return (
                <Reveal key={n} delay={n} className="w-full">
                  <View className={`overflow-hidden rounded-card ${bg} px-4 py-3.5`}>
                    <View className="flex-row items-start gap-4">
                      <Text
                        maxFontSizeMultiplier={1}
                        className={`font-display uppercase ${fg}`}
                        style={{ fontSize: wide ? 40 : 30, lineHeight: wide ? 36 : 28 }}
                      >
                        {j.year}
                      </Text>

                      <View className="flex-1 gap-1">
                        <View className="flex-row items-center justify-between gap-3">
                          <Mono color={fg}>
                            {j.kind} — {j.tag}
                          </Mono>
                          <Mono color={fg}>{String(n + 1).padStart(2, "0")}</Mono>
                        </View>

                        <Text
                          maxFontSizeMultiplier={1.1}
                          className={`font-display uppercase ${fg}`}
                          style={{ fontSize: wide ? 22 : 18, lineHeight: wide ? 22 : 19 }}
                        >
                          {j.title}
                        </Text>

                        <Text
                          maxFontSizeMultiplier={1.2}
                          className={`font-sans ${fg}`}
                          style={{ fontSize: 15, lineHeight: 21, opacity: 0.85 }}
                        >
                          {j.desc}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Reveal>
              );
            })}
          </View>
        </View>
      </Container>
    </View>
  );
}