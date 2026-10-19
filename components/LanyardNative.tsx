import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import type { ImageResizeMode, ImageSourcePropType } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { useMotion } from "./motion/Motion";

/**
 * Lanyard — port React Native, dipakai di Android/iOS.
 *
 * Aslinya adalah renderer Three.js (`THREE.WebGLRenderer`), yang tidak ada
 * padanannya di React Native. `expo-gl`/Skia punya scene graph sendiri,
 * bukan Three.js, dan shader GLSL foil-nya disuntik lewat `onBeforeCompile`.
 *
 * Port ini mengganti rendering dengan simulasi fisika Verlet pada rantai 4
 * titik yang dijalankan di UI thread lewat `useFrameCallback`, lalu strap,
 * klip, dan card digambar dengan View + react-native-svg.
 *
 * Konsekuensinya: tidak ada twist/torsi 3D seperti di versi web, dan `finish`
 * hanya glossy/matte (tidak ada foil hologram).
 *
 * Di web dipakai implementasinya apa adanya; lihat `LanyardDom.tsx`.
 */

const NODES = 4;
const SEGS = NODES - 1;

export type LanyardNativeAnchor = "top-left" | "top-center" | "top-right" | "center";

export type LanyardNativeProps = {
  frontImage: ImageSourcePropType;
  backImage?: ImageSourcePropType;
  strapImage?: ImageSourcePropType;
  imageFit?: ImageResizeMode;
  cardColor?: string;
  orientation?: "portrait" | "landscape";
  finish?: "glossy" | "matte";
  cornerRadius?: number;
  size?: number;
  anchor?: LanyardNativeAnchor;
  strapLength?: number;
  strapColor?: string;
  strapWidth?: number;
  metal?: "silver" | "gold";
  gravity?: number;
  damping?: number;
  elasticity?: number;
  breeze?: number;
  interactive?: boolean;
  intro?: boolean;
  height?: number;
};

const METALS = {
  silver: ["#f6f7f9", "#8d959e", "#eef1f4"],
  gold: ["#fbe6a6", "#b8860b", "#f3d98b"],
} as const;

export function Lanyard({
  frontImage,
  backImage,
  strapImage,
  imageFit = "cover",
  cardColor = "#ffffff",
  orientation = "portrait",
  finish = "glossy",
  cornerRadius = 0.3,
  size = 0.6,
  anchor = "top-center",
  strapLength = 0.5,
  strapColor = "#111111",
  strapWidth = 0.65,
  metal = "silver",
  gravity = 1,
  damping = 0.5,
  elasticity = 0.5,
  breeze = 0.5,
  interactive = true,
  intro = true,
  height = 600,
}: LanyardNativeProps) {
  const { reduceMotion } = useMotion();
  const [w, setW] = useState(0);
  const h = height;

  const ax = useSharedValue(0);
  const ay = useSharedValue(0);
  const x = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  const y = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  const px = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  const py = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  const cardDeg = useSharedValue(0);
  const dragging = useSharedValue(0);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  // `useFrameCallback` di Reanimated 4 tidak menerima deps array, jadi callback
  // hanya terdaftar sekali. Semua parameter fisika disalin ke shared value
  // supaya worklet tetap membaca nilai terbaru tanpa didaftarkan ulang.
  const pSegLen = useSharedValue(0);
  const pW = useSharedValue(0);
  const pH = useSharedValue(0);
  const pCardH = useSharedValue(0);
  const pGravity = useSharedValue(gravity);
  const pDamping = useSharedValue(damping);
  const pElasticity = useSharedValue(elasticity);
  const pBreeze = useSharedValue(breeze);
  const pReduce = useSharedValue(reduceMotion ? 1 : 0);

  const geom = useMemo(() => {
    // Rasio kartu mengikuti CARD_SIZES di LanyardDom: portrait 1.6 x 2.25.
    const ratio = orientation === "portrait" ? 2.25 / 1.6 : 1.6 / 2.25;
    // `size` = tinggi kartu sebagai fraksi tinggi container (sama like asli).
    const cardH = h * Math.min(Math.max(size, 0.15), 0.9);
    const cardW = Math.min(cardH / ratio, w * 0.72);
    const anchorX =
      anchor === "top-left"
        ? cardW * 0.5
        : anchor === "top-right"
          ? w - cardW * 0.5
          : w * 0.5;
    return {
      cardW,
      cardH,
      // Aslinya: mix(0.03, min(1.6, 2.25) * 0.2, cornerRadius) dalam satuan
      // dunia; dinormalisasi terhadap lebar kartu.
      radius: cardW * (0.019 + cornerRadius * 0.181),
      // Aslinya: STRAP_WIDTH 0.36 terhadap lebar kartu 1.6.
      strapW: cardW * 0.225 * Math.min(Math.max(strapWidth, 0.4), 2),
      // Aslinya: cardTop = viewHeight/2 - viewHeight * mix(0.12, 0.42, strapLength)
      segLen: (h * (0.12 + strapLength * 0.3)) / SEGS,
      anchorX,
      anchorY: 0,
    };
  }, [w, h, orientation, size, cornerRadius, strapWidth, strapLength, anchor]);

  const { cardW, cardH, radius, strapW, segLen, anchorX, anchorY } = geom;
  const introDrop = intro && !reduceMotion ? 260 : 0;

  useEffect(() => {
    pSegLen.value = segLen;
    pW.value = w;
    pH.value = h;
    pCardH.value = cardH;
    pGravity.value = gravity;
    pDamping.value = damping;
    pElasticity.value = elasticity;
    pBreeze.value = breeze;
    pReduce.value = reduceMotion ? 1 : 0;
  }, [
    w,
    h,
    segLen,
    cardH,
    gravity,
    damping,
    elasticity,
    breeze,
    reduceMotion,
    pSegLen,
    pW,
    pH,
    pCardH,
    pGravity,
    pDamping,
    pElasticity,
    pBreeze,
    pReduce,
  ]);

  useEffect(() => {
    if (w === 0) return;
    const y0 = anchorY - introDrop;
    ax.value = anchorX;
    ay.value = y0;
    for (let i = 0; i < 3; i++) {
      x[i].value = px[i].value = anchorX;
      y[i].value = py[i].value = y0 + segLen * (i + 1);
    }
    cardDeg.value = 0;
  }, [w, anchorX, anchorY, segLen, introDrop, ax, ay, x, px, y, py, cardDeg]);

  const frame = useFrameCallback(
    (info) => {
      "worklet";
      const dt = Math.min(info.timeSincePreviousFrame ?? 16.667, 32) / 16.667;
      const segLen = pSegLen.value;
      const w = pW.value;
      const h = pH.value;
      const xs = [x[0].value, x[1].value, x[2].value];
      const ys = [y[0].value, y[1].value, y[2].value];
      const oxs = [px[0].value, px[1].value, px[2].value];
      const oys = [py[0].value, py[1].value, py[2].value];

      const retain = 1 - pDamping.value * 0.15;
      const g = pGravity.value * 4;
      const t = (info.timestamp ?? 0) / 1000;
      const wind = pReduce.value ? 0 : pBreeze.value;

      for (let i = 0; i < 3; i++) {
        const vx = (xs[i] - oxs[i]) * retain;
        const vy = (ys[i] - oys[i]) * retain;
        oxs[i] = xs[i];
        oys[i] = ys[i];
        const push = wind === 0 ? 0 : Math.sin(t * 1.7 + i * 0.9) * wind * 0.35;
        xs[i] += vx + push * dt * dt;
        ys[i] += vy + g * dt * dt;
      }

      if (dragging.value) {
        const kx = (dragX.value - xs[2]) * 0.45;
        const ky = (dragY.value - ys[2]) * 0.45;
        xs[2] += kx;
        ys[2] += ky;
        oxs[2] += kx * 0.5;
        oys[2] += ky * 0.5;
      }

      const pxs = [ax.value, xs[0], xs[1], xs[2]];
      const pys = [ay.value, ys[0], ys[1], ys[2]];
      const iters = 2 + Math.round(pElasticity.value * 10);

      for (let it = 0; it < iters; it++) {
        for (let s = 0; s < SEGS; s++) {
          const dx = pxs[s + 1] - pxs[s];
          const dy = pys[s + 1] - pys[s];
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const diff = (dist - segLen) / dist;
          const mx = dx * diff * 0.5;
          const my = dy * diff * 0.5;
          if (s > 0) {
            pxs[s] += mx;
            pys[s] += my;
          }
          pxs[s + 1] -= mx;
          pys[s + 1] -= my;
        }
        if (dragging.value) {
          pxs[3] = dragX.value;
          pys[3] = dragY.value;
        }
      }

      const top = ay.value;
      const floor = h + pCardH.value;
      for (let i = 0; i < 3; i++) {
        if (pys[i + 1] < top) pys[i + 1] = top;
        if (pys[i + 1] > floor) pys[i + 1] = floor;
        xs[i] = Math.min(Math.max(pxs[i + 1], -w * 0.5), w * 1.5);
        ys[i] = pys[i + 1];
      }

      for (let i = 0; i < 3; i++) {
        x[i].value = xs[i];
        y[i].value = ys[i];
        px[i].value = oxs[i];
        py[i].value = oys[i];
      }

      const target =
        (Math.atan2(ys[2] - ys[1], xs[2] - xs[1]) * 180) / Math.PI - 90;
      cardDeg.value += (Math.min(Math.max(target, -70), 70) - cardDeg.value) * 0.35;
    },
    false,
  );

  // Callback fisika didaftarkan dengan `autostart: false` lalu diaktifkan
  // setelah container terukur. Sebelum `w` diketahui, view-nya sendiri belum
  // dirender (`w > 0` di bawah) sementara tiap frame tetap menjalankan
  // simulasi terhadap posisi yang semuanya nol — hasilnya dibuang.
  // Catatan: tidak dipause saat di luar layar karena tidak ada sinyal
  // visibilitas murah di native tanpa merombak struktur bagian ini.
  useEffect(() => {
    if (w > 0) frame.setActive(true);
  }, [w, frame]);

  const segStyles = [
    useSegment(0, ax, ay, x, y, strapW),
    useSegment(1, ax, ay, x, y, strapW),
    useSegment(2, ax, ay, x, y, strapW),
  ];

  const cardStyle = useAnimatedStyle(() => ({
    left: x[2].value - cardW / 2,
    top: y[2].value + strapW * 0.3,
    transform: [{ rotate: `${cardDeg.value * 0.55}deg` }],
  }));

  const flipFront = useFlip(cardDeg);
  const flipBack = useFlip(cardDeg, 180);

  const clipStyle = useAnimatedStyle(() => ({
    left: x[2].value - strapW * 0.75,
    top: y[2].value - strapW * 0.55,
    width: strapW * 1.5,
    height: strapW * 1.1,
  }));

  const jointStyle = useJoint(0, ax, ay, x, y, strapW);
  const jointStyle2 = useJoint(1, ax, ay, x, y, strapW);
  const jointStyle3 = useJoint(2, ax, ay, x, y, strapW);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(interactive)
        .onBegin((e) => {
          dragging.value = 1;
          dragX.value = e.x;
          dragY.value = e.y;
        })
        .onUpdate((e) => {
          dragX.value = e.x;
          dragY.value = e.y;
        })
        .onFinalize(() => {
          dragging.value = 0;
        }),
    [interactive],
  );

  const stops = METALS[metal];

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[styles.root, { height: h }]}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
      >
        {w > 0 ? (
          <>
            {segStyles.map((s, i) => (
              <Animated.View key={`seg${i}`} style={[styles.strap, s]}>
                <View
                  style={[StyleSheet.absoluteFill, { backgroundColor: strapColor }]}
                />
                {strapImage ? (
                  <Image
                    source={strapImage}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                ) : null}
              </Animated.View>
            ))}

            <Animated.View style={[styles.joint, jointStyle, { backgroundColor: strapColor, width: strapW, height: strapW, borderRadius: strapW / 2 }]} />
            <Animated.View style={[styles.joint, jointStyle2, { backgroundColor: strapColor, width: strapW, height: strapW, borderRadius: strapW / 2 }]} />
            <Animated.View style={[styles.joint, jointStyle3, { backgroundColor: strapColor, width: strapW, height: strapW, borderRadius: strapW / 2 }]} />

            <Animated.View style={[styles.clip, clipStyle]}>
              <Svg width="100%" height="100%">
                <Defs>
                  <SvgGradient id="metal" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor={stops[0]} />
                    <Stop offset="0.5" stopColor={stops[1]} />
                    <Stop offset="1" stopColor={stops[2]} />
                  </SvgGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" rx={3} ry={3} fill="url(#metal)" />
              </Svg>
            </Animated.View>

            <Animated.View
              style={[
                styles.card,
                cardStyle,
                { width: cardW, height: cardH, borderRadius: radius },
              ]}
            >
              <Animated.View style={[styles.face, flipFront]}>
                <View style={[styles.faceInner, { backgroundColor: cardColor }]}>
                  <Image
                    source={frontImage}
                    style={StyleSheet.absoluteFill}
                    resizeMode={imageFit}
                  />
                  {finish === "glossy" ? <Sheen /> : null}
                </View>
              </Animated.View>
              <Animated.View style={[styles.face, flipBack]}>
                <BackCard
                  image={backImage}
                  color={cardColor}
                  resizeMode={imageFit}
                  gloss={finish === "glossy"}
                />
              </Animated.View>
            </Animated.View>
          </>
        ) : null}
      </View>
    </GestureDetector>
  );
}

type SV = ReturnType<typeof useSharedValue<number>>;

function useSegment(
  i: number,
  ax: SV,
  ay: SV,
  x: SV[],
  y: SV[],
  strapW: number,
) {
  return useAnimatedStyle(() => {
    const x0 = i === 0 ? ax.value : x[i - 1].value;
    const y0 = i === 0 ? ay.value : y[i - 1].value;
    const dx = x[i].value - x0;
    const dy = y[i].value - y0;
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    return {
      left: x0 - strapW / 2,
      top: y0 - strapW / 2,
      width: Math.sqrt(dx * dx + dy * dy) + strapW,
      height: strapW,
      borderRadius: strapW / 2,
      transform: [{ rotate: `${deg}deg` }],
    };
  });
}

function useJoint(i: number, ax: SV, ay: SV, x: SV[], y: SV[], strapW: number) {
  return useAnimatedStyle(() => ({
    left: x[i].value - strapW / 2,
    top: y[i].value - strapW / 2,
  }));
}

function useFlip(cardDeg: SV, offset = 0) {
  return useAnimatedStyle(() => {
    const ry = interpolate(
      cardDeg.value,
      [-60, 0, 60],
      [55, 0, -55],
      Extrapolation.CLAMP,
    );
    return { transform: [{ perspective: 900 }, { rotateY: `${ry + offset}deg` }] };
  });
}

function BackCard({
  image,
  color,
  resizeMode,
  gloss,
}: {
  image?: ImageSourcePropType;
  color: string;
  resizeMode: ImageResizeMode;
  gloss: boolean;
}) {
  if (image) {
    return (
      <View style={[styles.faceInner, { backgroundColor: color }]}>
        <Image source={image} style={StyleSheet.absoluteFill} resizeMode={resizeMode} />
        {gloss ? <Sheen /> : null}
      </View>
    );
  }
  return (
    <View style={[styles.faceInner, { backgroundColor: color }]}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <SvgGradient id="backbg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#ff2f11" />
            <Stop offset="1" stopColor="#7d0f04" />
          </SvgGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#backbg)" />
      </Svg>
      <View style={styles.backInner}>
        <View style={styles.backBadge}>
          <View style={styles.backDot} />
        </View>
      </View>
      {gloss ? <Sheen /> : null}
    </View>
  );
}

function Sheen() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <SvgGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
          <Stop offset="0.45" stopColor="#ffffff" stopOpacity="0.04" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#sheen)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { width: "100%", overflow: "hidden" },
  strap: { position: "absolute", overflow: "hidden" },
  joint: { position: "absolute" },
  clip: { position: "absolute" },
  card: { position: "absolute" },
  face: {
    ...StyleSheet.absoluteFillObject,
    backfaceVisibility: "hidden",
  },
  faceInner: {
    flex: 1,
    overflow: "hidden",
  },
  backInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  backBadge: {
    width: "34%",
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.55,
  },
  backDot: { width: "26%", aspectRatio: 1, borderRadius: 999, backgroundColor: "#ffffff" },
});