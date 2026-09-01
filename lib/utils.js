"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

export const CATEGORIES_KEUANGAN = [
  "Makanan",
  "Transportasi",
  "Belanja",
  "Hiburan",
  "Tagihan",
  "Kesehatan",
  "Pendidikan",
  "Lainnya",
];

export const KATEGORI_MOTIVASI = ["Kerja", "Kehidupan", "Cinta", "Disiplin", "Semangat", "Lainnya"];
export const KATEGORI_SASTRA = ["Puisi", "Cerpen", "Prosa", "Pesan", "Lainnya"];

export function formatRupiah(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(num) || 0);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function getMonthKey(dateStr) {
  return (dateStr || "").slice(0, 7);
}

export function monthLabel(monthKey) {
  const [y, m] = monthKey.split("-");
  const d = new Date(y, Number(m) - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}
