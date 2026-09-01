"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Form, Button, Badge, Modal } from "react-bootstrap";
import { getStorage, setStorage } from "@/lib/storage";
import { KATEGORI_SASTRA } from "@/lib/utils";

const catColors = {
  Puisi: "primary", Cerpen: "success", Prosa: "warning", "Pesan": "danger", Lainnya: "secondary",
};

const catIcons = {
  Puisi: "bi-palette", Cerpen: "bi-book", Prosa: "bi-journal-richtext", "Pesan": "bi-chat-square-quote", Lainnya: "bi-pencil-square",
};

export default function SastraPage() {
  const [works, setWorks] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", category: "Puisi", content: "" });
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState(null);

  useEffect(() => {
    setWorks(getStorage("literature", []));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", category: "Puisi", content: "" });
    setShowModal(true);
  };

  const openEdit = (w) => {
    setEditing(w.id);
    setForm({ title: w.title, category: w.category, content: w.content });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updated;
    if (editing) {
      updated = works.map((w) => (w.id === editing ? { ...w, ...form } : w));
    } else {
      updated = [...works, { ...form, date: new Date().toISOString().slice(0, 10), id: Date.now().toString() }];
    }
    setWorks(updated);
    setStorage("literature", updated);
    setShowModal(false);
  };

  const deleteWork = (id) => {
    const updated = works.filter((w) => w.id !== id);
    setWorks(updated);
    setStorage("literature", updated);
    if (view && view.id === id) setView(null);
  };

  const filtered = filter === "all" ? works : works.filter((w) => w.category === filter);

  return (
    <div>
      <div className="page-header">
        <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 160 }}>
          <option value="all">Semua Kategori</option>
          {KATEGORI_SASTRA.map((c) => <option key={c} value={c}>{c}</option>)}
        </Form.Select>
        <Button variant="primary" onClick={openAdd}><i className="bi bi-plus-lg me-1" />Tulis Karya</Button>
      </div>

      {filtered.length > 0 ? (
        <Row className="g-4">
          {filtered.slice().reverse().map((w) => (
            <Col md={6} lg={4} key={w.id}>
              <Card className="h-100 stat-card">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge bg={catColors[w.category] || "secondary"}><i className={`bi ${catIcons[w.category] || "bi-pencil-square"} me-1`} />{w.category}</Badge>
                    <span className="d-flex gap-1">
                      <Button size="sm" variant="outline-primary" onClick={() => openEdit(w)}><i className="bi bi-pencil" /></Button>
                      <Button size="sm" variant="outline-danger" onClick={() => deleteWork(w.id)}><i className="bi bi-trash" /></Button>
                    </span>
                  </div>
                  <h5 className="card-title">{w.title}</h5>
                  <p className="card-text small text-muted flex-grow-1" style={{ whiteSpace: "pre-line" }}>
                    {w.content.length > 120 ? w.content.slice(0, 120) + "..." : w.content}
                  </p>
                  {w.content.length > 120 && (
                    <Button size="sm" variant="link" className="p-0 align-self-start" onClick={() => setView(w)}>Baca selengkapnya</Button>
                  )}
                  <div className="small text-muted align-self-end mt-2">{w.date}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center text-muted py-5">
          <i className="bi bi-pencil-square fs-1 d-block mb-2" />
          Belum ada karya sastra
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>{editing ? "Edit" : "Tulis"} Karya</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Judul</Form.Label>
              <Form.Control type="text" name="title" value={form.title} placeholder="Judul karya" onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kategori</Form.Label>
              <Form.Select name="category" value={form.category} onChange={handleChange}>
                {KATEGORI_SASTRA.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Isi Karya</Form.Label>
              <Form.Control as="textarea" rows={10} name="content" value={form.content} placeholder="Tulis puisi, cerpen, atau prosa-mu di sini..." onChange={handleChange} required style={{ fontFamily: "Georgia, serif" }} />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
              <Button type="submit" variant="primary">Simpan</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={!!view} onHide={() => setView(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {view && (
              <>
                {view.title}
                <Badge bg={catColors[view.category] || "secondary"} className="ms-2">{view.category}</Badge>
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {view && (
            <div style={{ whiteSpace: "pre-line", fontFamily: "Georgia, serif", lineHeight: 1.8 }}>
              {view.content}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
