# Лаборатори №3: Сценарио → SLO → k6 threshold

* **Оюутны нэр:** Эрдэнэбаярын Энхсаруул
* **Оюутны код:** B232270145
* **k6 version:** k6 v2.2.0 (commit/00a9a1b7f5, go1.26.5, linux/amd64)# F.CSA313 Lab 03 — 
---

## 1. Лабораторийн ажлын зорилго

Энэ лабораторийн ажлаар системийн чанарын шаардлагыг эхлээд чанарын сценарио хэлбэрээр тодорхойлж, дараа нь SLI болон SLO болгон хувиргасан. Үүний дараа k6 ашиглан performance, reliability, availability хэмжиж, threshold ашиглан шаардлага хангаж байгаа эсэхийг шалгасан.

Тест хийх систем нь Node.js болон Express ашигласан. Системд дараах endpoint-ууд байна.

* `POST /cart/add` — сагсанд бараа нэмэх
* `GET /report` — тайлан авах
* `POST /pay` — төлбөр хийх

Мөн серверийг зориудаар 10 секунд зогсоож chaos test хийж, системийн availability болон reliability-д ямар нөлөө үзүүлж байгааг шалгасан. Эцэст нь `/report` endpoint-ийн threshold-ийг зориудаар бага болгож, k6 тестийг FAIL болгох туршилт хийсэн.

---

# 2. Чанарын сценарио

## 2.1 Performance Scenario

### Overview

Хэрэглэгч сагсанд бараа нэмэх үед систем хурдан хариу өгөх хэрэгтэй. Тиймээс `/cart/add` endpoint-ийн response time-ийг хэмжиж performance-ийг шалгасан.

### System State

Сервер ажиллаж байгаа бөгөөд `/cart/add` endpoint хэвийн ажиллагаатай байна.

### Environment State

Тестийг локал орчинд `localhost:3000` дээр ажиллуулсан. k6 ашиглан 20 virtual user ачаалал үүсгэсэн.

### External Stimulus

20 virtual user зэрэг `/cart/add` endpoint рүү хүсэлт илгээнэ.

### Required Response

Систем хүсэлт бүрт хурдан хариу өгч, барааг амжилттай нэмэх ёстой.

### Measure

`http_req_duration` metric ашиглан response time-ийг хэмжиж, p95 утгыг шалгасан.

**SLO: `/cart/add` p95 < 200 ms**

---

## 2.2 Reliability Scenario

### Overview

Хэрэглэгч төлбөр хийх үед системийн алдааны түвшин бага байх шаардлагатай. Тиймээс `/pay` endpoint-ийн failure rate-ийг хэмжсэн.

### System State

Сервер ажиллаж байгаа бөгөөд `/pay` endpoint хүсэлт хүлээн авч байна.

### Environment State

Тестийг локал сервер дээр 20 virtual user ашиглан ажиллуулсан.

### External Stimulus

Хэрэглэгч төлбөр хийх үйлдэл хийж `/pay` endpoint рүү хүсэлт илгээнэ.

### Required Response

Төлбөрийн хүсэлтүүдийн ихэнх нь амжилттай боловсруулагдах ёстой.

### Measure

`http_req_failed{name:pay}` metric ашиглан `/pay` endpoint-ийн error rate-ийг хэмжсэн.

**SLO: `/pay` error rate < 8%**

---

## 2.3 Availability Scenario

### Overview

Сервер түр хугацаанд унтарсан үед систем дахин хэр хурдан сэргэж байгааг шалгасан.

### System State

k6 тест ажиллаж байх үед Node.js сервер хэвийн ажиллаж байсан.

### Environment State

Тестийг 20 virtual user ашиглан 2 минут ажиллуулсан. Chaos test-ийн үед серверийг зориудаар ойролцоогоор 10 секунд зогсоож, дараа нь дахин ажиллуулсан.

### External Stimulus

**FAILURE** буюу серверийг `Ctrl+C` ашиглан зогсоосон. Ойролцоогоор 10 секундийн дараа `node server.js` командаар серверийг дахин ажиллуулсан.

### Required Response

Сервер дахин ассан даруйд хүсэлтүүдийг дахин хүлээн авч, үйлчилгээ хэвийн үргэлжлэх шаардлагатай.

### Measure

Availability-ийг амжилттай болсон request-ийн хувийг нийт request-ийн тоотой харьцуулж хэмжсэн.

**SLO: Availability ≥ 90%**

Мөн chaos test-ийн үед серверийг зогсоосон хугацаа болон дахин сэргээсэн хугацааг ажигласан.

---

# 3. SLI болон SLO

| Чанарын үзүүлэлт   | SLI                           | SLO / Threshold  | Тестийн нөхцөл |
| ------------------ | ----------------------------- | ---------------- | -------------- |
| Performance        | `/cart/add` p95 response time | **p95 < 200 ms** | 20 VU, 1 минут |
| Reliability        | `/pay` error rate             | **< 8%**         | 20 VU, 1 минут |
| Availability       | Амжилттай request-ийн хувь    | **≥ 90%**        | 20 VU, 2 минут |
| Report Performance | `/report` p95 response time   | **p95 < 450 ms** | 20 VU, 2 минут |

`/report` endpoint-ийг нэмэлт performance SLO болгон оруулсан. Учир нь тайлан боловсруулах үйлдэл нь `/cart/add`-аас удаан байдаг тул тусад нь threshold тавьж шалгасан.

---

# 4. Threshold-ийн сонголт

`/cart/add` нь хэрэглэгчийн шууд үйлдэл учраас хурдан хариу өгөх шаардлагатай. Тиймээс p95 response time-ийг 200 ms-ээс бага байхаар сонгосон.

`/report` endpoint нь тайлан боловсруулах учраас арай удаан ажилладаг. Тиймээс p95 threshold-ийг 450 ms болгосон.

`/pay` endpoint дээр тодорхой хэмжээний алдаа гарах боломжтой тул error rate-ийг 8%-иас бага байхаар тогтоосон.

Availability-ийн хувьд нийт хүсэлтийн 90%-иас доошгүй нь амжилттай байх шаардлагатай гэж үзсэн.

---

# 5. Error Budget

Availability SLO нь 90% байгаа учраас зөвшөөрөгдөх downtime нь 10% байна.

Тестийн хугацаа:

**2 минут = 120 секунд**

Error budget:

**120 × 10% = 12 секунд**

Иймээс 2 минутын хугацаанд нийт 12 секунд хүртэлх downtime нь time-based error budget-д багтана.

Chaos test-ийн үед серверийг ойролцоогоор 10 секунд зогсоосон. Энэ нь 12 секундын time-based error budget-ээс бага боловч request-based availability SLO автоматаар хангагдана гэсэн үг биш.

Учир нь сервер унтарсан 10 секундын хугацаанд k6 олон request илгээж, тэдгээрийн зарим нь амжилтгүй болсон. Тиймээс нийт амжилттай request-ийн хувь 90%-иас доош орж болно.

Энэ тестээр time-based error budget болон request-based availability нь хоёр өөр хэмжүүр болохыг харуулсан.

---

# 6. k6 Script болон Threshold

Үндсэн `slo-test.js` файлд endpoint-үүдийг tag ашиглан ялгасан.

```javascript
thresholds: {
  'http_req_duration{name:cart}': ['p(95)<200'],
  'http_req_duration{name:report}': ['p(95)<450'],
  'http_req_failed{name:pay}': ['rate<0.08'],
  'availability': ['rate>0.90'],
},
```

Мөн `availability` гэсэн custom Rate metric үүсгэж, endpoint бүрийн амжилттай request-ийг тооцсон.

Ингэснээр endpoint тус бүрийн performance болон reliability threshold-ийг тусад нь шалгаж, нийт availability-ийг мөн хэмжих боломжтой болсон.

---

# 7. Normal PASS Test

Хэвийн нөхцөлд 20 VU ашиглан k6 test ажиллуулсан.

### Үр дүн

| Metric            |        Үр дүн | Threshold | Төлөв |
| ----------------- | ------------: | --------: | ----- |
| Availability      |    **98.28%** |     > 90% | PASS  |
| `/cart/add` p95   |   **3.34 ms** |  < 200 ms | PASS  |
| `/report` p95     | **393.67 ms** |  < 450 ms | PASS  |
| `/pay` error rate |     **5.14%** |      < 8% | PASS  |

Нийт **5535 request** илгээгдсэнээс **5440 request амжилттай** болсон.

Availability:

**5440 / 5535 × 100 = 98.28%**

Ингэснээр хэвийн нөхцөлд бүх үндсэн threshold хангагдсан.

Дэлгэрэнгүй k6 output:

```text
results/pass.txt
```

---

# 8. Chaos Test

Chaos test-ийн үед k6-ийг 20 VU, 2 минутын хугацаатай ажиллуулж байхдаа серверийг зориудаар зогсоосон. Серверийг ойролцоогоор 10 секундийн дараа дахин ажиллуулсан.

### Үр дүн

| Metric            |        Үр дүн | Threshold | Төлөв |
| ----------------- | ------------: | --------: | ----- |
| Availability      |    **88.20%** |     > 90% | FAIL  |
| `/cart/add` p95   |   **3.33 ms** |  < 200 ms | PASS  |
| `/report` p95     | **393.15 ms** |  < 450 ms | PASS  |
| `/pay` error rate |    **15.43%** |      < 8% | FAIL  |

Нийт **5655 request**-ээс **4988 request амжилттай**, **667 request амжилтгүй** болсон.

Availability:

**4988 / 5655 × 100 = 88.20%**

Ингэснээр availability-ийн 90%-ийн SLO хангагдаагүй.

`/pay` endpoint дээр:

**291 / 1885 × 100 = 15.43%**

error гарсан. Энэ нь 8%-ийн threshold-ээс өндөр учраас reliability SLO мөн FAIL болсон.

Харин `/cart/add` болон `/report` endpoint-ийн performance threshold PASS хэвээр байсан.

### Chaos test-ийн гол үр дүн

```text
availability = 88.20% → FAIL
/pay error rate = 15.43% → FAIL
/cart p95 = 3.33 ms → PASS
/report p95 = 393.15 ms → PASS
```

Дэлгэрэнгүй output:

```text
results/chaos.txt
```

---

# 9. Availability ба Reliability-ийн ялгаа

Chaos test-ийн үед availability болон reliability хоёулаа муудсан боловч эдгээр нь ижил хэмжүүр биш.

Availability нь систем хэрэглэгчийн хүсэлтийг ерөнхийдөө амжилттай хүлээн авч үйлчилгээ үзүүлж байгаа эсэхийг хэмждэг.

Reliability нь тухайн үйлдэл, энэ тохиолдолд `/pay` төлбөрийн request-ийн алдааны түвшинг хэмжсэн.

Сервер унтарсан үед олон endpoint-ийн request амжилтгүй болсон тул availability **88.20%** болсон.

Мөн `/pay` endpoint дээр **291 алдаа** гарсан тул payment error rate **15.43%** болсон.

Иймээс нэг failure event хоёр өөр SLI-д нөлөөлж болох боловч хэмжиж байгаа чанарын үзүүлэлт нь өөр байна.

---

# 10. Deliberate FAIL Test

Threshold-ийг зориудаар FAIL болгохын тулд `slo-test-fail.js` файлд `/report` endpoint-ийн threshold-ийг:

```javascript
'http_req_duration{name:report}': ['p(95)<100'],
```

гэж өөрчилсөн.

Өмнөх тестүүдээр `/report` endpoint-ийн p95 ойролцоогоор 390 ms байсан тул 100 ms-ийн threshold-ийг хангахгүй.

### FAIL test-ийн үр дүн

```text
http_req_duration{name:report}
✗ 'p(95)<100' p(95)=389.05ms
```

Өөрөөр хэлбэл:

**389.05 ms > 100 ms**

тул threshold зөрчигдөж, k6 тестийг FAIL болгосон.

Гэхдээ `/report` endpoint өөрөө HTTP 200 status буцаасан бөгөөд:

**931 / 931 = 100%**

request check амжилттай болсон.

Энэ нь endpoint ажиллагааны хувьд хэвийн боловч performance SLO-г хангаагүй гэдгийг харуулж байна.

k6:

```text
thresholds on metrics 'http_req_duration{name:report}' have been crossed
```

гэж гарсан.

Дэлгэрэнгүй output:

```text
results/fail.txt
```

---

# 11. Тестүүдийн нийт үр дүн

| Test            | Availability |    Cart p95 |    Report p95 | Pay error rate |
| --------------- | -----------: | ----------: | ------------: | -------------: |
| Normal PASS     |   **98.28%** | **3.34 ms** | **393.67 ms** |      **5.14%** |
| Chaos           |   **88.20%** | **3.33 ms** | **393.15 ms** |     **15.43%** |
| Deliberate FAIL |            — |           — | **389.05 ms** |              — |

Normal test үед бүх SLO хангагдсан.

Chaos test үед availability болон `/pay` reliability SLO зөрчигдсөн боловч `/cart/add` болон `/report` performance threshold хангагдсан.

Deliberate FAIL test-ийн үед `/report`-ийн threshold-ийг 100 ms болгож зориудаар бууруулснаар k6 threshold FAIL болсон.

---

# 12. Тестийн үр дүнгийн файлууд

Тестийн бүрэн k6 output-уудыг дараах файлуудад хадгалсан.

```text
results/
├── pass.txt
├── chaos.txt
└── fail.txt
```

`pass.txt` — хэвийн нөхцөлд хийсэн PASS test

`chaos.txt` — серверийг зориудаар зогсоож хийсэн Chaos test

`fail.txt` — threshold-ийг зориудаар зөрчүүлсэн FAIL test

---

# 13. Төслийн бүтэц

```text
F.CSA313_lab03/
│
├── README.md
├── package.json
├── package-lock.json
├── server.js
├── script.js
├── slo-test.js
├── slo-test-fail.js
│
├── results/
│   ├── pass.txt
│   ├── chaos.txt
│   └── fail.txt
│
└── .gitignore
```

`node_modules/` санг Git repository-д оруулахгүй байхаар `.gitignore` файлд:

```text
node_modules/
```

гэж нэмсэн.

---

# 14. Git

Лабораторийн ажлыг Git ашиглан үе шаттай хадгалсан.

Ажлын үе шатуудыг commit-уудаар хадгалсан бөгөөд код, k6 script, тестийн үр дүн болон README нь тус тусдаа шинэчлэгдсэн.

Жишээ нь:

```text
Initial lab setup
Add SLO scenarios and k6 thresholds
Add chaos and deliberate fail test results
```

Git history нь лабораторийн ажлыг үе шаттай хийсэн байдлыг харуулна.

---

# 15. Дүгнэлт

Энэ лабораторийн ажлаар чанарын шаардлагыг эхлээд scenario хэлбэрээр тодорхойлж, дараа нь SLI болон SLO болгон хувиргаж үзсэн. Хэвийн нөхцөлд availability 98.28%, `/cart/add` p95 3.34 ms, `/report` p95 393.67 ms, `/pay` error rate 5.14% гарч бүх үндсэн threshold хангагдсан. Chaos test хийхдээ серверийг ойролцоогоор 10 секунд зогсоосон бөгөөд үүний дараа availability 88.20% болж 90%-ийн SLO-г хангаагүй. Мөн `/pay` error rate 15.43% болж reliability-ийн 8%-ийн босгоос давсан. Харин `/cart/add` болон `/report` endpoint-ийн performance threshold chaos test-ийн үед мөн PASS гарсан. Энэ нь серверийн тасалдал нь бүх SLO-д ижил хэмжээгээр нөлөөлөхгүй байж болохыг харуулсан. 2 минутын availability SLO дээр тооцоход error budget 12 секунд болсон. Гэхдээ серверийг 10 секунд зогсоосон нь time-based error budget дотор байсан ч request-based availability 88.20% болсон тул availability SLO зөрчигдсөн. Эцэст нь `/report` endpoint-ийн p95 threshold-ийг зориудаар 100 ms болгож багасгахад бодит p95 нь 389.05 ms гарч threshold зөрчигдсөн. Ингэснээр k6 threshold ашиглан системийн чанарын шаардлагыг автоматаар шалгаж, SLO хангаж байгаа эсэхийг бодит тестийн үр дүнгээр тодорхойлох боломжтойг туршиж үзсэн.
