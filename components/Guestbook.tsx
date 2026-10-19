import { useCallback, useEffect, useState } from "react";
import { Animated, Text, TextInput, View } from "react-native";
import {
  GUESTBOOK_MAX_MESSAGE,
  GUESTBOOK_MAX_NAME,
  isFirebaseConfigured,
  type GuestbookEntry,
} from "@/lib/firebase";
import { addGuestbook, listGuestbook } from "@/lib/guestbook";
import { Reveal } from "./motion/Reveal";
import { useSpin } from "./motion/Entrance";
import { useWide } from "./motion/Motion";
import { useSectionAnchor } from "./SectionScroll";
import { Container, Display, Eyebrow, Lead, Mono, PillButton } from "./ui";
import { Asterisk, Blob } from "./decor/Shape";

type Msg = GuestbookEntry;

const input =
  "rounded-card border-2 border-ink bg-paper px-5 py-4 font-sans text-base text-ink";

export default function Guestbook() {
  const anchor = useSectionAnchor("guestbook");
  const wide = useWide();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [list, setList] = useState<Msg[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const spin = useSpin(360, 36, false, wide);

  const load = useCallback(async () => {
    if (!isFirebaseConfigured) return;
    try {
      setList(await listGuestbook(100));
    } catch (e) {
      setStatus(`Gagal memuat: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const send = async () => {
    if (!name.trim() || !text.trim()) return;
    setSending(true);
    setStatus(null);

    if (!isFirebaseConfigured) {
      // Tanpa Firebase ini masih jalan seperti sebelumnya: memori lokal.
      setList([
        {
          id: `local-${Date.now()}`,
          name: name.trim(),
          text: text.trim(),
          createdAt: Date.now(),
        },
        ...list,
      ]);
      setName("");
      setText("");
      setSending(false);
      return;
    }

    try {
      const saved = await addGuestbook(name.trim(), text.trim());
      setList([saved, ...list]);
      setName("");
      setText("");
      setStatus("Tersimpan. Terima kasih!");
    } catch (e) {
      setStatus(`Gagal mengirim: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSending(false);
    }
  };

  const empty = !name.trim() || !text.trim();

  return (
    <View {...anchor} className="overflow-hidden bg-lavender">
      <Container className={wide ? "pb-28 pt-24" : "pb-20 pt-16"}>
        <View className={wide ? "flex-row items-start gap-12" : ""}>
          <View className={wide ? "w-[40%] gap-6" : "gap-6"}>
            <View className="flex-row items-center gap-3">
              <Asterisk size={18} color="#191717" strokeWidth={4} />
              <Eyebrow>Buku tamu</Eyebrow>
            </View>

            <Reveal>
              <Display level="h2" color="text-ink">
                Leave a
                {"\n"}
                mark
              </Display>
            </Reveal>

            <Reveal delay={1}>
              <Lead color="text-ink">
                Tinggalkan pesan, feedback, atau sekadar say hi. Semua yang
                ditulis tersimpan di server.
              </Lead>
            </Reveal>

            <View className="hidden self-end">
              <Animated.View style={spin}>
                <Blob color="#e4fc51" width={170} variant={1} />
              </Animated.View>
            </View>
          </View>

          <View className={wide ? "flex-1 gap-4" : "mt-10 gap-3"}>
            <Reveal delay={1}>
              <View className="rounded-card bg-paper p-6">
                <View className="gap-3">
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Nama"
                    placeholderTextColor="#19171788"
                    className={input}
                    maxLength={GUESTBOOK_MAX_NAME}
                  />
                  <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Pesan"
                    placeholderTextColor="#19171788"
                    multiline
                    numberOfLines={4}
                    className={`${input} min-h-[120px]`}
                    style={{ textAlignVertical: "top" }}
                    maxLength={GUESTBOOK_MAX_MESSAGE}
                  />
                  <View className="flex-row items-center justify-between">
                    <Mono className="text-ink">
                      {empty
                        ? "Isi nama dan pesan dulu"
                        : `${name.trim().length}/${text.trim().length} siap`}
                    </Mono>
                    <PillButton
                      onPress={send}
                      fill={empty || sending ? "cream" : "ink"}
                      textColor="ink"
                      size="md"
                    >
                      {sending ? "Menyimpan..." : "Tanda tangan"}
                    </PillButton>
                  </View>
                  {status ? <Mono className="text-ink/70">{status}</Mono> : null}
                </View>
              </View>
            </Reveal>

            <View className={wide ? "mt-6 gap-4" : "mt-6 gap-4"}>
              {list.length === 0 ? (
                <Reveal delay={2}>
                  <View className="rounded-card border-2 border-ink/20 p-6">
                    <Text className="font-sans text-ink" style={{ fontSize: 17, lineHeight: 26 }}>
                      Belum ada pesan. Jadilah yang pertama.
                    </Text>
                  </View>
                </Reveal>
              ) : (
                list.map((m, n) => (
                  <Reveal key={n} delay={n}>
                    <View
                      className={`rounded-card bg-ink p-5`}
                      style={
                        wide && n % 2 === 1
                          ? { marginLeft: 48 }
                          : undefined
                      }
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="font-display uppercase text-lime" style={{ fontSize: 20, lineHeight: 20 }}>
                          {m.name}
                        </Text>
                        <Mono color="text-paper">
                          #{String(list.length - n).padStart(2, "0")}
                        </Mono>
                      </View>
                      <Text
                        className="mt-2 font-sans text-paper"
                        style={{ fontSize: 16, lineHeight: 24 }}
                      >
                        {m.text}
                      </Text>
                      {m.reply ? (
                        <View className="mt-4 rounded-card bg-paper/10 p-3">
                          <Mono color="text-lime">Balasan</Mono>
                          <Text
                            className="mt-1 font-sans text-paper"
                            style={{ fontSize: 15, lineHeight: 22 }}
                          >
                            {m.reply}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </Reveal>
                ))
              )}
            </View>

            {/* Sengaja tidak ada tombol hapus di halaman publik. Aturan "boleh siapa"
                ada di firestore.rules, bukan di UI. Lihat file itu. */}
            {!isFirebaseConfigured ? (
              <Mono className="text-ink/60">
                Firebase belum dikonfigurasi, pesan hanya tersimpan di
                perangkat ini.
              </Mono>
            ) : null}
          </View>
        </View>
      </Container>
    </View>
  );
}