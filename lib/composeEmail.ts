import { Linking, Platform } from "react-native";

/**
 * URL Gmail compose untuk `to`.
 *
 * Dipakai dua cara: sebagai `href` anchor (tab baru, web) dan oleh
 * {@link composeEmail} untuk pembukaan programatik.
 */
export function composeEmailUrl(
  to: string,
  opts?: { subject?: string; body?: string },
): string {
  const query = new URLSearchParams();
  query.set("view", "cm");
  query.set("fs", "1");
  query.set("to", to);
  if (opts?.subject) query.set("su", opts.subject);
  if (opts?.body) query.set("body", opts.body);
  return `https://mail.google.com/mail/?${query.toString()}`;
}

/**
 * Buka compose email ke `to` secara programatik.
 *
 * Untuk tombol di UI pakai anchor lewat `href={composeEmailUrl(...)}` +
 * `hrefAttrs={{ target: "_blank" }}` — navigasi anchor asli tidak pernah
 * kena popup blocker. Fungsi ini untuk jalur yang tidak punya elemen sendiri
 * (mis. fallback mailto form kontak).
 *
 * Native (Android/iOS): mail client bawaan lewat `mailto:`.
 */
export function composeEmail(
  to: string,
  opts?: { subject?: string; body?: string },
): void {
  if (Platform.OS === "web") {
    window.open(composeEmailUrl(to, opts), "_blank", "noopener");
    return;
  }

  const params: string[] = [];
  if (opts?.subject) params.push(`subject=${encodeURIComponent(opts.subject)}`);
  if (opts?.body) params.push(`body=${encodeURIComponent(opts.body)}`);
  void Linking.openURL(
    `mailto:${to}${params.length ? `?${params.join("&")}` : ""}`,
  );
}
