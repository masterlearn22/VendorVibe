# Product Requirements Document (PRD) – VendorVibe

---

## 1. Project Overview

### 1.1 Rangkuman Produk

**VendorVibe** adalah sebuah platform *Automated Procurement & Vendor Risk Analyzer* berbasis Web. Aplikasi ini dirancang untuk membantu tim procurement dan stakeholder perusahaan dalam menyeleksi proposal vendor secara instan, menganalisis risiko bisnis, dan membandingkan penawaran menggunakan kecerdasan buatan (Google AI Studio).

### 1.2 Masalah yang Diselesaikan

- Proses *screening* dokumen proposal (RFP) vendor yang memakan waktu berhari-hari.
- Sulitnya melakukan komparasi harga dan *timeline* pengerjaan secara objektif dari format dokumen yang berbeda-beda.
- Risiko memilih vendor yang tidak kompeten atau memiliki stabilitas bisnis yang buruk.

### 1.3 Solusi Utama

- Ekstraksi data PDF proposal otomatis menggunakan Google AI Studio (Gemini).
- Penilaian skor risiko vendor secara otomatis (*AI-driven risk scoring*).
- Dashboard komparasi *side-by-side* dan visualisasi dampak bisnis (ROI) untuk stakeholder.

---

## 2. Arsitektur Sistem & Integrasi Teknologi

Aplikasi ini dibangun menggunakan arsitektur modern yang berfokus pada kecepatan pengembangan (*vibe coding*):

```
[React.js Frontend] <---> [Supabase Client / Edge Functions] <---> [Supabase DB via MCP]
                                      |
                                      +---> [Google AI Studio (Gemini API)]
```

- **Frontend:** React.js (Vite) + Tailwind CSS + Shadcn UI + Recharts/Tremor.
- **Backend & Database:** Supabase (PostgreSQL) yang dikelola langsung oleh agen Antigravity via **Supabase MCP Server**.
- **AI Engine:** Google AI Studio (SDK Gemini) untuk analisis teks dokumen dan *scoring*.
- **Deployment:** GitHub Actions ke Vercel / GitHub Pages.

---

## 3. Alur Sistem & Use Case

### 3.1 Alur Sistem Utama (System Flow)

1. **Tahap Input:** User mengunggah file PDF/Scan proposal vendor ke halaman dashboard.
2. **Tahap Analisis (AI Studio):** Dokumen dikirim ke Gemini API dengan teknik *Structured Prompting* untuk menghasilkan output berupa format JSON (Nama vendor, Harga, Durasi, Ringkasan, dan Potensi Risiko).
3. **Tahap Penyimpanan (Supabase):** Agen menyuntikkan data hasil ekstraksi ke tabel `vendors` dan `proposals` melalui Supabase MCP.
4. **Tahap Visualisasi:** Frontend React mengambil data secara *real-time* dan menampilkannya dalam bentuk tabel interaktif dan grafik analisis.

### 3.2 Use Case Diagram (Deskriptif)

#### Use Case 1: Unggah & Ekstraksi Proposal Otomatis

- **Aktor:** Tim Procurement (User)
- **Pre-condition:** User berada di halaman "Upload Proposal".
- **Alur Utama:**
  1. User melakukan *drag-and-drop* file PDF proposal.
  2. Sistem menampilkan *loading state* (AI sedang membaca dokumen).
  3. Google AI Studio mengekstrak poin penting ke format JSON.
  4. Data otomatis tersimpan di Supabase.
  5. Halaman dialihkan ke detail vendor dengan data yang sudah terisi otomatis.

#### Use Case 2: Komparasi Vendor Berbantuan AI

- **Aktor:** Manajer / Stakeholder Perusahaan
- **Pre-condition:** Sudah ada minimal 2 vendor terdaftar di database.
- **Alur Utama:**
  1. User membuka halaman "Vendor Directory".
  2. User mencentang 2 atau 3 vendor yang ingin dibandingkan.
  3. User menekan tombol "Bandingkan via AI".
  4. Sistem menampilkan tabel komparasi *side-by-side* (Harga, Durasi, Skor Risiko).
  5. Google AI Studio mengeluarkan satu paragraf rekomendasi final mengenai opsi terbaik.

---

## 4. Panduan Desain, Layout, & Aksesibilitas (UI/UX)

Sesuai kebutuhan, desain berfokus pada **kontras yang tinggi, teks yang sangat mudah dibaca, dan warna yang tidak saling bertabrakan dengan latar belakang**.

### 4.1 Skema Warna (Colourway) – *Corporate High-Contrast Theme*

Menggunakan pendekatan *hybrid-dark theme* profesional yang ramah di mata, namun memiliki penanda status yang tegas.

| Elemen UI | Variabel Tailwind | Kode Hex | Alasan & Kegunaan |
|---|---|---|---|
| **Main Background** | `bg-slate-950` | `#020617` | Latar belakang utama, sangat gelap namun lembut (bukan hitam pekat). |
| **Card / Surface Background** | `bg-slate-900` | `#0f172a` | Latar belakang komponen kartu/tabel untuk menciptakan hierarki visual. |
| **Primary Text** | `text-slate-50` | `#f8fafc` | Putih pudar untuk teks utama. Kontras maksimal di atas slate-900 (Rasio > 7:1). |
| **Secondary Text** | `text-slate-400` | `#94a3b8` | Abu-abu terang untuk label, teks bantuan, atau deskripsi sub-menu. |
| **Accent / Button** | `bg-indigo-600` | `#4f46e5` | Warna aksi utama (tombol upload, tombol simpan). Menarik perhatian. |
| **Risk Low (Aman)** | `text-emerald-400` | `#34d399` | Hijau neon lembut untuk indikator risiko rendah dan teks angka hemat biaya. |
| **Risk Medium (Waspada)** | `text-amber-400` | `#fbbf24` | Kuning hangat untuk indikator risiko sedang. Tidak menusuk mata. |
| **Risk High (Bahaya)** | `text-rose-400` | `#f87171` | Merah pastel terang untuk indikator risiko tinggi (kontras tinggi di background gelap). |

### 4.2 Tipografi & Font

- **Font Family:** `Inter` atau `Plus Jakarta Sans` (Sans-serif modern, sangat bersih pada ukuran kecil maupun angka-angka statistik korporat).
- **Aturan Keterbacaan (Readability):**
  - *Heading Utama (Title):* `text-2xl font-bold tracking-tight text-slate-50`
  - *Body Text / Konten:* `text-sm font-normal leading-relaxed text-slate-200`
  - *Data Angka (Metrics):* `font-mono text-xl font-semibold` (agar angka pada nominal harga sejajar secara vertikal dan mudah dibaca cepat).

### 4.3 Struktur Layout Halaman

Aplikasi ini menggunakan layout **Fixed Sidebar** di sisi kiri dan **Scrollable Content** di sisi kanan untuk kenyamanan navigasi.

```
+-----------------------------------------------------------------------+
|  SIDEBAR           |  HEADER: Nama Halaman & Profil User              |
|                    +--------------------------------------------------+
|  - Overview DB     |  CONTENT AREA                                    |
|  - Vendor List     |                                                  |
|  - Upload Prop.    |  [ Card Metrik ROI ]  [ Card Total Vendor ]      |
|  - AI Compare      |                                                  |
|                    |  [ Data Table Vendor & Risk Score Status ]       |
|                    |                                                  |
+-----------------------------------------------------------------------+
```

---

## 5. Struktur Database (Supabase Schema via MCP)

Berikut adalah struktur tabel yang akan diinstruksikan kepada Supabase MCP:

```sql
-- Tabel Vendor Utama
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    risk_status VARCHAR(20) CHECK (risk_status IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Dokumen Proposal
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    file_url TEXT,
    offered_price NUMERIC(15, 2),
    duration_months INT,
    ai_summary TEXT,
    risk_score INT CHECK (risk_score BETWEEN 1 AND 100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 6. Target Pengembangan 3 Hari (Antigravity Prompting Milestone)

### Hari 1: Kebutuhan Fondasi

- **Prompt Target:** Pembuatan repositori, inisialisasi skema DB via Supabase MCP, dan perancangan *Dashboard Shell* (Sidebar, Header, Main Layout) menggunakan Tailwind CSS dengan skema warna resolusi kontras tinggi yang sudah ditentukan di atas.

### Hari 2: Kebutuhan Logika & AI Studio

- **Prompt Target:** Implementasi komponen unggah dokumen. Integrasi API Google AI Studio dengan mengirimkan berkas/teks untuk diparsing menjadi JSON dan disimpan langsung ke Supabase. Tampilan status risiko (`emerald-400` / `rose-400`) harus langsung terlihat di tabel utama setelah proses selesai.

### Hari 3: Kebutuhan Eksplorasi Stakeholder & CI/CD

- **Prompt Target:** Pembuatan halaman perbandingan vendor berdampingan (*side-by-side card comparison*) dan halaman metrik ROI perusahaan (menggunakan grafik garis/batang Recharts). Konfigurasi GitHub Actions untuk deployment otomatis produk akhir.

---

> **Catatan untuk Google Antigravity:** Pastikan saat melakukan kompilasi koda (*code compilation*), periksa keaslian kontras warna melalui tab *Artifacts* agar warna teks (`text-slate-50` dan `text-slate-400`) selalu berada di atas permukaan latar belakang (`bg-slate-900` atau `bg-slate-950`) demi menjaga nilai aksesibilitas AAA.
