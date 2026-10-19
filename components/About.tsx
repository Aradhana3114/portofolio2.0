import { Animated, Text, View } from "react-native";
import { profile } from "@/data/content";
import { useSectionAnchor } from "./SectionScroll";
import { Reveal } from "./motion/Reveal";
import { Entrance, useDrift } from "./motion/Entrance";
import { useWide } from "./motion/Motion";
import { Container, Display, Eyebrow, Lead, Tag } from "./ui";
import { Asterisk, Blob, Squiggle } from "./decor/Shape";
import Lanyard from "./Lanyard";

/**
 * Kolom kanan section About.
 *
 * Wrapper-nya `w-full` (bukan `w-[46%]` seperti placeholder portrait yang
 * pernah di sini): canvas Three.js menentukan framing-nya sendiri lewat
 * `frameView()`, jadi wrapper yang sempit cuma memotong kotak dan menyisakan
 * ruang kosong. Tingginya 700px memberi aspect ~1.06 — card butuh ruang
 * untuk diseret tanpa kena `overflow: hidden`.
 */
function Portrait({ wide }: { wide: boolean }) {
  const drift = useDrift(8, 12, 12, wide);
  return (
    <View className="w-full">
      <Animated.View style={drift}>
        <Lanyard
          frontImage="/images/me.png"
          nativeFrontImage={require("../public/images/me.png")}
          imageFit="cover"
          orientation="portrait"
          finish="glossy"
          cornerRadius={0.3}
          size={0.52}
          anchor="center"
          strapLength={0.22}
          strapColor="#191717"
          strapWidth={0.65}
          metal="silver"
          gravity={1}
          damping={0.5}
          elasticity={0.5}
          breeze={0.35}
          interactive
          intro
          height={wide ? 640 : 500}
        />
      </Animated.View>
      <View className="-mt-6 ml-8 self-start rounded-card bg-ink px-5 py-4">
        <Text className="font-sans text-sm text-paper">{profile.school}</Text>
        <Text className="font-sans text-sm text-paper">{profile.major}</Text>
      </View>
    </View>
  );
}

export default function About() {
  const anchor = useSectionAnchor("about");
  const wide = useWide();

  return (
    <View {...anchor} className="overflow-hidden bg-cream">
      <Container className={wide ? "pb-28 pt-24" : "pb-20 pt-16"}>
        <View className="flex-row items-center gap-3">
          <Asterisk size={18} color="#191717" strokeWidth={4} />
          <Eyebrow>Tentang saya</Eyebrow>
        </View>

        <Reveal className={wide ? "mt-6" : "mt-4"}>
          <Display level="h2" color="text-ink">
            {`Hai, saya ${profile.first}`}
            {"\n"}
            <Text className="text-lavender">membangun</Text>{" "}
            <Text className="text-ink">yang benar</Text>
            {"\n"}
            <Text className="text-ink">dipakai.</Text>
          </Display>
        </Reveal>

        <View className={wide ? "mt-14 flex-row gap-10" : "mt-10 gap-10"}>
          <View className={wide ? "w-[38%] gap-6" : "w-full gap-6"}>
            <Reveal delay={1}>
              <Lead className="text-ink">{profile.bio}</Lead>
            </Reveal>

            <Reveal delay={2}>
              <View className="flex-row flex-wrap gap-2">
                {profile.courses.map((c) => (
                  <Tag key={c} fill="paper">
                    {c}
                  </Tag>
                ))}
              </View>
            </Reveal>

            {wide && (
              <View className="mt-4 self-start">
                <Squiggle width={180} color="#ff2f11" strokeWidth={7} />
              </View>
            )}
          </View>

          {/*
            Kolom lanyard dinaikkan sedikit agar puncak kotaknya lebih dekat
            dengan blok judul, sementara kolom bio tetap mulai di baris
            aslinya. Nilainya sengaja kecil — dulu `-mt-36` membuat kotaknya
            menabrak judul dan terlihat seperti kecelakaan tata letak.
          */}
          <Reveal delay={1} className={wide ? "flex-1 -mt-12" : ""}>
            <Portrait wide={wide} />
          </Reveal>
        </View>

        {wide && (
          <View className="mt-16 flex-row items-center justify-end">
            <Blob color="#e4fc51" width={220} variant={2} opacity={0.85} />
            <View className="-ml-10 rounded-pill bg-ground px-6 py-4">
              <Text className="font-mono text-xs uppercase text-ink">
                {profile.location}
              </Text>
            </View>
          </View>
        )}
      </Container>
    </View>
  );
}