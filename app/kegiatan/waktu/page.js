"use client";

import { useEffect, useState, useRef } from "react";
import { Row, Col, Card, Table, Form, Button, Badge } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { getStorage, setStorage } from "@/lib/storage";
import { todayISO } from "@/lib/utils";

export default function WaktuPage() {
  const [timeLogs, setTimeLogs] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ date: todayISO(), activity: "", hours: "" });
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  const [editing, setEditing] = useState(null);
  const [editHours, setEditHours] = useState("");

  useEffect(() => {
    setTimeLogs(getStorage("timeLogs", []));
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const startTimer = () => {
    setRunning(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stopTimer = () => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const hours = Math.round((seconds / 3600) * 100) / 100;
    if (hours > 0) {
      setForm((f) => ({ ...f, hours: hours.toFixed(2) }));
    }
    setSeconds(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updated;
    if (editing) {
      updated = timeLogs.map((l) => (l.id === editing ? { ...l, ...form, hours: Number(form.hours) } : l));
    } else {
      updated = [...timeLogs, { ...form, hours: Number(form.hours), id: Date.now().toString() }];
    }
    setTimeLogs(updated);
    setStorage("timeLogs", updated);
    setEditing(null);
    setForm({ date: todayISO(), activity: "", hours: "" });
  };

  const deleteLog = (id) => {
    const updated = timeLogs.filter((l) => l.id !== id);
    setTimeLogs(updated);
    setStorage("timeLogs", updated);
  };

  const totalHours = timeLogs.reduce((s, l) => s + Number(l.hours), 0);
  const today = todayISO();
  const todayHours = timeLogs.filter((l) => l.date === today).reduce((s, l) => s + Number(l.hours), 0);

  const weekDays = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    weekDays.push(d.toISOString().slice(0, 10));
  }
  const weekLabels = weekDays.map((d) => new Date(d + "T00:00:00").toLocaleDateString("id-ID", { weekday: "short" }));
  const weekData = weekDays.map((d) => timeLogs.filter((l) => l.date === d).reduce((s, l) => s + Number(l.hours), 0));

  const fmtTime = () => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div>
      <Row className="g-4">
        <Col lg={4}>
          <Card className="mb-4 text-center">
            <Card.Header className="bg-white"><strong>Stopwatch Timer</strong></Card.Header>
            <Card.Body>
              <div className="display-4 fw-bold mb-3" style={{ fontVariantNumeric: "tabular-nums" }}>{fmtTime()}</div>
              {!running ? (
                <Button variant={seconds > 0 ? "warning" : "primary"} onClick={seconds > 0 ? stopTimer : startTimer} className="w-100">
                  <i className={`bi ${seconds > 0 ? "bi-stop-fill" : "bi-play-fill"} me-1`} />{seconds > 0 ? "Stop & Simpan" : "Mulai"}
                </Button>
              ) : (
                <Button variant="danger" onClick={stopTimer} className="w-100"><i className="bi bi-stop-fill me-1" />Stop</Button>
              )}
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="bg-white"><strong>{editing ? "Edit Log" : "Tambah Log Waktu"}</strong></Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Tanggal</Form.Label>
                  <Form.Control type="date" name="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Aktivitas</Form.Label>
                  <Form.Control type="text" name="activity" value={form.activity} placeholder="e.g. Kerja proyek, Meeting" onChange={(e) => setForm({ ...form, activity: e.target.value })} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Jam (desimal)</Form.Label>
                  <Form.Control type="number" name="hours" value={form.hours} placeholder="e.g. 2.5" step="0.01" min="0" onChange={(e) => setForm({ ...form, hours: e.target.value })} required />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100">{editing ? "Simpan" : "Tambah"}</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Row className="g-3 mb-4">
            <Col md={4}><Card className="stat-card"><Card.Body><div className="text-muted small">Jam Hari Ini</div><div className="fw-bold fs-4">{todayHours} jam</div></Card.Body></Card></Col>
            <Col md={4}><Card className="stat-card"><Card.Body><div className="text-muted small">Total Jam</div><div className="fw-bold fs-4">{totalHours} jam</div></Card.Body></Card></Col>
            <Col md={4}><Card className="stat-card"><Card.Body><div className="text-muted small">Log</div><div className="fw-bold fs-4">{timeLogs.length}</div></Card.Body></Card></Col>
          </Row>
          <Card className="mb-4">
            <Card.Header className="bg-white"><strong>Jam Kerja 7 Hari Terakhir</strong></Card.Header>
            <Card.Body>
              <div className="chart-container" style={{ height: 220 }}>
                <Bar
                  data={{
                    labels: weekLabels,
                    datasets: [{ label: "Jam", data: weekData, backgroundColor: "#0d6efd", borderRadius: 6 }],
                  }}
                  options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                />
              </div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="bg-white"><strong>Riwayat Waktu</strong></Card.Header>
            <Card.Body>
              {timeLogs.length > 0 ? (
                <Table hover responsive className="align-middle">
                  <thead><tr><th>Tanggal</th><th>Aktivitas</th><th className="text-end">Jam</th><th className="text-end">Aksi</th></tr></thead>
                  <tbody>
                    {timeLogs.slice().reverse().map((l) => (
                      <tr key={l.id}>
                        <td className="small">{l.date}</td>
                        <td>{l.activity}</td>
                        <td className="text-end"><Badge bg="primary">{l.hours} jam</Badge></td>
                        <td className="text-end">
                          <Button size="sm" variant="outline-primary" className="me-1" onClick={() => { setEditing(l.id); setForm({ date: l.date, activity: l.activity, hours: l.hours }); }}><i className="bi bi-pencil" /></Button>
                          <Button size="sm" variant="outline-danger" onClick={() => deleteLog(l.id)}><i className="bi bi-trash" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center text-muted py-5">Belum ada log waktu</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
