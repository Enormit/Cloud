import React from "react";
import {
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Calendar,
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

  const availableSlots = Math.max(0, course.max_capacity - course.registered_count);
  const isFull = availableSlots <= 0;

  return (
    <div
      id={`course-card-${course.code}`}
      className="glass-panel"
      style={{
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "14px",
        position: "relative",
        background: course.is_registered
          ? "rgba(16, 185, 129, 0.04)"
          : course.has_conflict
          ? "rgba(245, 158, 11, 0.04)"
          : "var(--bg-surface)",
        borderColor: course.is_registered
          ? "var(--success-border)"
          : course.has_conflict
          ? "var(--warning-border)"
          : "var(--border-subtle)",
      }}
    >
      {/* Top Header: Code, Department & Status */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            marginBottom: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: "13px",
                color: "#60a5fa",
                background: "var(--primary-subtle)",
                padding: "2px 7px",
                borderRadius: "5px",
                border: "1px solid var(--primary-border)",
                letterSpacing: "0.2px",
              }}
            >
              {course.code}
            </span>
            <span className="badge badge-primary">{course.credits} Tín chỉ</span>
          </div>

          <div>
            {course.is_registered ? (
              <span className="badge badge-success">
                <CheckCircle2 size={12} /> Đã Đăng Ký
              </span>
            ) : course.has_conflict ? (
              <span className="badge badge-warning">
                <AlertTriangle size={12} /> Trùng Lịch
              </span>
            ) : (
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {course.department}
              </span>
            )}
          </div>
        </div>

        {/* Course Title */}
        <h3
          style={{
            fontSize: "15.5px",
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: "12px",
            color: "var(--text-primary)",
          }}
        >
          {course.name}
        </h3>

        {/* Schedule & Room Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            fontSize: "12.5px",
            color: "var(--text-secondary)",
            background: "var(--bg-surface-subtle)",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <span>{course.schedule_day || "Chưa xếp"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <span>Tiết {course.schedule_periods || "--"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MapPin size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {course.room || "P.A101"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <User size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {course.instructor || "Giảng viên"}
            </span>
          </div>
        </div>
      </div>

      {/* Capacity & Action Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Capacity Bar */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px",
              marginBottom: "5px",
            }}
          >
            <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Users size={12} /> Sĩ số lớp:
            </span>
            <span
              style={{
                fontWeight: 600,
                color: isFull ? "var(--danger)" : percentFilled > 80 ? "var(--warning)" : "var(--text-secondary)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {course.registered_count} / {course.max_capacity} ({isFull ? "Đầy chỗ" : `còn ${availableSlots} chỗ`})
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: "5px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${percentFilled}%`,
                background: isFull
                  ? "var(--danger)"
                  : percentFilled > 85
                  ? "var(--warning)"
                  : "var(--primary)",
                borderRadius: "3px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Buttons Row */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => onViewDetails && onViewDetails(course)}
            className="btn btn-secondary"
            style={{ padding: "7px 11px", fontSize: "12.5px", flexShrink: 0 }}
            title="Xem chi tiết học phần"
          >
            <Info size={14} />
            <span>Chi tiết</span>
          </button>

          {course.is_registered ? (
            <button
              onClick={() => onCancel && onCancel(course)}
              disabled={loading || !windowOpen}
              className="btn btn-danger"
              style={{ width: "100%", fontSize: "12.5px" }}
            >
              <XCircle size={14} />
              <span>Hủy Học Phần</span>
            </button>
          ) : (
            <button
              onClick={() => onRegister && onRegister(course)}
              disabled={loading || !windowOpen || isFull || course.has_conflict}
              className="btn btn-primary"
              style={{ width: "100%", fontSize: "12.5px" }}
            >
              {isFull ? (
                <span>Lớp Đã Đầy</span>
              ) : course.has_conflict ? (
                <span>Trùng Lịch Học</span>
              ) : !windowOpen ? (
                <span>Cổng Đã Đóng</span>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Đăng Ký Ngay</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
