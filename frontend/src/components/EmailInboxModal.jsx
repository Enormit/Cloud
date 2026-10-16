import React, { useState } from "react";
import { Mail, X, CheckCircle, AlertTriangle, Send, RefreshCw, Calendar, BookOpen } from "lucide-react";

export default function EmailInboxModal({ emails = [], onClose, onRefresh, loading = false }) {
  const [selectedEmail, setSelectedEmail] = useState(emails.length > 0 ? emails[0] : null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "880px",
          width: "90%",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(99, 102, 241, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff" }}>
                Hộp Thư Thông Báo Email Sinh Viên
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Nhật ký email xác nhận đăng ký / hủy môn học được gửi qua AWS SES / SMTP
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="btn btn-secondary"
              style={{ padding: "8px", borderRadius: "8px" }}
              title="Làm mới hộp thư"
            >
              <RefreshCw size={15} className={loading ? "spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: "8px", borderRadius: "8px" }}
              title="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
          {/* Left Email List */}
          <div
            style={{
              width: "320px",
              borderRight: "1px solid var(--border-color)",
              overflowY: "auto",
              background: "rgba(0, 0, 0, 0.15)",
            }}
          >
            {emails.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                Chưa có email nào trong hộp thư. Hãy đăng ký hoặc hủy một môn học để nhận email!
              </div>
            ) : (
              emails.map((item) => {
                const isSelected = selectedEmail?.id === item.id;
                const isReg = item.action === "REGISTER";
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEmail(item)}
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      cursor: "pointer",
                      background: isSelected ? "rgba(99, 102, 241, 0.12)" : "transparent",
                      borderLeft: isSelected ? "3px solid var(--primary)" : "3px solid transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span
                        className={`badge ${isReg ? "badge-success" : "badge-danger"}`}
                        style={{ fontSize: "10px", padding: "2px 6px" }}
                      >
                        {isReg ? "Đăng ký" : "Hủy môn"}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {item.sent_at ? new Date(item.sent_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "#fff", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.subject}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.body_preview || "Chi tiết học phần..."}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Email Preview Detail */}
          <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
            {selectedEmail ? (
              <>
                <div style={{ background: "rgba(0, 0, 0, 0.25)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                      {selectedEmail.subject}
                    </h4>
                    <span className="badge badge-primary" style={{ fontSize: "11px" }}>
                      {selectedEmail.provider?.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 12px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Người gửi:</span>
                    <span style={{ color: "#38bdf8" }}>Hệ Thống Đào Tạo &lt;noreply@course-reg.edu.vn&gt;</span>

                    <span style={{ color: "var(--text-muted)" }}>Người nhận:</span>
                    <span style={{ color: "#fff" }}>{selectedEmail.recipient}</span>

                    <span style={{ color: "var(--text-muted)" }}>Thời gian:</span>
                    <span>{selectedEmail.sent_at ? new Date(selectedEmail.sent_at).toLocaleString("vi-VN") : ""}</span>

                    <span style={{ color: "var(--text-muted)" }}>Trạng thái:</span>
                    <span style={{ color: "#34d399", fontWeight: 600 }}>
                      ✓ {selectedEmail.status}
                    </span>
                  </div>
                </div>

                {/* Email Body Preview Box */}
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    padding: "20px",
                    color: "#e2e8f0",
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {selectedEmail.body_preview}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                Chọn một email từ danh sách bên trái để đọc nội dung
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
