"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Table, Form, Button, Badge, Modal } from "react-bootstrap";
import { getStorage, setStorage } from "@/lib/storage";
import { formatRupiah } from "@/lib/utils";

export default function HutangPage() {
  const [debts, setDebts] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type: "hutang", name: "", amount: "", note: "", dueDate: "", settled: false });

  useEffect(() => {
    setDebts(getStorage("debts", []));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditing(null);
    setForm({ type: "hutang", name: "", amount: "", note: "", dueDate: "", settled: false });
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditing(d.id);
    setForm({ type: d.type, name: d.name, amount: d.amount, note: d.note, dueDate: d.dueDate, settled: d.settled });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updated;
    const payload = { ...form, amount: Number(form.amount), settled: form.settled === true || form.settled === "true" };
    if (editing) {
      updated = debts.map((d) => (d.id === editing ? { ...d, ...payload } : d));
    } else {
      updated = [...debts, { ...payload, id: Date.now().toString() }];
    }
    setDebts(updated);
    setStorage("debts", updated);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    const updated = debts.filter((d) => d.id !== id);
    setDebts(updated);
    setStorage("debts", updated);
  };

  const toggleSettled = (d) => {
    const updated = debts.map((x) => (x.id === d.id ? { ...x, settled: !x.settled } : x));
    setDebts(updated);
    setStorage("debts", updated);
  };

  const totalHutang = debts.filter((d) => d.type === "hutang" && !d.settled).reduce((s, d) => s + Number(d.amount), 0);
  const totalPiutang = debts.filter((d) => d.type === "piutang" && !d.settled).reduce((s, d) => s + Number(d.amount), 0);

  return (
    <div>
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="stat-card"><Card.Body>
            <div className="text-muted small">Total Hutang Aktif</div>
            <div className="fw-bold fs-4 text-danger">{formatRupiah(totalHutang)}</div>
          </Card.Body></Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card"><Card.Body>
            <div className="text-muted small">Total Piutang Aktif</div>
            <div className="fw-bold fs-4 text-success">{formatRupiah(totalPiutang)}</div>
          </Card.Body></Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card"><Card.Body>
            <div className="text-muted small">Total Transaksi</div>
            <div className="fw-bold fs-4">{debts.length}</div>
          </Card.Body></Card>
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Button variant="primary" className="w-100" onClick={openAdd}><i className="bi bi-plus-lg me-1" />Tambah</Button>
        </Col>
      </Row>

      <Card>
        <Card.Header className="bg-white"><strong>Daftar Hutang & Piutang</strong></Card.Header>
        <Card.Body>
          {debts.length > 0 ? (
            <Table hover responsive className="align-middle">
              <thead>
                <tr><th>Tipe</th><th>Dengan</th><th className="text-end">Jumlah</th><th>Jatuh Tempo</th><th>Catatan</th><th>Status</th><th className="text-end">Aksi</th></tr>
              </thead>
              <tbody>
                {debts.slice().reverse().map((d) => (
                  <tr key={d.id} className={d.settled ? "opacity-50" : ""}>
                    <td><Badge bg={d.type === "hutang" ? "danger" : "success"}>{d.type === "hutang" ? "Hutang" : "Piutang"}</Badge></td>
                    <td className="fw-semibold">{d.name}</td>
                    <td className="text-end text-money">{formatRupiah(d.amount)}</td>
                    <td className="small">{d.dueDate || "-"}</td>
                    <td className="small text-muted">{d.note || "-"}</td>
                    <td><Button size="sm" variant={d.settled ? "success" : "outline-secondary"} onClick={() => toggleSettled(d)}>{d.settled ? "Lunas" : "Belum"}</Button></td>
                    <td className="text-end">
                      <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(d)}><i className="bi bi-pencil" /></Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(d.id)}><i className="bi bi-trash" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted py-5">Belum ada data hutang/piutang</div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editing ? "Edit" : "Tambah"} Hutang / Piutang</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tipe</Form.Label>
              <Form.Select name="type" value={form.type} onChange={handleChange}>
                <option value="hutang">Hutang (Saya berhutang)</option>
                <option value="piutang">Piutang (Orang berhutang ke saya)</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nama</Form.Label>
              <Form.Control type="text" name="name" value={form.name} placeholder="Nama orang / lembaga" onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Jumlah (Rp)</Form.Label>
              <Form.Control type="number" name="amount" value={form.amount} placeholder="0" onChange={handleChange} required min="0" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Jatuh Tempo</Form.Label>
              <Form.Control type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Catatan</Form.Label>
              <Form.Control type="text" name="note" value={form.note} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" name="settled" label="Sudah Lunas" checked={form.settled === true || form.settled === "true"} onChange={(e) => setForm({ ...form, settled: e.target.checked })} />
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
