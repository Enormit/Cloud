import React, { useState } from "react";
import { GraduationCap, Lock, User, ArrowRight, ShieldCheck, Mail, Database, Cloud } from "lucide-react";
import { api, setToken, setUser } from "../api";

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(username, password);
      setToken(data.access_token);
      setUser(data.user);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userVal, passVal) => {
    setUsername(userVal);
    setPassword(passVal);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "36px 32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              marginBottom: "16px",
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
            }}
          >
            <GraduationCap size={34} />
          </div>

          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            Đăng Nhập Cổng Đào Tạo
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>
            Hệ thống Đăng ký Môn học Sinh viên &bull; AWS Cloud Architecture
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "10px",
              padding: "12px",
              color: "#fca5a5",
              fontSize: "13px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
              Tên đăng nhập hoặc MSSV:
            </label>
            <div style={{ position: "relative" }}>
              <User size={18} style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)" }} />
              <input
                id="login-username-input"
                type="text"
                required
                placeholder="Nhập mã sinh viên (vd: 21000101) hoặc sv001..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-control"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
              Mật khẩu:
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)" }} />
              <input
                id="login-password-input"
                type="password"
                required
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-control"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px", marginTop: "8px", fontSize: "15px" }}
          >
            {loading ? "Đang xác thực..." : "Đăng Nhập"}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Accounts Selection */}
        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px", textAlign: "center" }}>
            Hoặc chọn nhanh tài khoản thử nghiệm:
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button
              type="button"
              onClick={() => handleQuickLogin("sv001", "student123")}
              className="btn btn-secondary"
              style={{ padding: "8px", fontSize: "12px", textAlign: "left", display: "block" }}
            >
              <div style={{ fontWeight: 700, color: "#38bdf8" }}>sv001 (Sinh viên 1)</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>MSSV: 21000101</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("sv002", "student123")}
              className="btn btn-secondary"
              style={{ padding: "8px", fontSize: "12px", textAlign: "left", display: "block" }}
            >
              <div style={{ fontWeight: 700, color: "#34d399" }}>sv002 (Sinh viên 2)</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>MSSV: 21000102</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("admin", "admin123")}
              className="btn btn-secondary"
              style={{ padding: "8px", fontSize: "12px", textAlign: "left", gridColumn: "span 2", borderColor: "rgba(245, 158, 11, 0.3)" }}
            >
              <div style={{ fontWeight: 700, color: "#fbbf24" }}>admin (Quản trị viên)</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Toàn quyền cấu hình & gửi email test</div>
            </button>
          </div>
        </div>

        {/* Tech Badges Footer */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Cloud size={13} color="#38bdf8" /> AWS Cloud
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Database size={13} color="#a78bfa" /> DynamoDB
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Mail size={13} color="#f472b6" /> SES / SMTP
          </span>
        </div>
      </div>
    </div>
  );
}
