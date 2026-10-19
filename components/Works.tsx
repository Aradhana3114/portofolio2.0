import { Animated, Image, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { works } from "@/data/content";
import { Reveal } from "./motion/Reveal";
import { useSectionAnchor } from "./SectionScroll";
import { useHover } from "./motion/Press";
import { useWide } from "./motion/Motion";
import { Container, Display, Eyebrow, Lead, Mono, PillButton, Tag } from "./ui";
import { ArrowUpRight, Asterisk } from "./decor/Shape";

type Work = (typeof works)[number];

const MEDIA: Record<string, { bg: string; fg: string; ratio: [number, number] }> = {
  "bg-paper": { bg: "bg-paper", fg: "text-ink", ratio: [16, 10] },
  "bg-lilac": { bg: "bg-lavender", fg: "text-ink", ratio: [4, 3] },
  "bg-mint": { bg: "bg-lime", fg: "text-ink", ratio: [16, 11] },
  "bg-ink": { bg: "bg-brown", fg: "text-paper", ratio: [4, 5] },
  "bg-accent": { bg: "bg-paper", fg: "text-ground", ratio: [16, 10] },
  "bg-cream": { bg: "bg-cream", fg: "text-ink", ratio: [4, 5] },
};

function initials(title: string) {
  return title
    .replace(/[^A-Za-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function ProjectMedia({
  work,
  ratio,
  image,
}: {
  work: Work & { image?: ImageSourcePropType };
  ratio: [number, number];
  image?: ImageSourcePropType;
}) {
  const { hovered, handlers } = useHover();
  const conf = MEDIA[work.tone] ?? MEDIA["bg-paper"];

  const scale = {
    transform: [
      {
        scale: hovered.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.04],
        }),
      },
    ],
  };

  const sheen = {
    opacity: hovered.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
  };

  const reveal = {
    opacity: hovered.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
    transform: [
      {
        translateY: hovered.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
    ],
  };

  return (
    <View
      className={`overflow-hidden rounded-card ${conf.bg}`}
      style={{ aspectRatio: ratio[0] / ratio[1] }}
      {...handlers}
    >
      {image ? (
        <Animated.Image
          source={image}
          resizeMode="cover"
          style={[{ width: "100%", height: "100%" }, scale]}
        />
      ) : (
        <Animated.View style={[{ flex: 1 }, scale]}>
          <View className="h-full w-full justify-between p-10">
            <Mono color={conf.fg}>{work.no}</Mono>
            <Text
              maxFontSizeMultiplier={1}
              className={`font-display uppercase ${conf.fg}`}
              style={{ fontSize: 96, lineHeight: 80, letterSpacing: -3 }}
            >
              {initials(work.title)}
            </Text>
            <Mono color={conf.fg}>{work.year}</Mono>
          </View>
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 6,
                backgroundColor: "#ff2f11",
              },
              sheen,
            ]}
          />
        </Animated.View>
      )}

      <Animated.View
        pointerEvents="none"
        style={[
          { position: "absolute", left: 20, bottom: 18 },
          reveal,
        ]}
      >
        <View className="flex-row items-center gap-2 rounded-pill bg-ink px-4 py-2">
          <Text className="font-sans text-sm uppercase text-paper">
            Buka proyek
          </Text>
          <ArrowUpRight size={15} color="#e4fc51" />
        </View>
      </Animated.View>
    </View>
  );
}

function ProjectMeta({ work, wide }: { work: Work; wide: boolean }) {
  return (
    <View className={wide ? "gap-4" : "gap-3"}>
      <View className="flex-row flex-wrap items-center gap-3">
        <Mono className="text-ink">{work.kind}</Mono>
        <View className="h-1 w-1 rounded-pill bg-ground" />
        <Mono className="text-ink">{work.year}</Mono>
      </View>

      <Display level="h3" color="text-ink">
        {work.title}
      </Display>

      <Lead color="text-ink" className={wide ? "max-w-[560px]" : ""}>
        {work.desc}
      </Lead>

      <View className="flex-row flex-wrap gap-2">
        {work.tech.map((x) => (
          <Tag key={x} fill="paper">
            {x}
          </Tag>
        ))}
      </View>

      <View className="mt-2 flex-row flex-wrap gap-3">
        {!!work.site && (
          <PillButton href={work.site} size="md" fill="ink" textColor="paper" withArrow>
            Kunjungi Situs
          </PillButton>
        )}
        <PillButton href={`/project/${work.slug}`} size="md" fill="paper" textColor="ink" withArrow>
          Baca Case Study
        </PillButton>
      </View>
    </View>
  );
}

function Project({
  work,
  index,
  wide,
}: {
  work: (typeof works)[number] & { image?: ImageSourcePropType };
  index: number;
  wide: boolean;
}) {
  if (!wide) {
    return (
      <Reveal delay={index} className="gap-5">
        <View className="flex-row items-center gap-3">
          <Display level="h3" color="text-paper">
            {work.no}
          </Display>
          <View className="h-px flex-1 bg-paper/40" />
        </View>
        <ProjectMedia work={work} ratio={[16, 10]} image={work.image} />
        <ProjectMeta work={work} wide={false} />
      </Reveal>
    );
  }

  if (index % 3 === 0) {
    return (
      <Reveal delay={index}>
        <View className="gap-8">
          <View className="flex-row items-center gap-4">
            <Display level="h4" color="text-ink">
              {work.no}
            </Display>
            <View className="h-px flex-1 bg-ink/30" />
            <Eyebrow color="text-ink">{work.kind}</Eyebrow>
          </View>
          <ProjectMedia work={work} ratio={[16, 9]} image={work.image} />
          <View className="w-full max-w-[860px]">
            <ProjectMeta work={work} wide />
          </View>
        </View>
      </Reveal>
    );
  }

  if (index % 3 === 1) {
    return (
      <Reveal delay={index}>
        <View className="flex-row items-start gap-10">
          <View className="w-[36%]">
            <ProjectMeta work={work} wide />
          </View>
          <View className="flex-1">
            <ProjectMedia work={work} ratio={[4, 3]} image={work.image} />
          </View>
        </View>
      </Reveal>
    );
  }

  return (
    <Reveal delay={index}>
      <View className="flex-row-reverse items-start gap-10">
        <View className="w-[58%]">
          <ProjectMedia work={work} ratio={[4, 5]} image={work.image} />
        </View>
        <View className="flex-1 self-stretch">
            <ProjectMeta work={work} wide />
          </View>
      </View>
    </Reveal>
  );
}

export default function Works() {
  const anchor = useSectionAnchor("work");
  const wide = useWide();

  return (
    <View {...anchor} className="overflow-hidden bg-ground">
      <Container className={wide ? "pb-28 pt-24" : "pb-20 pt-16"}>
        <View className={wide ? "flex-row items-end justify-between" : ""}>
          <View className={wide ? "w-[70%]" : ""}>
            <Eyebrow color="text-paper">Karya terpilih</Eyebrow>
            <Reveal className="mt-4">
              <Display level="h2" color="text-paper">
                Selected
                {"\n"}
                <Text className="text-ink">works</Text>
              </Display>
            </Reveal>
          </View>

          {wide && (
            <View className="w-[24%] pb-4">
              <Lead color="text-paper">
                Solusi web fungsional yang berfokus pada masalah nyata dan
                pengalaman pengguna.
              </Lead>
            </View>
          )}
        </View>

        {!wide && (
          <Lead color="text-paper" className="mt-5">
            Solusi web fungsional yang berfokus pada masalah nyata dan pengalaman
            pengguna.
          </Lead>
        )}

        <View className={wide ? "mt-20 gap-32" : "mt-12 gap-16"}>
          {works.map((w, i) => (
            <Project key={w.no} work={w} index={i} wide={wide} />
          ))}
        </View>
      </Container>
    </View>
  );
}