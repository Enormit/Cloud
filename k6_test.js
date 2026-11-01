import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 30 },  // Khởi động tăng lên 30 VUs trong 30s
    { duration: '3m', target: 70 },   // Đẩy tải cao 70 VUs liên tục trong 3 phút
    { duration: '30s', target: 0 },   // Hạ tải về 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'https://enormitpham.me';

// Setup function chạy 1 lần duy nhất để lấy JWT token
export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      username_or_mssv: 'sv001',
      password: 'student123',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const token = loginRes.json('access_token');
  console.log(`[k6 Setup] Lấy Access Token thành công: ${token.substring(0, 20)}...`);
  return { token };
}

export default function (data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  // 1. Gọi API lấy danh sách môn học
  const resCourses = http.get(`${BASE_URL}/api/courses/`, params);
  check(resCourses, {
    'courses status is 200': (r) => r.status === 200,
  });

  // 2. Gọi API lấy thống kê tín chỉ sinh viên
  const resStats = http.get(`${BASE_URL}/api/registrations/stats`, params);
  check(resStats, {
    'stats status is 200': (r) => r.status === 200,
  });

  // Nghỉ nhẹ 20ms giữa các request để duy trì tải liên tục
  sleep(0.02);
}
