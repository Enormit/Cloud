import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  BookOpen,
  Award,
  Plus,
  Trash2,
  Edit,
  Mail,
  Send,
  CheckCircle,
  Clock,
  Eye,
  X,
  Server,
  Activity,
  Layers,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { api } from "../api";

export default function AdminDashboard({ onShowToast }) {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals & Panels
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [selectedRosterCourse, setSelectedRosterCourse] = useState(null);
  const [rosterData, setRosterData] = useState(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  // Email Test
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [testEmailSending, setTestEmailSending] = useState(false);

  // New Course Form State
  const [newCourse, setNewCourse] = useState({
    code: "",
    name: "",
    credits: 3,
    department: "Khoa CNTT",
    instructor: "",
    schedule_day: "Thứ 2",
    schedule_periods: "1-3",
    room: "P.A101",
    max_capacity: 45,
    prerequisites: "Không",
    description: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes] = await Promise.all([
        api.getAdminStats(),
        api.getCourses(),
      ]);
      setStats(statsRes);
      setCourses(coursesRes);
    } catch (err) {
      onShowToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.createCourse(newCourse);
      onShowToast("success", `Đã tạo môn học ${newCourse.code} thành công!`);
      setShowAddCourse(false);
      setNewCourse({
        code: "",
        name: "",
        credits: 3,
        department: "Khoa CNTT",
        instructor: "",
        schedule_day: "Thứ 2",
        schedule_periods: "1-3",
        room: "P.A101",
        max_capacity: 45,
        prerequisites: "Không",
        description: "",
      });
      loadData();
    } catch (err) {
      onShowToast("error", err.message);
    }
  };

  const handleDeleteCourse = async (courseId, courseCode) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa môn học ${courseCode}?`)) return;
    try {
      await api.deleteCourse(courseId);
      onShowToast("success", `Đã xóa thành công môn học ${courseCode}`);
      loadData();
    } catch (err) {
      onShowToast("error", err.message);
    }
  };

  const handleViewRoster = async (course) => {
    setSelectedRosterCourse(course);
    setRosterLoading(true);
    try {
      const data = await api.getCourseRoster(course.id);
      setRosterData(data);
    } catch (err) {
      onShowToast("error", err.message);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailRecipient) return;
    setTestEmailSending(true);
    try {
      const res = await api.sendTestEmail(
        testEmailRecipient,
        "Thử nghiệm hệ thống gửi mail từ Ban Quản Trị Hệ Thống",
        "Chào bạn, đây là email kiểm tra dịch vụ Google Mail Lambda Worker qua Interface VPC Endpoint."
      );
      onShowToast("success", res.message || "Email thử nghiệm đã được gửi thành công!");
      setTestEmailRecipient("");
    } catch (err) {
      onShowToast("error", err.message);
    } finally {
      setTestEmailSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Panel */}
      <div
        className="glass-panel"
        style={{
          padding: "24px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fbbf24",
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
                Bảng Quản Trị Hệ Thống Đào Tạo
              </h2>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  color: "#34d399",
                  fontSize: "11px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                }}
              >
                ADMIN ACCESS
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
              Giám sát tình trạng đăng ký, quản lý danh mục học phần và kiểm tra điều phối dịch vụ Lambda Email.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary"
            style={{ fontSize: "13px", padding: "8px 14px" }}
          >
            Làm mới số liệu
          </button>
          <button
            id="admin-add-course-btn"
            onClick={() => setShowAddCourse(true)}
            className="btn btn-primary"
            style={{ fontSize: "13px", padding: "8px 16px" }}
          >
            <Plus size={16} />
            Thêm học phần mới
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: "20px 24px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
              Tổng sinh viên
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(56, 189, 248, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#38bdf8",
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: "30px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            {stats?.total_students || 0}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Tài khoản sinh viên đang hoạt động
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: "20px 24px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
              Tổng số học phần
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(167, 139, 250, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a78bfa",
              }}
            >
              <BookOpen size={18} />
            </div>
          </div>
          <div style={{ fontSize: "30px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            {stats?.total_courses || courses.length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Lớp học phần mở trong học kỳ này
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: "20px 24px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
              Lượt đăng ký thành công
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(52, 211, 153, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#34d399",
              }}
            >
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: "30px", fontWeight: 800, color: "#34d399", letterSpacing: "-0.02em" }}>
            {stats?.total_registrations || 0}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Ghi nhận tại bảng DynamoDB
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: "20px 24px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
              Dịch vụ gửi mail
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(245, 158, 11, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fbbf24",
              }}
            >
              <Mail size={18} />
            </div>
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#fbbf24",
              letterSpacing: "-0.01em",
              fontFamily: "var(--font-mono)",
            }}
          >
            GOOGLE LAMBDA
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            AWS VPC Interface Endpoint
          </div>
        </div>
      </div>

      {/* Email Test Tool Panel */}
      <div
        className="glass-panel"
        style={{
          padding: "22px 24px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "14px",
        }}
      >
        <div style={{ marginBottom: "14px" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: 0,
            }}
          >
            <Mail size={17} color="#38bdf8" />
            Kiểm Tra Kênh Gửi Thư (Google Mail Lambda Worker Test)
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
            Kích hoạt Lambda worker từ backend ECS qua Interface VPC Endpoint để kiểm tra kết nối Google SMTP ra bên ngoài.
          </p>
        </div>

        <form onSubmit={handleSendTestEmail} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="email"
            id="admin-test-email-input"
            required
            placeholder="Nhập địa chỉ email người nhận để test (vd: giangvien@gmail.com)..."
            value={testEmailRecipient}
            onChange={(e) => setTestEmailRecipient(e.target.value)}
            className="input-control"
            style={{ flex: "1 1 320px", maxWidth: "500px" }}
          />
          <button
            type="submit"
            id="admin-send-test-email-btn"
            disabled={testEmailSending}
            className="btn btn-primary"
            style={{ padding: "8px 18px", fontSize: "13px" }}
          >
            <Send size={14} />
            {testEmailSending ? "Đang gửi..." : "Gửi email kiểm tra"}
          </button>
        </form>
      </div>

      {/* Courses Management Table */}
      <div
        className="glass-panel"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
              Danh Mục Các Học Phần Trong Hệ Thống
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
              Toàn bộ dữ liệu được lưu trữ trên Amazon DynamoDB và đồng bộ thời gian thực.
            </p>
          </div>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              fontSize: "12px",
              fontWeight: 600,
              color: "#cbd5e1",
            }}
          >
            {courses.length} học phần
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  borderBottom: "1px solid var(--border-color)",
                  color: "var(--text-muted)",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>Mã môn</th>
                <th style={{ padding: "14px 16px", fontWeight: 600 }}>Tên học phần</th>
                <th style={{ padding: "14px 16px", fontWeight: 600 }}>Tín chỉ</th>
                <th style={{ padding: "14px 16px", fontWeight: 600 }}>Thời khóa biểu</th>
                <th style={{ padding: "14px 16px", fontWeight: 600 }}>Phòng</th>
                <th style={{ padding: "14px 16px", fontWeight: 600 }}>Giảng viên</th>
                <th style={{ padding: "14px 16px", fontWeight: 600 }}>Đăng ký / Sĩ số</th>
                <th style={{ padding: "14px 20px", fontWeight: 600, textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#38bdf8",
                        background: "rgba(56, 189, 248, 0.1)",
                        padding: "3px 8px",
                        borderRadius: "5px",
                        border: "1px solid rgba(56, 189, 248, 0.2)",
                      }}
                    >
                      {c.code}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#ffffff", fontSize: "14px" }}>{c.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {c.department || "Khoa CNTT"}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "5px",
                        background: "rgba(99, 102, 241, 0.12)",
                        border: "1px solid rgba(99, 102, 241, 0.25)",
                        color: "#a5b4fc",
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      {c.credits} TC
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Calendar size={13} color="var(--text-muted)" />
                      <span>{c.schedule_day}</span>
                      <span style={{ color: "var(--text-muted)" }}>•</span>
                      <span style={{ color: "#38bdf8" }}>Tiết {c.schedule_periods}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        padding: "2px 6px",
                        background: "rgba(255, 255, 255, 0.04)",
                        borderRadius: "4px",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {c.room}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                    {c.instructor}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: c.registered_count >= c.max_capacity ? "#f87171" : "#34d399",
                      }}
                    >
                      {c.registered_count}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}> / {c.max_capacity}</span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        onClick={() => handleViewRoster(c)}
                        className="btn btn-secondary"
                        style={{ padding: "6px 10px", fontSize: "11px" }}
                        title="Xem danh sách sinh viên đăng ký môn này"
                      >
                        <Eye size={13} />
                        DSSV ({c.registered_count})
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c.id, c.code)}
                        className="btn btn-danger"
                        style={{ padding: "6px 10px", fontSize: "11px" }}
                        title="Xóa môn học khỏi hệ thống"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Course */}
      {showAddCourse && (
        <div className="modal-overlay" onClick={() => setShowAddCourse(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: "28px",
              maxWidth: "600px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.75)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Thêm Lớp Học Phần Mới
              </h3>
              <button
                onClick={() => setShowAddCourse(false)}
                className="btn btn-secondary"
                style={{ padding: "6px", borderRadius: "8px", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                    Mã môn học:
                  </label>
                  <input
                    required
                    placeholder="vd: IT011"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                    className="input-control"
                    style={{ width: "100%", fontFamily: "var(--font-mono)", fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                    Tên học phần:
                  </label>
                  <input
                    required
                    placeholder="vd: Điện toán Biên & Serverless"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    className="input-control"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                    Số tín chỉ:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 3 })}
                    className="input-control"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                    Sĩ số tối đa:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newCourse.max_capacity}
                    onChange={(e) => setNewCourse({ ...newCourse, max_capacity: parseInt(e.target.value) || 45 })}
                    className="input-control"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                    Phòng học:
                  </label>
                  <input
                    required
                    value={newCourse.room}
                    onChange={(e) => setNewCourse({ ...newCourse, room: e.target.value })}
                    className="input-control"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                    Thứ trong tuần:
                  </label>
                  <select
                    value={newCourse.schedule_day}
                    onChange={(e) => setNewCourse({ ...newCourse, schedule_day: e.target.value })}
                    className="input-control"
                    style={{ width: "100%" }}
                  >
                    <option value="Thứ 2">Thứ 2</option>
                    <option value="Thứ 3">Thứ 3</option>
                    <option value="Thứ 4">Thứ 4</option>
                    <option value="Thứ 5">Thứ 5</option>
                    <option value="Thứ 6">Thứ 6</option>
                    <option value="Thứ 7">Thứ 7</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                    Tiết học:
                  </label>
                  <input
                    required
                    placeholder="vd: 1-3 hoặc 7-9"
                    value={newCourse.schedule_periods}
                    onChange={(e) => setNewCourse({ ...newCourse, schedule_periods: e.target.value })}
                    className="input-control"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                  Giảng viên phụ trách:
                </label>
                <input
                  required
                  placeholder="vd: TS. Nguyễn Văn A"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  className="input-control"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                  Mô tả tóm tắt học phần:
                </label>
                <textarea
                  rows="3"
                  placeholder="Nội dung, mục tiêu và yêu cầu của môn học..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="input-control"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "8px",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "16px",
                }}
              >
                <button type="button" onClick={() => setShowAddCourse(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu học phần
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Roster for Course */}
      {selectedRosterCourse && (
        <div className="modal-overlay" onClick={() => setSelectedRosterCourse(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: "28px",
              maxWidth: "720px",
              width: "92%",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.75)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "16px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                    Danh Sách Sinh Viên Ghi Danh
                  </h3>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#38bdf8",
                      background: "rgba(56, 189, 248, 0.1)",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {selectedRosterCourse.code}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                  Học phần: <strong style={{ color: "#ffffff" }}>{selectedRosterCourse.name}</strong> • Sĩ số: {selectedRosterCourse.registered_count} sinh viên
                </p>
              </div>
              <button
                onClick={() => setSelectedRosterCourse(null)}
                className="btn btn-secondary"
                style={{ padding: "6px", borderRadius: "8px", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            {rosterLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                Đang tải danh sách sinh viên ghi danh...
              </div>
            ) : !rosterData || rosterData.students.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                Chưa có sinh viên nào đăng ký môn học này.
              </div>
            ) : (
              <div style={{ maxHeight: "380px", overflowY: "auto", border: "1px solid var(--border-subtle)", borderRadius: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr
                      style={{
                        background: "rgba(0, 0, 0, 0.2)",
                        borderBottom: "1px solid var(--border-color)",
                        color: "var(--text-muted)",
                        textAlign: "left",
                      }}
                    >
                      <th style={{ padding: "10px 14px", fontWeight: 600 }}>MSSV</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600 }}>Họ và tên</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600 }}>Email sinh viên</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600 }}>Chuyên ngành</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rosterData.students.map((st) => (
                      <tr
                        key={st.student_id}
                        style={{ borderBottom: "1px solid var(--border-subtle)" }}
                      >
                        <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "#38bdf8", fontWeight: 600 }}>
                          {st.mssv}
                        </td>
                        <td style={{ padding: "10px 14px", color: "#ffffff", fontWeight: 500 }}>
                          {st.full_name}
                        </td>
                        <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>
                          {st.email}
                        </td>
                        <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>
                          {st.major || "Công nghệ Thông tin"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
