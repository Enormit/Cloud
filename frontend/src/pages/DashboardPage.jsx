import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  RefreshCw,
  BellRing,
  X,
  Layers,
  GraduationCap,
} from "lucide-react";
import { api } from "../api";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import Timetable from "../components/Timetable";
import RegisteredCourses from "../components/RegisteredCourses";
import EmailInboxModal from "../components/EmailInboxModal";
import CourseDetailModal from "../components/CourseDetailModal";
import AdminDashboard from "../components/AdminDashboard";
import ProfileModal from "../components/ProfileModal";

export default function DashboardPage({ user, onLogout, onUpdateUser }) {
  const [currentUser, setCurrentUser] = useState(user);
  const [activeTab, setActiveTab] = useState("courses"); // courses | timetable | registered | admin
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [windowInfo, setWindowInfo] = useState(null);
  const [emails, setEmails] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  // Modals & State
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Toasts
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const loadAllData = async () => {
    try {
      setLoadingData(true);
      const [coursesData, regsData, statsData, winData, emailsData] =
        await Promise.all([
          api.getCourses(search, department),
          api.getMyRegistrations(),
          api.getStudentStats(),
          api.getWindowInfo(),
          api.getMyInbox(),
        ]);
      setCourses(coursesData);
      setRegistrations(regsData);
      setStats(statsData);
      setWindowInfo(winData);
      setEmails(emailsData);
    } catch (err) {
      showToast("error", err.message || "Không thể tải dữ liệu.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [department]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    api
      .getCourses(search, department)
      .then(setCourses)
      .catch((err) => showToast("error", err.message));
  };

  const handleRegister = async (course) => {
    setLoadingAction(true);
    try {
      const res = await api.registerCourse(course.id);
      showToast("success", res.message || `Đăng ký môn ${course.name} thành công! Email xác nhận đã gửi.`);
      await loadAllData();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancelCourse = async (course) => {
    setLoadingAction(true);
    try {
      const res = await api.cancelCourse(course.id);
      showToast("info", res.message || `Đã hủy môn ${course.name}. Email thông báo đã gửi.`);
      await loadAllData();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const registeredCourseObjects = registrations
    .map((r) => r.course)
    .filter(Boolean);

  const departmentsList = [
    "Tất cả các khoa",
    "Khoa CNTT",
    "Kỹ thuật Phần mềm",
    "Khoa học Máy tính",
    "Hệ thống Thông tin",
    "Mạng máy tính",
    "An toàn Thông tin",
    "Khoa học Dữ liệu",
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <Navbar
        user={currentUser}
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInbox={() => setShowInboxModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        inboxCount={emails.length}
      />

      {/* Main Container */}
      <main style={{ maxWidth: "1480px", margin: "0 auto", width: "100%", padding: "20px 24px", flex: 1 }}>
        {/* Registration Window Live Alert Banner (Refined without banned 4px border-left) */}
        <div
          className="glass-panel"
          style={{
            padding: "14px 18px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            background: windowInfo?.is_open
              ? "rgba(16, 185, 129, 0.05)"
              : "rgba(244, 63, 94, 0.05)",
            borderColor: windowInfo?.is_open
              ? "var(--success-border)"
              : "var(--danger-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {windowInfo?.is_open ? (
              <span className="pulse-indicator" />
            ) : (
              <AlertCircle size={18} style={{ color: "var(--danger)" }} />
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <strong style={{ fontSize: "13.5px", color: "var(--text-primary)" }}>
                  {windowInfo?.name || "Đợt Đăng Ký Học Kỳ I (2026-2027)"}
                </strong>
                <span className={`badge ${windowInfo?.is_open ? "badge-success" : "badge-danger"}`}>
                  {windowInfo?.is_open ? "Cổng Đang Mở" : "Cổng Đã Đóng"}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {windowInfo?.message || "Sinh viên đăng ký và nhận thư điện tử xác nhận tức thì qua Google Mail (Serverless Lambda)."}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={loadAllData}
              disabled={loadingData}
              className="btn btn-secondary"
              style={{ padding: "6px 12px", fontSize: "12.5px" }}
              title="Tải lại dữ liệu hệ thống"
            >
              <RefreshCw size={13} className={loadingData ? "spin" : ""} />
              <span>Cập nhật</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Course Catalog & Registration */}
        {activeTab === "courses" && (
          <div>
            {/* Search and Filters Bar */}
            <div
              className="glass-panel"
              style={{
                padding: "16px 20px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {/* Row 1: Search Box & Department Dropdown */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                {/* Search Box */}
                <form
                  onSubmit={handleSearchSubmit}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flex: 1,
                    maxWidth: "520px",
                    position: "relative",
                  }}
                >
                  <Search size={16} style={{ position: "absolute", left: "12px", color: "var(--text-muted)" }} />
                  <input
                    id="course-search-input"
                    type="text"
                    placeholder="Tìm theo mã môn (COMP1024), tên môn học hoặc giảng viên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-control"
                    style={{ paddingLeft: "36px", paddingRight: search ? "32px" : "12px" }}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        api.getCourses("", department).then(setCourses);
                      }}
                      style={{
                        position: "absolute",
                        right: "95px",
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary" style={{ padding: "8px 16px" }}>
                    Tìm kiếm
                  </button>
                </form>

                {/* Department Dropdown */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Filter size={15} style={{ color: "var(--text-muted)" }} />
                  <select
                    id="department-filter-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value === "Tất cả các khoa" ? "" : e.target.value)}
                    className="input-control"
                    style={{ minWidth: "190px" }}
                  >
                    {departmentsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Department Quick Filter Pills */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "2px",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, flexShrink: 0 }}>
                  Khoa / Chuyên ngành:
                </span>
                {departmentsList.map((d) => {
                  const isSelected = (department === "" && d === "Tất cả các khoa") || department === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDepartment(d === "Tất cả các khoa" ? "" : d)}
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: "6px",
                        border: "1px solid",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.15s ease",
                        background: isSelected ? "var(--primary)" : "var(--bg-surface-subtle)",
                        color: isSelected ? "#ffffff" : "var(--text-secondary)",
                        borderColor: isSelected ? "var(--primary)" : "var(--border-subtle)",
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total Results Summary */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
                fontSize: "13px",
                color: "var(--text-muted)",
              }}
            >
              <div>
                Hiển thị <strong style={{ color: "var(--text-primary)" }}>{courses.length}</strong> học phần mở
                {department && <span> thuộc <em>{department}</em></span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }} />
                  Đã đăng ký ({registrations.length})
                </span>
              </div>
            </div>

            {/* Course Grid */}
            {courses.length === 0 ? (
              <div
                className="glass-panel"
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  background: "var(--bg-surface-subtle)",
                  borderRadius: "12px",
                }}
              >
                <BookOpen size={42} style={{ opacity: 0.35, marginBottom: "12px" }} />
                <h4 style={{ fontSize: "16px", color: "var(--text-primary)", marginBottom: "6px" }}>
                  Không tìm thấy học phần phù hợp
                </h4>
                <p style={{ fontSize: "13px" }}>
                  Vui lòng thử tìm kiếm bằng từ khóa khác hoặc bấm nút "Tất cả các khoa" ở trên.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                  gap: "18px",
                }}
              >
                {courses.map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    onRegister={handleRegister}
                    onCancel={handleCancelCourse}
                    onViewDetails={setSelectedCourseDetail}
                    loading={loadingAction}
                    windowOpen={windowInfo?.is_open}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Timetable Matrix */}
        {activeTab === "timetable" && (
          <Timetable
            registeredCourses={registeredCourseObjects}
            onSelectCourse={setSelectedCourseDetail}
          />
        )}

        {/* Tab 3: Registered Courses Summary */}
        {activeTab === "registered" && (
          <RegisteredCourses
            registrations={registrations}
            onCancelCourse={handleCancelCourse}
            loading={loadingAction}
            windowOpen={windowInfo?.is_open}
          />
        )}

        {/* Tab 4: Admin Portal */}
        {activeTab === "admin" && user?.is_staff && (
          <AdminDashboard onShowToast={showToast} />
        )}
      </main>

      {/* Course Detail Modal */}
      {selectedCourseDetail && (
        <CourseDetailModal
          course={selectedCourseDetail}
          onClose={() => setSelectedCourseDetail(null)}
          onRegister={handleRegister}
          windowOpen={windowInfo?.is_open}
        />
      )}

      {/* Email Inbox Modal */}
      {showInboxModal && (
        <EmailInboxModal
          emails={emails}
          onClose={() => setShowInboxModal(false)}
          onRefresh={loadAllData}
          loading={loadingData}
        />
      )}

      {/* User Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={currentUser}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
            if (onUpdateUser) onUpdateUser(updated);
            showToast("success", "Đã cập nhật hồ sơ cá nhân thành công!");
          }}
        />
      )}

      {/* Toast Notification Alert */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === "success" && <CheckCircle2 size={18} style={{ color: "var(--success)", flexShrink: 0 }} />}
            {toast.type === "error" && <AlertCircle size={18} style={{ color: "var(--danger)", flexShrink: 0 }} />}
            {toast.type === "info" && <BellRing size={18} style={{ color: "var(--secondary)", flexShrink: 0 }} />}
            <div style={{ fontSize: "13.5px", color: "var(--text-primary)", lineHeight: 1.4 }}>
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
