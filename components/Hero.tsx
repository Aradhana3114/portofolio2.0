import { Animated, Text, View } from "react-native";
import { profile } from "@/data/content";
import { useSectionAnchor } from "./SectionScroll";
import { useEntrance, useSpin, useDrift, Entrance } from "./motion/Entrance";
import { useWide } from "./motion/Motion";
import { Marquee } from "./motion/Marquee";
import { Container, Display, Lead, PillButton, Tag, type as t } from "./ui";
import { Asterisk, Blob } from "./decor/Shape";

function HeroLine({
  children,
  delay,
  color,
  size,
}: {
  children: string;
  delay: number;
  color: string;
  size: number;
}) {
  const enter = useEntrance(delay, 40);
  return (
    <Animated.View style={enter}>
      <Text
        maxFontSizeMultiplier={1.05}
        className={`font-display uppercase ${color}`}
        style={{ fontSize: size, lineHeight: size * 0.86, letterSpacing: -2 }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {children}
      </Text>
    </Animated.View>
  );
}

export default function Hero() {
  const anchor = useSectionAnchor("home");
  const wide = useWide();
  const spin = useSpin(360, 26, false, wide);
  const drift = useDrift(14, -10, 11, wide);
  const size = wide ? 108 : 52;

  return (
    <View {...anchor} className="overflow-hidden bg-ground">
      <Container className={wide ? "pb-16 pt-32" : "pb-12 pt-28"}>
        <Entrance delay={80}>
          <View className="flex-row flex-wrap gap-2">
            <Tag fill="paper">{profile.status}</Tag>
            <Tag fill="paper">{profile.location}</Tag>
          </View>
        </Entrance>

        <View className={wide ? "relative mt-12" : "mt-8"}>
          {wide && (
            <View className="absolute right-8 top-2">
              <Animated.View style={drift}>
                <Blob color="#c3b5f9" width={230} variant={1} opacity={0.9} />
              </Animated.View>
            </View>
          )}

          <HeroLine delay={180} color="text-ink" size={size}>
            {profile.first}
          </HeroLine>
          <HeroLine
            delay={320}
            color="text-paper"
            size={wide ? size * 0.6 : size * 0.5}
          >
            {profile.last}
          </HeroLine>
        </View>

        <View
          className={
            wide
              ? "mt-16 flex-row items-start justify-between gap-12"
              : "mt-8 gap-4"
          }
        >
          <Entrance delay={520} className={wide ? "w-[440px]" : "w-full"}>
            <Lead className="text-ink">
              Full Stack Developer dari Indonesia. Saya membangun produk web yang
              benar-benar dipakai — bukan sekadar tugas sekolah.
            </Lead>
          </Entrance>

          <View
            className={
              wide
                ? "mt-24 flex-1 flex-row flex-wrap justify-end gap-2"
                : "flex-row flex-wrap gap-2"
            }
          >
            {profile.roles.map((r, i) => (
              <Entrance key={r} delay={620 + i * 90}>
                <Tag fill="outline">{r}</Tag>
              </Entrance>
            ))}
          </View>
        </View>

        <View
          className={
            wide
              ? "mt-12 flex-row items-center gap-4"
              : "mt-10 flex-row flex-wrap items-center gap-3"
          }
        >
          <Entrance delay={720}>
            <PillButton section="work" withArrow>
              Lihat Karya
            </PillButton>
          </Entrance>
          <Entrance delay={840}>
            <PillButton section="contact" fill="paper" textColor="ink">
              Mari Ngobrol
            </PillButton>
          </Entrance>

          {wide && (
            <View className="ml-6">
              <Animated.View style={spin}>
                <Asterisk size={64} color="#e4fc51" strokeWidth={7} />
              </Animated.View>
            </View>
          )}
        </View>

        {wide && (
          <View className="mt-16 flex-row items-end justify-between">
            <Display level="h3" color="text-paper" className="w-[620px]">
              Portofolio
            </Display>
            <Text className="font-mono text-xs uppercase text-paper">
              {profile.grade}
            </Text>
          </View>
        )}
      </Container>

      <View className="mt-2 border-y-2 border-ink bg-ink py-4">
        <Marquee duration={24}>
          {[0, 1, 2].map((i) => (
            <View key={i} className="flex-row items-center">
              <Text
                className="px-6 font-display uppercase text-paper"
                style={{ fontSize: wide ? t.h5.lg : t.h5.sm, lineHeight: wide ? 34 : 26 }}
              >
                Full Stack Developer
              </Text>
              <Asterisk size={20} color="#e4fc51" strokeWidth={4} />
            </View>
          ))}
        </Marquee>
      </View>
    </View>
  );
}