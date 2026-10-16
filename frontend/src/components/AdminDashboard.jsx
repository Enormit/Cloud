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
    if (!window.confirm(`Bạn có chắc muốn xóa môn học ${courseCode}?`)) return;
    try {
      await api.deleteCourse(courseId);
      onShowToast("success", `Đã xóa môn học ${courseCode}`);
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
        "Thử nghiệm hệ thống gửi mail từ Ban Quản Trị",
        "Chào bạn, đây là email kiểm tra hệ thống AWS SES / SMTP hoạt động thành công."
      );
      onShowToast("success", res.message || "Email thử nghiệm đã được gửi!");
      setTestEmailRecipient("");
    } catch (err) {
      onShowToast("error", err.message);
    } finally {
      setTestEmailSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "24px",
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)",
          borderColor: "rgba(245, 158, 11, 0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <ShieldAlert size={24} color="#f59e0b" />
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>
            Bảng Quản Trị Hệ Thống Đào Tạo (Admin Portal)
          </h2>
        </div>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Quản lý danh mục học phần, danh sách sinh viên đăng ký theo môn, kiểm tra đợt đăng ký và cấu hình dịch vụ AWS.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "13px", marginBottom: "6px" }}>
            <Users size={18} color="#38bdf8" />
            Tổng sinh viên
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#fff" }}>
            {stats?.total_students || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "13px", marginBottom: "6px" }}>
            <BookOpen size={18} color="#a78bfa" />
            Tổng số học phần
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#fff" }}>
            {stats?.total_courses || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "13px", marginBottom: "6px" }}>
            <Award size={18} color="#34d399" />
            Lượt đăng ký thành công
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#34d399" }}>
            {stats?.total_registrations || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "13px", marginBottom: "6px" }}>
            <Mail size={18} color="#f59e0b" />
            Email Provider
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#fbbf24" }}>
            {stats?.email_provider || "SES"}
          </div>
        </div>
      </div>

      {/* Email Test Tool Panel */}
      <div className="glass-panel" style={{ padding: "20px 24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
          <Mail size={18} color="#38bdf8" />
          Kiểm Tra Kết Nối Gửi Mail (AWS SES / SMTP Test)
        </h3>
        <form onSubmit={handleSendTestEmail} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            type="email"
            id="admin-test-email-input"
            required
            placeholder="Nhập địa chỉ email người nhận để test (vd: test@example.com)..."
            value={testEmailRecipient}
            onChange={(e) => setTestEmailRecipient(e.target.value)}
            className="input-control"
            style={{ maxWidth: "450px" }}
          />
          <button
            type="submit"
            id="admin-send-test-email-btn"
            disabled={testEmailSending}
            className="btn btn-primary"
          >
            <Send size={15} />
            {testEmailSending ? "Đang gửi..." : "Gửi email thử nghiệm"}
          </button>
        </form>
      </div>

      {/* Courses Management Table */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff" }}>
            Quản Lý Danh Sách Môn Học
          </h3>
          <button
            id="admin-add-course-btn"
            onClick={() => setShowAddCourse(true)}
            className="btn btn-primary"
            style={{ fontSize: "13px" }}
          >
            <Plus size={16} />
            Thêm học phần mới
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Mã môn</th>
                <th style={{ padding: "12px" }}>Tên học phần</th>
                <th style={{ padding: "12px" }}>Tín chỉ</th>
                <th style={{ padding: "12px" }}>Thời khóa biểu</th>
                <th style={{ padding: "12px" }}>Phòng</th>
                <th style={{ padding: "12px" }}>Giảng viên</th>
                <th style={{ padding: "12px" }}>Đăng ký / Sĩ số</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <td style={{ padding: "12px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38bdf8" }}>
                    {c.code}
                  </td>
                  <td style={{ padding: "12px", fontWeight: 600, color: "#fff" }}>
                    {c.name}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span className="badge badge-primary">{c.credits} TC</span>
                  </td>
                  <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                    {c.schedule_day} (Tiết {c.schedule_periods})
                  </td>
                  <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                    {c.room}
                  </td>
                  <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                    {c.instructor}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ fontWeight: 700, color: c.registered_count >= c.max_capacity ? "#f87171" : "#34d399" }}>
                      {c.registered_count}
                    </span>
                    /{c.max_capacity}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        onClick={() => handleViewRoster(c)}
                        className="btn btn-secondary"
                        style={{ padding: "6px 10px", fontSize: "11px" }}
                        title="Xem danh sách sinh viên đăng ký"
                      >
                        <Eye size={13} />
                        DSSV ({c.registered_count})
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c.id, c.code)}
                        className="btn btn-danger"
                        style={{ padding: "6px 10px", fontSize: "11px" }}
                        title="Xóa môn học"
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>Thêm Học Phần Mới</h3>
              <button onClick={() => setShowAddCourse(false)} className="btn btn-secondary" style={{ padding: "6px" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                    Mã môn học:
                  </label>
                  <input
                    required
                    placeholder="vd: IT011"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                    className="input-control"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                    Tên học phần:
                  </label>
                  <input
                    required
                    placeholder="vd: Điện toán Biên (Edge Computing)"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    className="input-control"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                    Số tín chỉ:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
                    className="input-control"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                    Sĩ số tối đa:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newCourse.max_capacity}
                    onChange={(e) => setNewCourse({ ...newCourse, max_capacity: parseInt(e.target.value) })}
                    className="input-control"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                    Phòng học:
                  </label>
                  <input
                    required
                    value={newCourse.room}
                    onChange={(e) => setNewCourse({ ...newCourse, room: e.target.value })}
                    className="input-control"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                    Thứ học:
                  </label>
                  <select
                    value={newCourse.schedule_day}
                    onChange={(e) => setNewCourse({ ...newCourse, schedule_day: e.target.value })}
                    className="input-control"
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
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                    Tiết học:
                  </label>
                  <input
                    required
                    placeholder="vd: 1-3 hoặc 7-9"
                    value={newCourse.schedule_periods}
                    onChange={(e) => setNewCourse({ ...newCourse, schedule_periods: e.target.value })}
                    className="input-control"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                  Giảng viên phụ trách:
                </label>
                <input
                  required
                  placeholder="vd: TS. Nguyễn Văn A"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  className="input-control"
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                  Mô tả học phần:
                </label>
                <textarea
                  rows="3"
                  placeholder="Mô tả nội dung, mục tiêu môn học..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="input-control"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: "28px", maxWidth: "700px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                  Danh Sách Sinh Viên Đăng Ký
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Môn: <strong style={{ color: "#38bdf8" }}>{selectedRosterCourse.name}</strong> ({selectedRosterCourse.code})
                </p>
              </div>
              <button onClick={() => setSelectedRosterCourse(null)} className="btn btn-secondary" style={{ padding: "6px" }}>
                <X size={18} />
              </button>
            </div>

            {rosterLoading ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                Đang tải danh sách sinh viên...
              </div>
            ) : !rosterData || rosterData.students.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                Chưa có sinh viên nào đăng ký môn học này.
              </div>
            ) : (
              <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "left" }}>
                      <th style={{ padding: "8px" }}>MSSV</th>
                      <th style={{ padding: "8px" }}>Họ và tên</th>
                      <th style={{ padding: "8px" }}>Email</th>
                      <th style={{ padding: "8px" }}>Chuyên ngành</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rosterData.students.map((st) => (
                      <tr key={st.student_id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono)", color: "#38bdf8" }}>
                          {st.mssv}
                        </td>
                        <td style={{ padding: "10px 8px", color: "#fff", fontWeight: 600 }}>
                          {st.full_name}
                        </td>
                        <td style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>
                          {st.email}
                        </td>
                        <td style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>
                          {st.major}
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
