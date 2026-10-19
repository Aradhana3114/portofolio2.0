import type { ReactNode } from "react";
import {
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Container, Display, Lead, Mono } from "@/components/ui";
import { Press } from "@/components/motion/Press";

/** Warna tinta utama — dipakai untuk garis tepi, teks, dan bayangan keras. */
export const INK = "#191717";

/**
 * Perawatan visual neobrutalisme: garis tepi hitam tebal, sudut tajam, dan
 * bayangan padat tanpa blur.
 *
 * Bayangan ditulis sebagai `boxShadow` langsung, bukan lewat utilitas
 * `shadow-*` Tailwind — utilitas itu diterjemahkan ke properti native yang
 * selalu membulat tepinya, jadi offset keras seperti ini tidak terbentuk.
 */
const hard = (x: number, y: number): ViewStyle => ({
  boxShadow: `${x}px ${y}px 0px 0px ${INK}`,
});

export function NeoBox({
  children,
  shadow = 6,
  className = "",
  style,
}: {
  children: ReactNode;
  shadow?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View className={`border-2 border-ink ${className}`} style={[hard(shadow, shadow), style]}>
      {children}
    </View>
  );
}

export type Tone = "lime" | "ink" | "paper" | "ground" | "cream";

const tones: Record<Tone, { box: string; text: string }> = {
  lime: { box: "bg-lime", text: "text-ink" },
  ink: { box: "bg-ink", text: "text-paper" },
  paper: { box: "bg-paper", text: "text-ink" },
  ground: { box: "bg-ground", text: "text-paper" },
  cream: { box: "bg-cream", text: "text-ink" },
};

export function NeoButton({
  children,
  onPress,
  tone = "lime",
  disabled = false,
  full = false,
  icon,
}: {
  children: ReactNode;
  onPress?: () => void;
  tone?: Tone;
  disabled?: boolean;
  full?: boolean;
  /** Ikon kecil di sebelah label. Di-render di luar `<Text>`. */
  icon?: ReactNode;
}) {
  const t = tones[tone];
  return (
    <Press
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      hoverScale={1}
      pressScale={0.98}
      className={full ? "w-full" : "self-start"}
    >
      <View
        className={`flex-row items-center justify-center gap-2 border-2 border-ink px-5 ${t.box} ${disabled ? "opacity-40" : ""}`}
        style={[hard(4, 4), { minHeight: 48 }, full ? { flex: 1 } : null]}
      >
        <Text
          maxFontSizeMultiplier={1.2}
          className={`font-sans uppercase ${t.text}`}
          style={{ fontSize: 15, fontWeight: "700", lineHeight: 18, letterSpacing: 0.2 }}
        >
          {children}
        </Text>
        {icon}
      </View>
    </Press>
  );
}

/** Chip data kecil: latar krem, garis tebal, sudut tajam. */
export function Chip({ children, tone = "cream" }: { children: ReactNode; tone?: Tone }) {
  const t = tones[tone];
  return (
    <View className={`self-start border-2 border-ink px-2.5 py-1 ${t.box}`}>
      <Mono color={t.text}>{children}</Mono>
    </View>
  );
}

/** Panel pesan error: merah menyala, teks putih, bayangan tetap keras. */
export function Alert({ children }: { children: ReactNode }) {
  return (
    <NeoBox shadow={3} className="self-start bg-ground px-3 py-2">
      <Text className="font-sans text-paper" style={{ fontSize: 14, lineHeight: 19, fontWeight: 700 }}>
        {children}
      </Text>
    </NeoBox>
  );
}

export const fmtDate = (ms: number) => {
  if (!ms) return "-";
  const d = new Date(ms);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/**
 * Kepala halaman memakai komponet yang sama dengan bagian lain situs —
 * eyebrow mono, judul display besar, lalu pita lime tipis sebagai penutup.
 *
 * `compact` dipakai di layar login supaya seluruh isi muat dalam satu tinggi
 * viewport tanpa scroll.
 */
export function Head({
  crumb,
  title,
  lead,
  compact = false,
}: {
  crumb: string;
  title: string;
  lead: string;
  compact?: boolean;
}) {
  return (
    <View>
      <Mono className="text-ink/55">{crumb}</Mono>
      <View className={compact ? "mt-1" : "mt-2"}>
        {compact ? (
          <Display level="h4" color="text-ink">
            {title}
          </Display>
        ) : (
          <Display level="h2" color="text-ink">
            {title}
          </Display>
        )}
      </View>
      <View className={compact ? "mt-3 flex-row items-center gap-2" : "mt-4 flex-row items-center gap-2"}>
        <View className="h-3.5 w-3.5 border-2 border-ink bg-lime" />
        <View className="h-[3px] flex-1 bg-ink" />
      </View>
      <View className={`max-w-[560px] ${compact ? "mt-3" : "mt-4"}`}>
        <Lead color="text-ink/75" style={compact ? { fontSize: 16, lineHeight: 23, letterSpacing: -0.2 } : undefined}>
          {lead}
        </Lead>
      </View>
    </View>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ flexGrow: 1 }}>
      <Container className="py-12">{children}</Container>
    </ScrollView>
  );
}

/**
 * Shell khusus layar login: tanpa ScrollView dan diambil tengah secara
 * vertikal, supaya seluruh isi muat dalam satu tinggi layar.
 */
export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1 justify-center bg-cream">
      <Container className="py-8">{children}</Container>
    </View>
  );
}
