const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

export function getUser() {
  const raw = localStorage.getItem("user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.reload();
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    logout();
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.detail || data.message || `Lỗi hệ thống (${response.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (username_or_mssv, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username_or_mssv, password }),
    }),
  getMe: () => request("/auth/me"),

  // Courses
  getCourses: (search = "", department = "") => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (department) params.append("department", department);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request(`/courses/${qs}`);
  },
  getCourseDetail: (courseId) => request(`/courses/${courseId}`),

  // Registrations
  getMyRegistrations: () => request("/registrations/"),
  getStudentStats: () => request("/registrations/stats"),
  getWindowInfo: () => request("/registrations/window"),
  registerCourse: (course_id) =>
    request("/registrations/register", {
      method: "POST",
      body: JSON.stringify({ course_id }),
    }),
  cancelCourse: (course_id) =>
    request(`/registrations/${course_id}/cancel`, {
      method: "DELETE",
    }),

  // Email notifications
  getMyInbox: () => request("/emails/my-inbox"),
  getAllEmailLogs: () => request("/emails/logs"),
  sendTestEmail: (recipient, subject, content) =>
    request("/emails/send-test", {
      method: "POST",
      body: JSON.stringify({ recipient, subject, content }),
    }),

  // Admin
  getAdminStats: () => request("/admin/stats"),
  createCourse: (courseData) =>
    request("/admin/courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    }),
  updateCourse: (courseId, courseData) =>
    request(`/admin/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(courseData),
    }),
  deleteCourse: (courseId) =>
    request(`/admin/courses/${courseId}`, {
      method: "DELETE",
    }),
  getCourseRoster: (courseId) => request(`/admin/courses/${courseId}/students`),
  updateWindow: (windowData) =>
    request("/admin/window", {
      method: "PUT",
      body: JSON.stringify(windowData),
    }),
};
