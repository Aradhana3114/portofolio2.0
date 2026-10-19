/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // core
        ground: "#ff2f11", // hot red — the page ground
        ink: "#191717", // warm near-black
        paper: "#fffdfd", // warm off-white
        cream: "#f1ead8", // secondary surface
        // controlled accents
        lime: "#e4fc51",
        lavender: "#c3b5f9",
        purple: "#3600a9",
        brown: "#7e401a",
        pink: "#fd86ed",
      },
      fontFamily: {
        // Tiap stack wajib diakhiri generic family. `expo-font` baru
        // mendaftarkan @font-face setelah JS jalan, jadi ada jendela (dan
        // kegagalan jaringan) ketika keluarga kustom ini belum ada di
        // browser. Tanpa fallback, browser jatuh ke default-nya sendiri —
        // Times New Roman — dan seluruh halaman terlihat mentah.
        display: [
          "ArchivoBlack_400Regular",
          "Archivo Black",
          "Arial Black",
          "Impact",
          "sans-serif",
        ],
        sans: [
          "SpaceGrotesk_400Regular",
          "SpaceGrotesk_500Medium",
          "SpaceGrotesk_700Bold",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "SpaceMono_400Regular",
          "SpaceMono_700Bold",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      borderRadius: {
        // Hanya dua token, supaya seluruh situs memakai ritme yang sama.
        // `pill` untuk yang memang berbentuk pil: tombol, tag, chip.
        // `card` untuk semua permukaan: panel, kartu, media, input form.
        pill: "400px",
        card: "14px",
      },
      spacing: {
        gutter: "24px",
        section: "160px",
      },
    },
  },
  plugins: [],
};