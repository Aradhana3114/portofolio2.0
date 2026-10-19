import {
  AccessibilityInfo,
  Animated,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

export const WIDE_BREAKPOINT = 900;

type MotionValue = {
  scrollY: Animated.Value;
  viewportH: number;
  reduceMotion: boolean;
};

const MotionContext = createContext<MotionValue>({
  scrollY: new Animated.Value(0),
  viewportH: 800,
  reduceMotion: false,
});

export function MotionProvider({ children }: { children: ReactNode }) {
  const { height } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (alive) setReduceMotion(!!v);
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (v) => {
        if (alive) setReduceMotion(!!v);
      },
    );
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  const value = useMemo(
    () => ({ scrollY, viewportH: height, reduceMotion }),
    [scrollY, height, reduceMotion],
  );

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

export function useMotion() {
  return useContext(MotionContext);
}

function readViewportWidth() {
  if (Platform.OS !== "web" || typeof window === "undefined") return 0;
  return (
    window.visualViewport?.width ??
    window.document.documentElement.clientWidth ??
    window.innerWidth ??
    0
  );
}

export function useWide() {
  const { width: rnWidth } = useWindowDimensions();
  const [vw, setVw] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const read = () => setVw(readViewportWidth());
    read();
    window.addEventListener("resize", read);
    window.visualViewport?.addEventListener("resize", read);
    return () => {
      window.removeEventListener("resize", read);
      window.visualViewport?.removeEventListener("resize", read);
    };
  }, []);

  // PENTING: jangan pakai rnWidth sebagai fallback di web. Saat static
  // export, render di server memakai komposisi mobile (window = 0), sementara
  // render pertama client sudah tahu viewport asli. Bedanya memicu React
  // error #418 (hydration mismatch): React membuang seluruh HTML server lalu
  // render ulang dari nol, sehingga semua animasi ter-reset ke kondisi awal.
  // Karena itu render pertama client juga harus memakai `vw` (masih 0),
  // baru berubah ke desktop setelah effect berjalan.
  const width = Platform.OS === "web" ? vw : rnWidth;
  return width >= WIDE_BREAKPOINT;
}

export { Animated };