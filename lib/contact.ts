import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import {
  CONTACT_COLLECTION,
  db,
  type ContactEntry,
} from "./firebase";

type Row = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  text?: unknown;
  createdAt?: unknown;
};

const toEntry = (id: string, data: Row): ContactEntry => ({
  id,
  name: typeof data.name === "string" ? data.name : "",
  email: typeof data.email === "string" ? data.email : "",
  subject: typeof data.subject === "string" ? data.subject : "",
  text: typeof data.text === "string" ? data.text : "",
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
});

/**
 * Ambil pesan kontak.
 *
 * Baris ini hanya bisa dipanggil oleh admin: `firestore.rules` menolak
 * `read` untuk selain akun admin, jadi kalau token login tidak cocok,
 * Firestore melempar PERMISSION_DENIED sebelum ada data yang keluar.
 */
export async function listContacts(max = 100): Promise<ContactEntry[]> {
  if (!db) return [];
  const snap = await getDocs(
    query(collection(db, CONTACT_COLLECTION), orderBy("createdAt", "desc"), limit(max)),
  );
  return snap.docs.map((d) => toEntry(d.id, d.data() as Row));
}

export async function addContact(
  name: string,
  email: string,
  subject: string,
  text: string,
): Promise<ContactEntry> {
  if (!db) throw new Error("Firebase belum dikonfigurasi.");
  const createdAt = Date.now();
  const ref = await addDoc(collection(db, CONTACT_COLLECTION), {
    name,
    email,
    subject,
    text,
    createdAt,
  });
  return { id: ref.id, name, email, subject, text, createdAt };
}

/**
 * Hapus satu pesan kontak.
 *
 * Sama seperti deleteGuestbook: tanpa parameter auth. Batasannya ada di
 * `firestore.rules` — `delete` hanya untuk `isAdmin()`.
 */
export async function deleteContact(id: string): Promise<void> {
  if (!db) throw new Error("Firebase belum dikonfigurasi.");
  await deleteDoc(doc(db, CONTACT_COLLECTION, id));
}
