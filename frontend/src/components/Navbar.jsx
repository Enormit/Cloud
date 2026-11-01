import React from "react";
import {
  GraduationCap,
  Mail,
  LogOut,
  Shield,
  CalendarDays,
  BookOpen,
  CheckCircle2,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import { logout } from "../api";

export default function Navbar({
  user,
  stats,
  activeTab,
  setActiveTab,
  onOpenInbox,
  onOpenProfile,
  inboxCount = 0,
}) {
  const credits = stats?.total_registered_credits || 0;
  const maxCredits = stats?.max_credits || 24;
  const minCredits = stats?.min_credits || 10;
  const creditPercent = Math.min(100, Math.round((credits / maxCredits) * 100));

  const isCreditValid = credits >= minCredits && credits <= maxCredits;

  return (
    <header
      id="main-navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--bg-header)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "10px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1480px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Brand Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "16px",
                  letterSpacing: "-0.2px",
                  color: "var(--text-primary)",
                }}
              >
                Cổng Đăng Ký Học Phần
              </span>
              <span
                className="badge badge-primary"
                style={{ fontSize: "10.5px", padding: "1px 7px", letterSpacing: "0.3px" }}
              >
                HỌC KỲ I (2026-2027)
              </span>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "1px",
              }}
            >
              <span className="pulse-indicator" />
              <span>Hệ thống trực tuyến sẵn sàng</span>
            </div>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "var(--bg-surface-subtle)",
            padding: "4px",
            borderRadius: "10px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <button
            id="tab-courses-btn"
            onClick={() => setActiveTab("courses")}
            className={`btn ${activeTab === "courses" ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "7px 14px", fontSize: "13px" }}
          >
            <BookOpen size={15} />
            <span>Môn Học Mở</span>
          </button>

          <button
            id="tab-timetable-btn"
            onClick={() => setActiveTab("timetable")}
            className={`btn ${activeTab === "timetable" ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "7px 14px", fontSize: "13px" }}
          >
            <CalendarDays size={15} />
            <span>Thời Khóa Biểu</span>
          </button>

          <button
            id="tab-registered-btn"
            onClick={() => setActiveTab("registered")}
            className={`btn ${activeTab === "registered" ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "7px 14px", fontSize: "13px" }}
          >
            <CheckCircle2 size={15} />
            <span>Đã Đăng Ký</span>
            {stats?.registered_count > 0 && (
              <span
                style={{
                  background: activeTab === "registered" ? "rgba(255, 255, 255, 0.25)" : "rgba(59, 130, 246, 0.2)",
                  color: activeTab === "registered" ? "#fff" : "#93c5fd",
                  borderRadius: "999px",
                  padding: "0 6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  marginLeft: "2px",
                }}
              >
                {stats.registered_count}
              </span>
            )}
          </button>

          {user?.is_staff && (
            <button
              id="tab-admin-btn"
              onClick={() => setActiveTab("admin")}
              className={`btn ${activeTab === "admin" ? "btn-primary" : "btn-ghost"}`}
              style={{
                padding: "7px 14px",
                fontSize: "13px",
                color: activeTab === "admin" ? "#fff" : "#f59e0b",
              }}
            >
              <Shield size={15} />
              <span>Quản Trị</span>
            </button>
          )}
        </nav>

        {/* Right Tools: Credit Bar, Inbox & Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Credit Progress Pill */}
          {!user?.is_staff && (
            <div
              style={{
                background: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-medium)",
                borderRadius: "8px",
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              title={`Quy định tín chỉ: Tối thiểu ${minCredits} TC - Tối đa ${maxCredits} TC`}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                    Tín chỉ:
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: isCreditValid ? "var(--success)" : "#fcd34d",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {credits} / {maxCredits}
                  </span>
                </div>
                <div
                  style={{
                    width: "75px",
                    height: "4px",
                    background: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "2px",
                    overflow: "hidden",
                    marginTop: "3px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${creditPercent}%`,
                      background: isCreditValid ? "var(--success)" : "var(--primary)",
                      borderRadius: "2px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email Inbox Button */}
          <button
            id="open-inbox-btn"
            onClick={onOpenInbox}
            className="btn btn-secondary"
            style={{
              padding: "8px 12px",
              position: "relative",
            }}
            title="Hộp thư xác nhận đăng ký môn học"
          >
            <Mail size={16} />
            <span style={{ fontSize: "13px" }}>Hộp thư</span>
            {inboxCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "var(--danger)",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: 700,
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--bg-header)",
                }}
              >
                {inboxCount > 9 ? "9+" : inboxCount}
              </span>
            )}
          </button>

          {/* Profile User Button */}
          <button
            id="open-profile-btn"
            onClick={onOpenProfile}
            className="btn btn-secondary"
            style={{
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                background: user?.is_staff ? "rgba(245, 158, 11, 0.2)" : "rgba(59, 130, 246, 0.2)",
                color: user?.is_staff ? "#f59e0b" : "#93c5fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "12px",
              }}
            >
              {user?.first_name ? user.first_name[0] : (user?.username ? user.username[0].toUpperCase() : "U")}
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                {user?.full_name || user?.username}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                {user?.mssv || (user?.is_staff ? "Admin" : "")}
              </div>
            </div>
          </button>

          {/* Logout Button */}
          <button
            id="logout-btn"
            onClick={logout}
            className="btn btn-ghost"
            style={{ padding: "8px 10px" }}
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
