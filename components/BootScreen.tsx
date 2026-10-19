import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, Text, View } from "react-native";

const GROUND = "#ff2f11";
const LIME = "#e4fc51";
const PAPER = "#fffdfd";
const INK = "#191717";

/**
 * Layar boot.
 *
 * Ditampilkan sementara `expo-font` memuat Archivo Black, Space Grotesk, dan
 * Space Mono. Sebelum font siap, `font-family` kustom belum dikenal browser,
 * jadi kalau halaman utama ikut dirender, seluruh teks jatuh ke font bawaan —
 * Times New Roman — dan halaman terlihat belum jadi. Dengan menahan rendering
 * sampai font beres, jendela itu tidak pernah terlihat sama sekali.
 *
 * Aturan desainnya: **tidak boleh bergantung pada apa yang sedang dimuat.**
 * Karena itu semua style ditulis inline (bukan kelas Tailwind), dan font
 * memakai stack sistem. Font kustom justru sedang dalam perjalanan — kalau
 * layar ini memakainya, ia akan gagal dengan cara yang sama seperti masalah
 * yang ingin dihindari.
 *
 * Digunakan di semua platform, termasuk server (`_layout.tsx` me-render ini
 * selama SSR), jadi isinya wajib aman untuk render tanpa efek: animasi baru
 * dijalankan di `useEffect`.
 */
export default function BootScreen() {
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(slide, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [slide]);

  // Balok bergeser maju-mundur; tanpa lompatan di ujung.
  const trackWidth = 168;
  const barWidth = 56;
  const offset = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth - barWidth],
  });

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Menyiapkan situs"
      style={{
        flex: 1,
        backgroundColor: GROUND,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <AsteriskMark size={96} />

      <Text
        maxFontSizeMultiplier={1.1}
        style={{
          marginTop: 34,
          color: PAPER,
          fontSize: 28,
          lineHeight: 32,
          letterSpacing: 1.5,
          textAlign: "center",
          fontFamily:
            Platform.OS === "web"
              ? "'Archivo Black', 'Arial Black', Impact, sans-serif"
              : undefined,
          fontWeight: Platform.OS === "web" ? "400" : "800",
        }}
      >
        ARADHANA DEV
      </Text>

      <View
        style={{
          marginTop: 30,
          width: trackWidth,
          height: 6,
          overflow: "hidden",
          borderRadius: 3,
          backgroundColor: INK,
        }}
      >
        <Animated.View
          style={{
            width: barWidth,
            height: "100%",
            borderRadius: 3,
            backgroundColor: LIME,
            transform: [{ translateX: offset }],
          }}
        />
      </View>

      <Text
        maxFontSizeMultiplier={1.1}
        style={{
          marginTop: 14,
          color: INK,
          fontSize: 12,
          letterSpacing: 3,
          textAlign: "center",
          fontFamily:
            Platform.OS === "web"
              ? "ui-monospace, SFMono-Regular, Menlo, monospace"
              : undefined,
        }}
      >
        MENYIAPKAN
      </Text>
    </View>
  );
}

/**
 * Tanda asterisk merek: tiga palang membulat yang saling bersilang.
 *
 * Digambar dengan `View` biasa, bukan `react-native-svg` — layar ini ikut
 * dirender di server, dan path SVG justru komponen yang paling mungkin
 * bermasalah saat render tanpa DOM.
 */
function AsteriskMark({ size }: { size: number }) {
  const armWidth = Math.round(size * 0.16);
  const armLength = size;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {[0, 60, 120].map((deg) => (
        <View
          key={deg}
          style={{
            position: "absolute",
            width: size,
            height: size,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: armLength,
              height: armWidth,
              borderRadius: armWidth,
              backgroundColor: LIME,
              transform: [{ rotate: `${deg}deg` }],
            }}
          />
        </View>
      ))}
    </View>
  );
}
