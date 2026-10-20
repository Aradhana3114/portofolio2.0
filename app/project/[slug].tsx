import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { works } from "@/data/content";
import { Reveal } from "@/components/motion/Reveal";
import { Entrance } from "@/components/motion/Entrance";
import { useWide } from "@/components/motion/Motion";
import {
  Container,
  Display,
  Eyebrow,
  Lead,
  Mono,
  PillButton,
  Tag,
} from "@/components/ui";
import { Press } from "@/components/motion/Press";
import { ArrowUpRight, Asterisk } from "@/components/decor/Shape";

const TONE = {
  "bg-lilac": "bg-lavender",
  "bg-mint": "bg-lime",
  "bg-paper": "bg-paper",
  "bg-cream": "bg-cream",
} as const;

function initials(title: string) {
  return title
    .replace(/[^A-Za-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function generateStaticParams() {
  return works.map((w) => ({ slug: w.slug }));
}

export default function CaseStudy() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const wide = useWide();

  const index = works.findIndex((w) => w.slug === slug);
  const work = index >= 0 ? works[index] : null;

  if (!work) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-ground">
        <Container className="flex-1 justify-center py-20">
          <Display level="h2" color="text-paper">
            Proyek
            {"\n"}
            tidak ditemukan
          </Display>
          <View className="mt-8 self-start">
            <PillButton onPress={() => router.replace("/")} fill="ink" textColor="paper" withArrow>
              Kembali
            </PillButton>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  const next = works[(index + 1) % works.length];
  const tone = TONE[work.tone as keyof typeof TONE] ?? "bg-lavender";

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-ground">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 64 }}
      >
        <Container className={wide ? "pb-10 pt-6" : "pb-8 pt-4"}>
          <Press onPress={goBack} accessibilityRole="button">
            <View className="flex-row items-center gap-3 self-start rounded-pill bg-ink px-5 py-3">
              <Text className="font-sans text-sm uppercase text-paper">
                Kembali
              </Text>
              <Text className="font-sans text-sm text-lime">←</Text>
            </View>
          </Press>
        </Container>

        <Container className={wide ? "pb-12" : "pb-10"}>
          <Entrance delay={0}>
            <View className="flex-row flex-wrap items-center gap-3">
              <View className="rounded-pill bg-ink px-4 py-2">
                <Mono className="text-lime">{work.no}</Mono>
              </View>
              <Mono className="text-paper">{work.kind}</Mono>
              <View className="h-1 w-1 rounded-pill bg-paper" />
              <Mono className="text-paper">{work.year}</Mono>
            </View>
          </Entrance>

          <Reveal className="mt-6">
            <Display level="h2" color="text-paper">
              {work.title}
            </Display>
          </Reveal>
        </Container>

        <Container className="pb-12">
          <Reveal>
            <View
              className={`w-full overflow-hidden rounded-card ${tone}`}
              style={{ aspectRatio: wide ? 2 / 1 : 4 / 3 }}
            >
              <View className="h-full w-full justify-between p-10">
                <Mono className="text-ink">{work.no}</Mono>
                <Text
                  maxFontSizeMultiplier={1}
                  className="font-display uppercase text-ink"
                  style={{ fontSize: 96, lineHeight: 80, letterSpacing: -3 }}
                >
                  {initials(work.title)}
                </Text>
                <Mono className="text-ink">{work.year}</Mono>
              </View>
            </View>
          </Reveal>
        </Container>

        <View className="border-y-2 border-ink bg-cream">
          <Container className={wide ? "py-14" : "py-10"}>
            <View className={wide ? "flex-row gap-12" : "gap-10"}>
              <View className={wide ? "w-[38%] gap-4" : "gap-3"}>
                <View className="flex-row items-center gap-3">
                  <Asterisk size={18} color="#ff2f11" strokeWidth={4} />
                  <Eyebrow>Ringkasan</Eyebrow>
                </View>
                <Lead color="text-ink">{work.desc}</Lead>
              </View>

              <View className={wide ? "flex-1 gap-6" : "gap-8"}>
                <View className="gap-3">
                  <Eyebrow>Teknologi</Eyebrow>
                  <View className="flex-row flex-wrap gap-2">
                    {work.tech.map((t) => (
                      <Tag key={t} fill="paper">
                        {t}
                      </Tag>
                    ))}
                  </View>
                </View>

                <View className="gap-3">
                  <Eyebrow>Tautan</Eyebrow>
                  <View className="flex-row flex-wrap gap-3">
                    {!!work.site && (
                      <PillButton
                        href={work.site}
                        fill="ink"
                        textColor="paper"
                        withArrow
                      >
                        Kunjungi Situs
                      </PillButton>
                    )}
                    <PillButton
                      href={work.caseStudy}
                      fill="paper"
                      textColor="ink"
                      withArrow
                    >
                      Dokumentasi Asli
                    </PillButton>
                  </View>
                </View>
              </View>
            </View>
          </Container>
        </View>

        <Container className={wide ? "pb-10 pt-14" : "pb-10 pt-12"}>
          <Reveal>
            <Press onPress={() => router.replace(`/project/${next.slug}`)}>
              <View className="flex-row items-center justify-between gap-4 rounded-card bg-ink p-6">
                <View className="flex-1 gap-1">
                  <Mono className="text-lime">Proyek berikutnya</Mono>
                  <Text
                    className="font-display uppercase text-paper"
                    style={{ fontSize: wide ? 34 : 24, lineHeight: wide ? 30 : 21 }}
                  >
                    {next.title}
                  </Text>
                </View>
                <View className="h-12 w-12 items-center justify-center rounded-pill bg-lime">
                  <ArrowUpRight size={18} />
                </View>
              </View>
            </Press>
          </Reveal>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}