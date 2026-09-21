import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20, duration: '1m',
  thresholds: {
    'http_req_duration{name:report}': ['p(95)<100'], // Зориуд FAIL болгох хатуу босго
  },
};

export default function () {
  const base = 'http://localhost:3000';
  const r = http.get(`${base}/report`, { tags: { name: 'report' } });
  check(r, { 'report 200': (x) => x.status === 200 });
  sleep(1);
}