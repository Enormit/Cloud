import React, { useState } from "react";
import {
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Database,
  Cloud,
  Cpu,
  Mail,
  AlertCircle,
} from "lucide-react";
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
      setError(err.message || "Tài khoản hoặc mật khẩu không chính xác.");
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
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: "16px",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              marginBottom: "14px",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <GraduationCap size={30} />
          </div>

          <h1
            style={{
              fontSize: "21px",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.3px",
            }}
          >
            Cổng Đăng Ký Học Phần
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginTop: "5px",
            }}
          >
            Hệ thống đào tạo tín chỉ đại học trực tuyến
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div
            style={{
              background: "var(--danger-subtle)",
              border: "1px solid var(--danger-border)",
              borderRadius: "8px",
              padding: "11px 14px",
              color: "#fda4af",
              fontSize: "13px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "6px",
              }}
            >
              Mã số sinh viên (MSSV) / Tài khoản
            </label>
            <div style={{ position: "relative" }}>
              <User
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: sv001 hoặc 21000101"
                className="input-control"
                style={{ paddingLeft: "38px" }}
                required
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "6px",
              }}
            >
              Mật khẩu
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                className="input-control"
                style={{ paddingLeft: "38px" }}
                required
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "10px", marginTop: "4px" }}
          >
            {loading ? (
              <span>Đang xác thực...</span>
            ) : (
              <>
                <span>Đăng Nhập Hệ Thống</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Section */}
        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)" }}>
          <div
            style={{
              fontSize: "11.5px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "var(--text-muted)",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ShieldCheck size={14} style={{ color: "var(--primary)" }} />
            <span>Tài khoản thử nghiệm nhanh (1-Click)</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              type="button"
              id="demo-student-1"
              onClick={() => handleQuickLogin("sv001", "student123")}
              className="btn btn-secondary"
              style={{
                justifyContent: "space-between",
                padding: "8px 12px",
                fontSize: "12.5px",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="badge badge-primary" style={{ padding: "1px 6px" }}>SV</span>
                <span style={{ fontWeight: 600 }}>Nguyễn Văn An</span>
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "11px", fontVariantNumeric: "tabular-nums" }}>
                sv001 / student123
              </span>
            </button>

            <button
              type="button"
              id="demo-admin"
              onClick={() => handleQuickLogin("admin", "admin123")}
              className="btn btn-secondary"
              style={{
                justifyContent: "space-between",
                padding: "8px 12px",
                fontSize: "12.5px",
                textAlign: "left",
                borderColor: "rgba(245, 158, 11, 0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="badge badge-warning" style={{ padding: "1px 6px" }}>ADMIN</span>
                <span style={{ fontWeight: 600 }}>Ban Quản Trị Đào Tạo</span>
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "11px", fontVariantNumeric: "tabular-nums" }}>
                admin / admin123
              </span>
            </button>
          </div>
        </div>

        {/* Cloud Infrastructure Proof Badges */}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Cloud size={13} style={{ color: "#38bdf8" }} />
            <span>AWS Fargate</span>
          </div>
          <span>&bull;</span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Database size={13} style={{ color: "#a855f7" }} />
            <span>DynamoDB</span>
          </div>
          <span>&bull;</span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Cpu size={13} style={{ color: "#f97316" }} />
            <span>Lambda Async</span>
          </div>
        </div>
      </div>
    </div>
  );
}
