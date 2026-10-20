import { Linking, Text, View } from "react-native";
import { nav, profile, socials } from "@/data/content";
import { composeEmail, composeEmailUrl } from "@/lib/composeEmail";
import { Reveal } from "./motion/Reveal";
import { Press } from "./motion/Press";
import { useWide } from "./motion/Motion";
import { useSectionScroll } from "./SectionScroll";
import { Container, Display, Mono, PillButton } from "./ui";
import { ArrowUpRight, SlantWedge } from "./decor/Shape";

export default function Footer() {
  const wide = useWide();
  const { scrollTo } = useSectionScroll();

  return (
    <View className="overflow-hidden bg-ground">
      <View style={{ height: 34, marginTop: -34 }} className="w-full">
        <SlantWedge color="#fffdfd" width="100%" height={40} />
      </View>

      <Container className={wide ? "pb-10 pt-16" : "pb-8 pt-14"}>
        <View className={wide ? "flex-row gap-3" : "gap-3"}>
          <Reveal fill className={wide ? "w-[38%]" : ""}>
            <View className="h-full justify-between rounded-card bg-cream p-6">
              <View className="gap-1">
                {nav.map((n) => (
                  <Press key={n.href} onPress={() => scrollTo(n.href)}>
                    <View className="py-1">
                      <Text
                        maxFontSizeMultiplier={1.1}
                        className="font-display uppercase text-ink"
                        style={{ fontSize: wide ? 34 : 26, lineHeight: wide ? 32 : 25 }}
                      >
                        {n.label}
                      </Text>
                    </View>
                  </Press>
                ))}
              </View>

              <View className="mt-6 flex-row flex-wrap gap-2">
                {socials.map((s) => (
                  <Press key={s.label} onPress={() => Linking.openURL(s.href)}>
                    <View className="flex-row items-center gap-2 rounded-pill bg-paper px-4 py-2">
                      <Text className="font-sans text-sm text-ink">{s.label}</Text>
                      <ArrowUpRight size={14} />
                    </View>
                  </Press>
                ))}
              </View>
            </View>
          </Reveal>

          <Reveal delay={1} fill className={wide ? "w-[32%]" : ""}>
            <View className="h-full justify-between rounded-card bg-brown p-6">
              <Display level="h4" color="text-paper">
                Yuk
                {"\n"}
                ketemu
              </Display>
              <Text
                className="mt-4 font-sans text-paper"
                style={{ fontSize: 15, lineHeight: 22 }}
              >
                {profile.name} — {profile.major}, {profile.school}.
              </Text>
              <Press
                href={composeEmailUrl(profile.email)}
                hrefAttrs={{ target: "_blank", rel: "noopener" }}
                onPress={() => composeEmail(profile.email)}
                className="mt-4 self-start"
              >
                <View className="rounded-pill bg-paper px-4 py-2">
                  <Text className="font-sans text-sm text-ink">{profile.email}</Text>
                </View>
              </Press>
            </View>
          </Reveal>

          <Reveal delay={2} fill className={wide ? "flex-1" : ""}>
            <View className="justify-between gap-6 rounded-card bg-lime p-6">
              <Display level="h4" color="text-ink">
                Punya
                {"\n"}
                proyek?
              </Display>
              <PillButton section="contact" fill="ink" textColor="paper" withArrow>
                Mulai obrolan
              </PillButton>
              <Mono className="text-ink">{profile.location}</Mono>
            </View>
          </Reveal>
        </View>

        <View
          className={
            wide
              ? "mt-10 flex-row items-center justify-between"
              : "mt-8 gap-2"
          }
        >
          <Mono className="text-ink">(c) 2026 {profile.first} {profile.last}</Mono>
          <Mono className="text-ink">Hak cipta dilindungi.</Mono>
          <Press onPress={() => scrollTo("home")}>
            <View className="self-start rounded-pill bg-ink px-4 py-2">
              <Text className="font-sans text-xs uppercase text-paper">
                Kembali ke atas
              </Text>
            </View>
          </Press>
        </View>
      </Container>
    </View>
  );
}