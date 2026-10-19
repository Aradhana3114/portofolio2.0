/**
 * Kandidat penulisan kode admin yang dicoba satu per satu.
 *
 * Firebase Auth mencocokkan password secara persis: satu spasi berlebih,
 * satu titik di akhir, atau beda kapitalisasi sudah cukup untuk ditolak.
 * Dengan mencoba beberapa bentuk penulisan, orang tidak harus teliti soal
 * spasi, kapital, atau tanda baca di akhir.
 *
 * Fungsi murni tanpa dependensi supaya bisa diuji terpisah.
 */
export function passcodeCandidates(typed: string, canonical = ""): string[] {
  const out: string[] = [];
  const push = (v: string) => {
    if (v && !out.includes(v)) out.push(v);
  };

  const t = typed.trim();
  push(t);
  push(t.replace(/[.\s]+$/, ""));
  push(t.replace(/\s+/g, " "));
  push(`${t}.`);
  push(canonical.trim());

  return out;
}
