"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Form, Button, Badge, Modal } from "react-bootstrap";
import { getStorage, setStorage } from "@/lib/storage";
import { KATEGORI_MOTIVASI } from "@/lib/utils";

const catColors = {
  Kerja: "primary", Kehidupan: "success", Cinta: "danger", Disiplin: "warning", Semangat: "info", Lainnya: "secondary",
};

export default function MotivasiPage() {
  const [notes, setNotes] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ content: "", category: "Semangat" });
  const [filter, setFilter] = useState("all");
  const [showQuote, setShowQuote] = useState(false);
  const [randomQuote, setRandomQuote] = useState(null);

  useEffect(() => {
    setNotes(getStorage("motivations", []));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditing(null);
    setForm({ content: "", category: "Semangat" });
    setShowModal(true);
  };

  const openEdit = (n) => {
    setEditing(n.id);
    setForm({ content: n.content, category: n.category });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updated;
    if (editing) {
      updated = notes.map((n) => (n.id === editing ? { ...n, ...form } : n));
    } else {
      updated = [...notes, { ...form, date: new Date().toISOString().slice(0, 10), id: Date.now().toString() }];
    }
    setNotes(updated);
    setStorage("motivations", updated);
    setShowModal(false);
  };

  const deleteNote = (id) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    setStorage("motivations", updated);
  };

  const pickRandom = () => {
    if (notes.length === 0) return;
    setRandomQuote(notes[Math.floor(Math.random() * notes.length)]);
    setShowQuote(true);
  };

  const filtered = filter === "all" ? notes : notes.filter((n) => n.category === filter);

  return (
    <div>
      <div className="page-header">
        <div className="d-flex gap-2 align-items-center">
          <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 160 }}>
            <option value="all">Semua Kategori</option>
            {KATEGORI_MOTIVASI.map((c) => <option key={c} value={c}>{c}</option>)}
          </Form.Select>
          <Button variant="outline-warning" onClick={pickRandom}><i className="bi bi-shuffle me-1" />Quote Random</Button>
        </div>
        <Button variant="primary" onClick={openAdd}><i className="bi bi-plus-lg me-1" />Tambah Motivasi</Button>
      </div>

      {filtered.length > 0 ? (
        <Row className="g-4">
          {filtered.slice().reverse().map((n) => (
            <Col md={6} lg={4} key={n.id}>
              <Card className="h-100 stat-card">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg={catColors[n.category] || "secondary"}>{n.category}</Badge>
                    <span className="d-flex gap-1">
                      <Button size="sm" variant="outline-primary" onClick={() => openEdit(n)}><i className="bi bi-pencil" /></Button>
                      <Button size="sm" variant="outline-danger" onClick={() => deleteNote(n.id)}><i className="bi bi-trash" /></Button>
                    </span>
                  </div>
                  <blockquote className="blockquote mb-2 flex-grow-1">
                    <p className="mb-0" style={{ fontStyle: "italic" }}>"{n.content}"</p>
                  </blockquote>
                  <div className="small text-muted align-self-end">{n.date}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center text-muted py-5">
          <i className="bi bi-lightbulb fs-1 d-block mb-2" />
          Belum ada catatan motivasi
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editing ? "Edit" : "Tambah"} Motivasi</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Kategori</Form.Label>
              <Form.Select name="category" value={form.category} onChange={handleChange}>
                {KATEGORI_MOTIVASI.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Isi Motivasi</Form.Label>
              <Form.Control as="textarea" rows={4} name="content" value={form.content} placeholder="Tulis kata-kata motivasi untuk hidupmu..." onChange={handleChange} required />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
              <Button type="submit" variant="primary">Simpan</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showQuote} onHide={() => setShowQuote(false)}>
        <Modal.Header closeButton><Modal.Title><i className="bi bi-lightbulb me-1" />Motivasi Untukmu</Modal.Title></Modal.Header>
        <Modal.Body>
          {randomQuote && (
            <div className="text-center py-4">
              <i className="bi bi-quote fs-1 text-primary d-block mb-3" />
              <blockquote className="blockquote mb-3">
                <p className="fs-5" style={{ fontStyle: "italic" }}>"{randomQuote.content}"</p>
              </blockquote>
              <Badge bg={catColors[randomQuote.category] || "secondary"}>{randomQuote.category}</Badge>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
