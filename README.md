# TripLog AI — Frontend

React 기반 웹 클라이언트.

API 스펙 전체: [`Docs/API_CONTRACT.md`](../Docs/API_CONTRACT.md) 섹션 1

---

## Quick Start

**Node.js 18+ 필요**

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일에 VITE_API_BASE_URL 입력

# 3. 개발 서버 실행
npm run dev
```

`http://localhost:5173` 에서 확인

---

## 환경 변수 (`.env`)

```
VITE_API_BASE_URL=http://localhost:8080   # prod: BE EC2 URL
```

---

## Mock API로 즉시 개발 시작

BE Mock 서버가 이미 준비되어 있습니다. Swagger에서 응답 형태 확인 가능.

```bash
# BE Mock 서버 실행 (별도 터미널)
cd ../Backend && ./mvnw spring-boot:run
```

| URL | 용도 |
|-----|------|
| `http://localhost:8080/swagger-ui.html` | 전체 API 명세 + 테스트 |
| `http://localhost:8080/h2-console` | DB 콘솔 (dev 전용) |

H2 Console: JDBC URL `jdbc:h2:mem:tripledb` / Username `sa` / Password 없음

---

## Week 1 구현 목표

Mock API 기반으로 UI 먼저 완성 → 실제 API 붙이기

```
[ ] 홈 화면 (YouTube 추천 코스 목록)    GET  /api/v1/youtube-courses
[ ] 내 여행 목록                         GET  /api/v1/itineraries
[ ] 일정 상세 (대안 장소 포함)           GET  /api/v1/itineraries/{id}
[ ] 대안 장소 Swap UI                    PATCH /api/v1/itineraries/.../swap
[ ] AI 일정 생성 폼 (도시/기간/테마 등)  POST /api/v1/itineraries/ai/generate
```

---

## API 호출 예시 (Axios)

```js
// src/api/index.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// 로그인 후 토큰 저장 예시
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
```

```js
// 여행 목록 조회
const { data } = await api.get('/api/v1/itineraries')

// 장소 Swap
await api.patch(`/api/v1/itineraries/${id}/days/${dayId}/slots/${slotId}/swap`, {
  alternativeId: 5
})
```

---

## 프로젝트 구조 (권장)

```
src/
├── api/           # axios 인스턴스, API 함수
├── pages/         # 라우트별 페이지 컴포넌트
├── components/    # 공통 UI 컴포넌트
├── hooks/         # 커스텀 훅
└── App.jsx        # React Router 라우팅 정의
```
