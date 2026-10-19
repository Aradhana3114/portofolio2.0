import type { ReactNode } from "react";
import { useRouter, type Href } from "expo-router";
import {
  Text,
  View,
  Linking,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Press } from "./motion/Press";
import { useWide } from "./motion/Motion";
import { ArrowUpRight } from "./decor/Shape";
import { useSectionScroll } from "./SectionScroll";

export const MAX_W = 1440;

export const type = {
  h1: { sm: 46, lg: 104 },
  h2: { sm: 38, lg: 82 },
  h3: { sm: 30, lg: 60 },
  h4: { sm: 26, lg: 46 },
  h5: { sm: 22, lg: 30 },
  h6: { sm: 18, lg: 24 },
} as const;

export function Container({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const wide = useWide();
  return (
    <View
      className={`w-full self-center ${wide ? "px-6" : "px-5"} ${className}`}
      style={[{ maxWidth: MAX_W }, style]}
    >
      {children}
    </View>
  );
}

export function Display({
  level = "h2",
  children,
  color = "text-ink",
  className = "",
  style,
  numberOfLines,
}: {
  level?: keyof typeof type;
  children: ReactNode;
  color?: string;
  className?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const wide = useWide();
  return (
    <Text
      numberOfLines={numberOfLines}
      maxFontSizeMultiplier={1.15}
      className={`font-display uppercase ${color} ${className}`}
      style={[
        {
          fontSize: type[level][wide ? "lg" : "sm"],
          lineHeight: type[level][wide ? "lg" : "sm"] * 0.9,
          letterSpacing: -1,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Eyebrow({
  children,
  color = "text-ink",
  className = "",
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <Text
      maxFontSizeMultiplier={1.2}
      className={`font-sans text-sm uppercase text-ink ${color} ${className}`}
      style={{ lineHeight: 20, letterSpacing: -0.1 }}
    >
      {children}
    </Text>
  );
}

export function Mono({
  children,
  color = "text-ink",
  className = "",
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <Text
      maxFontSizeMultiplier={1.2}
      className={`font-mono text-xs ${color} ${className}`}
    >
      {children}
    </Text>
  );
}

export function Lead({
  children,
  color = "text-ink",
  className = "",
  style,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      maxFontSizeMultiplier={1.2}
      className={`font-sans ${color} ${className}`}
      style={[{ fontSize: 19, lineHeight: 28, letterSpacing: -0.3 }, style]}
    >
      {children}
    </Text>
  );
}

export function Tag({
  children,
  fill = "paper",
  color = "text-ink",
  className = "",
}: {
  children: ReactNode;
  fill?: "paper" | "ink" | "lime" | "cream" | "lavender" | "brown" | "outline";
  color?: string;
  className?: string;
}) {
  const fills: Record<string, string> = {
    paper: "bg-paper",
    ink: "bg-ink",
    lime: "bg-lime",
    cream: "bg-cream",
    lavender: "bg-lavender",
    brown: "bg-brown",
    outline: "bg-transparent border-2 border-ink",
  };
  return (
    <View className={`rounded-pill px-4 py-2 ${fills[fill]} ${className}`}>
      <Text
        maxFontSizeMultiplier={1.2}
        className={`font-sans text-sm uppercase ${color}`}
        style={{ lineHeight: 18 }}
      >
        {children}
      </Text>
    </View>
  );
}

type PillButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  href?: string;
  /** Section id untuk scroll internal. */
  section?: string;
  fill?: "ink" | "paper" | "cream" | "lime" | "ground";
  textColor?: "paper" | "ink" | "ground";
  withArrow?: boolean;
  className?: string;
  size?: "lg" | "md" | "sm";
  /** Garis tepi gelap — untuk tombol sekunder di atas latar terang. */
  outline?: boolean;
};

export function PillButton({
  children,
  onPress,
  href,
  section,
  fill = "ink",
  textColor = "paper",
  withArrow = false,
  className = "",
  size = "lg",
  outline = false,
}: PillButtonProps) {
  const { scrollTo } = useSectionScroll();
  const router = useRouter();
  const wide = useWide();

  const fills: Record<string, string> = {
    ink: "bg-ink",
    paper: "bg-paper",
    cream: "bg-cream",
    lime: "bg-lime",
    ground: "bg-ground",
  };
  const texts: Record<string, string> = {
    paper: "text-paper",
    ink: "text-ink",
    ground: "text-ground",
  };

  // "lg" dan "md" sengaja dibiarkan sama perlunya seperti sebelumnya supaya
  // halaman publik tidak berubah tampilan. "sm" untuk area padat seperti
  // panel admin.
  const dims =
    size === "sm"
      ? { h: wide ? 48 : 40, pad: wide ? 20 : 16, fs: wide ? 14 : 12, lh: wide ? 16 : 14 }
      : { h: wide ? 88 : 64, pad: wide ? 40 : 24, fs: wide ? 19 : 15, lh: wide ? 21 : 17 };

  const handle = () => {
    if (onPress) return onPress();
    if (section) return scrollTo(section);
    if (!href) return;
    if (href.startsWith("/")) return router.push(href as Href);
    return Linking.openURL(href);
  };

  return (
    <Press
      onPress={handle}
      accessibilityRole="button"
      className={`self-start ${className}`}
    >
      <View
        className={`flex-row items-center justify-center gap-3 rounded-pill ${fills[fill]} ${outline ? "border-2 border-ink" : ""}`}
        style={{
          paddingHorizontal: dims.pad,
          height: dims.h,
        }}
      >
        <Text
          maxFontSizeMultiplier={1.2}
          className={`font-sans uppercase ${texts[textColor]}`}
          style={{
            fontSize: dims.fs,
            fontWeight: "700",
            lineHeight: dims.lh,
          }}
        >
          {children}
        </Text>
        {withArrow && <ArrowUpRight color={fill === "ink" ? "#fffdfd" : "#191717"} size={18} />}
      </View>
    </Press>
  );
}
