/**
 * ScrollExpand — implementasi DOM asli dari React Bits, dipakai di web.
 *
 * Kenapa ada versi ini terpisah dari `ScrollExpand.tsx` (versi React Native):
 *
 *   Efek ScrollExpand aslinya casi seluruhnya ditangani browser:
 *   - `position: sticky` untuk mengunci frame  → compositor, tanpa JS
 *   - `clip-path: inset(...)` untuk membuka     → tanpa reflow
 *   - `transform: scale()` untuk media          → GPU
 *
 *   Port React Native tidak bisa meniru itu. RN tidak punya `clipPath`,
 *   jadi untuk kesan yang sama kita wajib menganimasikan `width`, `height`,
 *   `left`, `top`, dan `borderRadius` — semuanya layout properties, jadi tiap
 *   frame memicu reflow. Akibatnya jauh lebih berat dari versi DOM, dan tidak
 *   akan pernah terasa sehalus aslinya.
 *
 *   Karena itu: web → komponen ini (persis seperti aslinya, scroll engine
 *   browser), native → `ScrollExpand.tsx`.
 */

import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Platform } from "react-native";
import { ensureScrollExpandStyle } from "./scrollExpandCss";

// Dipanggil di module scope, bukan di `useEffect`, supaya CSS-nya sudah
// terpasang begitu modul dievaluasi — `useEffect` selalu datang setelah paint
// pertama, dan di jendela itulah splash ini sempat tampil tanpa styling.
// Cadangan saja: jalur utamanya ada di `app/+html.tsx` (lihat
// `components/scrollExpandCss.ts` untuk alasan lengkapnya).
if (Platform.OS === "web") ensureScrollExpandStyle();

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let n: HTMLElement | null = el?.parentElement ?? null;
  while (n) {
    const s = getComputedStyle(n);
    if (
      (s.overflowY === "auto" || s.overflowY === "scroll") &&
      n.scrollHeight > n.clientHeight
    ) {
      return n;
    }
    n = n.parentElement;
  }
  return null;
}

export type ScrollExpandDomProps = {
  src?: string;
  alt?: string;
  title?: string;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  /** `true` = pakai scroll window, `false`/undefined = pakai scroller terdekat. */
  useWindowScroll?: boolean;
  enabled?: boolean;
  reduceMotion?: boolean;
  children?: ReactNode;
};

type Config = Required<
  Omit<
    ScrollExpandDomProps,
    "alt" | "src" | "title" | "scrollHint" | "useWindowScroll" | "children"
  >
> &
  Pick<ScrollExpandDomProps, "useWindowScroll">;

export default function ScrollExpandDom({
  src = "",
  alt = "",
  title = "",
  scrollHint = "",
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 0.8,
  holdDistance = 0.2,
  smoothing = 0.1,
  overlayScrim = 0.45,
  useWindowScroll = false,
  enabled = true,
  reduceMotion = false,
  children,
}: ScrollExpandDomProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLImageElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  const propsRef = useRef<Config>({} as Config);
  propsRef.current = {
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
    reduceMotion,
  };

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    let raf = 0;
    let current = 0;
    let target = 0;
    let span = 1;
    let contentTop = 0;
    let scroller: HTMLElement | null = null;

    const applyProgress = (p: number) => {
      const frame = frameRef.current;
      const media = mediaRef.current;
      if (!frame || !media) return;
      const c = propsRef.current;

      const e = smoothstep(0, 1, p);

      const w = c.startWidth + (100 - c.startWidth) * e;
      const h = c.startHeight + (100 - c.startHeight) * e;
      const ix = Math.max(0, (100 - w) / 2);
      const iy = Math.max(0, (100 - h) / 2);
      const r = c.startRadius + (c.endRadius - c.startRadius) * e;
      frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;

      media.style.transform = `scale(${c.mediaZoom + (1 - c.mediaZoom) * e})`;

      if (scrimRef.current) {
        scrimRef.current.style.opacity = `${c.overlayScrim * e}`;
      }

      if (titleRef.current) {
        const out = smoothstep(0.4, 0.88, p);
        titleRef.current.style.opacity = `${1 - out}`;
        titleRef.current.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
      }

      if (hintRef.current) {
        const gone = smoothstep(0, 0.12, p);
        hintRef.current.style.opacity = `${1 - gone}`;
        hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
      }

      if (overlayRef.current) {
        const inn = smoothstep(0.68, 1, p);
        overlayRef.current.style.opacity = `${inn}`;
        overlayRef.current.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`;
      }
    };

    const measure = () => {
      const c = propsRef.current;
      scroller = c.useWindowScroll ? null : findScrollParent(track);

      const stageH = c.useWindowScroll || !scroller ? window.innerHeight : scroller.clientHeight;
      if (stageH <= 0) return;

      stage.style.height = `${stageH}px`;
      track.style.height = `${stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))}px`;
      span = stageH * Math.max(0.01, c.scrollDistance);

      // Jarak track dari atas konten scroller, dipakai untuk mengubah
      // scrollTop menjadi progress.
      if (scroller) {
        contentTop =
          track.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop;
      }

      const w = window.innerWidth || stageH;
      stage.style.setProperty("--se-title-size", `${clamp(w * 0.075, 20, 84)}px`);
    };

    const readProgress = () => {
      const c = propsRef.current;
      if (!c.enabled) return 1;
      if (c.reduceMotion) return 1;
      if (c.useWindowScroll || !scroller) {
        const top = track.getBoundingClientRect().top;
        return clamp(-top / span, 0, 1);
      }
      return clamp((scroller.scrollTop - contentTop) / span, 0, 1);
    };

    const tick = () => {
      const c = propsRef.current;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        applyProgress(current);
        raf = 0;
        return;
      }
      applyProgress(current);
      raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = readProgress();
      const c = propsRef.current;
      if (c.smoothing <= 0 || c.reduceMotion) {
        current = target;
        applyProgress(current);
        return;
      }
      kick();
    };

    const onResize = () => {
      measure();
      target = readProgress();
      current = target;
      applyProgress(current);
    };

    measure();
    target = readProgress();
    current = target;
    applyProgress(current);

    // Halaman ini scroll di dalam ScrollView-nya sendiri, bukan window,
    // jadi listen ke `document` di fase capture (pola yang sama dipakai
    // Header).
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(onResize);
    ro.observe(rootRef.current ?? track);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("scroll", onScroll, { capture: true } as never);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  // Tanpa `src`, pakai gradien brand + Asterisk lime sebagai placeholder —
  // sama persis dengan versi native, dan attenuated oleh `mediaZoom`.
  const media = src
    ? createElement("img", {
        ref: mediaRef,
        className: "scroll-expand__media",
        src,
        alt,
        draggable: false,
      })
    : createElement(
        "div",
        {
          ref: mediaRef,
          className: "scroll-expand__media",
          style: {
            background:
              "linear-gradient(135deg, #c3b5f9 0%, #3600a9 55%, #ff2f11 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          } as CSSProperties,
        },
        createElement(
          "svg",
          { viewBox: "0 0 32 32", width: 240, height: 240 } as CSSProperties,
          createElement("path", {
            d: "M16 3v26M5 9.5l22 13M27 9.5l-22 13",
            stroke: "#e4fc51",
            strokeWidth: 4,
            strokeLinecap: "round",
            fill: "none",
          }),
        ),
      );

  return createElement(
    "div",
    { ref: rootRef, className: `scroll-expand ${useWindowScroll ? "" : "scroll-expand--embedded"}`.trim() },
    createElement(
      "div",
      { ref: trackRef, className: "scroll-expand__track" },
      createElement(
        "div",
        { ref: stageRef, className: "scroll-expand__stage" },
        createElement(
          "div",
          { ref: frameRef, className: "scroll-expand__frame" },
          media,
          createElement("div", { ref: scrimRef, className: "scroll-expand__scrim" }),
          children
            ? createElement("div", { ref: overlayRef, className: "scroll-expand__overlay" }, children)
            : null,
        ),
        title
          ? createElement("div", { ref: titleRef, className: "scroll-expand__title" }, title)
          : null,
        scrollHint
          ? createElement("div", { ref: hintRef, className: "scroll-expand__hint" }, scrollHint)
          : null,
      ),
    ),
  );
}
