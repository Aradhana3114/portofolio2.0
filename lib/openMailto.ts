import { Linking, Platform } from "react-native";

/**
 * Buka tautan `mailto:`.
 *
 * Di web sengaja memakai navigasi biasa (`window.location.href`), BUKAN
 * `Linking.openURL` yang berakhir di `window.open(..., "_blank", "noopener")`.
 * `window.open` sering diblokir tanpa pesan apa pun (popup blocker, in-app
 * browser Instagram/WA, mode strict) sehingga klik terlihat "mati". Navigasi
 * mailto tidak mengganti halaman: browser menyerahkannya ke aplikasi mail
 * dan kalau tidak ada aplikasi mail bawaan, Chrome menampilkan dialog pilih
 * aplikasi — pengguna tetap mendapat umpan balik.
 */
export function openMailto(
  to: string,
  opts?: { subject?: string; body?: string },
): void {
  const query: string[] = [];
  if (opts?.subject) query.push(`subject=${encodeURIComponent(opts.subject)}`);
  if (opts?.body) query.push(`body=${encodeURIComponent(opts.body)}`);
  const url = `mailto:${to}${query.length ? `?${query.join("&")}` : ""}`;

  if (Platform.OS === "web") {
    window.location.href = url;
    return;
  }
  void Linking.openURL(url);
}
