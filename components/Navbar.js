"use client";

import { usePathname } from "next/navigation";

const pageTitles = {
  "/": { title: "Dashboard", icon: "bi-grid" },
  "/keuangan": { title: "Ringkasan Keuangan", icon: "bi-wallet2" },
  "/keuangan/transaksi": { title: "Income & Expense Tracker", icon: "bi-arrow-left-right" },
  "/keuangan/budget": { title: "Budget Planner", icon: "bi-pie-chart" },
  "/keuangan/investasi": { title: "Investment Tracker", icon: "bi-graph-up-arrow" },
  "/keuangan/hutang": { title: "Hutang & Piutang", icon: "bi-cash-coin" },
  "/kegiatan": { title: "Ringkasan Kegiatan", icon: "bi-clipboard-check" },
  "/kegiatan/task": { title: "Daily Task", icon: "bi-check2-square" },
  "/kegiatan/waktu": { title: "Time Tracker", icon: "bi-clock-history" },
  "/kegiatan/organisasi": { title: "Organisasi", icon: "bi-people" },
  "/kegiatan/liburan": { title: "Liburan", icon: "bi-airplane" },
  "/kegiatan/belajar": { title: "Belajar Hal Baru", icon: "bi-book" },
  "/motivasi": { title: "Catatan Motivasi", icon: "bi-lightbulb" },
  "/sastra": { title: "Kumpulan Sastra", icon: "bi-pencil-square" },
};

export default function Navbar() {
  const pathname = usePathname();
  const page = pageTitles[pathname] || { title: "App Kehidupan", icon: "bi-activity" };
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="navbar-top">
      <div className="d-flex justify-content-between align-items-center px-4">
        <h5 className="mb-0 d-flex align-items-center gap-2">
          <i className={`bi ${page.icon}`} />
          {page.title}
        </h5>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">{today}</span>
          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
            <i className="bi bi-person" />
          </div>
        </div>
      </div>
    </div>
  );
}
