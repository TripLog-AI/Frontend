# TripLog AI — Frontend

React(Vite) 기반 웹 클라이언트입니다.

**API 스펙 전체:** [`Docs/API_CONTRACT.md`](Docs/API_CONTRACT.md) 섹션 1

---

## 진행 현황 (요약)

| 구분 | 상태 |
|------|------|
| **UI (Figma 반영)** | 홈(Explore), 일정 생성(Create), 내 여행(My Trips), 일정 상세(View Trip) 화면 레이아웃·스타일 구현 |
| **라우팅** | `/`, `/create`, `/trips`, `/trip` — [`src/App.jsx`](src/App.jsx) |
| **공통 UI** | 하단 네비(`BottomNav`), 탭 개수·활성 상태가 경로별로 전환 (3탭 ↔ 4탭) |
| **API 연동** | Axios 클라이언트·예시 코드만 준비, 화면은 주로 정적/목업 데이터 |
| **문서·설정** | `.env.example`, `Docs/API_CONTRACT.md`, `src/api/itineraries.example.js` |

상세 화면별로는 히어로·검색·트렌딩 가이드(홈), YouTube URL·예산·테마·생성 상태 UI(생성), 카드·FAB·스켈레톤(내 여행), 데이 탭·AI 인사이트·타임라인(상세) 등 Figma 기준으로 맞춰 두었습니다.

---

## Tech Stack

| 구분 | 사용 |
|------|------|
| 런타임 / 빌드 | React 19, Vite 8 |
| 스타일 | Tailwind CSS 3 |
| 라우팅 | React Router 7 |
| HTTP | Axios |

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

**http://localhost:5173** 에서 확인합니다.

---

## 환경 변수 (`.env`)

```env
VITE_API_BASE_URL=http://localhost:8080   # prod: BE EC2 URL
```

- **개발:** 로컬 백엔드 주소 (예: `http://localhost:8080`)
- **운영:** 배포된 백엔드 베이스 URL

---

## 화면 & 라우트

| 경로 | 설명 |
|------|------|
| `/` | 홈 (Explore) |
| `/create` | AI 일정 생성 폼 |
| `/trips` | 내 여행 목록 |
| `/trip` | 일정 상세 (타임라인) |

---

## Mock API로 즉시 개발 시작

BE Mock 서버가 이미 준비되어 있으면 Swagger에서 응답 형태를 확인할 수 있습니다.

```bash
# BE Mock 서버 실행 (별도 터미널)
cd ../Backend && ./mvnw spring-boot:run
```

| URL | 용도 |
|-----|------|
| `http://localhost:8080/swagger-ui.html` | 전체 API 명세 + 테스트 |
| `http://localhost:8080/h2-console` | DB 콘솔 (dev 전용) |

**H2 Console:** JDBC URL `jdbc:h2:mem:tripledb` / Username `sa` / Password 없음

---

## 작업 트랙 (post mid-demo)

mid-demo 화면(홈/내 여행/일정 상세/Swap/AI 생성 등) 은 모두 BE 와 실연동 완료.  
final (6/11) 까지 분배안은 **마스터 plan** 참조:

→ [`../Lim/10_final_plan.md`](../Lim/10_final_plan.md)

---

## API 호출 예시 (Axios)

공통 인스턴스는 [`src/api/index.js`](src/api/index.js)에 정의되어 있습니다.  
`VITE_API_BASE_URL` 뒤에 `/api/v1`을 붙인 `baseURL`을 쓰므로, 요청 경로는 **버전 이후**만 적습니다. Bearer 토큰은 `localStorage.accessToken`이 있으면 자동 첨부됩니다.

추가 예시는 [`src/api/itineraries.example.js`](src/api/itineraries.example.js)를 참고하세요.

```js
// src/api/index.js 와 동일한 패턴 (참고)
import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

```js
import api from './api';

// 여행 목록 (실제 프로젝트는 baseURL에 /api/v1 포함)
const { data } = await api.get('/itineraries');

// 장소 Swap (경로는 Swagger 기준으로 조정)
await api.patch(`/itineraries/${id}/days/${dayId}/slots/${slotId}/swap`, {
  alternativeId: 5,
});
```

---

## 프로젝트 구조

```
src/
├── api/           # axios 인스턴스, API 예시
├── pages/         # 라우트별 페이지 (Home, CreateTrip, MyTrips, ViewTrip)
├── components/    # 공통 UI (BottomNav, PlaceCard 등)
├── hooks/         # 커스텀 훅
├── App.jsx        # React Router 라우팅
└── main.jsx
```

---

## Scripts

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (`dist/`) |
| `npm run preview` | 빌드 미리보기 |
| `npm run lint` | ESLint |

---

## 관련 문서

- [API Contract](Docs/API_CONTRACT.md)
