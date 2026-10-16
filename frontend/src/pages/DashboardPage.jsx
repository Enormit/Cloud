import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Calendar,
  Award,
  RefreshCw,
  BellRing,
} from "lucide-react";
import { api } from "../api";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import Timetable from "../components/Timetable";
import RegisteredCourses from "../components/RegisteredCourses";
import EmailInboxModal from "../components/EmailInboxModal";
import CourseDetailModal from "../components/CourseDetailModal";
import AdminDashboard from "../components/AdminDashboard";

export default function DashboardPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("courses"); // courses | timetable | registered | admin
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
        user={user}
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInbox={() => setShowInboxModal(true)}
        inboxCount={emails.length}
      />

      {/* Main Container */}
      <main style={{ maxWidth: "1440px", margin: "0 auto", width: "100%", padding: "24px", flex: 1 }}>
        {/* Registration Window Live Alert Banner */}
        <div
          className="glass-panel"
          style={{
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            borderLeft: windowInfo?.is_open ? "4px solid var(--success)" : "4px solid var(--danger)",
            background: windowInfo?.is_open
              ? "linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)"
              : "rgba(239, 68, 68, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {windowInfo?.is_open ? (
              <span className="pulse-indicator" />
            ) : (
              <AlertCircle size={20} color="#f87171" />
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <strong style={{ fontSize: "14px", color: "#fff" }}>
                  {windowInfo?.name || "Đợt Đăng Ký Học Kỳ I (2026-2027)"}
                </strong>
                <span className={`badge ${windowInfo?.is_open ? "badge-success" : "badge-danger"}`}>
                  {windowInfo?.is_open ? "Đang mở đăng ký" : "Đã đóng cổng"}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {windowInfo?.message || "Sinh viên đăng ký và nhận email xác nhận tức thì qua AWS SES."}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={loadAllData}
              disabled={loadingData}
              className="btn btn-secondary"
              style={{ padding: "6px 12px", fontSize: "12px" }}
              title="Tải lại dữ liệu hệ thống"
            >
              <RefreshCw size={13} className={loadingData ? "spin" : ""} />
              Làm mới
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
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              {/* Search Box */}
              <form
                onSubmit={handleSearchSubmit}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flex: 1,
                  maxWidth: "460px",
                  position: "relative",
                }}
              >
                <Search size={18} style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }} />
                <input
                  id="course-search-input"
                  type="text"
                  placeholder="Tìm theo mã môn, tên môn hoặc tên giảng viên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: "42px" }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: "9px 16px" }}>
                  Tìm kiếm
                </button>
              </form>

              {/* Department Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Filter size={16} color="var(--text-muted)" />
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

            {/* Course Grid */}
            {courses.length === 0 ? (
              <div className="glass-panel" style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                <BookOpen size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
                <h4 style={{ fontSize: "16px", color: "#fff", marginBottom: "6px" }}>
                  Không tìm thấy môn học nào
                </h4>
                <p style={{ fontSize: "13px" }}>
                  Vui lòng thử tìm kiếm bằng từ khóa khác hoặc xóa bộ lọc khoa.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                  gap: "20px",
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

      {/* Toast Notification Alert */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === "success" && <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0 }} />}
            {toast.type === "error" && <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />}
            {toast.type === "info" && <BellRing size={20} color="#06b6d4" style={{ flexShrink: 0 }} />}
            <div style={{ fontSize: "14px", color: "#fff", lineHeight: 1.5 }}>
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
