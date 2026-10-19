import { useEffect, useRef, useState } from "react";
import { Animated, Linking, Text, TextInput, View } from "react-native";
import { profile, socials, subjects } from "@/data/content";
import { isFirebaseConfigured } from "@/lib/firebase";
import { addContact } from "@/lib/contact";
import { friendlyRulesError } from "@/lib/errors";
import { Reveal } from "./motion/Reveal";
import { Press } from "./motion/Press";
import { useSpin } from "./motion/Entrance";
import { useWide } from "./motion/Motion";
import { useSectionAnchor } from "./SectionScroll";
import { Container, Display, Eyebrow, Lead, Mono, PillButton } from "./ui";
import { ArrowUpRight, Asterisk, Blob } from "./decor/Shape";

const input =
  "rounded-card border-2 border-ink bg-paper px-5 py-4 font-sans text-base text-ink";

/**
 * Cek format email sebelum dikirim.
 *
 * Security Rules sendiri hanya memeriksa ada-tidaknya `@`
 * (`'^.+@.+$'`) karena regex di sana tidak bisa dipercaya untuk kasus ini;
 * validasi yang sesungguhnya ada di sini.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SendState = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const anchor = useSectionAnchor("contact");
  const wide = useWide();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<SendState>("idle");
  const [error, setError] = useState<string | null>(null);
  const spin = useSpin(360, 30, false, wide);

  /** Pesan bisa selesai setelah pengguna meninggalkan bagian ini. */
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const emailOk = EMAIL_RE.test(email.trim());
  const valid = !!(name.trim() && emailOk && msg.trim());

  /** Setiap perubahan input membatalkan status "terkirim". */
  const edit = (set: (v: string) => void) => (v: string) => {
    set(v);
    if (state === "sent" || state === "error") {
      setState("idle");
      setError(null);
    }
  };

  const send = async () => {
    if (!valid || state === "sending") return;

    // Firebase belum dikonfigurasi: turunkan ke mailto supaya form tetap
    // berguna di lingkungan tanpa backend.
    if (!isFirebaseConfigured) {
      const body = encodeURIComponent(`${msg}\n\nDari: ${name} (${email})`);
      void Linking.openURL(
        `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${body}`,
      );
      setState("sent");
      return;
    }

    setState("sending");
    setError(null);
    try {
      await addContact(name.trim(), email.trim(), subject, msg.trim());
      if (!mountedRef.current) return;
      setState("sent");
      setName("");
      setEmail("");
      setMsg("");
      setSubject(subjects[0]);
    } catch (e) {
      if (!mountedRef.current) return;
      setState("error");
      setError(friendlyRulesError(e));
    }
  };

  const statusLine = () => {
    if (state === "sending") return "Mengirim...";
    if (state === "sent") return "Terkirim. Pesan Anda sudah masuk.";
    if (state === "error") return error ?? "Gagal mengirim. Coba lagi.";
    return valid
      ? `${msg.trim().length} karakter siap`
      : "Lengkapi nama, email, dan pesan";
  };

  return (
    <View {...anchor} className="overflow-hidden bg-paper">
      <Container className={wide ? "pb-28 pt-24" : "pb-20 pt-16"}>
        <View className={wide ? "flex-row items-start gap-12" : ""}>
          <View className={wide ? "w-[42%] gap-6" : "gap-6"}>
            <View className="flex-row items-center gap-3">
              <Asterisk size={18} color="#ff2f11" strokeWidth={4} />
              <Eyebrow>Kontak</Eyebrow>
            </View>

            <Reveal>
              <Display level="h2" color="text-ink">
                Mari mulai
                {"\n"}
                <Text className="text-ground">proyek</Text>
              </Display>
            </Reveal>

            <Reveal delay={1}>
              <Lead color="text-ink">
                Tertarik bekerja sama? Isi form atau kirim pesan langsung. Tersedia
                untuk freelance dan full-time.
              </Lead>
            </Reveal>

            <Reveal delay={2}>
              <View className="rounded-card bg-ink p-6">
                <Mono color="text-lime">Email langsung</Mono>
                <Text
                  maxFontSizeMultiplier={1.15}
                  className="mt-2 font-sans text-paper"
                  style={{ fontSize: 20, lineHeight: 26 }}
                >
                  {profile.email}
                </Text>
                <Press onPress={() => Linking.openURL(`mailto:${profile.email}`)} className="mt-4 self-start">
                  <View className="flex-row items-center gap-2 rounded-pill bg-lime px-4 py-2">
                    <Text className="font-sans text-sm uppercase text-ink">
                      Tulis email
                    </Text>
                    <ArrowUpRight size={15} />
                  </View>
                </Press>
              </View>
            </Reveal>

            <View className="hidden self-end">
              <Animated.View style={spin}>
                <Blob color="#e4fc51" width={160} variant={0} />
              </Animated.View>
            </View>
          </View>

          <View className={wide ? "flex-1 gap-5" : "mt-10 gap-4"}>
            <Reveal delay={1}>
              <View className="rounded-card bg-cream p-6">
                <View className="gap-4">
                  <TextInput
                    value={name}
                    onChangeText={edit(setName)}
                    placeholder="Nama Anda"
                    placeholderTextColor="#19171788"
                    className={input}
                    maxLength={60}
                  />
                  <TextInput
                    value={email}
                    onChangeText={edit(setEmail)}
                    placeholder="Email Anda"
                    placeholderTextColor="#19171788"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={input}
                    style={{ borderColor: email.trim() && !emailOk ? "#ff2f11" : undefined }}
                    maxLength={120}
                  />
                  {email.trim() && !emailOk ? (
                    <Mono className="text-ground">Format email belum benar</Mono>
                  ) : null}

                  <View className="flex-row flex-wrap gap-2">
                    {subjects.map((s) => {
                      const on = s === subject;
                      return (
                        <Press key={s} onPress={() => edit(setSubject)(s)}>
                          <View
                            className={`rounded-pill border-2 border-ink px-4 py-2 ${
                              on ? "bg-ink" : "bg-transparent"
                            }`}
                          >
                            <Text
                              className={`font-sans text-sm uppercase ${
                                on ? "text-paper" : "text-ink"
                              }`}
                            >
                              {s}
                            </Text>
                          </View>
                        </Press>
                      );
                    })}
                  </View>

                  <TextInput
                    value={msg}
                    onChangeText={edit(setMsg)}
                    placeholder="Pesan"
                    placeholderTextColor="#19171788"
                    multiline
                    numberOfLines={5}
                    className={`${input} min-h-[140px]`}
                    style={{ textAlignVertical: "top" }}
                    maxLength={1200}
                  />

                  <View className="flex-row flex-wrap items-center gap-3">
                    <PillButton
                      onPress={send}
                      fill={valid && state !== "sending" ? "ink" : "paper"}
                      textColor={valid && state !== "sending" ? "paper" : "ink"}
                      withArrow
                    >
                      {state === "sending"
                        ? "Mengirim"
                        : state === "sent"
                          ? "Terkirim"
                          : "Kirim pesan"}
                    </PillButton>
                    <Mono className={state === "error" ? "text-ground" : "text-ink"}>
                      {statusLine()}
                    </Mono>
                  </View>
                </View>
              </View>
            </Reveal>

            <Reveal delay={2}>
              <View className="mt-6">
                <Mono className="text-ink">Kehadiran sosial</Mono>
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {socials.map((s) => (
                    <Press key={s.label} onPress={() => Linking.openURL(s.href)}>
                      <View className="flex-row items-center gap-2 rounded-pill border-2 border-ink px-4 py-2">
                        <Text className="font-sans text-sm text-ink">{s.label}</Text>
                        <ArrowUpRight size={14} />
                      </View>
                    </Press>
                  ))}
                </View>
              </View>
            </Reveal>
          </View>
        </View>
      </Container>
    </View>
  );
}