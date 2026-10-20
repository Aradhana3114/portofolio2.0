import { Linking, Platform } from "react-native";

/**
 * Buka compose email ke `to`.
 *
 * Di web: langsung ke Gmail compose di tab yang sama — bukan `mailto:`
 * yang memicu dialog "Select an app to open this 'mailto' link" milik
 * Windows, dan bukan `window.open` yang bisa diblokir tanpa pesan
 * (popup blocker, in-app browser). Navigasi biasa tidak pernah diblokir.
 *
 * Native (Android/iOS): tetap memakai mail client bawaan lewat `mailto:` —
 * di sana tidak ada dialog pemilihan aplikasi seperti di Windows dan
 * compose-nya lebih nyaman daripada membuka webmail di browser.
 */
export function composeEmail(
  to: string,
  opts?: { subject?: string; body?: string },
): void {
  if (Platform.OS === "web") {
    const query = new URLSearchParams();
    query.set("view", "cm");
    query.set("fs", "1");
    query.set("to", to);
    if (opts?.subject) query.set("su", opts.subject);
    if (opts?.body) query.set("body", opts.body);
    window.location.href = `https://mail.google.com/mail/?${query.toString()}`;
    return;
  }

  const params: string[] = [];
  if (opts?.subject) params.push(`subject=${encodeURIComponent(opts.subject)}`);
  if (opts?.body) params.push(`body=${encodeURIComponent(opts.body)}`);
  void Linking.openURL(
    `mailto:${to}${params.length ? `?${params.join("&")}` : ""}`,
  );
}
