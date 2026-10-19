import { useState } from "react";
import { Animated, Text, View } from "react-native";
import { services } from "@/data/content";
import { Reveal, RevealItem } from "./motion/Reveal";
import { Press } from "./motion/Press";
import { useFadeTo, useSpin } from "./motion/Entrance";
import { useWide } from "./motion/Motion";
import { Container, Display, Eyebrow, Lead, Mono } from "./ui";
import { ArrowUpRight, Asterisk, Blob, PlusSketch } from "./decor/Shape";

const TONE_HEX: Record<string, string> = {
  "bg-lilac": "#c3b5f9",
  "bg-mint": "#e4fc51",
  "bg-paper": "#fffdfd",
  "bg-cream": "#f1ead8",
};

function Row({
  s,
  active,
  onSelect,
  wide,
}: {
  s: (typeof services)[number];
  active: boolean;
  onSelect: () => void;
  wide: boolean;
}) {
  const activeT = useFadeTo(active, 200);
  const fade = {
    opacity: Animated.add(
      new Animated.Value(0.8),
      Animated.multiply(activeT, 0.2),
    ),
  };
  const plusT = useFadeTo(active, 220);
  const plus = {
    transform: [
      {
        rotate: plusT.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "45deg"],
        }),
      },
    ],
  };

  return (
<Animated.View style={fade}>
        <Press onPress={onSelect} className="w-full" accessibilityRole="button">
          <View
            className={`w-full overflow-hidden rounded-card ${
              active ? "bg-ink" : "border-2 border-ink bg-paper"
            }`}
          >
          <View
            className="flex-row items-center gap-4 px-5"
            style={{ paddingVertical: wide ? 26 : 18 }}
          >
            <Mono color={active ? "text-lime" : "text-ink"}>{s.no}</Mono>

            <View className="flex-1">
              <Text
                maxFontSizeMultiplier={1.1}
                className={`font-display uppercase ${active ? "text-paper" : "text-ink"}`}
                style={{ fontSize: wide ? 40 : 24, lineHeight: wide ? 34 : 21 }}
              >
                {s.title}
              </Text>
            </View>

            <View
              className={`h-11 w-11 items-center justify-center rounded-pill ${
                active ? "bg-lime" : "bg-cream"
              }`}
            >
              <Animated.View style={plus}>
                <PlusSketch size={18} />
              </Animated.View>
            </View>
          </View>

          {active && (
            <View className="px-5 pb-6">
              <Lead color="text-paper">{s.desc}</Lead>
              <View className="mt-5 gap-2">
                {s.items.map((it) => (
                  <View key={it} className="flex-row items-center gap-3">
                    <Asterisk size={14} color="#e4fc51" strokeWidth={4} />
                    <Text
                      className="font-sans text-paper"
                      style={{ fontSize: 16, lineHeight: 22 }}
                    >
                      {it}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </Press>
    </Animated.View>
  );
}

export default function Services() {
  // -1 = semua tertutup saat halaman baru dibuka.
  const [i, setI] = useState(-1);
  const wide = useWide();
  const spin = useSpin(360, 40, false, wide);
  const s = services[i] ?? services[0];

  return (
    <View className="overflow-hidden bg-cream">
      <Container className={wide ? "pb-28 pt-24" : "pb-20 pt-16"}>
        <View className="flex-row items-center gap-3">
          <Asterisk size={18} color="#ff2f11" strokeWidth={4} />
          <Eyebrow>Yang bisa saya kerjakan</Eyebrow>
        </View>

        <Reveal>
          <Display level="h2" color="text-ink" numberOfLines={1}>
            Layanan
          </Display>
        </Reveal>

        <View className={wide ? "mt-12 flex-row items-start gap-12" : "mt-8"}>
          <View className={wide ? "w-[34%] gap-6" : "gap-6"}>
            <View className={wide ? "self-start" : "hidden"}>
              <Animated.View style={spin}>
                <Blob
                  color={TONE_HEX[s.tone] ?? "#c3b5f9"}
                  width={200}
                  variant={0}
                />
              </Animated.View>
            </View>

            {i >= 0 && (
              <View className="-mt-16 self-end rounded-pill bg-ground px-5 py-4">
                <Mono className="text-ink">{services[i].title}</Mono>
              </View>
            )}
          </View>

          <View className={wide ? "flex-1 gap-4" : "gap-3"}>
            {services.map((x, n) => (
              <RevealItem key={x.no} index={n}>
                <Row
                  s={x}
                  active={n === i}
                  onSelect={() => setI(n === i ? -1 : n)}
                  wide={wide}
                />
              </RevealItem>
            ))}

            <Reveal delay={3} className={wide ? "mt-4 flex-row justify-end" : "mt-4"}>
              <View className="flex-row items-center gap-3 rounded-pill bg-lime px-5 py-3">
                <Text className="font-sans text-sm uppercase text-ink">
                  Fleksibel untuk retainer
                </Text>
                <ArrowUpRight size={16} />
              </View>
            </Reveal>
          </View>
        </View>
      </Container>
    </View>
  );
}