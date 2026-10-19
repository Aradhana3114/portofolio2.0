export const profile = {
  name: "Aradhana",
  first: "ARADHANA",
  last: "MIFTAH HERMAWAN",
  logo: "Aradhana Dev",
  email: "dhanaz7711@gmail.com",
  status: "Tersedia untuk proyek freelance",
  location: "Berbasis di Indonesia",
  roles: ["Siswa PPLG", "Web Developer", "Freelancer"],
  school: "SMK AK Nusa Bangsa",
  major: "Pengembangan Perangkat Lunak dan Gim",
  grade: "Siswa Aktif - Grade 12",
  courses: ["Web Programming", "Database Systems", "Software Engineering", "OOP"],
  bio: "Saya siswa PPLG yang fokus membangun aplikasi web yang benar-benar dipakai, bukan sekadar tugas. Saat ini sedang memperdalam Next.js dan mengeksplorasi arsitektur serverless.",
  focus: "Memperdalam Next.js App Router dan pola full-stack dengan Supabase.",
};

export const nav = [
  { label: "Beranda", href: "home" },
  { label: "Tentang", href: "about" },
  { label: "Proyek", href: "work" },
  { label: "Perjalanan", href: "journey" },
  { label: "Buku Tamu", href: "guestbook" },
  { label: "Kontak", href: "contact" },
];

export const marquee = ["FULL STACK DEVELOPER", "UI/UX", "WEB DEVELOPMENT"];

/** Copy untuk intro ScrollExpand di paling atas halaman. */
export const splash = {
  title: "PORTOFOLIO",
  hint: "SCROLL",
  body: "Setiap pixel, di setiap layar.",
  /** Gradien placeholder; dipakai sampai ada `src` gambar asli. */
  gradient: ["#c3b5f9", "#3600a9", "#ff2f11"] as const,
};

export const techStack = [
  { group: "Frontend", items: [["Next.js", "Menengah"], ["React", "Menengah"], ["TypeScript", "Menengah"], ["Tailwind CSS", "Mahir"]] },
  { group: "Backend", items: [["Node.js", "Menengah"], ["Supabase", "Mahir"], ["REST API", "Mahir"]] },
  { group: "Database", items: [["PostgreSQL", "Menengah"], ["MySQL", "Mahir"]] },
  { group: "Tools & Design", items: [["Git & GitHub", "Mahir"], ["Figma", "Menengah"], ["Vercel", "Mahir"]] },
];

export const works = [
  {
    no: "01", slug: "russ-rental", title: "Russ Rental — Website Rental Mobil", kind: "Aplikasi Web", year: "2026", tone: "bg-lilac",
    desc: "Website rental mobil dengan katalog armada, form booking, dan panel admin berbasis Filament.",
    tech: ["Laravel 13", "Filament 5", "PHP 8.3", "MySQL"],
    site: "https://russ-rental.up.railway.app/", caseStudy: "https://www.aradhana.my.id/projects/russ-rental",
  },
  {
    no: "02", slug: "website-portofolio-pribadi", title: "Website Portofolio Pribadi", kind: "Proyek Pribadi", year: "2026", tone: "bg-mint",
    desc: "Website portofolio pribadi dengan guestbook interaktif berbasis Supabase.",
    tech: ["Next.js", "TypeScript", "Supabase", "Framer Motion"],
    site: "https://aradhana-portofolio.vercel.app/", caseStudy: "https://www.aradhana.my.id/projects/personal-portfolio",
  },
  {
    no: "03", slug: "sistem-manajemen-proyek-sekolah", title: "Sistem Manajemen Proyek Sekolah", kind: "Aplikasi Web", year: "2025", tone: "bg-lilac",
    desc: "Sistem manajemen proyek sekolah untuk PPLG — tracking tugas, deadline, dan kolaborasi tim.",
    tech: ["React", "Node.js", "MySQL", "Tailwind CSS"],
    site: "", caseStudy: "https://www.aradhana.my.id/projects/school-project-management",
  },
];

export const services = [
  { no: "01", title: "Website Development", tone: "bg-lilac", desc: "Membangun website responsif dari desain hingga deploy, menggunakan Next.js dan Tailwind CSS.", items: ["Landing page", "Company profile", "Portfolio", "Deployment ke Vercel"] },
  { no: "02", title: "Web Application", tone: "bg-mint", desc: "Aplikasi web dengan autentikasi, database, dan fitur custom sesuai kebutuhan.", items: ["Dashboard", "CRUD sederhana", "Integrasi Supabase"] },
  { no: "03", title: "UI Implementation", tone: "bg-lilac", desc: "Mengubah desain Figma menjadi kode yang rapi dan mudah dikembangkan.", items: ["Component library", "Responsive layout", "Aksesibilitas dasar"] },
];

export const journey = [
  { year: "2026", kind: "Proyek", title: "RUSS Rental", tag: "Tugas PPLG", tone: "bg-accent", desc: "Platform rental mobil berbasis web dengan katalog kendaraan, kategori dan transmisi, serta sistem booking." },
  { year: "2026", kind: "Proyek", title: "Membangun Personal Portfolio", tag: "Proyek Pribadi", tone: "bg-lilac", desc: "Mendesain dan membangun portfolio dari nol dengan Next.js dan Supabase, termasuk guestbook interaktif." },
  { year: "2025", kind: "Pendidikan", title: "Sistem Manajemen Proyek Sekolah", tag: "Tugas PPLG", tone: "bg-mint", desc: "Sistem manajemen proyek lengkap dengan autentikasi dan dashboard." },
  { year: "2024", kind: "Pendidikan", title: "Mulai PPLG", tag: "SMK", tone: "bg-lilac", desc: "Memulai jurusan Pengembangan Perangkat Lunak dan Gim, fokus awal di web development." },
];

export const subjects = ["Kolaborasi Proyek", "Peluang Kerja", "Pertanyaan Umum"];

export const socials = [
  { label: "LinkedIn", href: "https://linkedin.com/in/aradhana-miftah-hermawan" },
  { label: "GitHub", href: "https://github.com/Aradhana3114" },
  { label: "Instagram", href: "https://instagram.com/arazyizhere" },
];
