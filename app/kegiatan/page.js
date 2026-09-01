"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Badge, ProgressBar, ListGroup } from "react-bootstrap";
import { Bar, Line } from "react-chartjs-2";
import StatCard from "@/components/StatCard";
import { getStorage } from "@/lib/storage";
import { todayISO } from "@/lib/utils";

export default function KegiatanSummaryPage() {
  const [tasks, setTasks] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [orgLogs, setOrgLogs] = useState([]);
  const [travelLogs, setTravelLogs] = useState([]);
  const [learningLogs, setLearningLogs] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTasks(getStorage("tasks", []));
    setTimeLogs(getStorage("timeLogs", []));
    setOrgLogs(getStorage("orgLogs", []));
    setTravelLogs(getStorage("travelLogs", []));
    setLearningLogs(getStorage("learningLogs", []));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-5"><i className="bi bi-hourglass-split text-muted fs-1" /></div>;

  const today = todayISO();
  const todaysTasks = tasks.filter((t) => t.date === today);
  const done = todaysTasks.filter((t) => t.completed).length;
  const productivity = todaysTasks.length > 0 ? Math.round((done / todaysTasks.length) * 100) : 0;

  const totalHoursToday = timeLogs
    .filter((l) => l.date === today)
    .reduce((s, l) => s + (l.hours || 0), 0);

  const totalHoursAll = timeLogs.reduce((s, l) => s + (l.hours || 0), 0);

  // Bar productivity per day this week
  const weekDays = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    weekDays.push(d.toISOString().slice(0, 10));
  }
  const weekLabels = weekDays.map((d) =>
    new Date(d + "T00:00:00").toLocaleDateString("id-ID", { weekday: "short" })
  );
  const weekHours = weekDays.map((d) =>
    timeLogs.filter((l) => l.date === d).reduce((s, l) => s + (l.hours || 0), 0)
  );

  return (
    <div>
      <Row className="g-3 mb-4">
        <Col md={3}>
          <StatCard icon="bi-check2-square" color="#0d6efd" bg="#e7f1ff" title="Task Hari Ini" value={`${done}/${todaysTasks.length}`} subtitle="selesai/total" />
        </Col>
        <Col md={3}>
          <StatCard icon="bi-trophy" color="#fd7e14" bg="#fff3e6" title="Skor Produktivitas" value={`${productivity}%`} subtitle="hari ini" />
        </Col>
        <Col md={3}>
          <StatCard icon="bi-clock-history" color="#6f42c1" bg="#f0eaff" title="Jam Kerja Hari Ini" value={`${totalHoursToday} jam`} />
        </Col>
        <Col md={3}>
          <StatCard icon="bi-clock" color="#dc3545" bg="#fde7e9" title="Total Jam Kerja" value={`${totalHoursAll} jam`} subtitle="semua waktu" />
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={7}>
          <Card className="h-100">
            <Card.Header className="bg-white"><strong>Jam Kerja 7 Hari Terakhir</strong></Card.Header>
            <Card.Body>
              <div className="chart-container" style={{ height: 260 }}>
                <Bar
                  data={{
                    labels: weekLabels,
                    datasets: [{
                      label: "Jam", data: weekHours, backgroundColor: "#0d6efd", borderRadius: 6,
                    }],
                  }}
                  options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="h-100">
            <Card.Header className="bg-white"><strong>Produktivitas Hari Ini</strong></Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="text-center mb-3">
                <div className="display-3 fw-bold" style={{ color: productivity >= 70 ? "#198754" : productivity >= 40 ? "#fd7e14" : "#dc3545" }}>
                  {productivity}%
                </div>
                <div className="text-muted">Skor Produktivitas</div>
              </div>
              <ProgressBar now={productivity} variant={productivity >= 70 ? "success" : productivity >= 40 ? "warning" : "danger"} label={`${productivity}%`} />
              <div className="text-muted small mt-3 text-center">
                {productivity >= 70 ? "Produktivitas sangat baik! 💪" : productivity >= 40 ? "Cukup baik, tingkatkan lagi!" : "Perlu lebih semangat hari ini!"}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="bg-white"><strong>Log Organisasi Terbaru ({orgLogs.length})</strong></Card.Header>
            <Card.Body>
              {orgLogs.length > 0 ? (
                <ListGroup variant="flush">
                  {orgLogs.slice(-4).reverse().map((l, i) => (
                    <ListGroup.Item key={i}>
                      <div className="d-flex justify-content-between">
                        <strong>{l.title}</strong>
                        <small className="text-muted">{l.date}</small>
                      </div>
                      <small className="text-muted">{l.organ}</small>
                      {l.description && <div className="small mt-1">{l.description}</div>}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center text-muted py-4">Belum ada kegiatan organisasi</div>
              )}
              <a href="/kegiatan/organisasi" className="small text-primary">Lihat semua</a>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="bg-white"><strong>Log Belajar Terbaru ({learningLogs.length})</strong></Card.Header>
            <Card.Body>
              {learningLogs.length > 0 ? (
                <ListGroup variant="flush">
                  {learningLogs.slice(-4).reverse().map((l, i) => (
                    <ListGroup.Item key={i}>
                      <div className="d-flex justify-content-between">
                        <strong>{l.title}</strong>
                        <small className="text-muted">{l.date}</small>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <ProgressBar now={l.progress || 0} className="flex-grow-1" style={{ height: 6 }} />
                        <small className="text-muted">{l.progress || 0}%</small>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center text-muted py-4">Belum ada log belajar</div>
              )}
              <a href="/kegiatan/belajar" className="small text-primary">Lihat semua</a>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="bg-white"><strong>Log Liburan ({travelLogs.length})</strong></Card.Header>
            <Card.Body>
              {travelLogs.length > 0 ? (
                <ListGroup variant="flush">
                  {travelLogs.slice(-4).reverse().map((l, i) => (
                    <ListGroup.Item key={i}>
                      <div className="d-flex justify-content-between">
                        <strong>✈️ {l.destination}</strong>
                        <small className="text-muted">{l.date}</small>
                      </div>
                      <small className="text-muted">{l.notes}</small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center text-muted py-4">Belum ada log liburan</div>
              )}
              <a href="/kegiatan/liburan" className="small text-primary">Lihat semua</a>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="bg-white"><strong>Kategori Task Hari Ini</strong></Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                {(todaysTasks.length > 0 ? todaysTasks : []).map((t, i) => (
                  <Badge key={i} bg="light" text="dark" className="px-3 py-2">
                    <i className={`bi ${t.completed ? "bi-check-circle-fill text-success" : "bi-circle text-muted"} me-1`} />
                    {t.title}
                  </Badge>
                ))}
              </div>
              <a href="/kegiatan/task" className="small text-primary d-block mt-3">Kelola task</a>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
