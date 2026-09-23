import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const availability = new Rate('availability');

export const options = {
  vus: 20,
  duration: '2m',

  thresholds: {
    'http_req_duration{name:cart}': ['p(95)<200'],
    'http_req_duration{name:report}': ['p(95)<450'],
    'http_req_failed{name:pay}': ['rate<0.08'],
    'availability': ['rate>0.90'],
  },
};

export default function () {
  const base = 'http://localhost:3000';

  const cart = http.post(
    `${base}/cart/add`,
    null,
    { tags: { name: 'cart' } }
  );

  availability.add(cart.status === 200);

  check(cart, {
    'cart 200': (r) => r.status === 200,
  });

  const report = http.get(
    `${base}/report`,
    { tags: { name: 'report' } }
  );

  availability.add(report.status === 200);

  check(report, {
    'report 200': (r) => r.status === 200,
  });

  const pay = http.post(
    `${base}/pay`,
    null,
    { tags: { name: 'pay' } }
  );

  availability.add(pay.status === 200);

  check(pay, {
    'pay 200': (r) => r.status === 200,
  });

  sleep(1);
}