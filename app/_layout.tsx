import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  ArchivoBlack_400Regular,
  useFonts as useDisplay,
} from "@expo-google-fonts/archivo-black";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from "@expo-google-fonts/space-mono";
import { MotionProvider } from "@/components/motion/Motion";
import BootScreen from "@/components/BootScreen";

/**
 * Batas waktu sebelum layar boot menyerah.
 *
 * Tanpa ini, satu kegagalan mengunduh file font (jaringan putus, CDN lambat)
 * akan mengunci situs di layar boot selamanya. Lebih baik memperlihatkan
 * halaman dengan font cadangan daripada tidak memperlihatkan apa-apa.
 */
const FONT_TIMEOUT_MS = 5000;

const PAGE_TITLE = "Aradhana Dev — Full Stack Developer";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useDisplay({
    ArchivoBlack_400Regular,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) return;
    const id = setTimeout(() => setTimedOut(true), FONT_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [fontsLoaded, fontError]);

  // `fontError` dihitung "beres" juga: font gagal tetap punya fallback di
  // `tailwind.config.js`, jadi lebih baik tampil dengan font sistem daripada
  // tertahan di layar boot.
  const ready = fontsLoaded || !!fontError || timedOut;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MotionProvider>
          <StatusBar style="light" />
          {ready ? (
            // `title` ikut di-set di sini supaya judul yang dipasang Expo Router
            // ke `document.title` tidak menimpa judul di `app/+html.tsx`.
            <Stack
              screenOptions={{
                headerShown: false,
                title: PAGE_TITLE,
                contentStyle: { backgroundColor: "#ff2f11" },
              }}
            />
          ) : (
            <BootScreen />
          )}
        </MotionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
