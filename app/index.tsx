import { Animated, ScrollView } from "react-native";
import { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SectionScrollProvider,
  useSectionScrollController,
} from "@/components/SectionScroll";
import { useMotion } from "@/components/motion/Motion";
import Header from "@/components/Header";
import ScrollExpand from "@/components/ScrollExpand";
import Hero from "@/components/Hero";
import Words from "@/components/Words";
import About from "@/components/About";
import TechStack from "@/components/TechStack";
import Works from "@/components/Works";
import Services from "@/components/Services";
import Journey from "@/components/Journey";
import Guestbook from "@/components/Guestbook";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  const { scrollRef, register, scrollTo } = useSectionScrollController();
  const { scrollY } = useMotion();

  // `scrollY` di MotionProvider memakai native driver, sedangkan ScrollExpand
  // menganimasikan width/height/borderRadius yang TIDAK aman untuk native
  // driver — dan nilai native-driven tidak bisa dibaca di JS thread. Jadi
  // ScrollExpand memakai nilai kedua yang di-update lewat `listener` (tetap
  // jalan di JS thread) tanpa menyentuh event native yang sudah ada.
  const splashY = useRef(new Animated.Value(0)).current;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (e: any) => splashY.setValue(e.nativeEvent.contentOffset.y),
    },
  );

  return (
    <SectionScrollProvider value={{ register, scrollTo }}>
      <SafeAreaView edges={["top"]} className="flex-1 bg-ground">
        <Animated.ScrollView
          ref={scrollRef as React.Ref<ScrollView>}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
        >
          <ScrollExpand scrollY={splashY} />
          <Hero />
          <Words />
          <About />
          <TechStack />
          <Works />
          <Services />
          <Journey />
          <Guestbook />
          <Contact />
          <Footer />
        </Animated.ScrollView>
        <Header />
      </SafeAreaView>
    </SectionScrollProvider>
  );
}