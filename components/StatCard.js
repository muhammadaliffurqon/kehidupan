"use client";

export default function StatCard({ icon, color, bg, title, value, subtitle }) {
  return (
    <div className="card stat-card">
      <div className="card-body d-flex align-items-center gap-3">
        <div className="stat-icon" style={{ background: bg, color }}>
          <i className={`bi ${icon}`} />
        </div>
        <div>
          <div className="text-muted small">{title}</div>
          <div className="fw-bold fs-5">{value}</div>
          {subtitle && <div className="small text-muted">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}
