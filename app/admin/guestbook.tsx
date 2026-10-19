import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  GUESTBOOK_MAX_MESSAGE,
  GUESTBOOK_MAX_NAME,
  GUESTBOOK_MAX_REPLY,
  isFirebaseConfigured,
  type GuestbookEntry,
} from "@/lib/firebase";
import { deleteGuestbook, listGuestbook, replyGuestbook } from "@/lib/guestbook";
import { getCurrentUser, signInWithPasscode, signOut } from "@/lib/firebaseAuth";
import { friendlyAuthError, friendlyRulesError } from "@/lib/errors";
import { Mono } from "@/components/ui";
import { Press } from "@/components/motion/Press";
import {
  INK,
  Alert,
  Chip,
  Head,
  LoginShell,
  NeoBox,
  NeoButton,
  Shell,
  fmtDate,
} from "@/components/admin/ui";

const CRUMB = "Guestbook / admin";
const TITLE = "Kelola\npesan";
const TITLE_LOGIN = "Kelola pesan";
const LEAD = "Balas, ubah, atau hapus pesan yang masuk dari halaman Guestbook.";

export default function AdminGuestbook() {
  const [user, setUser] = useState<{ email: string | null } | null>(null);
  const [booting, setBooting] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [reveal, setReveal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [rows, setRows] = useState<GuestbookEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingRows, setLoadingRows] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  /** Draf balasan per pesan, sebelum disimpan. */
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setBooting(false);
      return;
    }
    let alive = true;
    getCurrentUser().then((u) => {
      if (!alive) return;
      setUser(u);
      setBooting(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const load = useCallback(async () => {
    setLoadingRows(true);
    setLoadError(null);
    try {
      const data = await listGuestbook(200);
      if (!mounted.current) return;
      setRows(data);
    } catch (e) {
      if (!mounted.current) return;
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      if (mounted.current) setLoadingRows(false);
    }
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const doSignIn = async () => {
    setBusy(true);
    setAuthError(null);
    try {
      const u = await signInWithPasscode(passcode.trim());
      if (!u) {
        setAuthError("Login hanya tersedia di browser.");
      } else {
        setUser({ email: u.email });
      }
    } catch (e) {
      setAuthError(friendlyAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    setLoadError(null);
    try {
      await deleteGuestbook(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      // Security Rules menolak kalau email login tidak cocok dengan yang
      // tertulis di firestore.rules, atau kalau rules-nya belum di-deploy.
      setLoadError(friendlyRulesError(e));
    } finally {
      setDeletingId(null);
    }
  };

  const saveReply = async (id: string) => {
    setReplyingId(id);
    setLoadError(null);
    const value = (drafts[id] ?? "").trim();
    try {
      await replyGuestbook(id, value);
      setRows((prev) => prev.map((r) => (r.id === id
        ? { ...r, reply: value || null, repliedAt: value ? Date.now() : null }
        : r)));
      setDrafts((prev) => ({ ...prev, [id]: value }));
    } catch (e) {
      setLoadError(friendlyRulesError(e));
    } finally {
      setReplyingId(null);
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <LoginShell>
        <Head crumb={CRUMB} title={TITLE_LOGIN} lead={LEAD} compact />
        <NeoBox className="mt-6 max-w-[520px] bg-paper p-5">
          <Text className="font-sans text-ink" style={{ fontSize: 15, lineHeight: 23 }}>
            Firebase belum dikonfigurasi. Isi variabel EXPO_PUBLIC_FIREBASE_* di
            file .env, lalu restart dev server.
          </Text>
        </NeoBox>
      </LoginShell>
    );
  }

  if (booting) {
    return (
      <LoginShell>
        <Head crumb={CRUMB} title={TITLE_LOGIN} lead={LEAD} compact />
        <View className="mt-6">
          <ActivityIndicator color={INK} />
        </View>
      </LoginShell>
    );
  }

  if (!user) {
    const ready = !!passcode.trim() && !busy;
    return (
      <LoginShell>
        <Head crumb={CRUMB} title={TITLE_LOGIN} lead={LEAD} compact />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="items-center">
          <NeoBox shadow={6} className="mt-6 w-full max-w-[480px] bg-paper p-5">
            <Text className="font-sans text-ink" style={{ fontSize: 17, lineHeight: 25, fontWeight: 700 }}>
              Masukkan kode admin untuk membuka panel.
            </Text>

            <TextInput
              value={passcode}
              onChangeText={setPasscode}
              placeholder="Kode admin"
              placeholderTextColor="#19171766"
              secureTextEntry={!reveal}
              autoCapitalize="none"
              autoCorrect={false}
              className="mt-4 border-2 border-ink bg-cream px-4 py-3 font-sans text-base text-ink"
            />

            <View className="mt-4 flex-row flex-wrap items-center gap-x-4 gap-y-3">
              <NeoButton onPress={doSignIn} tone="lime" disabled={!ready}>
                {busy ? "Memeriksa" : "Masuk"}
              </NeoButton>
              <Press onPress={() => setReveal((v) => !v)} accessibilityRole="button">
                <Mono className="text-ink/60 underline">
                  {reveal ? "Sembunyikan kode" : "Tampilkan kode"}
                </Mono>
              </Press>
            </View>

            {authError ? (
              <View className="mt-4">
                <Alert>{authError}</Alert>
              </View>
            ) : null}

            <Mono className="mt-4 text-ink/45">
              Kode diatur di .env (EXPO_PUBLIC_ADMIN_PASSCODE) dan harus sama
              dengan password akun admin@gmail.com.
            </Mono>
          </NeoBox>
        </KeyboardAvoidingView>
      </LoginShell>
    );
  }

  return (
    <Shell>
      <Head crumb={CRUMB} title={TITLE} lead={LEAD} />

      <View className="mt-8 flex-row flex-wrap items-center gap-3">
        <Chip tone="ink">{rows.length} pesan</Chip>
        {user.email ? <Chip>{user.email}</Chip> : null}
        <View className="flex-1" />
        <NeoButton onPress={load} tone="paper">
          Muat ulang
        </NeoButton>
      </View>

      {loadError ? (
        <View className="mt-4">
          <Alert>{loadError}</Alert>
        </View>
      ) : null}

      {loadingRows ? (
        <View className="mt-6">
          <ActivityIndicator color={INK} />
        </View>
      ) : null}

      {!loadingRows && rows.length === 0 ? (
        <NeoBox shadow={6} className="mt-6 max-w-[480px] bg-paper p-6">
          <Text className="font-sans text-ink" style={{ fontSize: 16, lineHeight: 24 }}>
            Belum ada pesan masuk.
          </Text>
        </NeoBox>
      ) : null}

      <View className="mt-6 gap-6">
        {rows.map((r, n) => (
          <NeoBox key={r.id} shadow={6} className="bg-paper p-5">
            <View className="flex-row flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
              <Text
                className="flex-1 font-display uppercase text-ink"
                style={{ fontSize: 19, lineHeight: 21, letterSpacing: -0.4 }}
                numberOfLines={1}
              >
                {r.name}
              </Text>
              <Chip>
                #{String(rows.length - n).padStart(2, "0")} · {fmtDate(r.createdAt)}
              </Chip>
            </View>

            <Text className="mt-3 font-sans text-ink" style={{ fontSize: 16, lineHeight: 25 }}>
              {r.text}
            </Text>

            {r.reply ? (
              <NeoBox shadow={3} className="mt-4 bg-lime p-4">
                <Mono>BALASAN</Mono>
                <Text className="mt-2 font-sans text-ink" style={{ fontSize: 15, lineHeight: 22 }}>
                  {r.reply}
                </Text>
              </NeoBox>
            ) : null}

            <TextInput
              value={drafts[r.id] ?? (r.reply ?? "")}
              onChangeText={(v) => setDrafts((d) => ({ ...d, [r.id]: v }))}
              placeholder={r.reply ? "Ubah balasan..." : "Balas pesan ini..."}
              placeholderTextColor="#19171766"
              multiline
              maxLength={GUESTBOOK_MAX_REPLY}
              className="mt-4 border-2 border-ink bg-cream px-4 py-3 font-sans text-base text-ink"
              style={{ minHeight: 88, textAlignVertical: "top" }}
            />

            <View className="mt-2 flex-row flex-wrap items-center gap-3">
              <Mono className="text-ink/45">
                {(drafts[r.id] ?? r.reply ?? "").length}/{GUESTBOOK_MAX_REPLY}
              </Mono>
              <View className="flex-1" />
              <NeoButton
                onPress={() => saveReply(r.id)}
                tone={replyingId === r.id ? "ink" : "lime"}
                disabled={replyingId === r.id}
              >
                {replyingId === r.id ? "Menyimpan" : r.reply ? "Ubah balasan" : "Balas"}
              </NeoButton>
              <NeoButton
                onPress={() => remove(r.id)}
                tone={deletingId === r.id ? "ink" : "ground"}
                disabled={deletingId === r.id}
              >
                {deletingId === r.id ? "Menghapus" : "Hapus"}
              </NeoButton>
            </View>
          </NeoBox>
        ))}
      </View>

      <View className="mt-8 flex-row flex-wrap items-center gap-4">
        <NeoButton
          tone="paper"
          onPress={async () => {
            await signOut();
            setUser(null);
          }}
        >
          Keluar
        </NeoButton>
        <Mono className="text-ink/45">
          Maks. nama {GUESTBOOK_MAX_NAME}, pesan {GUESTBOOK_MAX_MESSAGE}, balasan {GUESTBOOK_MAX_REPLY} karakter.
        </Mono>
      </View>
    </Shell>
  );
}
