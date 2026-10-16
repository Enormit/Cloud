import React from "react";
import {
  GraduationCap,
  Mail,
  LogOut,
  ShieldAlert,
  Calendar,
  BookOpen,
  Award,
} from "lucide-react";
import { logout } from "../api";

export default function Navbar({
  user,
  stats,
  activeTab,
  setActiveTab,
  onOpenInbox,
  inboxCount = 0,
}) {
  const credits = stats?.total_registered_credits || 0;
  const maxCredits = stats?.max_credits || 24;
  const minCredits = stats?.min_credits || 10;
  const creditPercent = Math.min(100, Math.round((credits / maxCredits) * 100));

  return (
    <header
      id="main-navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--bg-header)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-color)",
        padding: "12px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "17px",
                  letterSpacing: "-0.3px",
                  background: "linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Cổng Đăng Ký Môn Học
              </span>
              <span className="badge badge-primary" style={{ fontSize: "10px" }}>
                AWS CLOUD
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Trường Đại Học &bull; Học kỳ I (2026-2027)
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            id="tab-courses-btn"
            onClick={() => setActiveTab("courses")}
            className={`btn ${activeTab === "courses" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "8px 14px", fontSize: "13px" }}
          >
            <BookOpen size={16} />
            Đăng ký học phần
          </button>

          <button
            id="tab-timetable-btn"
            onClick={() => setActiveTab("timetable")}
            className={`btn ${activeTab === "timetable" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "8px 14px", fontSize: "13px" }}
          >
            <Calendar size={16} />
            Thời khóa biểu
          </button>

          <button
            id="tab-registered-btn"
            onClick={() => setActiveTab("registered")}
            className={`btn ${activeTab === "registered" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "8px 14px", fontSize: "13px" }}
          >
            <Award size={16} />
            Học phần đã chọn ({stats?.total_registered_courses || 0})
          </button>

          {user?.is_staff && (
            <button
              id="tab-admin-btn"
              onClick={() => setActiveTab("admin")}
              className={`btn ${activeTab === "admin" ? "btn-primary" : "btn-secondary"}`}
              style={{
                padding: "8px 14px",
                fontSize: "13px",
                borderColor: "rgba(245, 158, 11, 0.4)",
                color: activeTab === "admin" ? "#fff" : "#fcd34d",
              }}
            >
              <ShieldAlert size={16} />
              Quản trị viên
            </button>
          )}
        </nav>

        {/* Student Profile & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Credit Progress Indicator */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              padding: "6px 14px",
              minWidth: "160px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "var(--text-secondary)",
                marginBottom: "4px",
              }}
            >
              <span>Số tín chỉ:</span>
              <span
                style={{
                  fontWeight: 700,
                  color: credits >= minCredits ? "var(--success)" : "var(--warning)",
                }}
              >
                {credits} / {maxCredits} TC
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                borderRadius: "3px",
                background: "rgba(255, 255, 255, 0.1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${creditPercent}%`,
                  borderRadius: "3px",
                  background:
                    credits >= maxCredits
                      ? "var(--danger)"
                      : "linear-gradient(90deg, #6366f1, #06b6d4)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Email Inbox Button */}
          <button
            id="open-inbox-btn"
            onClick={onOpenInbox}
            className="btn btn-secondary"
            title="Xem các email thông báo đã nhận"
            style={{
              position: "relative",
              padding: "9px 12px",
              borderRadius: "10px",
            }}
          >
            <Mail size={18} />
            <span style={{ fontSize: "13px" }}>Hộp thư</span>
            {inboxCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "var(--danger)",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: 700,
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 5px rgba(239, 68, 68, 0.5)",
                }}
              >
                {inboxCount}
              </span>
            )}
          </button>

          {/* User Profile Card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "4px 8px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "14px",
                color: "#fff",
              }}
            >
              {user?.first_name ? user.first_name[0] : user?.username?.[0]?.toUpperCase() || "S"}
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600, fontSize: "13px", color: "#fff" }}>
                {user?.full_name || user?.username}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                MSSV: <span style={{ color: "#38bdf8" }}>{user?.mssv}</span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            id="logout-btn"
            onClick={logout}
            className="btn btn-secondary"
            title="Đăng xuất khỏi hệ thống"
            style={{
              padding: "8px",
              color: "#f87171",
              borderColor: "rgba(239, 68, 68, 0.2)",
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
