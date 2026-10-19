import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  CONTACT_MAX_MESSAGE,
  CONTACT_MAX_NAME,
  CONTACT_MAX_SUBJECT,
  isFirebaseConfigured,
  type ContactEntry,
} from "@/lib/firebase";
import { deleteContact, listContacts } from "@/lib/contact";
import { getCurrentUser, signInWithPasscode, signOut } from "@/lib/firebaseAuth";
import { friendlyAuthError, friendlyRulesError } from "@/lib/errors";
import { Mono } from "@/components/ui";
import { Press } from "@/components/motion/Press";
import { ContactCard } from "@/components/admin/ContactCard";
import {
  INK,
  Alert,
  Chip,
  Head,
  LoginShell,
  NeoBox,
  NeoButton,
  Shell,
} from "@/components/admin/ui";

const CRUMB = "Kontak / admin";
const TITLE = "Pesan\nmasuk";
const TITLE_LOGIN = "Pesan masuk";
const LEAD = "Baca pesan dari form Kontak, balas lewat email, atau hapus. Tidak ada yang bisa melihat halaman ini selain admin.";

/**
 * Susun URI mailto untuk membalas.
 *
 * Tombol balas tidak mengirim email sendiri — tidak ada backend mail di
 * proyek ini dan kredensial SMTP tidak boleh ada di bundle klien. Yang
 * dilakukan tombol ini hanyalah membuka aplikasi email dengan alamat,
 * subjek, dan kutipan pesan sudah terisi, lalu pengirim menekan kirim.
 */
function mailtoHref(r: ContactEntry) {
  const quoted = r.text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const body = encodeURIComponent(
    `Halo ${r.name || "rekan"},\n\nTerima kasih sudah menghubungi.\n\n---\n${quoted}\n---\n`,
  );
  const subject = encodeURIComponent(
    r.subject ? `Re: ${r.subject}` : "Balasan dari portofolio",
  );
  return `mailto:${r.email}?subject=${subject}&body=${body}`;
}

export default function AdminContact() {
  const [user, setUser] = useState<{ email: string | null } | null>(null);
  const [booting, setBooting] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [reveal, setReveal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [rows, setRows] = useState<ContactEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingRows, setLoadingRows] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      const data = await listContacts(200);
      if (!mounted.current) return;
      setRows(data);
    } catch (e) {
      if (!mounted.current) return;
      setLoadError(friendlyRulesError(e));
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
      await deleteContact(id);
      if (!mounted.current) return;
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      if (!mounted.current) return;
      setLoadError(friendlyRulesError(e));
    } finally {
      if (mounted.current) setDeletingId(null);
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
            Belum ada pesan masuk dari form Kontak.
          </Text>
        </NeoBox>
      ) : null}

      <View className="mt-6 gap-6">
        {rows.map((r, n) => (
          <ContactCard
            key={r.id}
            row={r}
            index={n}
            total={rows.length}
            deleting={deletingId === r.id}
            onReply={() => void Linking.openURL(mailtoHref(r))}
            onDelete={() => void remove(r.id)}
          />
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
          Maks. nama {CONTACT_MAX_NAME}, subjek {CONTACT_MAX_SUBJECT}, pesan {CONTACT_MAX_MESSAGE} karakter.
        </Mono>
      </View>
    </Shell>
  );
}
