"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Form, Button, Badge, ListGroup, ProgressBar, Modal } from "react-bootstrap";
import { getStorage, setStorage } from "@/lib/storage";

const TYPES = ["Course", "Buku", "Skill", "Bahasa", "Lainnya"];
const typeColors = { Course: "primary", Buku: "success", Skill: "warning", Bahasa: "info", Lainnya: "secondary" };

export default function BelajarPage() {
  const [logs, setLogs] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", type: "Course", date: "", progress: 0, review: "" });

  useEffect(() => {
    setLogs(getStorage("learningLogs", []));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", type: "Course", date: new Date().toISOString().slice(0, 10), progress: 0, review: "" });
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
    const payload = { ...form, progress: Number(form.progress || 0) };
    if (editing) {
      updated = logs.map((l) => (l.id === editing ? { ...l, ...payload } : l));
    } else {
      updated = [...logs, { ...payload, id: Date.now().toString() }];
    }
    setLogs(updated);
    setStorage("learningLogs", updated);
    setShowModal(false);
  };

  const deleteLog = (id) => {
    const updated = logs.filter((l) => l.id !== id);
    setLogs(updated);
    setStorage("learningLogs", updated);
  };

  const avgProgress = logs.length > 0 ? Math.round(logs.reduce((s, l) => s + Number(l.progress), 0) / logs.length) : 0;
  const completed = logs.filter((l) => Number(l.progress) >= 100).length;

  return (
    <div>
      <div className="page-header">
        <Button variant="primary" onClick={openAdd}><i className="bi bi-plus-lg me-1" />Tambah Belajar</Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={4}><Card className="stat-card"><Card.Body><div className="text-muted small">Total Hal Baru</div><div className="fw-bold fs-4">{logs.length}</div></Card.Body></Card></Col>
        <Col md={4}><Card className="stat-card"><Card.Body><div className="text-muted small">Rata-rata Progress</div><div className="fw-bold fs-4">{avgProgress}%</div></Card.Body></Card></Col>
        <Col md={4}><Card className="stat-card"><Card.Body><div className="text-muted small">Selesai</div><div className="fw-bold fs-4 text-success">{completed}</div></Card.Body></Card></Col>
      </Row>

      <Card>
        <Card.Header className="bg-white"><strong>Log Belajar</strong></Card.Header>
        <Card.Body>
          {logs.length > 0 ? (
            <ListGroup variant="flush">
              {logs.slice().reverse().map((l) => (
                <ListGroup.Item key={l.id} className="py-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1 me-3">
                      <div className="fw-semibold">{l.title} <Badge bg={typeColors[l.type] || "secondary"} className="ms-2">{l.type}</Badge></div>
                      <div className="small text-muted">{l.date}</div>
                      {l.review && <div className="small mt-1"><i className="bi bi-chat-quote me-1" />{l.review}</div>}
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <ProgressBar now={Math.min(Number(l.progress), 100)} label={`${l.progress}%`} variant={l.progress >= 100 ? "success" : "primary"} className="flex-grow-1" style={{ maxWidth: 300, height: 8 }} />
                      </div>
                    </div>
                    <div className="d-flex gap-1">
                      <Button size="sm" variant="outline-primary" onClick={() => openEdit(l)}><i className="bi bi-pencil" /></Button>
                      <Button size="sm" variant="outline-danger" onClick={() => deleteLog(l.id)}><i className="bi bi-trash" /></Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center text-muted py-5">Belum ada log belajar</div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editing ? "Edit" : "Tambah"} Belajar</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Judul / Materi</Form.Label>
              <Form.Control type="text" name="title" value={form.title} placeholder="e.g. React.js, Atomic Habits" onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipe</Form.Label>
              <Form.Select name="type" value={form.type} onChange={handleChange}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal Mulai</Form.Label>
              <Form.Control type="date" name="date" value={form.date} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Progress (%)</Form.Label>
              <Form.Range name="progress" value={form.progress} min="0" max="100" onChange={handleChange} />
              <div className="text-end small fw-semibold">{form.progress}%</div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Review / Catatan</Form.Label>
              <Form.Control as="textarea" rows={3} name="review" value={form.review} onChange={handleChange} />
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
