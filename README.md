# Portofolio Aradhana

Portfolio pribadi berbasis **Expo (SDK 54) + Expo Router + React Native + NativeWind v4**.
Berjalan di Android, iOS, dan web dari satu basis kode.

## Menjalankan

    npm install
    npm run web        # browser  (http://localhost:8081)
    npm run android
    npm run ios
    npm start          # pilih platform interaktif
    npm run typecheck  # tsc --noEmit

Build web statis untuk deploy:

    npx expo export --platform web     # hasil di dist/
    npm run build                      # alias yang sama

## Deploy ke Vercel

Sudah dikonfigurasi lewat `vercel.json` (static export, bukan SPA).

1. Push repo ke GitHub.
2. Di [vercel.com/new](https://vercel.com/new) — Import repo. Framework
   terdeteksi "Other"; Build/Output sudah dibaca dari `vercel.json`.
3. Tambah Environment Variables di **Project → Settings → Environment
   Variables** (nilai yang sama dengan `.env`):

       EXPO_PUBLIC_FIREBASE_API_KEY
       EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
       EXPO_PUBLIC_FIREBASE_PROJECT_ID
       EXPO_PUBLIC_FIREBASE_APP_ID
       EXPO_PUBLIC_ADMIN_PASSCODE     # opsional

   Variabel `EXPO_PUBLIC_*` di-inline saat build — set sebelum deploy,
   rebuild kalau nilainya berubah.
4. Deploy. Setiap push ke branch utama otomatis rebuild.

Deploy manual via CLI juga bisa:

    npm i -g vercel
    vercel          # preview
    vercel --prod   # production

## Design system

Diadaptasi dari arah visual aya.nl (ground merah, panel mengambang, pill,
radius besar) — bukan salinan konten.

| Token | Nilai | Token | Nilai |
|---|---|---|---|
| `ground` | `#ff2f11` | `rounded-pill` | `400px` |
| `ink` | `#191717` | `rounded-panel` | `96px` |
| `paper` | `#fffdfd` | `rounded-card` | `56px` |
| `cream` | `#f1ead8` | `rounded-banner` | `48px` |
| `lime` | `#e4fc51` | display | Archivo Black |
| `lavender` | `#c3b5f9` | body | Space Grotesk |
| `purple` | `#3600a9` | label | Space Mono |
| `brown` | `#7e401a` | | |
| `pink` | `#fd86ed` | | |

Type scale desktop/mobile (line-height `0.9`, uppercase, `Archivo Black`):
h1 `104/46`, h2 `82/38`, h3 `60/30`, h4 `46/26`, h5 `30/22`, h6 `24/18`.

## Struktur

    app/_layout.tsx          font, global.css, MotionProvider, Stack
    app/index.tsx            halaman utama: ScrollView + navigasi section
    app/project/[slug].tsx   halaman case study (route internal)
    components/
      ScrollExpand.tsx        dispatcher intro: DOM (web) / RN (native)
      ScrollExpandDom.tsx     implementasi DOM asli React Bits (web)
      ScrollExpandNative.tsx  port React Native (Android/iOS)
      Header.tsx             pill nav mengambang + overlay fullscreen
      Hero.tsx               headline raksasa, blob organik, marquee
      Words.tsx              statement band lime (paling atas) + ticker
      About.tsx              layout editorial + panel foto bertumpuk
      TechStack.tsx          daftar editorial + level dots + ticker
      Works.tsx              3 komposisi proyek asimetris + hover
      Services.tsx           accordion + blob
      Journey.tsx            timeline editorial + rail scroll-driven
      Guestbook.tsx          form (validasi tetap bekerja)
      Contact.tsx            form mailto + socials
      Footer.tsx             3 banner asimetris
      ui.tsx                 Display, Eyebrow, Lead, Mono, Tag, PillButton, Panel
      SectionScroll.tsx      scrollTo antar section via ScrollView
      decor/Shape.tsx        blob, plus & arrow sketchy, asterisk, squiggle
      motion/
        Motion.tsx           scrollY, reduced motion, breakpoint useWide
        Entrance.tsx         entrance, spin, drift, pulse
        Reveal.tsx           scroll-triggered reveal
        Press.tsx            hover/press scale
        Marquee.tsx          ticker seamless

## Catatan teknis

- **Penting:** react-native-web membuang `className` pada `Animated.View`.
  Karena itu setiap elemen beranimasi memakai pola
  `View` biasa (pemegang `className`) → `Animated.View` (hanya `style`).
  Jangan menaruh `className` langsung pada `Animated.View`.
- **Penting:** `useWide()` sengaja memakai lebar viewport yang dibaca lewat
  `useEffect`, **bukan** `useWindowDimensions` langsung. Saat static export,
  render server memakai komposisi mobile (`window` = 0) sementara render
  pertama client sudah tahu viewport asli. Kalau berbeda, React melempar
  error #418 (hydration mismatch), membuang seluruh HTML server lalu render
  ulang — akibatnya semua animasi ter-reset dan konten sempat tak terlihat.
  Solusinya: render pertama client juga `vw = 0`, baru berubah setelah effect.
- Semua animasi memakai `Animated` bawaan React Native dengan
  `useNativeDriver`, jadi tetap 60fps di native maupun web.
  Scroll-driven reveal memakai `Animated.event` + `measureInWindow`.
- `useEntrance` punya jaring pengaman: kalau animasi tidak jalan dalam 1.8
  detik, nilai dipaksa ke `1` supaya konten tidak pernah terkubur tak terlihat.
- **Animasi berulang tidak memakai `Animated.loop`.** Di react-native-web,
  `loop` hanya memutar satu iterasi lalu berhenti di nilai akhir: ticker diam
  dan teksnya tergeser keluar area clip. Pola `useRepeat`/`Marquee`
  memakai `onEnd` untuk memulai siklus berikutnya secara eksplisit.
- Ticker bergerak ke kiri berjalan `0 → -width`. Ticker bergerak ke kanan
  (`reverse`) berjalan `-width → 0` — **bukan** `0 → +width`, karena di
  titik akhir seluruh baris berada di luar area clip sehingga pita terlihat
  kosong.
- Header memakai `position: fixed` dan otomatis tersembunyi saat scroll ke
  bawah, muncul lagi saat scroll ke atas (web saja — di native header sudah
  `absolute` jadi ikut ter-scroll). Listener memakai event `scroll` di fase
  capture pada `document`, karena `addListener` pada `Animated.Value` yang
  digerakkan native driver tidak memberi notifikasi di web.
- Loop tak berujung dijeda saat tab tidak aktif, dan dekorasi spin/drift
  hanya dijalankan di layout desktop.
- `react-native-reanimated` tidak lagi dipakai (sudah dihapus dari import).
- `md:`/variant responsif web-only tidak dipakai; komposisi desktop/mobile
  dipilih lewat `useWide()` sehingga tetap jalan di native.
- `aspect-[..]`, `w-max`, `animate-*` digantikan `aspectRatio`,
  `Animated.loop`, dan flex row.
- Form Guestbook & Contact, integrasi `Linking`/mailto, dan seluruh konten
  di `data/content.ts` tetap utuh.
- **Routing:** `PillButton` membaca `href` yang diawali `/` sebagai route
  internal (`router.push`), selain itu membuka tautan eksternal. Jadi
  "Kunjungi Situs" → situs asli, "Baca Case Study" → `/project/<slug>`.
  Tautan `caseStudy` di `data/content.ts` tetap dipakai sebagai tombol
  sekunder "Dokumentasi Asli" di dalam halaman case study.

## Intro ScrollExpand

Komponen `ScrollExpand` dari React Bits, dipakai sebagai intro paling atas
halaman sebelum `Hero`.

Ada **dua implementasi**, dipilih lewat `Platform.OS`:

| File | Dipakai di | Isi |
|---|---|---|
| `ScrollExpandDom.tsx` | web | Komponen DOM asli React Bits, nyaris verbatim |
| `ScrollExpandNative.tsx` | Android/iOS | Port ke primitive React Native |
| `ScrollExpand.tsx` | keduanya | Dispatcher |

### Kenapa harus dua

Efek ScrollExpand aslinya hampir seluruhnya dikerjakan browser:

- `position: sticky` mengunci frame → compositor, **tanpa JS sama sekali**
- `clip-path: inset(...)` membuka frame → **tanpa reflow**
- `transform: scale()` untuk media → GPU

React Native tidak punya `clipPath`. Satu-satunya cara meniru kesan itu di RN
adalah menganimasikan `width`, `height`, `left`, `top`, dan `borderRadius` —
dan semuanya itu **layout properties**, jadi tiap frame memicu reflow.
Akibatnya port RN secara struktural tidak akan pernah sehalus versi DOM.

Karena `aradhana.my.id` memakai web export, versi DOM yang dipakai di sana, dan
port RN tetap dipakai di native. Pengukuran saat scroll lewat splash (Chrome
headless `--disable-gpu`, software rendering, 4 run): median **16.8–17.0
ms/frame** (~60fps), p95 21.8–22.5ms, 9–15% frame di atas 20ms. Di perangkat
nyata dengan GPU angka ini seharusnya lebih baik, tapi angka headless ini
sudah cuma sedikit di bawah 60fps — tidak ada frame drop besar.

### Yang perlu disesuaikan dari aslinya

- **Sumber scroll.** Halaman ini scroll di dalam satu `Animated.ScrollView`,
  bukan `window`, jadi `useWindowScroll` selalu membaca `0`. Versi DOM mencari
  scroll parent terdekat lalu mengubah `scrollTop`-nya jadi progress;
  `position: sticky` tetap dipakai apa adanya dan sudah terbukti jalan di
  dalam ScrollView react-native-web.
- **CSS.** Tidak ada pipeline CSS per komponen (`global.css` isinya cuma
  directive Tailwind untuk NativeWind), jadi CSS React Bits disuntik sebagai
  satu `<style>` ke `document.head` dari `useEffect`.
- **`prefers-reduced-motion`** memakai `reduceMotion` dari `MotionProvider`.
- **Default responsif.** `42%/58%` milik React Bits mengasumsikan stage
  desktop; di layar 390px frame diam cuma ~164px. Mobile memakai
  `74%/52%`. Berlaku untuk kedua implementasi.
- **`mediaType`/`poster`** tidak ikut: butuh `expo-video` yang belum terpasang.
  `src` tetap didukung; tanpa `src` memakai gradien brand + Asterisk lime
  sebagai placeholder (repo ini belum punya aset gambar).

### Dua jebakan yang sudah pernah menggigit

1. **Pin tidak boleh di-lerp — hanya ekspansinya.** Di versi RN, kalau `pinY`
   ikut memakai nilai hasil smoothing, saat scroll turun nilai `cur` selalu
   tertinggal dari `raw`, sehingga `viewport-y = -raw + cur` menjadi negatif:
   frame terlihat **naik ke atas** keluar layar lalu menyusul. Di React Bits
   asli ini mustahil terjadi karena `position: sticky` ditangani browser,
   terpisah dari lerp yang cuma menggerakkan `clip-path`. Karena itu versi RN
   memakai dua nilai: `expansion` (di-lerp) dan `pinY` (scroll mentah).
2. **`useStageSize()`** (versi RN) memakai pola `useWide()`: di web render
   pertama mengembalikan `0`, baru viewport asli setelah `useEffect`. Kalau
   tidak, geometry yang di-interpolate akan berbeda antara server dan client
   dan memicu React error #418.
3. **`removeEventListener` harus ikut `capture`.** Asli React Bits memasang
   listener `scroll` dengan `{ capture: true }` tapi melepasnya tanpa
   `capture` — jadi tidak pernah benar-benar dilepas. Versi DOM di sini
   sudah diperbaiki.

#   a r a d h a n a - p o r t o f o l i o  
 