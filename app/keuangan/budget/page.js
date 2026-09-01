"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Table, Form, Button, ProgressBar, Badge, Modal } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { getStorage, setStorage } from "@/lib/storage";
import { formatRupiah, CATEGORIES_KEUANGAN, getMonthKey, monthLabel } from "@/lib/utils";

const catColors = {
  Makanan: "#0d6efd", Transportasi: "#6f42c1", Belanja: "#fd7e14", Hiburan: "#20c997",
  Tagihan: "#dc3545", Kesehatan: "#198754", Pendidikan: "#0dcaf0", Lainnya: "#6c757d",
};

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category: "Makanan", amount: "" });

  useEffect(() => {
    setBudgets(getStorage("budgets", []));
    setTransactions(getStorage("transactions", []));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTx = transactions.filter((t) => getMonthKey(t.date) === currentMonth && t.type === "expense");

  const status = budgets.map((b) => {
    const spent = monthTx.filter((t) => t.category === b.category).reduce((s, t) => s + Number(t.amount), 0);
    const amount = Number(b.amount);
    const pct = amount > 0 ? Math.round((spent / amount) * 100) : 0;
    return { ...b, spent, pct, over: pct > 100 };
  });

  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount), 0);
  const totalSpent = status.reduce((s, b) => s + b.spent, 0);
  const budgetedCats = budgets.map((b) => b.category);
  const unbudgetedSpent = monthTx.filter((t) => !budgetedCats.includes(t.category)).reduce((s, t) => s + Number(t.amount), 0);

  const openAdd = () => {
    const used = budgets.map((b) => b.category);
    const avail = CATEGORIES_KEUANGAN.filter((c) => !used.includes(c));
    if (avail.length === 0) { alert("Semua kategori sudah punya budget"); return; }
    setEditing(null);
    setForm({ category: avail[0], amount: "" });
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditing(b.id);
    setForm({ category: b.category, amount: b.amount });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    let updated;
    if (editing) {
      updated = budgets.map((b) => (b.id === editing ? { ...b, ...form, amount: Number(form.amount) } : b));
    } else {
      updated = [...budgets, { ...form, amount: Number(form.amount), id: Date.now().toString() }];
    }
    setBudgets(updated);
    setStorage("budgets", updated);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    setStorage("budgets", updated);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="text-muted me-3">Total Budget: <strong className="text-primary">{formatRupiah(totalBudget)}</strong></span>
          <span className="text-muted me-3">Terpakai: <strong className="text-danger">{formatRupiah(totalSpent)}</strong></span>
          {unbudgetedSpent > 0 && <span className="text-muted">Tanpa Budget: <strong className="text-warning">{formatRupiah(unbudgetedSpent)}</strong></span>}
        </div>
        <Button variant="primary" onClick={openAdd}><i className="bi bi-plus-lg me-1" />Tambah Budget</Button>
      </div>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-white"><strong>Alokasi Budget ({monthLabel(currentMonth)})</strong></Card.Header>
            <Card.Body>
              {budgets.length > 0 ? (
                <div className="chart-container" style={{ height: 280 }}>
                  <Pie
                    data={{
                      labels: budgets.map((b) => b.category),
                      datasets: [{ data: budgets.map((b) => Number(b.amount)), backgroundColor: budgets.map((b) => catColors[b.category] || "#6c757d"), borderWidth: 2, borderColor: "#fff" }],
                    }}
                    options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
                  />
                </div>
              ) : (
                <div className="text-center text-muted py-5">Belum ada budget</div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-white"><strong>Rincian Budget</strong></Card.Header>
            <Card.Body>
              {status.length > 0 ? (
                <Table hover responsive className="align-middle">
                  <thead>
                    <tr><th>Kategori</th><th style={{ width: "35%" }}>Pemakaian</th><th>Terpakai</th><th>Budget</th><th>Status</th><th className="text-end">Aksi</th></tr>
                  </thead>
                  <tbody>
                    {status.map((b) => (
                      <tr key={b.id}>
                        <td><span className="d-inline-block me-2" style={{ width: 12, height: 12, borderRadius: 3, background: catColors[b.category] || "#6c757d" }} />{b.category}</td>
                        <td><ProgressBar now={Math.min(b.pct, 100)} variant={b.over ? "danger" : b.pct > 75 ? "warning" : "success"} label={b.over ? "Over!" : `${b.pct}%`} /></td>
                        <td className="text-money">{formatRupiah(b.spent)}</td>
                        <td className="text-money">{formatRupiah(b.amount)}</td>
                        <td>{b.over ? <Badge bg="danger">Over Budget</Badge> : b.pct > 75 ? <Badge bg="warning" text="dark">Hampir Habis</Badge> : <Badge bg="success">Aman</Badge>}</td>
                        <td className="text-end">
                          <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(b)}><i className="bi bi-pencil" /></Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(b.id)}><i className="bi bi-trash" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center text-muted py-5">Belum ada budget. Klik "Tambah Budget" untuk mulai.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editing ? "Edit Budget" : "Tambah Budget"}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Kategori</Form.Label>
              <Form.Select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES_KEUANGAN.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Budget Bulanan (Rp)</Form.Label>
              <Form.Control type="number" name="amount" value={form.amount} placeholder="0" onChange={handleChange} required min="0" />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
              <Button type="submit" variant="primary">Simpan</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
