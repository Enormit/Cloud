import React from "react";
import { Printer, CalendarDays, MapPin, User, Clock } from "lucide-react";

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const PERIODS = [
  { p: 1, time: "07:00 - 07:50" },
  { p: 2, time: "07:55 - 08:45" },
  { p: 3, time: "08:50 - 09:40" },
  { p: 4, time: "09:50 - 10:40" },
  { p: 5, time: "10:45 - 11:35" },
  { p: 6, time: "11:40 - 12:30" },
  { p: 7, time: "13:00 - 13:50" },
  { p: 8, time: "13:55 - 14:45" },
  { p: 9, time: "14:50 - 15:40" },
  { p: 10, time: "15:50 - 16:40" },
  { p: 11, time: "16:45 - 17:35" },
  { p: 12, time: "17:40 - 18:30" },
];

const COLORS = [
  { bg: "rgba(99, 102, 241, 0.18)", border: "#6366f1", text: "#a5b4fc" },
  { bg: "rgba(6, 182, 212, 0.18)", border: "#06b6d4", text: "#67e8f9" },
  { bg: "rgba(16, 185, 129, 0.18)", border: "#10b981", text: "#6ee7b7" },
  { bg: "rgba(245, 158, 11, 0.18)", border: "#f59e0b", text: "#fcd34d" },
  { bg: "rgba(236, 72, 153, 0.18)", border: "#ec4899", text: "#f472b6" },
  { bg: "rgba(139, 92, 246, 0.18)", border: "#8b5cf6", text: "#c4b5fd" },
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
  // Map courses to colors
  const courseColorMap = {};
  registeredCourses.forEach((c, idx) => {
    courseColorMap[c.code] = COLORS[idx % COLORS.length];
  });

  // Find course for a given day and period
  const getCourseForSlot = (day, period) => {
    return registeredCourses.find((c) => {
      if (c.schedule_day !== day) return false;
      const periods = parsePeriods(c.schedule_periods);
      return periods.includes(period);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-panel" style={{ padding: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CalendarDays size={20} color="#38bdf8" />
            Thời Khóa Biểu Tuần Học - Học Kỳ I (2026-2027)
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Lịch học chính thức dựa trên các học phần bạn đã đăng ký thành công.
          </p>
        </div>

        <button
          id="print-timetable-btn"
          onClick={handlePrint}
          className="btn btn-secondary"
          style={{ fontSize: "13px" }}
        >
          <Printer size={16} />
          In thời khóa biểu
        </button>
      </div>

      {registeredCourses.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--text-muted)",
          }}
        >
          <Clock size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
          <h4 style={{ fontSize: "16px", color: "#e2e8f0", marginBottom: "6px" }}>
            Chưa có môn học nào trong Thời khóa biểu
          </h4>
          <p style={{ fontSize: "13px" }}>
            Vui lòng chuyển qua tab "Đăng ký học phần" để chọn các môn học cho học kỳ này.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: "850px",
              borderCollapse: "separate",
              borderSpacing: "4px",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: "10px",
                    background: "rgba(0, 0, 0, 0.4)",
                    color: "var(--text-secondary)",
                    borderRadius: "8px",
                    width: "100px",
                  }}
                >
                  Tiết / Giờ
                </th>
                {DAYS.map((d) => (
                  <th
                    key={d}
                    style={{
                      padding: "10px",
                      background: "rgba(99, 102, 241, 0.12)",
                      color: "#e2e8f0",
                      fontWeight: 700,
                      borderRadius: "8px",
                    }}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(({ p, time }) => (
                <tr key={p}>
                  {/* Period Time Cell */}
                  <td
                    style={{
                      padding: "8px",
                      background: "rgba(0, 0, 0, 0.2)",
                      borderRadius: "6px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#fff" }}>Tiết {p}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      {time}
                    </div>
                  </td>

                  {/* Days */}
                  {DAYS.map((day) => {
                    const c = getCourseForSlot(day, p);
                    if (!c) {
                      return (
                        <td
                          key={day}
                          style={{
                            padding: "6px",
                            background: "rgba(255, 255, 255, 0.02)",
                            borderRadius: "6px",
                          }}
                        />
                      );
                    }

                    const periods = parsePeriods(c.schedule_periods);
                    const isFirstPeriod = periods[0] === p;
                    const color = courseColorMap[c.code] || COLORS[0];

                    return (
                      <td
                        key={day}
                        onClick={() => onSelectCourse && onSelectCourse(c)}
                        style={{
                          padding: "8px",
                          background: color.bg,
                          borderLeft: `3px solid ${color.border}`,
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "transform 0.15s ease",
                        }}
                      >
                        {isFirstPeriod ? (
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                color: color.text,
                                fontSize: "12px",
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>{c.code}</span>
                              <span style={{ fontSize: "10px", opacity: 0.8 }}>
                                {c.credits} TC
                              </span>
                            </div>
                            <div
                              style={{
                                color: "#ffffff",
                                fontWeight: 600,
                                margin: "2px 0 4px 0",
                                fontSize: "12px",
                              }}
                            >
                              {c.name}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "var(--text-secondary)",
                                fontSize: "11px",
                              }}
                            >
                              <MapPin size={11} color="#f472b6" />
                              <span>{c.room}</span>
                              <span style={{ margin: "0 2px" }}>&bull;</span>
                              <User size={11} color="#a78bfa" />
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {c.instructor}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              color: color.text,
                              fontSize: "11px",
                              opacity: 0.7,
                              fontWeight: 600,
                            }}
                          >
                            &bull; {c.code} ({c.room})
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
