import React from "react";
import {
  Printer,
  CalendarDays,
  MapPin,
  User,
  Clock,
  BookOpen,
  Sparkles,
} from "lucide-react";

const DAYS = [
  { key: "Thứ 2", label: "Thứ Hai", dayIdx: 1 },
  { key: "Thứ 3", label: "Thứ Ba", dayIdx: 2 },
  { key: "Thứ 4", label: "Thứ Tư", dayIdx: 3 },
  { key: "Thứ 5", label: "Thứ Năm", dayIdx: 4 },
  { key: "Thứ 6", label: "Thứ Sáu", dayIdx: 5 },
  { key: "Thứ 7", label: "Thứ Bảy", dayIdx: 6 },
  { key: "Chủ nhật", label: "Chủ Nhật", dayIdx: 0 },
];

const PERIODS = [
  { p: 1, time: "07:00 - 07:50", session: "Sáng" },
  { p: 2, time: "07:55 - 08:45", session: "Sáng" },
  { p: 3, time: "08:50 - 09:40", session: "Sáng" },
  { p: 4, time: "09:50 - 10:40", session: "Sáng" },
  { p: 5, time: "10:45 - 11:35", session: "Sáng" },
  { p: 6, time: "13:00 - 13:50", session: "Chiều" },
  { p: 7, time: "13:55 - 14:45", session: "Chiều" },
  { p: 8, time: "14:50 - 15:40", session: "Chiều" },
  { p: 9, time: "15:50 - 16:40", session: "Chiều" },
  { p: 10, time: "16:45 - 17:35", session: "Chiều" },
  { p: 11, time: "17:40 - 18:30", session: "Tối" },
  { p: 12, time: "18:35 - 19:25", session: "Tối" },
];

const PALETTES = [
  { bg: "rgba(59, 130, 246, 0.14)", border: "rgba(59, 130, 246, 0.35)", text: "#93c5fd", badge: "#1d4ed8" },
  { bg: "rgba(6, 182, 212, 0.14)", border: "rgba(6, 182, 212, 0.35)", text: "#67e8f9", badge: "#0e7490" },
  { bg: "rgba(16, 185, 129, 0.14)", border: "rgba(16, 185, 129, 0.35)", text: "#6ee7b7", badge: "#047857" },
  { bg: "rgba(245, 158, 11, 0.14)", border: "rgba(245, 158, 11, 0.35)", text: "#fcd34d", badge: "#b45309" },
  { bg: "rgba(139, 92, 246, 0.14)", border: "rgba(139, 92, 246, 0.35)", text: "#c4b5fd", badge: "#6d28d9" },
  { bg: "rgba(236, 72, 153, 0.14)", border: "rgba(236, 72, 153, 0.35)", text: "#f472b6", badge: "#be185d" },
];

function parsePeriods(str) {
  if (!str) return [];
  const match = str.match(/(\d+)\s*-\s*(\d+)/);
  if (match) {
    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    const res = [];
    for (let i = start; i <= end; i++) res.push(i);
    return res;
  }
  const single = parseInt(str);
  return isNaN(single) ? [] : [single];
}

export default function Timetable({ registeredCourses = [], onSelectCourse }) {
  const currentDayIdx = new Date().getDay();

  // Map each course code to a stable palette
  const courseColorMap = {};
  registeredCourses.forEach((c, idx) => {
    courseColorMap[c.code] = PALETTES[idx % PALETTES.length];
  });

  // Calculate total periods per week
  const totalWeeklyPeriods = registeredCourses.reduce((acc, c) => {
    return acc + parsePeriods(c.schedule_periods).length;
  }, 0);

  // Helper to find course at a slot
  const getCourseForSlot = (dayKey, period) => {
    return registeredCourses.find((c) => {
      if (c.schedule_day !== dayKey) return false;
      const periods = parsePeriods(c.schedule_periods);
      return periods.includes(period);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-panel" style={{ padding: "24px" }}>
      {/* Header Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "14px",
          paddingBottom: "16px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarDays size={20} style={{ color: "var(--primary)" }} />
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
              Thời Khóa Biểu Tuần Học
            </h2>
            <span className="badge badge-primary">Học Kỳ I (2026-2027)</span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Trực quan hóa lịch học tự động từ các môn học đã đăng ký thành công.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "var(--bg-surface-subtle)",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)",
              fontSize: "12.5px",
            }}
          >
            <span>
              Số môn: <strong style={{ color: "var(--text-primary)" }}>{registeredCourses.length}</strong>
            </span>
            <span style={{ color: "var(--border-medium)" }}>|</span>
            <span>
              Tổng tiết: <strong style={{ color: "var(--primary)" }}>{totalWeeklyPeriods}</strong> tiết/tuần
            </span>
          </div>

          <button
            id="print-timetable-btn"
            onClick={handlePrint}
            className="btn btn-secondary"
            style={{ fontSize: "13px", padding: "7px 13px" }}
            title="In thời khóa biểu"
          >
            <Printer size={15} />
            <span>In Lịch Học</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {registeredCourses.length === 0 ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "var(--bg-surface-subtle)",
            borderRadius: "12px",
            border: "1px dashed var(--border-medium)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "var(--primary-subtle)",
              color: "var(--primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "14px",
            }}
          >
            <BookOpen size={24} />
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
            Chưa có môn học nào trong thời khóa biểu
          </h3>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", maxWidth: "420px", margin: "6px auto 0" }}>
            Vui lòng chọn tab <strong>"Môn Học Mở"</strong> để đăng ký các học phần của kỳ này. Lịch học sẽ được cập nhật tự động ngay khi đăng ký.
          </p>
        </div>
      ) : (
        /* Weekly Timetable Table Grid */
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: "860px",
              borderCollapse: "separate",
              borderSpacing: "0",
              fontSize: "12.5px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    width: "120px",
                    padding: "10px 12px",
                    background: "var(--bg-surface-elevated)",
                    color: "var(--text-secondary)",
                    fontWeight: 700,
                    textAlign: "center",
                    borderBottom: "1px solid var(--border-medium)",
                    borderTopLeftRadius: "8px",
                  }}
                >
                  Tiết / Buổi
                </th>
                {DAYS.map((d, index) => {
                  const isToday = d.dayIdx === currentDayIdx;
                  return (
                    <th
                      key={d.key}
                      style={{
                        padding: "10px 12px",
                        background: isToday ? "rgba(59, 130, 246, 0.12)" : "var(--bg-surface-elevated)",
                        color: isToday ? "#60a5fa" : "var(--text-primary)",
                        fontWeight: 700,
                        textAlign: "center",
                        borderBottom: "1px solid var(--border-medium)",
                        borderLeft: "1px solid var(--border-subtle)",
                        borderTopRightRadius: index === DAYS.length - 1 ? "8px" : "0",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <span>{d.label}</span>
                        {isToday && (
                          <span
                            style={{
                              fontSize: "9.5px",
                              padding: "1px 5px",
                              background: "var(--primary)",
                              color: "#fff",
                              borderRadius: "4px",
                            }}
                          >
                            Hôm nay
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((periodObj, pIdx) => {
                const isAfternoonStart = periodObj.p === 6;
                return (
                  <React.Fragment key={periodObj.p}>
                    {/* Lunch Break Divider */}
                    {isAfternoonStart && (
                      <tr style={{ background: "rgba(0, 0, 0, 0.25)" }}>
                        <td
                          colSpan={DAYS.length + 1}
                          style={{
                            padding: "6px 16px",
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: "var(--text-muted)",
                            textAlign: "center",
                            borderTop: "1px solid var(--border-medium)",
                            borderBottom: "1px solid var(--border-medium)",
                          }}
                        >
                          &bull; Nghỉ Trưa (11:35 - 13:00) &bull;
                        </td>
                      </tr>
                    )}
                    <tr>
                      {/* Period Time Column */}
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "center",
                          background: "var(--bg-surface-subtle)",
                          borderBottom: "1px solid var(--border-subtle)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: "12px", color: "var(--text-primary)" }}>
                          Tiết {periodObj.p}
                        </div>
                        <div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                          {periodObj.time}
                        </div>
                      </td>

                      {/* Day Cells */}
                      {DAYS.map((d) => {
                        const course = getCourseForSlot(d.key, periodObj.p);
                        const isToday = d.dayIdx === currentDayIdx;

                        if (!course) {
                          return (
                            <td
                              key={d.key}
                              style={{
                                padding: "6px",
                                borderBottom: "1px solid var(--border-subtle)",
                                borderLeft: "1px solid var(--border-subtle)",
                                background: isToday ? "rgba(59, 130, 246, 0.02)" : "transparent",
                              }}
                            />
                          );
                        }

                        const periods = parsePeriods(course.schedule_periods);
                        const isFirstPeriod = periods[0] === periodObj.p;
                        const palette = courseColorMap[course.code] || PALETTES[0];

                        return (
                          <td
                            key={d.key}
                            style={{
                              padding: "4px",
                              borderBottom: "1px solid var(--border-subtle)",
                              borderLeft: "1px solid var(--border-subtle)",
                              background: isToday ? "rgba(59, 130, 246, 0.04)" : "transparent",
                              verticalAlign: "top",
                            }}
                          >
                            <div
                              onClick={() => onSelectCourse && onSelectCourse(course)}
                              style={{
                                padding: "8px 10px",
                                background: palette.bg,
                                border: `1px solid ${palette.border}`,
                                borderRadius: "8px",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                              title={`Bấm để xem chi tiết ${course.name}`}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "4px",
                                  marginBottom: "4px",
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    fontWeight: 700,
                                    fontSize: "11px",
                                    color: palette.text,
                                  }}
                                >
                                  {course.code}
                                </span>
                                <span
                                  style={{
                                    fontSize: "10.5px",
                                    padding: "1px 5px",
                                    background: "rgba(0, 0, 0, 0.2)",
                                    borderRadius: "4px",
                                    color: palette.text,
                                    fontWeight: 600,
                                  }}
                                >
                                  {course.credits} TC
                                </span>
                              </div>

                              <div
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "#ffffff",
                                  lineHeight: 1.3,
                                  marginBottom: "6px",
                                }}
                              >
                                {course.name}
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px", color: palette.text }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <MapPin size={11} style={{ flexShrink: 0 }} />
                                  <span>{course.room || "P.A101"}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <User size={11} style={{ flexShrink: 0 }} />
                                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {course.instructor || "Giảng viên"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
