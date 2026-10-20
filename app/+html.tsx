import { createElement, type ReactNode } from "react";
import { ScrollViewStyleReset } from "expo-router/html";

/**
 * Shell dokumen untuk web (dev maupun hasil `expo export`).
 *
 * Expo Router membaca `app/+html.tsx` lewat `getRootComponent()` — dipanggil
 * `getStaticContent()` yang dipakai server dev dan exporter. File ini menggantikan
 * `<Html>` bawaan, jadi SEMUA yang ada di `<head>` di sini ikut terbawa ke HTML
 * yang disajikan sebelum satu baris JS pun dievaluasi.
 *
 * Kenapa ini penting: ada jendela (di dev bisa beberapa detik) ketika browser
 * sudah menampilkan HTML tapi JS belum jalan. Apapun yang disuntik lewat
 * `useEffect` atau `useFonts` belum ada di jendela itu. Judul tab dan meta
 * harus sudah ada di HTML.
 *
 * Pakai `createElement`, bukan JSX `<html>`: `tsconfig` memakai
 * `jsxImportSource: "nativewind"`, jadi elemen HTML mentah tidak punya tipe.
 */
const TITLE = "Aradhana Dev — Full Stack Developer";
const DESCRIPTION =
  "Portofolio Aradhana Miftah Hermawan, Full Stack Developer dari Indonesia. " +
  "Membangun landing page, dashboard, dan aplikasi web yang benar-benar dipakai.";

/**
 * Latar `body` disetel di sini supaya paint pertama langsung merah merek —
 * bukan putih — sebelum React sempat merender apa pun.
 */
const documentCss = `
html, body {
  background: #ff2f11;
}
`;

/**
 * Pasang judul lewat skrip kecil yang dieksekusi saat `<head>` diparse.
 *
 * Kenapa perlu: Expo Router membuat `headContext.helmet` di server dengan
 * judul kosong, lalu menyuntiknya persis SETELAH bukaan `<head>` — selalu
 * sebelum apa pun yang kita tulis. Browser memakai `<title>` pertama, jadi
 * tab tetap kosong sampai JS selesai dan `document.title` di-set ulang.
 *
 * Skrip ini jalan tepat setelah `<title>` kita terparse, jadi judulnya benar
 * sejak milidetik pertama — tidak peduli seberapa lama bundle dimuat.
 */
const titleScript = `document.title=${JSON.stringify(TITLE)};`;

export default function Root({ children }: { children: ReactNode }) {
  return createElement(
    "html",
    { lang: "id" },
    createElement(
      "head",
      null,
      createElement("meta", { charSet: "utf-8" }),
      createElement("meta", { httpEquiv: "X-UA-Compatible", content: "IE=edge" }),
      createElement("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1, shrink-to-fit=no",
      }),
      createElement("title", null, TITLE),
      createElement("script", { dangerouslySetInnerHTML: { __html: titleScript } }),
      createElement("meta", { name: "description", content: DESCRIPTION }),
      createElement("meta", { name: "theme-color", content: "#ff2f11" }),
      createElement(ScrollViewStyleReset),
      createElement("style", {
        id: "document-css",
        dangerouslySetInnerHTML: { __html: documentCss },
      }),
    ),
    createElement("body", null, children),
  );
}
