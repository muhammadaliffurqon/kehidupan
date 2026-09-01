"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    section: "Utama",
    items: [
      { href: "/", icon: "bi-grid", label: "Dashboard" },
    ],
  },
  {
    section: "Keuangan",
    items: [
      { href: "/keuangan", icon: "bi-wallet2", label: "Ringkasan" },
      { href: "/keuangan/transaksi", icon: "bi-arrow-left-right", label: "Transaksi" },
      { href: "/keuangan/budget", icon: "bi-pie-chart", label: "Budget Planner" },
      { href: "/keuangan/investasi", icon: "bi-graph-up-arrow", label: "Investasi" },
      { href: "/keuangan/hutang", icon: "bi-cash-coin", label: "Hutang & Piutang" },
    ],
  },
  {
    section: "Kegiatan",
    items: [
      { href: "/kegiatan", icon: "bi-clipboard-check", label: "Ringkasan" },
      { href: "/kegiatan/task", icon: "bi-check2-square", label: "Daily Task" },
      { href: "/kegiatan/waktu", icon: "bi-clock-history", label: "Time Tracker" },
      { href: "/kegiatan/organisasi", icon: "bi-people", label: "Organisasi" },
      { href: "/kegiatan/liburan", icon: "bi-airplane", label: "Liburan" },
      { href: "/kegiatan/belajar", icon: "bi-book", label: "Belajar" },
    ],
  },
  {
    section: "Catatan",
    items: [
      { href: "/motivasi", icon: "bi-lightbulb", label: "Motivasi" },
      { href: "/sastra", icon: "bi-pencil-square", label: "Karya Sastra" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <i className="bi bi-activity" />
        App Kehidupan
      </div>
      {navItems.map((group) => (
        <div key={group.section}>
          <div className="sidebar-section-title">{group.section}</div>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
