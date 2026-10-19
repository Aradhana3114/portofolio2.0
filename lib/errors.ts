/**
 * Penerjemah pesan error Firebase.
 *
 * Pesan bawaan Firebase dan Security Rules ditulis untuk developer dan
 * berbahasa Inggris. Yang muncul di layar admin harus menjelaskan apa yang
 * salah dan apa yang bisa dilakukan, bukan menyalin string mentah.
 */

/** Error dari Firebase Auth saat login dengan passcode. */
export function friendlyAuthError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (
    raw.includes("auth/invalid-credential") ||
    raw.includes("wrong-password") ||
    raw.includes("user-not-found")
  ) {
    return "Kode admin salah.";
  }
  if (raw.includes("auth/too-many-requests")) {
    return "Terlalu banyak percobaan. Coba lagi nanti.";
  }
  if (raw.includes("auth/network-request-failed")) {
    return "Gagal menghubungi server.";
  }
  return raw;
}

/**
 * Error dari Security Rules.
 *
 * Pesan aslinya "Missing or insufficient permissions" — tidak menjelaskan
 * apa yang sebenarnya salah, padahal ada beberapa penyebab berbeda dengan
 * solusi berbeda.
 */
export function friendlyRulesError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (raw.includes("Missing or insufficient permissions") || raw.includes("PERMISSION_DENIED")) {
    return "Ditolak Security Rules. Pastikan rules sudah di-deploy dan email admin di firestore.rules cocok dengan yang dipakai login.";
  }
  if (raw.includes("auth/network-request-failed")) {
    return "Gagal menghubungi server.";
  }
  if (raw.includes("failed-precondition")) {
    return "Indeks Firestore belum siap. Coba lagi sebentar lagi.";
  }
  return raw;
}
