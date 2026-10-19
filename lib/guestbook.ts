import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  GUESTBOOK_COLLECTION,
  db,
  type GuestbookEntry,
} from "./firebase";

type Row = {
  name?: unknown;
  text?: unknown;
  createdAt?: unknown;
  reply?: unknown;
  repliedAt?: unknown;
};

const toEntry = (id: string, data: Row): GuestbookEntry => ({
  id,
  name: typeof data.name === "string" ? data.name : "",
  text: typeof data.text === "string" ? data.text : "",
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
  reply: typeof data.reply === "string" && data.reply ? data.reply : null,
  repliedAt: typeof data.repliedAt === "number" ? data.repliedAt : null,
});

export async function listGuestbook(max = 100): Promise<GuestbookEntry[]> {
  if (!db) return [];
  const snap = await getDocs(
    query(collection(db, GUESTBOOK_COLLECTION), orderBy("createdAt", "desc"), limit(max)),
  );
  return snap.docs.map((d) => toEntry(d.id, d.data() as Row));
}

export async function addGuestbook(name: string, text: string): Promise<GuestbookEntry> {
  if (!db) throw new Error("Firebase belum dikonfigurasi.");
  const createdAt = Date.now();
  const ref = await addDoc(collection(db, GUESTBOOK_COLLECTION), { name, text, createdAt });
  return { id: ref.id, name, text, createdAt, reply: null, repliedAt: null };
}

/**
 * Hapus satu pesan.
 *
 * Sengaja tanpa parameter auth: aturan "boleh siapa" sepenuhnya ada di
 * `firestore.rules`, bukan di kode ini. Kalau authorization ikut
 * ditulis di sini, ada jalur lain (DevTools, request buatan) yang
 * melewatinya — persis kesalahan yang membuat Security Rules penting.
 */
export async function deleteGuestbook(id: string): Promise<void> {
  if (!db) throw new Error("Firebase belum dikonfigurasi.");
  await deleteDoc(doc(db, GUESTBOOK_COLLECTION, id));
}

/**
 * Set balasan untuk satu pesan. String kosong berarti menghapus balasan.
 *
 * Sama seperti deleteGuestbook: tidak ada cek otorisasi di sini.
 * `firestore.rules` yang membatasi update hanya untuk admin, dan hanya
 * field `reply` / `repliedAt` yang boleh disentuh — `name` dan `text`
 * pesan orang lain tidak bisa diubah lewat fungsi ini.
 */
export async function replyGuestbook(id: string, reply: string): Promise<void> {
  if (!db) throw new Error("Firebase belum dikonfigurasi.");
  const text = reply.trim();
  await updateDoc(doc(db, GUESTBOOK_COLLECTION, id), text
    ? { reply: text, repliedAt: Date.now() }
    : { reply: null, repliedAt: null });
}