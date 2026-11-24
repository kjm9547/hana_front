import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:hana/api.dart';
import 'package:hana/main.dart';
import 'package:hana/widgets.dart';
import 'package:http/http.dart' as http;
import 'package:integration_test/integration_test.dart';
import 'package:material_ui/material_ui.dart' show EditableText;
import 'package:shadcn_ui/shadcn_ui.dart';

/// v1 채팅 흐름: 안 읽은 수 → 편지 → 읽음 → 진지한 인연 → 끝맺음 인사.
/// 매번 새 테스트 계정 둘을 만들어서 몇 번을 돌려도 같은 결과가 나온다.
/// 준비: 서버 실행. 실행: `flutter test integration_test -d <시뮬레이터 id>`
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  Future<void> waitFor(WidgetTester tester, Finder finder, {int seconds = 10}) async {
    for (var i = 0; i < seconds * 10; i++) {
      await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 100)));
      await tester.pump();
      if (finder.evaluate().isNotEmpty) return;
    }
    fail('$finder 가 $seconds초 안에 나타나지 않음');
  }

  /// 화면 전환·대화상자 애니메이션이 끝날 때까지 (중간에 누르면 좌표가 어긋난다)
  Future<void> settle(WidgetTester tester) async {
    for (var i = 0; i < 6; i++) {
      await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 100)));
      await tester.pump();
    }
  }

  Future<dynamic> call(String method, String path, {String? token, Map? json}) async {
    final req = http.Request(method, Uri.parse('$apiBase$path'))..headers['content-type'] = 'application/json';
    if (token != null) req.headers['authorization'] = 'Bearer $token';
    if (json != null) req.body = jsonEncode(json);
    final res = await http.Response.fromStream(await req.send());
    return res.body.isEmpty ? null : jsonDecode(res.body);
  }

  testWidgets('편지 → 읽음 → 진지한 인연 수락 → 끝맺음 인사', (tester) async {
    final stamp = DateTime.now().millisecondsSinceEpoch;
    final email = 'it-a-$stamp@hana.dev';
    final partnerName = '테스트$stamp';
    late final String partnerToken;
    late final int conversationId;

    // 상대(B)가 먼저 편지를 보내 둔다
    await tester.runAsync(() async {
      final a = await call(
        'POST',
        '/auth/register',
        json: {'email': email, 'password': 'password123', 'nickname': '나$stamp', 'nativeLang': 'ko'},
      );
      final b = await call(
        'POST',
        '/auth/register',
        json: {'email': 'it-b-$stamp@hana.dev', 'password': 'password123', 'nickname': partnerName, 'nativeLang': 'ja'},
      );
      partnerToken = b['accessToken'];
      final me = await call('GET', '/me', token: a['accessToken']);
      final conv = await call('POST', '/conversations', token: partnerToken, json: {'partnerId': me['id']});
      conversationId = conv['id'];
      await call(
        'POST',
        '/conversations/$conversationId/messages',
        token: partnerToken,
        json: {'body': 'はじめまして！ 韓国の文化に興味があって、ゆっくりお話ししてみたいと思いお手紙を書きました。'},
      );
    });

    // 로그인 (이메일·비밀번호 입력)
    await tester.pumpWidget(const HanaApp());
    await tester.enterText(find.byType(EditableText).at(0), email);
    await tester.enterText(find.byType(EditableText).at(1), 'password123');
    await tester.tap(find.text('로그인'));
    await waitFor(tester, find.text('오늘의 인연'));

    // 대화방 탭: 안 읽은 수 1
    await tester.tap(find.text('대화방').last);
    await waitFor(tester, find.text(partnerName));
    expect(find.text('1'), findsWidgets);
    await settle(tester);
    await tester.tap(find.text(partnerName));

    // 편지: 40자 전에는 전송 버튼이 꺼져 있다
    await waitFor(tester, find.text('첫 메시지는 정성 어린 편지로'));
    await settle(tester);
    final input = find.byType(EditableText).last;
    final send = find.widgetWithIcon(ShadIconButton, LucideIcons.send);
    await tester.enterText(input, '짧은 인사');
    await tester.pump();
    expect(tester.widget<ShadIconButton>(send).onPressed, isNull);
    const letter = '편지 고마워요! 저는 서울에 살고 있고 일본 여행을 정말 좋아해요. 천천히 이야기 나눠요.';
    await tester.enterText(input, letter);
    await tester.pump();
    expect(tester.widget<ShadIconButton>(send).onPressed, isNotNull);
    await tester.tap(send);
    // 입력칸이 아니라 말풍선에 나타날 때까지 (서버 응답 후)
    await waitFor(tester, find.descendant(of: find.byType(ChatBubble), matching: find.text(letter)));
    expect(find.text('첫 메시지는 정성 어린 편지로'), findsNothing);

    // 상대가 읽으면 내 메시지에 '읽음'
    await tester.runAsync(() async {
      final page = await call('GET', '/conversations/$conversationId/messages?limit=1', token: partnerToken);
      await call(
        'POST',
        '/conversations/$conversationId/read',
        token: partnerToken,
        json: {'messageId': page['items'][0]['id']},
      );
    });
    await waitFor(tester, find.textContaining('읽음'));

    // 상대의 진지한 인연 신청 → 배너에서 수락 → 머리글에 '진지한 인연'
    await tester.runAsync(() => call('POST', '/conversations/$conversationId/serious', token: partnerToken));
    await waitFor(tester, find.text('수락'));
    await settle(tester);
    await tester.tap(find.text('수락'));
    await waitFor(tester, find.text('진지한 인연'));

    // 메뉴 → 대화 마치기 → 끝맺음 인사
    await tester.tap(find.byIcon(LucideIcons.ellipsisVertical));
    await waitFor(tester, find.text('대화 마치기'));
    await settle(tester);
    await tester.tap(find.text('대화 마치기'));
    await waitFor(tester, find.text('인사 남기고 마치기'));
    await settle(tester);
    await tester.enterText(find.byType(EditableText).last, '함께해서 즐거웠어요. 좋은 여행 되세요!');
    await tester.tap(find.text('인사 남기고 마치기'));
    await waitFor(tester, find.text('인사를 남기고 대화를 마쳤어요'));
    // 끝맺음 인사 카드가 한 번만 보인다 (닫히는 대화상자의 입력칸과 구분하려고 카드 제목으로 확인)
    await waitFor(tester, find.text('나의 끝맺음 인사'));
    expect(find.text('나의 끝맺음 인사'), findsOneWidget);
  });
}
