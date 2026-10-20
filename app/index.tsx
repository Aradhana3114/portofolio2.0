import { Animated, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SectionScrollProvider,
  useSectionScrollController,
} from "@/components/SectionScroll";
import { useMotion } from "@/components/motion/Motion";
import Header from "@/components/Header";
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

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true },
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
