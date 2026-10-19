import { Platform } from "react-native";
import type { ImageSourcePropType } from "react-native";
import type { LanyardDomProps } from "./LanyardDom";
import type { LanyardNativeProps } from "./LanyardNative";

/**
 * Lanyard.
 *
 * Dispatcher: versi web memakai komponen React Bits apa adanya
 * (`LanyardDom`, Three.js), versi native memakai port React Native
 * (`LanyardNative`, fisika Verlet + Reanimated).
 *
 * Kenapa dua implementasi? Karena aslinya adalah renderer Three.js yang
 * menempelkan `<canvas>` ke DOM. React Native tidak punya Three.js —
 * `expo-gl`/Skia punya scene graph sendiri — dan shader GLSL-nya disuntik
 * lewat `onBeforeCompile`. Di web kita bisa pakai apa adanya, jadi itulah
 * yang dipakai di sana.
 *
 * Prop `frontImage`/`backImage`/`strapImage` mengikuti API asli (URL string,
 * relatif terhadap root `/`). Untuk native, gambar lokal dari `public/` tidak
 * bisa di-`require()` dari string dinamis, jadi pakai `nativeFrontImage` dan
 * friends untuk memberi sumber aset statis. Kalau tidak diisi, string
 * URL-nya tetap dipakai apa adanya (cocok untuk URL absolut).
 */

export type LanyardProps = {
  frontImage: string;
  backImage?: string;
  strapImage?: string;
  nativeFrontImage?: ImageSourcePropType;
  nativeBackImage?: ImageSourcePropType;
  nativeStrapImage?: ImageSourcePropType;
  imageFit?: "cover" | "contain";
  cardColor?: string;
  orientation?: "portrait" | "landscape";
  finish?: "holographic" | "metallic" | "glossy" | "matte";
  cornerRadius?: number;
  size?: number;
  anchor?: "left" | "center" | "right";
  strapLength?: number;
  strapColor?: string;
  strapWidth?: number;
  metal?: "graphite" | "silver" | "gold";
  gravity?: number;
  damping?: number;
  elasticity?: number;
  breeze?: number;
  interactive?: boolean;
  intro?: boolean;
  height?: number;
};

const DEFAULT_HEIGHT = 600;

const NATIVE_ANCHOR = {
  left: "top-left",
  center: "top-center",
  right: "top-right",
} as const;

export default function Lanyard({ nativeFrontImage, nativeBackImage, nativeStrapImage, ...rest }: LanyardProps) {
  if (Platform.OS === "web") {
    // `require` (bukan import statis) supaya Metro bisa tree-shake `three`
    // — sekitar 600 KB — keluar dari bundle native.
    const LanyardDom = require("./LanyardDom").default as React.ComponentType<LanyardDomProps>;
    // `height` harus jadi inline style, bukan andalkan `height: 100%` di
    // CSS `.lanyard`. Rantai percentage itu rapuh: `100%` → parent View
    // (flex:1) → container expo-router. Kalau salah satu putus,
    // `clientHeight` = 0 dan renderer menggambar ke canvas setinggi 1px —
    // hasilnya kosong tanpa error apa pun.
    const { height = DEFAULT_HEIGHT, ...domProps } = rest;
    return <LanyardDom {...domProps} style={{ width: "100%", height }} />;
  }

  const LanyardNative = require("./LanyardNative").Lanyard as React.ComponentType<LanyardNativeProps>;
  const { anchor = "center", finish = "glossy", metal = "silver", height = DEFAULT_HEIGHT, ...props } = rest;

  return (
    <LanyardNative
      {...props}
      height={height}
      anchor={NATIVE_ANCHOR[anchor]}
      // Port native tidak punya foil hologram maupun `graphite`.
      finish={finish === "matte" ? "matte" : "glossy"}
      metal={metal === "gold" ? "gold" : "silver"}
      frontImage={nativeFrontImage ?? { uri: props.frontImage }}
      backImage={nativeBackImage ?? (props.backImage ? { uri: props.backImage } : undefined)}
      strapImage={nativeStrapImage ?? (props.strapImage ? { uri: props.strapImage } : undefined)}
    />
  );
}