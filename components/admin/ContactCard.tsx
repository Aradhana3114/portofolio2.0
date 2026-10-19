import { Text, View } from "react-native";
import type { ContactEntry } from "@/lib/firebase";
import { Mono } from "@/components/ui";
import { ArrowUpRight } from "@/components/decor/Shape";
import { Chip, NeoBox, NeoButton, fmtDate } from "./ui";

/**
 * Satu baris pesan dari form Kontak.
 *
 * Kartunya sengaja berbeda dari guestbook: tidak ada balasan, tetapi ada
 * subjek dan alamat email pengirim — dua hal yang tidak ada di guestbook
 * dan justru yang membuat halaman ini berguna.
 */
export function ContactCard({
  row,
  index,
  total,
  deleting = false,
  onReply,
  onDelete,
}: {
  row: ContactEntry;
  index: number;
  total: number;
  deleting?: boolean;
  onReply?: () => void;
  onDelete?: () => void;
}) {
  return (
    <NeoBox shadow={6} className="bg-paper p-5">
      <View className="flex-row flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
        <Text
          className="flex-1 font-display uppercase text-ink"
          style={{ fontSize: 19, lineHeight: 21, letterSpacing: -0.4 }}
          numberOfLines={1}
        >
          {row.name || "Tanpa nama"}
        </Text>
        <Chip>
          #{String(total - index).padStart(2, "0")} · {fmtDate(row.createdAt)}
        </Chip>
      </View>

      <View className="mt-3 flex-row flex-wrap items-center gap-2">
        <Chip tone="lime">{row.subject || "Tanpa subjek"}</Chip>
        <Chip tone="cream">{row.email}</Chip>
      </View>

      <Text className="mt-3 font-sans text-ink" style={{ fontSize: 16, lineHeight: 25 }}>
        {row.text}
      </Text>

      <View className="mt-4 flex-row flex-wrap items-center gap-3">
        <NeoButton onPress={onReply} tone="lime" icon={<ArrowUpRight size={14} />}>
          Balas
        </NeoButton>
        <NeoButton onPress={onDelete} tone={deleting ? "ink" : "ground"} disabled={deleting}>
          {deleting ? "Menghapus" : "Hapus"}
        </NeoButton>
        <Mono className="text-ink/45">Balas membuka aplikasi email</Mono>
      </View>
    </NeoBox>
  );
}
