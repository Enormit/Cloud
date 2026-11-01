import React from "react";
import {
  X,
  BookOpen,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function CourseDetailModal({ course, onClose, onRegister, windowOpen = true }) {
  if (!course) return null;

  const isFull = (course.registered_count || 0) >= (course.max_capacity || 40);
  const remainingSlots = Math.max(0, (course.max_capacity || 40) - (course.registered_count || 0));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "600px",
          width: "92%",
          padding: "28px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.75)",
        }}
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#38bdf8",
                  background: "rgba(56, 189, 248, 0.12)",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                }}
              >
                {course.code}
              </span>
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: "rgba(99, 102, 241, 0.12)",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  color: "#a5b4fc",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                {course.credits} Tín chỉ
              </span>
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                {course.department || "Khoa CNTT"}
              </span>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
              {course.name}
            </h2>
          </div>

          <button
            id="close-detail-modal-btn"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: "8px", borderRadius: "8px", color: "var(--text-muted)" }}
            title="Đóng"
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
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-subtle)",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontSize: "13px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Calendar size={16} color="#38bdf8" />
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Thời khóa biểu</div>
              <strong style={{ color: "#ffffff", fontWeight: 600 }}>
                {course.schedule_day} (Tiết {course.schedule_periods})
              </strong>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MapPin size={16} color="#f472b6" />
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Phòng học</div>
              <strong style={{ color: "#ffffff", fontWeight: 600 }}>{course.room || "Chưa xếp"}</strong>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <User size={16} color="#a78bfa" />
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Giảng viên phụ trách</div>
              <strong style={{ color: "#ffffff", fontWeight: 600 }}>{course.instructor || "Đang phân công"}</strong>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={16} color={isFull ? "#f87171" : "#34d399"} />
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Sĩ số lớp</div>
              <strong style={{ color: "#ffffff", fontWeight: 600 }}>
                {course.registered_count || 0} / {course.max_capacity}
              </strong>{" "}
              <span style={{ fontSize: "12px", color: isFull ? "#f87171" : "#34d399" }}>
                ({isFull ? "Hết chỗ" : `Còn ${remainingSlots} chỗ`})
              </span>
            </div>
          </div>
        </div>

        {/* Prerequisites */}
        <div
          style={{
            marginBottom: "16px",
            padding: "14px 16px",
            borderRadius: "10px",
            background: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
            Học phần tiên quyết / Điều kiện ghi danh:
          </div>
          <div
            style={{
              fontSize: "13px",
              color: course.prerequisites === "Không" || !course.prerequisites ? "var(--text-muted)" : "#38bdf8",
              fontWeight: 500,
            }}
          >
            {course.prerequisites || "Không yêu cầu học phần tiên quyết"}
          </div>
        </div>

        {/* Description & Syllabus */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
            Mô tả tóm tắt học phần:
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              margin: 0,
              background: "rgba(0, 0, 0, 0.2)",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {course.description || "Học phần cung cấp kiến thức nền tảng và chuyên sâu, kết hợp các buổi thực hành bài tập lớn trên nền tảng Cloud hiện đại."}
          </p>
        </div>

        {/* Status notice if conflict or full */}
        {course.has_conflict && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              color: "#fbbf24",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <AlertTriangle size={15} />
            <span>Môn học này trùng thời khóa biểu với một môn bạn đã đăng ký.</span>
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            borderTop: "1px solid var(--border-color)",
            paddingTop: "16px",
          }}
        >
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: "8px 16px" }}>
            Đóng
          </button>
          {!course.is_registered && onRegister && (
            <button
              onClick={() => {
                onRegister(course);
                onClose();
              }}
              disabled={!windowOpen || isFull || course.has_conflict}
              className="btn btn-primary"
              style={{ padding: "8px 20px" }}
            >
              {isFull ? "Lớp đã đầy sĩ số" : course.has_conflict ? "Trùng thời khóa biểu" : "Đăng ký môn học này"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
