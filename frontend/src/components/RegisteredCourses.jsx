import React, { useState } from "react";
import {
  Award,
  CreditCard,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  MapPin,
} from "lucide-react";

export default function RegisteredCourses({
  registrations = [],
  onCancelCourse,
  loading = false,
  windowOpen = true,
}) {
  const [confirmCourse, setConfirmCourse] = useState(null);

  const totalCredits = registrations.reduce(
    (sum, r) => sum + (r.course?.credits || 0),
    0
  );

  const TUITION_PER_CREDIT = 550000; // 550,000 VND / tín chỉ
  const totalTuition = totalCredits * TUITION_PER_CREDIT;

  const handleConfirmDrop = () => {
    if (confirmCourse) {
      onCancelCourse(confirmCourse);
      setConfirmCourse(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Summary KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Award size={20} color="#38bdf8" />
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Số học phần đã chọn
            </span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#fff" }}>
            {registrations.length} <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>môn</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <FileText size={20} color="#a78bfa" />
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Tổng số tín chỉ đăng ký
            </span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: totalCredits >= 10 ? "#34d399" : "#fbbf24" }}>
            {totalCredits} <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>tín chỉ</span>
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            {totalCredits >= 10 ? "✓ Đạt mức tối thiểu (>= 10 TC)" : "⚠️ Chưa đủ số tín chỉ tối thiểu (>= 10 TC)"}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <CreditCard size={20} color="#34d399" />
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Học phí tạm tính (550.000đ/TC)
            </span>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#38bdf8" }}>
            {totalTuition.toLocaleString("vi-VN")} <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>VNĐ</span>
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Thanh toán theo thông báo từ Phòng Kế hoạch Tài chính
          </div>
        </div>
      </div>

      {/* Course List Table */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h3
          style={{
            fontSize: "17px",
            fontWeight: 700,
            marginBottom: "16px",
            color: "#ffffff",
          }}
        >
          Danh Sách Các Môn Học Đã Đăng Ký
        </h3>

        {registrations.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px",
              color: "var(--text-muted)",
            }}
          >
            <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: "12px" }} />
            <p style={{ fontSize: "15px", color: "#e2e8f0" }}>
              Bạn chưa đăng ký môn học nào trong học kỳ này.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "12px" }}>Mã môn</th>
                  <th style={{ padding: "12px" }}>Tên học phần</th>
                  <th style={{ padding: "12px" }}>Số TC</th>
                  <th style={{ padding: "12px" }}>Thời khóa biểu</th>
                  <th style={{ padding: "12px" }}>Phòng</th>
                  <th style={{ padding: "12px" }}>Giảng viên</th>
                  <th style={{ padding: "12px" }}>Ngày ĐK</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => {
                  const c = r.course || {};
                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 12px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38bdf8" }}>
                        {c.code || r.course_id}
                      </td>
                      <td style={{ padding: "14px 12px", fontWeight: 600, color: "#fff" }}>
                        {c.name || "Môn học"}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <span className="badge badge-primary">{c.credits || 0} TC</span>
                      </td>
                      <td style={{ padding: "14px 12px", color: "var(--text-secondary)" }}>
                        {c.schedule_day} (Tiết {c.schedule_periods})
                      </td>
                      <td style={{ padding: "14px 12px", color: "var(--text-secondary)" }}>
                        {c.room}
                      </td>
                      <td style={{ padding: "14px 12px", color: "var(--text-secondary)" }}>
                        {c.instructor}
                      </td>
                      <td style={{ padding: "14px 12px", fontSize: "11px", color: "var(--text-muted)" }}>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString("vi-VN") : "Hôm nay"}
                      </td>
                      <td style={{ padding: "14px 12px", textAlign: "right" }}>
                        <button
                          id={`drop-btn-${c.code || r.course_id}`}
                          onClick={() => setConfirmCourse(c)}
                          disabled={loading || !windowOpen}
                          className="btn btn-danger"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          <Trash2 size={13} />
                          Hủy môn
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Dropping Course */}
      {confirmCourse && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: "28px", maxWidth: "480px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <AlertCircle size={22} />
              Xác Nhận Hủy Môn Học
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "20px" }}>
              Bạn có chắc chắn muốn hủy đăng ký môn{" "}
              <strong style={{ color: "#fff" }}>{confirmCourse.name}</strong> ({confirmCourse.code}) không?
              <br />
              <br />
              <span style={{ color: "#38bdf8" }}>
                📧 Sau khi hủy thành công, một email thông báo xác nhận hủy môn sẽ tự động được gửi tới hộp thư của bạn.
              </span>
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                id="modal-cancel-btn"
                onClick={() => setConfirmCourse(null)}
                className="btn btn-secondary"
              >
                Giữ lại môn
              </button>
              <button
                id="modal-confirm-drop-btn"
                onClick={handleConfirmDrop}
                disabled={loading}
                className="btn btn-danger"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
