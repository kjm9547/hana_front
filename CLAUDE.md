# Hana 프론트 (Flutter)

一期一会 철학의 한·일 인연 앱 **Hana**의 Flutter 앱. 서버는 `kjm9547/hana_server` (NestJS), 제품 원칙은 서버 레포의 `docs/PRODUCT.md`.

- API 주소: `lib/api.dart`의 `API_BASE` (`--dart-define`), 기본 `http://localhost:3000`. Android 에뮬레이터는 `http://10.0.2.2:3000`
- 디버그 빌드 로그인 화면의 "테스트 로그인"은 서버 `npm run seed` 계정을 쓴다
- 완료 전 `flutter analyze` 경고 없음. 기존 코드는 `dart format`으로 일괄 정리하지 않는다 (새 파일만)
- 통합 테스트(실제 서버 필요: 서버 실행 + `npm run seed`): `flutter test integration_test -d <시뮬레이터 id>`

@CONTRIBUTING.md
