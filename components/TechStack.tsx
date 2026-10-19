import { Animated, Text, View } from "react-native";
import { profile, techStack } from "@/data/content";
import { Marquee } from "./motion/Marquee";
import { Reveal, RevealItem } from "./motion/Reveal";
import { useWide } from "./motion/Motion";
import { Container, Display, Eyebrow, Mono } from "./ui";
import { Asterisk } from "./decor/Shape";

const LEVELS: Record<string, number> = { Mahir: 3, Menengah: 2 };

function LevelDots({ level, color = "#191717" }: { level: string; color?: string }) {
  const filled = LEVELS[level] ?? 1;
  return (
    <View className="flex-row gap-1">
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          className="h-2 w-2 rounded-pill"
          style={{ backgroundColor: i < filled ? color : "transparent", opacity: i < filled ? 1 : 0.3, borderWidth: i < filled ? 0 : 1.5, borderColor: color }}
        />
      ))}
    </View>
  );
}

function StackGroup({
  g,
  index,
}: {
  g: (typeof techStack)[number];
  index: number;
}) {
  return (
    <RevealItem index={index}>
      <View className="rounded-card border-2 border-paper/20 p-6">
        <View className="flex-row items-baseline justify-between">
          <Display level="h4" color="text-paper">
            {g.group}
          </Display>
          <Mono color="text-lime">{String(index + 1).padStart(2, "0")}</Mono>
        </View>

        <View className="mt-5 gap-3">
          {g.items.map(([name, level]) => (
            <View
              key={name}
              className="flex-row items-center justify-between gap-3 border-b border-paper/15 pb-2"
            >
              <Text
                maxFontSizeMultiplier={1.2}
                className="font-sans text-paper"
                style={{ fontSize: 19, lineHeight: 26 }}
              >
                {name}
              </Text>
              <View className="flex-row items-center gap-3">
                <LevelDots level={level} color="#e4fc51" />
                <Mono color="text-paper">{level}</Mono>
              </View>
            </View>
          ))}
        </View>
      </View>
    </RevealItem>
  );
}

export default function TechStack() {
  const wide = useWide();

  return (
    <View className="overflow-hidden bg-ink">
      <Container className={wide ? "pb-28 pt-24" : "pb-20 pt-16"}>
        <View className="flex-row items-center gap-3">
          <Asterisk size={18} color="#e4fc51" strokeWidth={4} />
          <Eyebrow color="text-paper">Kemampuan</Eyebrow>
        </View>

        <Reveal className="mt-6">
          <Display level="h2" color="text-paper">
            Tech
            <Text className="text-lime">stack</Text>
          </Display>
        </Reveal>

        <View className={wide ? "mt-12 flex-row gap-8" : "mt-10"}>
          <View className={wide ? "w-[48%] gap-4" : "gap-4"}>
            {techStack.slice(0, 2).map((g, i) => (
              <StackGroup key={g.group} g={g} index={i} />
            ))}
          </View>
          <View className={wide ? "w-[48%] gap-4" : "gap-4"}>
            {techStack.slice(2).map((g, i) => (
              <StackGroup key={g.group} g={g} index={i + 2} />
            ))}
          </View>
        </View>

        <Reveal delay={2} className={wide ? "mt-16" : "mt-12"}>
          <View className="self-start rounded-pill bg-lime px-6 py-4">
            <Text className="font-mono text-xs uppercase text-ink">
              {techStack.length} kategori
            </Text>
          </View>
        </Reveal>
      </Container>

      <View className="border-t-2 border-ink bg-lime py-4">
        <Marquee duration={28}>
          {techStack.map((g) => (
            <View key={g.group} className="flex-row items-center">
              <Text
                className="px-5 font-display uppercase text-ink"
                style={{ fontSize: 28, lineHeight: 32 }}
              >
                {g.group}
              </Text>
              <Asterisk size={18} color="#191717" strokeWidth={5} />
            </View>
          ))}
        </Marquee>
      </View>
    </View>
  );
}