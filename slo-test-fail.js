import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '1m',

  thresholds: {
    'http_req_duration{name:report}': ['p(95)<100'],
  },
};

export default function () {
  const base = 'http://localhost:3000';

  const report = http.get(
    `${base}/report`,
    { tags: { name: 'report' } }
  );

  check(report, {
    'report 200': (r) => r.status === 200,
  });

  sleep(1);
}