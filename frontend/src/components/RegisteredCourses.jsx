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
  Calendar,
  AlertTriangle,
  Info,
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
  const isMinCreditsMet = totalCredits >= 10;
  const isMaxCreditsSafe = totalCredits <= 24;

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
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Card 1: Số học phần */}
        <div
          className="glass-panel"
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
              Số học phần đã chọn
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
              <Award size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em" }}>
              {registrations.length}{" "}
              <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>học phần</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
              Học kỳ 1 • Năm học 2026 - 2027
            </div>
          </div>
        </div>

        {/* Card 2: Tổng số tín chỉ */}
        <div
          className="glass-panel"
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
              Tổng số tín chỉ
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: isMinCreditsMet ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isMinCreditsMet ? "#34d399" : "#fbbf24",
              }}
            >
              <FileText size={18} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: isMinCreditsMet ? "#ffffff" : "#fbbf24",
                  letterSpacing: "-0.03em",
                }}
              >
                {totalCredits}
              </span>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>/ 24 TC tối đa</span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                marginTop: "6px",
                color: isMinCreditsMet ? "#34d399" : "#fbbf24",
              }}
            >
              {isMinCreditsMet ? (
                <>
                  <CheckCircle size={14} />
                  <span>Đã đạt mức tối thiểu (&ge; 10 TC)</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={14} />
                  <span>Cần tối thiểu 10 TC (còn thiếu {10 - totalCredits} TC)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Học phí tạm tính */}
        <div
          className="glass-panel"
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
              Học phí tạm tính
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(99, 102, 241, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818cf8",
              }}
            >
              <CreditCard size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
              {totalTuition.toLocaleString("vi-VN")}{" "}
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#38bdf8" }}>VNĐ</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
              Đơn giá chuẩn: 550.000 đ/tín chỉ
            </div>
          </div>
        </div>
      </div>

      {/* Main Registered Courses List */}
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
              Danh Sách Học Phần Đã Đăng Ký
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
              Mỗi thao tác đăng ký hoặc hủy môn đều kích hoạt gửi email thông báo tự động.
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
            {registrations.length} môn học
          </span>
        </div>

        {registrations.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              color: "var(--text-muted)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                marginBottom: "16px",
              }}
            >
              <AlertCircle size={24} />
            </div>
            <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#ffffff", marginBottom: "6px" }}>
              Chưa có môn học nào được đăng ký
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "420px", margin: "0 auto" }}>
              Vui lòng chuyển qua tab "Đăng ký học phần" để tra cứu và ghi danh vào các môn học trong đợt đăng ký này.
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
                  <th style={{ padding: "14px 16px", fontWeight: 600 }}>Ngày ĐK</th>
                  <th style={{ padding: "14px 20px", fontWeight: 600, textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r, idx) => {
                  const c = r.course || {};
                  return (
                    <tr
                      key={r.id || idx}
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
                          {c.code || r.course_id}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#ffffff", fontSize: "14px" }}>
                          {c.name || "Môn học"}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {c.department || "Khoa chuyên ngành"}
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
                          {c.credits || 0} TC
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
                          {c.room || "Chưa xếp"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                        {c.instructor || "Đang cập nhật"}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString("vi-VN") : "Hôm nay"}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <button
                          id={`drop-btn-${c.code || r.course_id}`}
                          onClick={() => setConfirmCourse(c)}
                          disabled={loading || !windowOpen}
                          className="btn btn-secondary"
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            color: "#f87171",
                            borderColor: "rgba(239, 68, 68, 0.25)",
                          }}
                          title="Hủy đăng ký môn này"
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
          <div
            className="modal-content"
            style={{
              padding: "28px",
              maxWidth: "480px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(239, 68, 68, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ef4444",
                }}
              >
                <AlertCircle size={20} />
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                }}
              >
                Xác Nhận Hủy Môn Học
              </h3>
            </div>

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "20px" }}>
              Bạn có chắc chắn muốn hủy đăng ký môn{" "}
              <strong style={{ color: "#ffffff" }}>{confirmCourse.name}</strong> (
              <span style={{ fontFamily: "var(--font-mono)", color: "#38bdf8" }}>{confirmCourse.code}</span>
              ) không?
            </p>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                background: "rgba(56, 189, 248, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                fontSize: "12px",
                color: "#cbd5e1",
                marginBottom: "24px",
                lineHeight: 1.5,
              }}
            >
              📧 Sau khi hủy thành công, một email xác nhận sẽ tự động được gửi tới hòm thư sinh viên của bạn qua Google Mail Lambda Worker.
            </div>

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
