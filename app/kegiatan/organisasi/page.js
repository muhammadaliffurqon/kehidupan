"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Table, Form, Button, Badge, Modal } from "react-bootstrap";
import { getStorage, setStorage } from "@/lib/storage";

export default function OrganisasiPage() {
  const [logs, setLogs] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", organ: "", date: "", role: "", type: "Rapat", description: "" });

  useEffect(() => {
    setLogs(getStorage("orgLogs", []));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", organ: "", date: new Date().toISOString().slice(0, 10), role: "", type: "Rapat", description: "" });
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
    if (editing) {
      updated = logs.map((l) => (l.id === editing ? { ...l, ...form } : l));
    } else {
      updated = [...logs, { ...form, id: Date.now().toString() }];
    }
    setLogs(updated);
    setStorage("orgLogs", updated);
    setShowModal(false);
  };

  const deleteLog = (id) => {
    const updated = logs.filter((l) => l.id !== id);
    setLogs(updated);
    setStorage("orgLogs", updated);
  };

  const types = ["Rapat", "Event", "Latihan", "Koordinasi", "Lainnya"];
  const typeColors = { Rapat: "primary", Event: "success", Latihan: "warning", Koordinasi: "info", Lainnya: "secondary" };

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="text-muted">Total kegiatan: <strong>{logs.length}</strong></span>
        </div>
        <Button variant="primary" onClick={openAdd}><i className="bi bi-plus-lg me-1" />Tambah Kegiatan</Button>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-white"><strong>Log Kegiatan Organisasi</strong></Card.Header>
            <Card.Body>
              {logs.length > 0 ? (
                <Table hover responsive className="align-middle">
                  <thead><tr><th>Tanggal</th><th>Kegiatan</th><th>Organisasi</th><th>Tipe</th><th>Peran</th><th className="text-end">Aksi</th></tr></thead>
                  <tbody>
                    {logs.slice().reverse().map((l) => (
                      <tr key={l.id}>
                        <td className="small">{l.date}</td>
                        <td className="fw-semibold">{l.title}{l.description && <div className="small text-muted fw-normal">{l.description}</div>}</td>
                        <td>{l.organ}</td>
                        <td><Badge bg={typeColors[l.type] || "secondary"}>{l.type}</Badge></td>
                        <td>{l.role}</td>
                        <td className="text-end">
                          <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(l)}><i className="bi bi-pencil" /></Button>
                          <Button size="sm" variant="outline-danger" onClick={() => deleteLog(l.id)}><i className="bi bi-trash" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center text-muted py-5">Belum ada kegiatan organisasi</div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Header className="bg-white"><strong>Statistik</strong></Card.Header>
            <Card.Body>
              <Row className="g-2">
                {types.map((t) => {
                  const count = logs.filter((l) => l.type === t).length;
                  return (
                    <Col xs={6} key={t}>
                      <div className="border rounded p-3 text-center">
                        <div className="fs-4 fw-bold">{count}</div>
                        <div className="small text-muted">{t}</div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editing ? "Edit" : "Tambah"} Kegiatan</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nama Kegiatan</Form.Label>
              <Form.Control type="text" name="title" value={form.title} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Organisasi</Form.Label>
              <Form.Control type="text" name="organ" value={form.organ} placeholder="Nama organisasi" onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal</Form.Label>
              <Form.Control type="date" name="date" value={form.date} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipe</Form.Label>
              <Form.Select name="type" value={form.type} onChange={handleChange}>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Peran</Form.Label>
              <Form.Control type="text" name="role" value={form.role} placeholder="e.g. Panitia, Koordinator" onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Deskripsi</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange} />
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
