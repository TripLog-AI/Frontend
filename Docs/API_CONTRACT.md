# API Contract (Section 1)

Backend 기준 API 스펙의 요약입니다. 상세 Request/Response는 **Spring Boot + Swagger**에서 확인하세요.

- **Base URL (dev):** `http://localhost:8080`  
- **Base path:** `/api/v1` (아래 엔드포인트는 모두 이 접두어를 가정)

## 인증

- Bearer 토큰을 사용하는 경우, `Authorization: Bearer <token>`  
- 프론트엔드에서는 `localStorage`에 저장된 토큰을 axios 인터셉터로 붙이는 방식을 권장 ([`src/api/index.js`](../src/api/index.js) 참고)

## Week 1 엔드포인트 개요

| 구분 | Method | Path | 용도 |
|------|--------|------|------|
| YouTube 추천 | `GET` | `/youtube-courses` | 홈 — Trending on YouTube |
| 일정 목록 | `GET` | `/itineraries` | My Trips 목록 |
| 일정 상세 | `GET` | `/itineraries/{id}` | 일정 상세(대체 장소 등) |
| 장소 스왑 | `PATCH` | `/itineraries/.../swap` | Place Swap UI |
| AI 일정 생성 | `POST` | `/itineraries/ai/generate` | Create Trip 폼 제출 |

실제 경로·바디는 백엔드 Swagger(`swagger-ui.html`)를 기준으로 맞춥니다.

## 에러 형식

백엔드에서 정의한 공통 에러 응답(JSON)을 따릅니다. (필드명은 BE 레포 또는 Swagger 참고)
