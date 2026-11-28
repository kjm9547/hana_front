# Hana 앱 (React Native · Expo)

一期一会 철학의 한·일 인연 앱 **Hana**의 앱. 서버는 `kjm9547/hana_server` (NestJS), 제품 원칙은 서버 레포의 `docs/PRODUCT.md`.

## 구조

- `src/app/` — 화면. 파일 하나 = 화면 하나 (Expo Router). `(tabs)/`는 바텀 탭 5개, `_layout.tsx`가 로그인 여부로 화면을 가른다
- `src/lib/` — 화면이 아닌 것: `api.ts`(fetch + 서버 응답 타입), `session.tsx`(로그인 상태·`useApi`), `chat.ts`(socket.io 수신), `toast.tsx`, `time.ts`
- `src/global.css` — 색·글자·간격·모서리 토큰 (디자인 시스템의 원본). Tailwind v4 문법
- `src/ui/` — 컴포넌트
  - `button.tsx` `input.tsx` `text.tsx` 등: [React Native Reusables](https://reactnativereusables.com)(shadcn/ui의 RN판)에서 복사해 온 기본 부품. 복사해 온 순간 우리 코드라 Hana에 맞게 고쳐 쓴다
  - `hana.tsx`: Hana 전용 부품 (화면 틀, 오늘의 표현 카드, 말풍선, 마스코트 …)
  - `theme.ts`: JS에서만 필요한 것 (글꼴 파일, className을 못 받는 곳에 넘길 색)
- 화면 ID(AUTH·HOME·CHAT·MATCH·BOARD·PROF)는 각 화면 컴포넌트 주석에 적는다 — 화면 설계서와 맞추는 기준

## 규칙

- Expo SDK 58. API가 SDK마다 바뀌니 기억에 의존하지 말고 `node_modules`의 타입이나 https://docs.expo.dev/versions/v58.0.0/ 을 확인한다
- 패키지는 `npx expo install <pkg>`로 추가한다 (SDK에 맞는 버전). 외부 서비스(EAS, CDN 등)에 의존하는 패키지는 쓰지 않는다 — 자체 서버 원칙
- 스타일은 `className`(Tailwind, [Uniwind](https://docs.uniwind.dev))으로 쓴다. 색·글자는 `global.css`에 있는 이름만 (Tailwind 기본 팔레트는 꺼 둠)
  - 글자는 `<Text variant="title|section|body|sub|caption|display">`. 굵기 클래스(`font-semibold` 등)는 fontWeight가 아니라 Pretendard 글꼴 파일을 고른다
  - className을 못 받는 색 속성은 `placeholderTextColorClassName="accent-muted-foreground"`처럼 `accent-` 접두사, 그래도 안 되면 `useColor()`
  - 새 기본 부품이 필요하면 `npx @react-native-reusables/cli@latest add <이름> -y --styling-library uniwind` 후 Hana에 맞게 고친다
  - `global.css`에 글자 크기·간격 이름을 추가하면 `src/lib/utils.ts`의 tailwind-merge 설정에도 추가한다
- 서버 응답이 바뀌면 `src/lib/api.ts`의 타입을 같이 고친다
- 완료 전 `npm run check` (타입 검사 + 린트 + 단위 테스트) 통과

## 실행

- 서버를 먼저 띄운다 (`hana_server`에서 `npm run start:dev`, 테스트 계정은 `npm run seed`)
- `npm run web` — 브라우저 미리보기 (http://localhost:8081)
- `npm run android` — Android 에뮬레이터 / 휴대폰은 같은 Wi-Fi에서 Expo Go로 QR 스캔
- API 주소는 기본으로 Expo 개발 서버가 떠 있는 PC의 3000번 포트. 바꾸려면 `EXPO_PUBLIC_API_BASE`
- 개발 빌드의 로그인 화면 "테스트 로그인"은 서버 `npm run seed` 계정(민수·ゆき)을 쓴다

@CONTRIBUTING.md
