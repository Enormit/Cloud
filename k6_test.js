import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 50 },  // Tăng nhanh lên 50 VUs trong 20s
    { duration: '5m', target: 50 },   // Giữ ổn định 50 VUs liên tục suốt 5 phút
    { duration: '20s', target: 0 },   // Hạ tải về 0
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

  // Nghỉ 40ms giữa các request để duy trì tải đều đặn và mượt mà
  sleep(0.04);
}
