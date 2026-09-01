"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Form, Button, Badge, ListGroup, ProgressBar } from "react-bootstrap";
import { getStorage, setStorage } from "@/lib/storage";
import { todayISO } from "@/lib/utils";

const TODAY = todayISO();

export default function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [date, setDate] = useState(TODAY);
  const [form, setForm] = useState({ title: "", priority: "sedang", category: "Kerja" });

  useEffect(() => {
    setTasks(getStorage("tasks", []));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const dayTasks = tasks.filter((t) => t.date === date);
  const done = dayTasks.filter((t) => t.completed).length;
  const pct = dayTasks.length > 0 ? Math.round((done / dayTasks.length) * 100) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const updated = [...tasks, { ...form, date, completed: false, id: Date.now().toString() }];
    setTasks(updated);
    setStorage("tasks", updated);
    setForm({ title: "", priority: "sedang", category: "Kerja" });
  };

  const toggle = (id) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    setStorage("tasks", updated);
  };

  const remove = (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    setStorage("tasks", updated);
  };

  const priorityColor = (p) => (p === "tinggi" ? "danger" : p === "sedang" ? "warning" : "secondary");

  return (
    <div>
      <Row className="g-4">
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header className="bg-white"><strong>Pilih Tanggal</strong></Card.Header>
            <Card.Body>
              <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="bg-white"><strong>Tambah Task</strong></Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Aktivitas</Form.Label>
                  <Form.Control type="text" value={form.title} placeholder="e.g. Presentasi di meeting" onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Kategori</Form.Label>
                  <Form.Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option>Kerja</option><option>Organisasi</option><option>Belajar</option><option>Pribadi</option><option>Liburan</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Prioritas</Form.Label>
                  <Form.Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="tinggi">Tinggi</option><option value="sedang">Sedang</option><option value="rendah">Rendah</option>
                  </Form.Select>
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100"><i className="bi bi-plus-lg me-1" />Tambah Task</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <strong>Task - {new Date(date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</strong>
              <span className="text-muted small">{done}/{dayTasks.length} selesai</span>
            </Card.Header>
            <Card.Body>
              {dayTasks.length > 0 && (
                <ProgressBar now={pct} variant={pct >= 70 ? "success" : pct >= 40 ? "warning" : "danger"} label={`${pct}%`} className="mb-3" />
              )}
              {dayTasks.length > 0 ? (
                <ListGroup variant="flush">
                  {dayTasks.map((t) => (
                    <ListGroup.Item key={t.id} className="d-flex align-items-center gap-3 py-3">
                      <button onClick={() => toggle(t.id)} className="btn btn-link p-0 fs-4 text-decoration-none">
                        <i className={`bi ${t.completed ? "bi-check-circle-fill text-success" : "bi-circle text-muted"}`} />
                      </button>
                      <div className={`flex-grow-1 ${t.completed ? "text-decoration-line-through text-muted" : ""}`}>
                        <div className="fw-semibold">{t.title}</div>
                        <div className="d-flex gap-2 mt-1">
                          <Badge bg="light" text="dark">{t.category}</Badge>
                          <Badge bg={priorityColor(t.priority)}>{t.priority}</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline-danger" onClick={() => remove(t.id)}><i className="bi bi-trash" /></Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center text-muted py-5">Belum ada task untuk tanggal ini</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
