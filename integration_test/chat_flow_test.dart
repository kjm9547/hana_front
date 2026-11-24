import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:hana/api.dart';
import 'package:hana/chat.dart';
import 'package:hana/main.dart';
import 'package:http/http.dart' as http;
import 'package:integration_test/integration_test.dart';
import 'package:material_ui/material_ui.dart' show EditableText;
import 'package:shadcn_ui/shadcn_ui.dart';

/// 실제 서버를 상대로 도는 채팅 흐름 테스트.
/// 준비: 서버 실행 + `npm run seed` (민수/ゆき 계정). 실행: `flutter test integration_test -d <시뮬레이터 id>`
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  /// 실제 네트워크를 기다려야 해서 pumpAndSettle 대신 실시간으로 조금씩 기다린다
  Future<void> waitFor(WidgetTester tester, Finder finder, {int seconds = 10}) async {
    for (var i = 0; i < seconds * 10; i++) {
      await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 100)));
      await tester.pump();
      if (finder.evaluate().isNotEmpty) return;
    }
    fail('$finder 가 $seconds초 안에 나타나지 않음');
  }

  /// 앱 밖에서 ゆき로 로그인해 REST로 답장한다 (상대방 역할)
  Future<void> replyAsYuki(String body) async {
    Future<dynamic> call(String method, String path, {String? token, Map? json}) async {
      final req = http.Request(method, Uri.parse('$apiBase$path'))..headers['content-type'] = 'application/json';
      if (token != null) req.headers['authorization'] = 'Bearer $token';
      if (json != null) req.body = jsonEncode(json);
      return jsonDecode((await http.Response.fromStream(await req.send())).body);
    }

    final token = (await call('POST', '/auth/token', json: {'email': 'yuki@hana.dev', 'password': 'password123'}))['accessToken'];
    final conversations = (await call('GET', '/conversations', token: token))['items'] as List;
    final withMinsu = conversations.firstWhere((c) => c['partner']['nickname'] == '민수');
    await call('POST', '/conversations/${withMinsu['id']}/messages', token: token, json: {'body': body});
  }

  testWidgets('민수가 ゆき에게 메시지를 보내고, ゆき의 답장을 실시간으로 받는다', (tester) async {
    final stamp = DateTime.now().millisecondsSinceEpoch;
    final hello = '안녕하세요 $stamp';
    final reply = 'こんにちは $stamp';

    await tester.pumpWidget(const HanaApp());
    await tester.tap(find.text('민수 · 한국어'));
    await waitFor(tester, find.text('ゆき'));

    // 메인 탭의 친구 → 채팅방
    await tester.tap(find.text('ゆき').first);
    await waitFor(tester, find.byType(ChatRoomScreen));
    // 화면 전환 중에는 이전 화면(로그인)의 입력칸도 남아 있어서 채팅방 안으로 좁힌다
    final input = find.descendant(of: find.byType(ChatRoomScreen), matching: find.byType(EditableText));
    await waitFor(tester, input);

    // 보내기 (REST) → 내 말풍선
    await tester.enterText(input, hello);
    await tester.tap(find.byIcon(LucideIcons.send));
    await waitFor(tester, find.text(hello));

    // 상대 답장 → 소켓으로 실시간 수신
    await tester.runAsync(() => replyAsYuki(reply));
    await waitFor(tester, find.text(reply));

    // 뒤로 → 대화방 탭에 마지막 메시지가 보인다
    await tester.tap(find.byIcon(LucideIcons.chevronLeft));
    await waitFor(tester, find.text('대화방'));
    await tester.tap(find.text('대화방').last);
    await waitFor(tester, find.text(reply));
  });
}
