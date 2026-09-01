"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Table, Badge, ProgressBar } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import StatCard from "@/components/StatCard";
import { getStorage } from "@/lib/storage";
import { formatRupiah, CATEGORIES_KEUANGAN, getMonthKey, monthLabel } from "@/lib/utils";

const catColors = {
  Makanan: "#0d6efd", Transportasi: "#6f42c1", Belanja: "#fd7e14", Hiburan: "#20c997",
  Tagihan: "#dc3545", Kesehatan: "#198754", Pendidikan: "#0dcaf0", Lainnya: "#6c757d",
};

export default function KeuanganSummaryPage() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [debts, setDebts] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTransactions(getStorage("transactions", []));
    setBudgets(getStorage("budgets", []));
    setInvestments(getStorage("investments", []));
    setDebts(getStorage("debts", []));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTx = transactions.filter((t) => getMonthKey(t.date) === currentMonth);
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  const totalInvestment = investments.reduce((s, i) => s + Number(i.currentValue || i.amount || 0), 0);
  const totalDebt = debts.filter((d) => !d.settled).reduce((s, d) => s + Number(d.amount), 0);

  // expense by category for pie
  const catOrder = {};
  monthTx.filter((t) => t.type === "expense").forEach((t) => {
    catOrder[t.category] = (catOrder[t.category] || 0) + Number(t.amount);
  });

  // Budget status
  const budgetStatus = budgets.map((b) => {
    const spent = monthTx.filter((t) => t.type === "expense" && t.category === b.category).reduce((s, t) => s + Number(t.amount), 0);
    const pct = b.amount > 0 ? Math.round((spent / Number(b.amount)) * 100) : 0;
    return { ...b, spent, pct };
  });

  const totalAllTime = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div>
      <Row className="g-3 mb-4">
        <Col md={3}><StatCard icon="bi-cash-stack" color="#0d6efd" bg="#e7f1ff" title="Pemasukan" value={formatRupiah(income)} /></Col>
        <Col md={3}><StatCard icon="bi-cart" color="#dc3545" bg="#fde7e9" title="Pengeluaran" value={formatRupiah(expense)} /></Col>
        <Col md={3}><StatCard icon="bi-piggy-bank" color="#198754" bg="#e6f7ee" title="Saldo Bulan Ini" value={formatRupiah(balance)} /></Col>
        <Col md={3}><StatCard icon="bi-graph-up-arrow" color="#6f42c1" bg="#f0eaff" title="Total Investasi" value={formatRupiah(totalInvestment)} /></Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={5}>
          <Card className="h-100">
            <Card.Header className="bg-white"><strong>Pengeluaran per Kategori ({monthLabel(currentMonth)})</strong></Card.Header>
            <Card.Body>
              {Object.keys(catOrder).length > 0 ? (
                <div className="chart-container" style={{ height: 260 }}>
                  <Pie
                    data={{
                      labels: Object.keys(catOrder),
                      datasets: [{ data: Object.values(catOrder), backgroundColor: Object.keys(catOrder).map((c) => catColors[c] || "#6c757d"), borderWidth: 2, borderColor: "#fff" }],
                    }}
                    options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
                  />
                </div>
              ) : (
                <div className="text-center text-muted py-5">Belum ada data</div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card className="h-100">
            <Card.Header className="bg-white"><strong>Status Budget Bulan Ini</strong></Card.Header>
            <Card.Body>
              {budgetStatus.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {budgetStatus.map((b, i) => (
                    <div key={i}>
                      <div className="d-flex justify-content-between small mb-1">
                        <span>{b.category}</span>
                        <span className="text-muted">{formatRupiah(b.spent)} / {formatRupiah(b.amount)}</span>
                      </div>
                      <ProgressBar
                        now={Math.min(b.pct, 100)}
                        variant={b.pct > 100 ? "danger" : b.pct > 75 ? "warning" : "success"}
                        label={b.pct > 100 ? "Over!" : `${b.pct}%`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  Belum ada budget. <a href="/keuangan/budget" className="text-primary">Atur budget</a> sekarang.
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={7}>
          <Card>
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <strong>Transaksi Terbaru</strong>
              <a href="/keuangan/transaksi" className="btn btn-sm btn-outline-primary">Lihat Semua</a>
            </Card.Header>
            <Card.Body>
              {monthTx.length > 0 ? (
                <Table hover responsive size="sm">
                  <thead>
                    <tr><th>Tanggal</th><th>Deskripsi</th><th>Kategori</th><th className="text-end">Jumlah</th></tr>
                  </thead>
                  <tbody>
                    {monthTx.slice(-8).reverse().map((t, i) => (
                      <tr key={i}>
                        <td className="small">{t.date}</td>
                        <td>{t.description}</td>
                        <td><Badge bg="light" text="dark">{t.category}</Badge></td>
                        <td className={`text-end text-money fw-semibold ${t.type === "income" ? "text-success" : "text-danger"}`}>
                          {t.type === "income" ? "+" : "-"}{formatRupiah(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center text-muted py-4">Belum ada transaksi bulan ini</div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header className="bg-white"><strong>Hutang & Piutang Aktif</strong></Card.Header>
            <Card.Body>
              <div className="text-danger fs-5 fw-bold mb-2">{formatRupiah(totalDebt)}</div>
              {debts.length > 0 ? (
                <a href="/keuangan/hutang" className="small text-primary">Kelola hutang & piutang</a>
              ) : (
                <div className="text-muted small">Tidak ada hutang/piutang aktif</div>
              )}
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="bg-white"><strong>Total Pengeluaran</strong></Card.Header>
            <Card.Body>
              <div className="display-6 fw-bold text-danger">{formatRupiah(totalAllTime)}</div>
              <div className="text-muted small">Gabungan seluruh waktu</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
