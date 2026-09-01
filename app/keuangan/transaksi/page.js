"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Table, Form, Button, Badge, Modal } from "react-bootstrap";
import { getStorage, setStorage } from "@/lib/storage";
import { formatRupiah, CATEGORIES_KEUANGAN, todayISO } from "@/lib/utils";

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type: "expense", date: todayISO(), description: "", category: "Makanan", amount: "" });

  useEffect(() => {
    setTransactions(getStorage("transactions", []));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditing(null);
    setForm({ type: "expense", date: todayISO(), description: "", category: "Makanan", amount: "" });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t.id);
    setForm({ type: t.type, date: t.date, description: t.description, category: t.category, amount: t.amount });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updated;
    if (editing) {
      updated = transactions.map((t) => (t.id === editing ? { ...t, ...form, amount: Number(form.amount) } : t));
    } else {
      updated = [...transactions, { ...form, amount: Number(form.amount), id: Date.now().toString() }];
    }
    setTransactions(updated);
    setStorage("transactions", updated);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    setStorage("transactions", updated);
  };

  const incomeTotal = transactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenseTotal = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  let filtered = transactions;
  if (filter !== "all") filtered = filtered.filter((t) => t.type === filter);
  if (monthFilter !== "all") filtered = filtered.filter((t) => t.date.slice(0, 7) === monthFilter);

  const months = [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort().reverse();

  return (
    <div>
      <div className="page-header">
        <div className="d-flex gap-3">
          <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 150 }}>
            <option value="all">Semua</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </Form.Select>
          <Form.Select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={{ width: 160 }}>
            <option value="all">Semua Bulan</option>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </Form.Select>
        </div>
        <Button variant="primary" onClick={openAdd}><i className="bi bi-plus-lg me-1" />Tambah Transaksi</Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <div className="card stat-card"><div className="card-body d-flex align-items-center gap-3">
            <div className="stat-icon bg-success bg-opacity-10 text-success"><i className="bi bi-arrow-down-circle" /></div>
            <div><div className="text-muted small">Total Pemasukan</div><div className="fw-bold fs-5 text-success">{formatRupiah(incomeTotal)}</div></div>
          </div></div>
        </Col>
        <Col md={4}>
          <div className="card stat-card"><div className="card-body d-flex align-items-center gap-3">
            <div className="stat-icon bg-danger bg-opacity-10 text-danger"><i className="bi bi-arrow-up-circle" /></div>
            <div><div className="text-muted small">Total Pengeluaran</div><div className="fw-bold fs-5 text-danger">{formatRupiah(expenseTotal)}</div></div>
          </div></div>
        </Col>
        <Col md={4}>
          <div className="card stat-card"><div className="card-body d-flex align-items-center gap-3">
            <div className="stat-icon bg-primary bg-opacity-10 text-primary"><i className="bi bi-calculator" /></div>
            <div><div className="text-muted small">Selisih</div><div className="fw-bold fs-5">{formatRupiah(incomeTotal - expenseTotal)}</div></div>
          </div></div>
        </Col>
      </Row>

      <Card>
        <Card.Header className="bg-white"><strong>Daftar Transaksi ({filtered.length})</strong></Card.Header>
        <Card.Body>
          {filtered.length > 0 ? (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Tanggal</th><th>Deskripsi</th><th>Kategori</th><th>Tipe</th><th className="text-end">Jumlah</th><th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice().reverse().map((t) => (
                  <tr key={t.id}>
                    <td className="small">{t.date}</td>
                    <td>{t.description}</td>
                    <td><Badge bg="light" text="dark">{t.category}</Badge></td>
                    <td><Badge bg={t.type === "income" ? "success" : "danger"}>{t.type === "income" ? "Masuk" : "Keluar"}</Badge></td>
                    <td className={`text-end text-money fw-semibold ${t.type === "income" ? "text-success" : "text-danger"}`}>
                      {t.type === "income" ? "+" : "-"}{formatRupiah(t.amount)}
                    </td>
                    <td className="text-end">
                      <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(t)}><i className="bi bi-pencil" /></Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(t.id)}><i className="bi bi-trash" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted py-5">Tidak ada transaksi</div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editing ? "Edit Transaksi" : "Tambah Transaksi"}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tipe</Form.Label>
              <Form.Select name="type" value={form.type} onChange={handleChange}>
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal</Form.Label>
              <Form.Control type="date" name="date" value={form.date} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Deskripsi</Form.Label>
              <Form.Control type="text" name="description" value={form.description} placeholder="e.g. Belanja bulanan, Gaji, dll" onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kategori</Form.Label>
              <Form.Select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES_KEUANGAN.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Jumlah (Rp)</Form.Label>
              <Form.Control type="number" name="amount" value={form.amount} placeholder="0" onChange={handleChange} required min="0" />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
              <Button type="submit" variant="primary"><i className="bi bi-check-lg me-1" />Simpan</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
