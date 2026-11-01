import React, { useState } from "react";
import {
  Mail,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Send,
  User,
  Inbox,
  Clock,
  Sparkles,
} from "lucide-react";

export default function EmailInboxModal({ emails = [], onClose, onRefresh, loading = false }) {
  const [selectedEmail, setSelectedEmail] = useState(emails.length > 0 ? emails[0] : null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "920px",
          width: "92%",
          height: "82vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.75)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0, 0, 0, 0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.12)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#38bdf8",
              }}
            >
              <Mail size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Hộp Thư Thông Báo Học Phần
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
                Nhật ký biên lai gửi tự động từ Google Mail Lambda Worker qua Interface VPC Endpoint
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="btn btn-secondary"
              style={{ padding: "8px 12px", fontSize: "12px", gap: "6px" }}
              title="Làm mới hộp thư"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>{loading ? "Đang tải..." : "Làm mới"}</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: "8px", borderRadius: "8px", color: "var(--text-muted)" }}
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
              width: "340px",
              borderRight: "1px solid var(--border-color)",
              overflowY: "auto",
              background: "rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-subtle)",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(0, 0, 0, 0.1)",
              }}
            >
              <span>DANH SÁCH THƯ</span>
              <span>{emails.length} thư</span>
            </div>

            {emails.length === 0 ? (
              <div
                style={{
                  padding: "48px 20px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Inbox size={32} style={{ opacity: 0.3 }} />
                <span>Hộp thư hiện đang trống</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Thư xác nhận sẽ xuất hiện khi bạn thao tác đăng ký hoặc hủy học phần.
                </span>
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
                      borderBottom: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      background: isSelected ? "var(--bg-surface-elevated)" : "transparent",
                      transition: "background 0.15s ease",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: isReg ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                          color: isReg ? "#34d399" : "#f87171",
                          border: `1px solid ${isReg ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
                        }}
                      >
                        {isReg ? "Đăng ký thành công" : "Hủy học phần"}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {item.sent_at
                          ? new Date(item.sent_at).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>

                    <div
                      style={{
                        fontWeight: isSelected ? 700 : 600,
                        fontSize: "13px",
                        color: isSelected ? "#ffffff" : "#e2e8f0",
                        marginBottom: "4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.subject}
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.body_preview || "Nội dung biên lai học phần..."}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Email Preview Detail */}
          <div
            style={{
              flex: 1,
              padding: "24px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              background: "var(--bg-canvas)",
            }}
          >
            {selectedEmail ? (
              <>
                {/* Meta details card */}
                <div
                  style={{
                    background: "var(--bg-surface)",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "16px",
                      borderBottom: "1px solid var(--border-subtle)",
                      paddingBottom: "14px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#ffffff",
                        lineHeight: 1.4,
                        margin: 0,
                      }}
                    >
                      {selectedEmail.subject}
                    </h4>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "5px",
                        background: "rgba(56, 189, 248, 0.12)",
                        border: "1px solid rgba(56, 189, 248, 0.25)",
                        color: "#38bdf8",
                        whiteSpace: "nowrap",
                      }}
                    >
                      GOOGLE LAMBDA
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      gap: "8px 14px",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>Người gửi:</span>
                    <span style={{ color: "#38bdf8", fontWeight: 500 }}>
                      Hệ Thống Đào Tạo &lt;noreply@cloud-course.edu.vn&gt;
                    </span>

                    <span style={{ color: "var(--text-muted)" }}>Người nhận:</span>
                    <span style={{ color: "#ffffff", fontWeight: 500 }}>{selectedEmail.recipient}</span>

                    <span style={{ color: "var(--text-muted)" }}>Thời gian:</span>
                    <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                      {selectedEmail.sent_at ? new Date(selectedEmail.sent_at).toLocaleString("vi-VN") : "Vừa xong"}
                    </span>

                    <span style={{ color: "var(--text-muted)" }}>Trạng thái:</span>
                    <span style={{ color: "#34d399", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <CheckCircle2 size={14} /> {selectedEmail.status || "DELIVERED"}
                    </span>
                  </div>
                </div>

                {/* Email Content Box */}
                <div
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    padding: "24px",
                    color: "#e2e8f0",
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                    lineHeight: 1.7,
                    whiteSpace: "pre-line",
                  }}
                >
                  {selectedEmail.body_preview}
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "var(--text-muted)",
                  gap: "12px",
                }}
              >
                <Mail size={40} style={{ opacity: 0.25 }} />
                <span>Chọn một thư trong danh sách bên trái để xem chi tiết</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
