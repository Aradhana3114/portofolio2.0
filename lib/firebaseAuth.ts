import type { Auth } from "firebase/auth";
import { ADMIN_EMAIL, ADMIN_PASSCODE, firebaseApp } from "./firebase";
import { passcodeCandidates } from "./passcode";

/**
 * Firebase Auth — khusus web.
 *
 * Di-import secara dinamis (dan di dalam try/catch) karena entry point
 * `firebase/auth` versi web menyentuh `window`/`document`. Modul ini ikut
 * ter-bundle ke app native, jadi kalau di-import di level atas, aplikasi
 * Android/iOS akan crash saat startUp.
 *
 * Login hanya dipakai di halaman admin, yang memang hanya dipakai di web.
 */

type AuthUser = { uid: string; email: string | null };

let authPromise: Promise<Auth | null> | null = null;

function loadAuth() {
  if (!authPromise) {
    authPromise = import("firebase/auth").then((m) => {
      if (!firebaseApp) return null;
      return m.getAuth(firebaseApp);
    }).catch(() => null);
  }
  return authPromise;
}

/**
 * Login dengan kode admin.
 *
 * Email-nya sudah diketahui (data publik, dan memang harus tercantum di
 * rules). Yang di-type orang hanya passcode-nya, dan itu TIDAK PERNAH
 * disimpan di bundel — hanya dikirim ke Firebase Auth lewat HTTPS. Kalau
 * passcode ditaruh di kode, siapa pun yang membuka DevTools bisa
 * membacanya lalu masuk sebagai admin dan menghapus semua pesan.
 *
 * Pengecualian: kalau `EXPO_PUBLIC_ADMIN_PASSCODE` diisi di `.env`, kode
 * itu justru tersimpan di bundel dan bisa dibaca publik. Karena itu kode
 * dari .env hanya dipakai sebagai KONFIRMASI tambahan, sedangkan
 * otorisasi sesungguhnya tetap di `firestore.rules`.
 */
export async function signInWithPasscode(passcode: string): Promise<AuthUser | null> {
  const mod = await import("firebase/auth");
  const auth = await loadAuth();
  if (!auth || !firebaseApp) return null;

  const typed = passcode.trim();

  // Firebase Auth mencocokkan password secara persis: satu spasi atau satu
  // titik di akhir sudah cukup untuk ditolak. Jadi beberapa bentuk penulisan
  // dicoba satu per satu, dan terakhir kode kanonik dari .env.
  const tries = passcodeCandidates(typed, ADMIN_PASSCODE);

  for (const candidate of tries) {
    try {
      const cred = await mod.signInWithEmailAndPassword(auth, ADMIN_EMAIL, candidate);
      return { uid: cred.user.uid, email: cred.user.email };
    } catch (e) {
      // Hanya "kode salah" yang dicoba lanjut ke kandidat berikutnya.
      // Error lain (jaringan, akun nonaktif) harus langsung dilempar.
      const code = (e as { code?: string })?.code ?? "";
      const msg = e instanceof Error ? e.message : String(e);
      const wrongCredential =
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found" ||
        msg.includes("INVALID_LOGIN_CREDENTIALS");
      if (!wrongCredential) throw e;
    }
  }

  throw new Error("auth/invalid-credential");
}

export async function signOut(): Promise<void> {
  const mod = await import("firebase/auth");
  const auth = await loadAuth();
  if (!auth) return;
  await mod.signOut(auth);
}

/**
 * Sesi yang sedang aktif, kalau ada.
 *
 * `getCurrentUser` hanya mengembalikan user bila sudah sign in di perangkat
 * ini — sesi disimpan oleh Firebase di localStorage. Kalau localStorage
 * belum terisi (mis. baru buka tab admin), hasilnya null dan halaman
 * menampilkan form login.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const auth = await loadAuth();
  const u = auth?.currentUser;
  return u ? { uid: u.uid, email: u.email } : null;
}