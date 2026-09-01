"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Form, Button, Badge, Modal } from "react-bootstrap";
import { getStorage, setStorage } from "@/lib/storage";
import { formatRupiah } from "@/lib/utils";

export default function LiburanPage() {
  const [logs, setLogs] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ destination: "", date: "", days: "", cost: "", notes: "" });

  useEffect(() => {
    setLogs(getStorage("travelLogs", []));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditing(null);
    setForm({ destination: "", date: new Date().toISOString().slice(0, 10), days: "", cost: "", notes: "" });
    setShowModal(true);
  };

  const openEdit = (l) => {
    setEditing(l.id);
    setForm({ ...l });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updated;
    const payload = { ...form, days: Number(form.days || 0), cost: Number(form.cost || 0) };
    if (editing) {
      updated = logs.map((l) => (l.id === editing ? { ...l, ...payload } : l));
    } else {
      updated = [...logs, { ...payload, id: Date.now().toString() }];
    }
    setLogs(updated);
    setStorage("travelLogs", updated);
    setShowModal(false);
  };

  const deleteLog = (id) => {
    const updated = logs.filter((l) => l.id !== id);
    setLogs(updated);
    setStorage("travelLogs", updated);
  };

  const totalTrips = logs.length;
  const totalDays = logs.reduce((s, l) => s + Number(l.days), 0);
  const totalCost = logs.reduce((s, l) => s + Number(l.cost), 0);

  const destinationColors = ["primary", "success", "warning", "danger", "info", "secondary"];

  return (
    <div>
      <div className="page-header">
        <span className="text-muted">Total liburan: <strong>{totalTrips}</strong></span>
        <Button variant="primary" onClick={openAdd}><i className="bi bi-plus-lg me-1" />Tambah Liburan</Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={4}><Card className="stat-card"><Card.Body><div className="text-muted small">Total Liburan</div><div className="fw-bold fs-4">✈️ {totalTrips}</div></Card.Body></Card></Col>
        <Col md={4}><Card className="stat-card"><Card.Body><div className="text-muted small">Total Hari</div><div className="fw-bold fs-4">{totalDays} hari</div></Card.Body></Card></Col>
        <Col md={4}><Card className="stat-card"><Card.Body><div className="text-muted small">Total Biaya</div><div className="fw-bold fs-4 text-danger">{formatRupiah(totalCost)}</div></Card.Body></Card></Col>
      </Row>

      <Row className="g-4">
        {logs.length > 0 ? (
          logs.slice().reverse().map((l, i) => (
            <Col md={6} lg={4} key={l.id}>
              <Card className="h-100 stat-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0"><i className="bi bi-geo-alt-fill me-1" style={{ color: "var(--bs-primary)" }} />{l.destination}</h5>
                    <span className="d-flex gap-1">
                      <Button size="sm" variant="outline-primary" onClick={() => openEdit(l)}><i className="bi bi-pencil" /></Button>
                      <Button size="sm" variant="outline-danger" onClick={() => deleteLog(l.id)}><i className="bi bi-trash" /></Button>
                    </span>
                  </div>
                  <div className="text-muted small mb-2">{l.date}</div>
                  <div className="d-flex gap-2 mb-2 flex-wrap">
                    <Badge bg="light" text="dark"><i className="bi bi-calendar me-1" />{l.days} hari</Badge>
                    <Badge bg="light" text="dark"><i className="bi bi-cash me-1" />{formatRupiah(l.cost)}</Badge>
                  </div>
                  {l.notes && <div className="small text-muted">{l.notes}</div>}
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col className="text-center text-muted py-5">Belum ada liburan tercatat</Col>
        )}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editing ? "Edit" : "Tambah"} Liburan</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Destinasi</Form.Label>
              <Form.Control type="text" name="destination" value={form.destination} placeholder="e.g. Bali, Jepang" onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal</Form.Label>
              <Form.Control type="date" name="date" value={form.date} onChange={handleChange} required />
            </Form.Group>
            <Row>
              <Col><Form.Group className="mb-3">
                <Form.Label>Lama (hari)</Form.Label>
                <Form.Control type="number" name="days" value={form.days} min="0" onChange={handleChange} />
              </Form.Group></Col>
              <Col><Form.Group className="mb-3">
                <Form.Label>Biaya (Rp)</Form.Label>
                <Form.Control type="number" name="cost" value={form.cost} min="0" onChange={handleChange} />
              </Form.Group></Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Catatan</Form.Label>
              <Form.Control as="textarea" rows={3} name="notes" value={form.notes} onChange={handleChange} />
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
