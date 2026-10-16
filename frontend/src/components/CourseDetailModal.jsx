import React from "react";
import { X, BookOpen, Clock, MapPin, User, Users, CheckCircle, ShieldCheck } from "lucide-react";

export default function CourseDetailModal({ course, onClose, onRegister, windowOpen = true }) {
  if (!course) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: "28px" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "20px",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: "15px",
                  color: "#38bdf8",
                  background: "rgba(56, 189, 248, 0.12)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                }}
              >
                {course.code}
              </span>
              <span className="badge badge-primary">{course.credits} Tín chỉ</span>
              <span className="badge badge-neutral">{course.department}</span>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>
              {course.name}
            </h2>
          </div>

          <button
            id="close-detail-modal-btn"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: "8px", borderRadius: "8px" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Course Info Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            background: "rgba(0, 0, 0, 0.25)",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontSize: "13px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Clock size={16} color="#38bdf8" />
            <span>Thời khóa biểu: <strong style={{ color: "#fff" }}>{course.schedule_day} (Tiết {course.schedule_periods})</strong></span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MapPin size={16} color="#f472b6" />
            <span>Phòng học: <strong style={{ color: "#fff" }}>{course.room}</strong></span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <User size={16} color="#a78bfa" />
            <span>Giảng viên: <strong style={{ color: "#fff" }}>{course.instructor}</strong></span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={16} color="#34d399" />
            <span>Sĩ số: <strong style={{ color: "#fff" }}>{course.registered_count}/{course.max_capacity}</strong> (Còn {course.remaining_slots} chỗ)</span>
          </div>
        </div>

        {/* Prerequisites */}
        <div style={{ marginBottom: "16px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
            Học phần tiên quyết / Điều kiện tiên quyết:
          </h4>
          <p style={{ fontSize: "13px", color: course.prerequisites === "Không" ? "var(--text-muted)" : "#a5b4fc" }}>
            {course.prerequisites || "Không yêu cầu học phần tiên quyết"}
          </p>
        </div>

        {/* Description & Syllabus */}
        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
            Mô tả tóm tắt học phần:
          </h4>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {course.description || "Học phần trang bị kiến thức lý thuyết trọng tâm kết hợp bài tập thực hành ứng dụng thực tế."}
          </p>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
          <button onClick={onClose} className="btn btn-secondary">
            Đóng
          </button>
          {!course.is_registered && onRegister && (
            <button
              onClick={() => {
                onRegister(course);
                onClose();
              }}
              disabled={!windowOpen || course.is_full || course.has_conflict}
              className="btn btn-primary"
            >
              Đăng ký môn học này
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
