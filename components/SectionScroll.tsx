import { createContext, useCallback, useContext, useRef } from "react";
import type { ViewProps } from "react-native";

type SectionScrollValue = {
  register: (id: string, y: number) => void;
  scrollTo: (id: string) => void;
};

const SectionScrollContext = createContext<SectionScrollValue>({
  register: () => {},
  scrollTo: () => {},
});

export function useSectionScroll() {
  return useContext(SectionScrollContext);
}

/** Dipakai di app/index.tsx untuk membuat provider + ref ScrollView. */
export function useSectionScrollController() {
  const scrollRef = useRef<any>(null);
  const offsets = useRef<Record<string, number>>({});

  const register = useCallback((id: string, y: number) => {
    offsets.current[id] = y;
  }, []);

  const scrollTo = useCallback((id: string) => {
    const y = offsets.current[id];
    if (y == null) return;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 72), animated: true });
  }, []);

  return { scrollRef, register, scrollTo };
}

export function SectionScrollProvider({
  value,
  children,
}: {
  value: SectionScrollValue;
  children: React.ReactNode;
}) {
  return (
    <SectionScrollContext.Provider value={value}>
      {children}
    </SectionScrollContext.Provider>
  );
}

/**
 * Memberi tahu provider posisi Y sebuah section lalu mengembalikan props
 * yang perlu disebar ke View pembungkus section.
 */
export function useSectionAnchor(id: string): Pick<
  ViewProps,
  "nativeID" | "onLayout"
> {
  const { register } = useSectionScroll();
  return {
    nativeID: id,
    onLayout: (e) => register(id, e.nativeEvent.layout.y),
  };
}