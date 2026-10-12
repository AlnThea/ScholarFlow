// lib/institution/executive-pdf-generator.ts
// Generator Laporan Eksekutif PDF (1-2 Halaman Resmi) untuk Pimpinan Kampus / Rektorat

export interface ExecutiveReportData {
  institutionName: string;
  adminEmail: string;
  totalSeats: number;
  usedSeats: number;
  contractEnd: string;
  adoptionRate: number;
  totalDrafts: number;
  tokensConsumed: string;
  approvalRate: string;
  departments: Array<{ name: string; drafts: number; seats: number }>;
  roleDistribution: Array<{ role: string; count: number }>;
  isEn: boolean;
}

export function generateExecutivePdfHtml(data: ExecutiveReportData): string {
  const currentDate = new Date().toLocaleDateString(data.isEn ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const percentUsed = Math.min(100, Math.round((data.usedSeats / data.totalSeats) * 100));

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>ScholarFlow Executive Summary - ${data.institutionName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 15mm 18mm 15mm;
    }
    body {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 0;
      line-height: 1.45;
      font-size: 11pt;
    }
    .header-table {
      width: 100%;
      border-bottom: 2.5px solid #4338ca;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 8.5pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-official {
      background-color: #e0e7ff;
      color: #3730a3;
    }
    .kpi-grid {
      display: table;
      width: 100%;
      table-layout: fixed;
      margin-bottom: 18px;
    }
    .kpi-card {
      display: table-cell;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      vertical-align: top;
      margin-right: 6px;
    }
    .kpi-title {
      font-size: 8pt;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .kpi-value {
      font-size: 16pt;
      font-weight: 800;
      color: #1e1b4b;
    }
    .kpi-sub {
      font-size: 7.5pt;
      color: #059669;
      font-weight: 600;
    }
    .section-title {
      font-size: 11pt;
      font-weight: 700;
      color: #1e293b;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 14px;
      margin-bottom: 10px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 9.5pt;
    }
    table.data-table th {
      background-color: #f1f5f9;
      color: #334155;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      font-weight: 700;
    }
    table.data-table td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      color: #334155;
    }
    .progress-bar-bg {
      background: #e2e8f0;
      border-radius: 4px;
      height: 8px;
      width: 100%;
      overflow: hidden;
      margin-top: 4px;
    }
    .progress-bar-fill {
      background: #4f46e5;
      height: 100%;
      border-radius: 4px;
    }
    .security-notice {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 8.5pt;
      color: #166534;
      margin-bottom: 18px;
    }
    .signature-area {
      margin-top: 35px;
      width: 100%;
    }
    .sign-box {
      width: 45%;
      display: inline-block;
      vertical-align: top;
      text-align: center;
      font-size: 9pt;
    }
    .sign-line {
      margin-top: 50px;
      border-bottom: 1px solid #64748b;
      width: 80%;
      margin-left: auto;
      margin-right: auto;
    }
  </style>
</head>
<body>
  <!-- Header Kop Surat -->
  <table class="header-table">
    <tr>
      <td style="width: 70%;">
        <span class="badge badge-official">LAPORAN RESMI EKSEKUTIF ADOPSI RISET</span>
        <h1 style="font-size: 16pt; margin: 4px 0 2px 0; color: #1e1b4b;">${data.institutionName}</h1>
        <p style="margin: 0; font-size: 9pt; color: #64748b;">
          Sistem Akselerasi Penulisan Ilmiah & Manajemen Lisensi Kampus ScholarFlow
        </p>
      </td>
      <td style="width: 30%; text-align: right; vertical-align: bottom;">
        <p style="margin: 0; font-size: 8.5pt; color: #475569;">Tanggal Cetak: <strong>${currentDate}</strong></p>
        <p style="margin: 2px 0 0 0; font-size: 8pt; color: #64748b;">PIC: ${data.adminEmail}</p>
      </td>
    </tr>
  </table>

  <!-- 4 KPI Card Grid -->
  <div class="kpi-grid">
    <div class="kpi-card" style="width: 25%;">
      <div class="kpi-title">Kapasitas Lisensi</div>
      <div class="kpi-value">${data.usedSeats}/${data.totalSeats}</div>
      <div class="kpi-sub">${percentUsed}% Kursi Terpakai</div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${percentUsed}%;"></div>
      </div>
    </div>
    <div class="kpi-card" style="width: 25%;">
      <div class="kpi-title">Naskah Riset Aktif</div>
      <div class="kpi-value">${data.totalDrafts}</div>
      <div class="kpi-sub">+18.4% vs Bulan Lalu</div>
    </div>
    <div class="kpi-card" style="width: 25%;">
      <div class="kpi-title">Rasio Keaktifan</div>
      <div class="kpi-value">${data.adoptionRate}%</div>
      <div class="kpi-sub">Adopsi Dosen & Mhs</div>
    </div>
    <div class="kpi-card" style="width: 25%;">
      <div class="kpi-title">Siap Jurnal / SINTA</div>
      <div class="kpi-value">${data.approvalRate}</div>
      <div class="kpi-sub">Validasi Pembimbing</div>
    </div>
  </div>

  <!-- Security & Privacy Guarantee -->
  <div class="security-notice">
    <strong>Jaminan Kepatuhan Akademik (Zero Data Retention):</strong> Seluruh draf naskah tugas akhir dan riset civitas akademika ${data.institutionName} dilindungi enkripsi standar institusi dan TIDAK PERNAH digunakan untuk melatih model AI publik.
  </div>

  <!-- Tabel Produktivitas per Fakultas -->
  <div class="section-title">I. REKAPITULASI PRODUKTIVITAS RISET PER FAKULTAS / PRODI</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 45%;">Fakultas / Program Studi</th>
        <th style="width: 25%; text-align: center;">Jumlah Draf Naskah</th>
        <th style="width: 30%; text-align: center;">Alokasi Kursi Lisensi</th>
      </tr>
    </thead>
    <tbody>
      ${data.departments.map(d => `
        <tr>
          <td><strong>${d.name}</strong></td>
          <td style="text-align: center;">${d.drafts} Naskah</td>
          <td style="text-align: center;">${d.seats} Lisensi Aktif</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Tabel Pembagian Peran Civitas -->
  <div class="section-title">II. DISTRIBUSI HAK AKSES PERAN AKADEMIK (RBAC)</div>
  <table class="data-table">
    <thead>
      <tr>
        <th>Tingkat Peran Akademik</th>
        <th style="text-align: center;">Jumlah Akun Aktif</th>
        <th>Batas Jatah Token AI Bulanan</th>
      </tr>
    </thead>
    <tbody>
      ${data.roleDistribution.map(r => `
        <tr>
          <td><strong>${r.role}</strong></td>
          <td style="text-align: center;">${r.count} Orang</td>
          <td>${r.role.includes('Super') ? '1,000,000 Token (Akses Rektorat)' : r.role.includes('Lecturer') || r.role.includes('Dosen') ? '500,000 Token (Prioritas Pembimbing)' : '100,000 Token (Standar Mahasiswa)'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Tanda Tangan Pengesahan -->
  <div class="signature-area">
    <div class="sign-box" style="float: left;">
      <p style="margin: 0;">Disiapkan Oleh,</p>
      <p style="margin: 2px 0 0 0; font-weight: bold;">Administrator Kampus / LPPM</p>
      <div class="sign-line"></div>
      <p style="margin: 4px 0 0 0; font-size: 8pt; color: #64748b;">${data.adminEmail}</p>
    </div>
    <div class="sign-box" style="float: right;">
      <p style="margin: 0;">Mengetahui,</p>
      <p style="margin: 2px 0 0 0; font-weight: bold;">Pimpinan Universitas / Wakil Rektor I</p>
      <div class="sign-line"></div>
      <p style="margin: 4px 0 0 0; font-size: 8pt; color: #64748b;">NIP. ......................................................</p>
    </div>
    <div style="clear: both;"></div>
  </div>
</body>
</html>
  `;
}

export async function printExecutivePdfReport(data: ExecutiveReportData): Promise<void> {
  const html = generateExecutivePdfHtml(data);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('Could not access iframe document');
  }

  doc.open();
  doc.write(html);
  doc.close();

  // Print iframe
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1500);
  }, 300);
}
