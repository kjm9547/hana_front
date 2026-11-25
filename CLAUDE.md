# Hana 앱 (React Native · Expo)

一期一会 철학의 한·일 인연 앱 **Hana**의 앱. 서버는 `kjm9547/hana_server` (NestJS), 제품 원칙은 서버 레포의 `docs/PRODUCT.md`.

## 구조

- `src/app/` — 화면. 파일 하나 = 화면 하나 (Expo Router). `(tabs)/`는 바텀 탭 5개, `_layout.tsx`가 로그인 여부로 화면을 가른다
- `src/lib/` — 화면이 아닌 것: `api.ts`(fetch + 서버 응답 타입), `session.tsx`(로그인 상태·`useApi`), `chat.ts`(socket.io 수신), `toast.tsx`, `time.ts`
- `src/ui/` — `theme.ts`(색·간격·글자 토큰, 디자인 시스템의 원본)와 공통 컴포넌트 `components.tsx`
- 화면 ID(AUTH·HOME·CHAT·MATCH·BOARD·PROF)는 각 화면 컴포넌트 주석에 적는다 — 화면 설계서와 맞추는 기준

## 규칙

- Expo SDK 58. API가 SDK마다 바뀌니 기억에 의존하지 말고 `node_modules`의 타입이나 https://docs.expo.dev/versions/v58.0.0/ 을 확인한다
- 패키지는 `npx expo install <pkg>`로 추가한다 (SDK에 맞는 버전). 외부 서비스(EAS, CDN 등)에 의존하는 패키지는 쓰지 않는다 — 자체 서버 원칙
- 색·간격·글자 크기는 `src/ui/theme.ts`의 값만 쓴다. 굵기는 fontWeight가 아니라 `font.*`(글꼴 파일)로 고른다
- 서버 응답이 바뀌면 `src/lib/api.ts`의 타입을 같이 고친다
- 완료 전 `npm run check` (타입 검사 + 린트 + 단위 테스트) 통과

## 실행

- 서버를 먼저 띄운다 (`hana_server`에서 `npm run start:dev`, 테스트 계정은 `npm run seed`)
- `npm run web` — 브라우저 미리보기 (http://localhost:8081)
- `npm run android` — Android 에뮬레이터 / 휴대폰은 같은 Wi-Fi에서 Expo Go로 QR 스캔
- API 주소는 기본으로 Expo 개발 서버가 떠 있는 PC의 3000번 포트. 바꾸려면 `EXPO_PUBLIC_API_BASE`
- 개발 빌드의 로그인 화면 "테스트 로그인"은 서버 `npm run seed` 계정(민수·ゆき)을 쓴다

@CONTRIBUTING.md
