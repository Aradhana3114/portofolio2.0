import "../global.css";
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

const PAGE_TITLE = "Aradhana Dev — Full Stack Developer";

export default function RootLayout() {
  useDisplay({
    ArchivoBlack_400Regular,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MotionProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              title: PAGE_TITLE,
              contentStyle: { backgroundColor: "#ff2f11" },
            }}
          />
        </MotionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
