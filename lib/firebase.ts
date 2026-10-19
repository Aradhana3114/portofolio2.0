import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase —App dan Firestore saja.
 *
 * Login (firebase/auth) TIDAK di-import di sini dengan sengaja: entry point
 * web-nya menyentuh `window`/`document`, dan modul ini ikut ter-import oleh
 * komponen Guestbook yang juga jalan di Android/iOS. Auth dipanggil secara
 * dinamis di `lib/firebaseAuth.ts`, jadi native tidak pernah menyentuhnya.
 *
 * Catatan penting soal "API key": nilai `apiKey` di bawah ini BUKAN rahasia.
 * Firebase merancangkannya untuk terlihat publik — sama seperti `anon` key
 * di Supabase. Yang melindungi data adalah Security Rules di server. Kalau
 * rules-nya longgar, siapa pun bisa menghapus semua pesan dari DevTools.
 */

const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;

export const isFirebaseConfigured = Boolean(apiKey && projectId && appId);

const config = {
  apiKey,
  authDomain,
  projectId,
  appId,
};

export const firebaseApp = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(config as Record<string, string>)
  : null;

export const db = firebaseApp ? getFirestore(firebaseApp) : null;

export type GuestbookEntry = {
  id: string;
  name: string;
  text: string;
  createdAt: number;
  /** Opsional: dokumen lama dibuat sebelum field ini ada. */
  reply?: string | null;
  repliedAt?: number | null;
};

export const GUESTBOOK_MAX_NAME = 40;
export const GUESTBOOK_MAX_MESSAGE = 280;
export const GUESTBOOK_MAX_REPLY = 600;
export const GUESTBOOK_COLLECTION = "guestbook";

/**
 * Pesan dari form Kontak.
 *
 * Beda dengan `GuestbookEntry`: ada `email` dan `subject`, tidak ada
 * `reply`. Field isi pesan memakai nama `text` (bukan `message`)
 * supaya sejajar dengan guestbook — satu bentuk dokumen, satu pola rules.
 *
 * Email ini pribadi, jadi dokumen tidak pernah dibaca publik: hanya
 * `create` yang boleh anonim. Lihat blok `/contact` di `firestore.rules`.
 */
export type ContactEntry = {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  createdAt: number;
};

export const CONTACT_MAX_NAME = 60;
export const CONTACT_MAX_EMAIL = 120;
export const CONTACT_MAX_SUBJECT = 80;
export const CONTACT_MAX_MESSAGE = 1200;
export const CONTACT_COLLECTION = "contact";

/**
 * Email akun admin.
 *
 * BUKAN rahasia — email memang data publik, dan harusnya tetap terlihat di
 * rules. Yang rahasia adalah passwordnya, dan itu tidak pernah disimpan di
 * sini: pengguna mengetiknya sendiri di halaman admin, lalu dikirim ke
 * Firebase Auth lewat HTTPS. Kalau passwordnya ditaruh di bundel, siapa pun
 * yang membuka DevTools bisa membacanya dan masuk sebagai admin.
 */
export const ADMIN_EMAIL = "admin@gmail.com";

/**
 * Kode admin opsional, dibaca dari `.env` (`EXPO_PUBLIC_ADMIN_PASSCODE`).
 *
 * PENTING: variabel `EXPO_PUBLIC_*` di-inline ke dalam bundel JS saat
 * build. Siapa pun yang membuka DevTools bisa membacanya. Jadi kode admin
 * yang disimpan di sini TIDAK rahasia — kalau rules hanya memeriksa
 * `request.auth != null`, siapa pun bisa masuk sebagai admin.
 *
 * Karena itu aturan di `firestore.rules` memeriksa email, bukan sekadar
 * "sudah login". Akun yang emailnya cocok tetap perlu tahu passwordnya.
 *
 * Kalau variabel ini dikosongkan, aplikasi memakai kode yang diketik
 * pengguna dan diverifikasi langsung oleh Firebase Auth — mode itu yang
 * benar-benar aman.
 */
export const ADMIN_PASSCODE = process.env.EXPO_PUBLIC_ADMIN_PASSCODE ?? "";