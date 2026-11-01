import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Lock,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { api, setUser } from "../api";

export default function ProfileModal({ isOpen, onClose, user, onProfileUpdated }) {
  if (!isOpen || !user) return null;

  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updatedUser = await api.updateProfile(formData);
      setUser(updatedUser);
      setSuccess("Cập nhật thông tin cá nhân và email thành công!");
      if (onProfileUpdated) {
        onProfileUpdated(updatedUser);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || "Không thể cập nhật hồ sơ cá nhân.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(3, 7, 18, 0.78)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "540px",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
          background: "var(--bg-surface)",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.7)",
          padding: "24px 28px",
          position: "relative",
          animation: "modalSlideIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.12)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#38bdf8",
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#ffffff" }}>
                Hồ Sơ Cá Nhân Sinh Viên
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                Quản lý địa chỉ nhận email xác nhận đăng ký học phần
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: "6px", borderRadius: "8px", color: "var(--text-muted)" }}
            title="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        {/* Thông báo lỗi / thành công */}
        {error && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#fca5a5",
              fontSize: "13px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} color="#ef4444" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#6ee7b7",
              fontSize: "13px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle size={16} color="#10b981" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Thông tin định danh cố định */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "10px",
              padding: "14px 16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Lock size={12} /> Thông tin định danh hệ thống (Không chỉnh sửa)
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                fontSize: "13px",
              }}
            >
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Mã sinh viên (MSSV):</span>
                <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#38bdf8", marginTop: "2px" }}>
                  {user.mssv || user.username}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Tài khoản đăng nhập:</span>
                <div style={{ fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
                  {user.username}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Khoa đào tạo:</span>
                <div style={{ fontWeight: 500, color: "#cbd5e1", marginTop: "2px" }}>
                  {user.major || "Khoa Công nghệ Thông tin"}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Phân quyền:</span>
                <div style={{ marginTop: "2px" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                      background: "rgba(99, 102, 241, 0.15)",
                      color: "#a5b4fc",
                      border: "1px solid rgba(99, 102, 241, 0.25)",
                    }}
                  >
                    {user.is_staff ? "Quản trị viên" : "Sinh viên chính quy"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Các thông tin cho phép chỉnh sửa */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Họ & Tên */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  Họ và tên đệm
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Nguyễn Văn"
                  className="input-control"
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  Tên
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Ví dụ: An"
                  className="input-control"
                  style={{ width: "100%" }}
                  required
                />
              </div>
            </div>

            {/* Email nhận thông báo */}
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Mail size={14} color="#38bdf8" /> Email nhận thông báo học phần
                </span>
                <span style={{ fontSize: "11px", color: "#38bdf8" }}>* Tự động gửi thư khi ĐK / Hủy</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="sinhvien@example.com"
                className="input-control"
                style={{ width: "100%" }}
                required
              />
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.4 }}>
                Hệ thống Google Mail Lambda Worker sẽ tự động gửi thư biên lai xác nhận đăng ký và hủy môn học tới địa chỉ này.
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                <Phone size={14} color="#a855f7" /> Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912345678"
                className="input-control"
                style={{ width: "100%" }}
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                <MapPin size={14} color="#34d399" /> Địa chỉ cư trú
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                className="input-control"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "24px",
              borderTop: "1px solid var(--border-color)",
              paddingTop: "16px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary"
              style={{ padding: "8px 16px" }}
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                padding: "8px 20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Save size={16} />
              {loading ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
