"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Badge, ListGroup, ProgressBar } from "react-bootstrap";
import { Pie, Line } from "react-chartjs-2";
import StatCard from "@/components/StatCard";
import { getStorage } from "@/lib/storage";
import { formatRupiah, getMonthKey, monthLabel, todayISO } from "@/lib/utils";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [motivations, setMotivations] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTransactions(getStorage("transactions", []));
    setTasks(getStorage("tasks", []));
    setMotivations(getStorage("motivations", []));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const monthTx = transactions.filter((t) => getMonthKey(t.date) === currentMonth);
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  const today = todayISO();
  const todaysTasks = tasks.filter((t) => t.date === today);
  const doneToday = todaysTasks.filter((t) => t.completed).length;
  const productivity = todaysTasks.length > 0 ? Math.round((doneToday / todaysTasks.length) * 100) : 0;

  // Pie chart by category
  const catOrder = {};
  const catColors = {
    Makanan: "#0d6efd", Transportasi: "#6f42c1", Belanja: "#fd7e14", Hiburan: "#20c997",
    Tagihan: "#dc3545", Kesehatan: "#198754", Pendidikan: "#0dcaf0", Lainnya: "#6c757d",
  };
  monthTx.filter((t) => t.type === "expense").forEach((t) => {
    catOrder[t.category] = (catOrder[t.category] || 0) + Number(t.amount);
  });
  const pieLabels = Object.keys(catOrder);
  const pieData = Object.values(catOrder);

  // Trend last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  const trendIncome = months.map((m) =>
    transactions.filter((t) => getMonthKey(t.date) === m && t.type === "income").reduce((s, t) => s + Number(t.amount), 0)
  );
  const trendExpense = months.map((m) =>
    transactions.filter((t) => getMonthKey(t.date) === m && t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)
  );

  const trendLabels = months.map(monthLabel);

  // Random motivation quote
  const randomMotivation = motivations.length > 0
    ? motivations[Math.floor(Math.random() * motivations.length)]
    : null;

  return (
    <div>
      <div className="page-header">
        <h4>Selamat datang kembali 👋</h4>
      </div>

      <Row className="g-3 mb-4">
        <Col md={3}>
          <StatCard icon="bi-cash-stack" color="#0d6efd" bg="#e7f1ff" title="Pemasukan Bulan Ini" value={formatRupiah(income)} />
        </Col>
        <Col md={3}>
          <StatCard icon="bi-cart" color="#dc3545" bg="#fde7e9" title="Pengeluaran Bulan Ini" value={formatRupiah(expense)} />
        </Col>
        <Col md={3}>
          <StatCard icon="bi-piggy-bank" color="#198754" bg="#e6f7ee" title="Saldo" value={formatRupiah(balance)} />
        </Col>
        <Col md={3}>
          <StatCard icon="bi-trophy" color="#fd7e14" bg="#fff3e6" title="Produktivitas Hari Ini" value={`${productivity}%`} subtitle={`${doneToday}/${todaysTasks.length} task`} />
        </Col>
      </Row>

      {randomMotivation && (
        <div className="alert alert-primary d-flex align-items-start gap-2 mb-4">
          <i className="bi bi-lightbulb fs-4" />
          <div>
            <strong>Motivasi hari ini:</strong> {randomMotivation.content}
            {randomMotivation.category && <Badge bg="secondary" className="ms-2">{randomMotivation.category}</Badge>}
          </div>
        </div>
      )}

      <Row className="g-4 mb-4">
        <Col lg={5}>
          <Card className="h-100">
            <Card.Header className="bg-white"><strong>Pengeluaran per Kategori</strong></Card.Header>
            <Card.Body>
              {pieLabels.length > 0 ? (
                <div className="chart-container" style={{ height: 280 }}>
                  <Pie
                    data={{
                      labels: pieLabels,
                      datasets: [{
                        data: pieData,
                        backgroundColor: pieLabels.map((c) => catColors[c] || "#6c757d"),
                        borderWidth: 2,
                        borderColor: "#fff",
                      }],
                    }}
                    options={{ maintainAspectRatio: false, plugins: { legend: { position: "right" } } }}
                  />
                </div>
              ) : (
                <div className="text-center text-muted py-5">Belum ada data pengeluaran bulan ini</div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card className="h-100">
            <Card.Header className="bg-white"><strong>Tren Keuangan 6 Bulan</strong></Card.Header>
            <Card.Body>
              <div className="chart-container" style={{ height: 280 }}>
                <Line
                  data={{
                    labels: trendLabels,
                    datasets: [
                      { label: "Pemasukan", data: trendIncome, borderColor: "#198754", backgroundColor: "rgba(25,135,84,0.1)", fill: true, tension: 0.3 },
                      { label: "Pengeluaran", data: trendExpense, borderColor: "#dc3545", backgroundColor: "rgba(220,53,69,0.1)", fill: true, tension: 0.3 },
                    ],
                  }}
                  options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card>
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <strong>Task Hari Ini</strong>
            </Card.Header>
            <Card.Body>
              {todaysTasks.length > 0 ? (
                <ListGroup variant="flush">
                  {todaysTasks.map((t, i) => (
                    <ListGroup.Item key={i} className="d-flex align-items-center gap-2">
                      <i className={`bi ${t.completed ? "bi-check-circle-fill text-success" : "bi-circle text-muted"}`} />
                      <span className={t.completed ? "text-decoration-line-through text-muted" : ""}>{t.title}</span>
                      {t.priority && (
                        <Badge bg={t.priority === "tinggi" ? "danger" : t.priority === "sedang" ? "warning" : "secondary"} className="ms-auto">
                          {t.priority}
                        </Badge>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center text-muted py-4">Tidak ada task untuk hari ini</div>
              )}
              <ProgressBar now={productivity} variant={productivity >= 70 ? "success" : productivity >= 40 ? "warning" : "danger"} className="mt-3" label={`${productivity}%`} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header className="bg-white"><strong>Ringkasan Cepat</strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-wallet2 me-2 text-primary" />Jumlah Transaksi Bulan Ini</span>
                  <Badge bg="primary">{monthTx.length}</Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-lightbulb me-2 text-warning" />Total Catatan Motivasi</span>
                  <Badge bg="warning" text="dark">{motivations.length}</Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-check2-square me-2 text-success" />Total Task</span>
                  <Badge bg="success">{tasks.length}</Badge>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
