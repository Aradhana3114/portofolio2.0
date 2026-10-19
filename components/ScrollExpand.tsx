import { Platform } from "react-native";
import { splash as splashCopy } from "@/data/content";
import { useMotion, useWide } from "./motion/Motion";
import ScrollExpandDom from "./ScrollExpandDom";
import ScrollExpandNative, { type ScrollExpandProps } from "./ScrollExpandNative";

/**
 * Intro ScrollExpand.
 *
 * Dispatcher: versi web memakai komponen DOM asli React Bits
 * (`ScrollExpandDom`), versi native memakai port React Native
 * (`ScrollExpandNative`).
 *
 * Kenapa dua implementasi? Karena `clip-path` dan `position: sticky` tidak
 * ada di React Native. Port RN harus meniru efeknya dengan menganimasikan
 * `width`/`height`/`left`/`top`/`borderRadius`, yang semuanya layout
 * properties — tiap frame memicu reflow dan jauh lebih berat dari versi DOM.
 * Di web kita bisa pakai implementasi aslinya apa adanya, jadi itulah yang
 * dipakai di sana. Detail lengkapnya ada di `ScrollExpandDom.tsx`.
 *
 * Props `scrollY`, `smoothing`, dan demás diteruskan ke versi native. Di web
 * nilai scroll diambil sendiri dari ScrollView halaman.
 */
export default function ScrollExpand({
  scrollY,
  startWidth,
  startHeight,
  ...rest
}: ScrollExpandProps) {
  const { reduceMotion } = useMotion();
  const wide = useWide();

  // Default 42% milik React Bits mengasumsikan stage desktop; di layar 390px
  // frame diam cuma ~164px. Sama seperti di versi native, mobile memakai
  // frame yang lebih lebar dan lebih pendek.
  const w = startWidth ?? (wide ? 42 : 74);
  const h = startHeight ?? (wide ? 58 : 52);

  if (Platform.OS === "web") {
    return (
      <ScrollExpandDom
        title={splashCopy.title}
        scrollHint={splashCopy.hint}
        startWidth={w}
        startHeight={h}
        reduceMotion={reduceMotion}
        {...rest}
      />
    );
  }

  return <ScrollExpandNative scrollY={scrollY} startWidth={w} startHeight={h} {...rest} />;
}
