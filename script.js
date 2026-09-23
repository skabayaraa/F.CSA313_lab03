import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 5,
  duration: '1m',
};

export default function () {
  const base = 'http://localhost:3000';

  const res = http.post(`${base}/cart/add`);

  check(res, {
    'status 200 байна': (r) => r.status === 200,
  });

  sleep(1);
}