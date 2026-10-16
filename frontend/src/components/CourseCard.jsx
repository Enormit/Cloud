import React from "react";
import {
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  BookMarked,
  XCircle,
} from "lucide-react";

export default function CourseCard({
  course,
  onRegister,
  onCancel,
  onViewDetails,
  loading = false,
  windowOpen = true,
}) {
  const percentFilled = Math.min(
    100,
    Math.round((course.registered_count / course.max_capacity) * 100)
  );

  return (
    <div
      id={`course-card-${course.code}`}
      className="glass-panel"
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "16px",
        position: "relative",
        overflow: "hidden",
        borderLeft: course.is_registered
          ? "4px solid var(--success)"
          : course.has_conflict
          ? "4px solid var(--warning)"
          : "1px solid var(--border-color)",
      }}
    >
      {/* Top Meta: Code, Credits, Department */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: "14px",
                color: "#38bdf8",
                background: "rgba(56, 189, 248, 0.12)",
                padding: "3px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}
            >
              {course.code}
            </span>
            <span className="badge badge-primary">{course.credits} Tín chỉ</span>
          </div>

          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {course.department}
          </span>
        </div>

        {/* Course Name */}
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: "14px",
            color: "#ffffff",
          }}
        >
          {course.name}
        </h3>

        {/* Schedule & Instructor Meta */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            fontSize: "13px",
            color: "var(--text-secondary)",
            background: "rgba(0, 0, 0, 0.2)",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock size={15} color="#38bdf8" />
            <span>
              <strong style={{ color: "#e2e8f0" }}>{course.schedule_day}</strong> (Tiết {course.schedule_periods})
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MapPin size={15} color="#f472b6" />
            <span>Phòng: <strong style={{ color: "#e2e8f0" }}>{course.room}</strong></span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              gridColumn: "span 2",
            }}
          >
            <User size={15} color="#a78bfa" />
            <span>Giảng viên: <strong style={{ color: "#e2e8f0" }}>{course.instructor}</strong></span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginBottom: "5px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Users size={14} />
              Sĩ số lớp:
            </span>
            <span>
              <strong
                style={{
                  color: course.is_full ? "var(--danger)" : "#ffffff",
                }}
              >
                {course.registered_count}
              </strong>
              /{course.max_capacity} (Còn {course.remaining_slots} chỗ)
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "3px",
              background: "rgba(255, 255, 255, 0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${percentFilled}%`,
                height: "100%",
                borderRadius: "3px",
                background:
                  course.is_full
                    ? "var(--danger)"
                    : percentFilled > 80
                    ? "var(--warning)"
                    : "linear-gradient(90deg, #10b981, #06b6d4)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Conflict Alert Callout */}
        {course.has_conflict && !course.is_registered && (
          <div
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "12px",
              color: "#fcd34d",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{course.conflict_reason}</span>
          </div>
        )}

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites !== "Không" && (
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
            Môn tiên quyết: <span style={{ color: "#a5b4fc" }}>{course.prerequisites}</span>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          borderTop: "1px solid var(--border-color)",
          paddingTop: "14px",
        }}
      >
        <button
          id={`view-detail-btn-${course.code}`}
          onClick={() => onViewDetails(course)}
          className="btn btn-secondary"
          style={{ padding: "8px 12px", fontSize: "12px" }}
          title="Xem đề cương chi tiết"
        >
          <Info size={14} />
          Đề cương
        </button>

        {course.is_registered ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              className="badge badge-success"
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              <CheckCircle2 size={14} />
              Đã đăng ký
            </span>
            <button
              id={`cancel-btn-${course.code}`}
              onClick={() => onCancel(course)}
              disabled={loading || !windowOpen}
              className="btn btn-danger"
              style={{ padding: "7px 12px", fontSize: "12px" }}
              title="Hủy đăng ký môn học này (gửi email thông báo)"
            >
              <XCircle size={14} />
              Hủy môn
            </button>
          </div>
        ) : (
          <button
            id={`register-btn-${course.code}`}
            onClick={() => onRegister(course)}
            disabled={
              loading ||
              !windowOpen ||
              course.is_full ||
              course.has_conflict
            }
            className="btn btn-primary"
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              minWidth: "120px",
            }}
          >
            <BookMarked size={15} />
            {course.is_full
              ? "Hết chỗ"
              : course.has_conflict
              ? "Trùng lịch"
              : "Đăng ký"}
          </button>
        )}
      </div>
    </div>
  );
}
