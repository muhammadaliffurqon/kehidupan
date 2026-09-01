"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Table, Form, Button, Badge, Modal } from "react-bootstrap";
import { getStorage, setStorage } from "@/lib/storage";
import { formatRupiah } from "@/lib/utils";

const JENIS = ["Saham", "Reksa Dana", "Emas", "Kripto", "Obligasi", "Properti", "Lainnya"];

const jenisColors = {
  Saham: "#0d6efd", "Reksa Dana": "#6f42c1", Emas: "#ffc107", Kripto: "#dc3545",
  Obligasi: "#198754", Properti: "#fd7e14", Lainnya: "#6c757d",
};

export default function InvestasiPage() {
  const [investments, setInvestments] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", jenis: "Saham", amount: "", currentValue: "", date: "" });

  useEffect(() => {
    setInvestments(getStorage("investments", []));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", jenis: "Saham", amount: "", currentValue: "", date: new Date().toISOString().slice(0, 10) });
    setShowModal(true);
  };

  const openEdit = (inv) => {
    setEditing(inv.id);
    setForm({ name: inv.name, jenis: inv.jenis, amount: inv.amount, currentValue: inv.currentValue, date: inv.date });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updated;
    const payload = { ...form, amount: Number(form.amount), currentValue: Number(form.currentValue || form.amount) };
    if (editing) {
      updated = investments.map((i) => (i.id === editing ? { ...i, ...payload } : i));
    } else {
      updated = [...investments, { ...payload, id: Date.now().toString() }];
    }
    setInvestments(updated);
    setStorage("investments", updated);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    const updated = investments.filter((i) => i.id !== id);
    setInvestments(updated);
    setStorage("investments", updated);
  };

  const rows = investments.map((i) => {
    const invested = Number(i.amount);
    const current = Number(i.currentValue || i.amount);
    const profit = current - invested;
    const pct = invested > 0 ? Math.round((profit / invested) * 100) : 0;
    return { ...i, invested, current, profit, pct };
  });

  const totalInvested = rows.reduce((s, r) => s + r.invested, 0);
  const totalCurrent = rows.reduce((s, r) => s + r.current, 0);
  const totalProfit = totalCurrent - totalInvested;

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="text-muted me-3">Modal: <strong>{formatRupiah(totalInvested)}</strong></span>
          <span className="text-muted me-3">Nilai Saat Ini: <strong>{formatRupiah(totalCurrent)}</strong></span>
          <span className="text-muted">Keuntungan: <strong className={totalProfit >= 0 ? "text-success" : "text-danger"}>{totalProfit >= 0 ? "+" : ""}{formatRupiah(totalProfit)}</strong></span>
        </div>
        <Button variant="primary" onClick={openAdd}><i className="bi bi-plus-lg me-1" />Tambah Investasi</Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={4}><Card className="stat-card"><Card.Body><div className="text-muted small">Total Modal</div><div className="fw-bold fs-4">{formatRupiah(totalInvested)}</div></Card.Body></Card></Col>
        <Col md={4}><Card className="stat-card"><Card.Body><div className="text-muted small">Nilai Saat Ini</div><div className="fw-bold fs-4 text-primary">{formatRupiah(totalCurrent)}</div></Card.Body></Card></Col>
        <Col md={4}><Card className="stat-card"><Card.Body><div className="text-muted small">Total Keuntungan / Rugi</div><div className={`fw-bold fs-4 ${totalProfit >= 0 ? "text-success" : "text-danger"}`}>{totalProfit >= 0 ? "+" : ""}{formatRupiah(totalProfit)}</div></Card.Body></Card></Col>
      </Row>

      <Card>
        <Card.Header className="bg-white"><strong>Portofolio Investasi ({investments.length})</strong></Card.Header>
        <Card.Body>
          {rows.length > 0 ? (
            <Table hover responsive className="align-middle">
              <thead>
                <tr><th>Nama</th><th>Jenis</th><th>Tanggal</th><th className="text-end">Modal</th><th className="text-end">Nilai Kini</th><th className="text-end">Untung/Rugi</th><th className="text-end">Aksi</th></tr>
              </thead>
              <tbody>
                {rows.slice().reverse().map((r) => (
                  <tr key={r.id}>
                    <td className="fw-semibold">{r.name}</td>
                    <td><Badge style={{ background: jenisColors[r.jenis] || "#6c757d" }}>{r.jenis}</Badge></td>
                    <td className="small">{r.date}</td>
                    <td className="text-end text-money">{formatRupiah(r.invested)}</td>
                    <td className="text-end text-money">{formatRupiah(r.current)}</td>
                    <td className={`text-end text-money fw-semibold ${r.profit >= 0 ? "text-success" : "text-danger"}`}>
                      {r.profit >= 0 ? "+" : ""}{formatRupiah(r.profit)} ({r.pct >= 0 ? "+" : ""}{r.pct}%)
                    </td>
                    <td className="text-end">
                      <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(r)}><i className="bi bi-pencil" /></Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(r.id)}><i className="bi bi-trash" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted py-5">Belum ada investasi</div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editing ? "Edit Investasi" : "Tambah Investasi"}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nama Investasi</Form.Label>
              <Form.Control type="text" name="name" value={form.name} placeholder="e.g. BBRI, Emas Antam" onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Jenis</Form.Label>
              <Form.Select name="jenis" value={form.jenis} onChange={handleChange}>
                {JENIS.map((j) => <option key={j} value={j}>{j}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal</Form.Label>
              <Form.Control type="date" name="date" value={form.date} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Modal Awal (Rp)</Form.Label>
              <Form.Control type="number" name="amount" value={form.amount} placeholder="0" onChange={handleChange} required min="0" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nilai Saat Ini (Rp)</Form.Label>
              <Form.Control type="number" name="currentValue" value={form.currentValue} placeholder="Kosongkan jika sama dengan modal" onChange={handleChange} min="0" />
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
