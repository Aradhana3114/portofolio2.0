import { Animated, Text, View } from "react-native";
import { Marquee } from "./motion/Marquee";
import { useDrift, Entrance } from "./motion/Entrance";
import { useWide } from "./motion/Motion";
import { Asterisk } from "./decor/Shape";

const STATEMENTS = [
  "Web yang dipakai",
  "Kode yang dibaca",
  "Detail yang dicek",
];

export default function Words() {
  const wide = useWide();
  const drift = useDrift(10, 6, 8, wide);

  return (
    <View className="overflow-hidden border-y-2 border-ink bg-lime py-6">
      <Entrance>
        <Marquee duration={34} reverse>
          {STATEMENTS.map((s) => (
            <View key={s} className="flex-row items-center">
              <Text
                maxFontSizeMultiplier={1.1}
                className="px-6 font-display uppercase text-ink"
                style={{
                  fontSize: wide ? 46 : 28,
                  lineHeight: wide ? 42 : 26,
                }}
              >
                {s}
              </Text>
              <Asterisk size={22} color="#191717" strokeWidth={5} />
            </View>
          ))}
        </Marquee>
      </Entrance>

      {!wide && (
        <View className="mt-2 px-5">
          <Animated.View style={drift}>
            <Text className="font-mono text-[10px] uppercase text-ink">
              build / ship / repeat
            </Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}