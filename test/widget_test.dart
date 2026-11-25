import 'package:flutter_test/flutter_test.dart';
import 'package:hana/main.dart';
import 'package:hana/widgets.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

void main() {
  testWidgets('로그인 ↔ 가입 화면 전환', (tester) async {
    await tester.pumpWidget(const HanaApp());
    expect(find.text('닉네임'), findsNothing);

    await tester.tap(find.text('처음이에요 · 가입하기'));
    await tester.pump();
    expect(find.text('닉네임'), findsOneWidget);
    expect(find.text('가입하기'), findsOneWidget);
  });

  testWidgets('오늘의 표현: 모국어의 반대 언어를 크게 보여줌', (tester) async {
    const phrase = {
      'ko': '만나서 반가워요',
      'ja': 'お会いできて嬉しいです',
      'koReading': 'マンナソ パンガウォヨ',
      'jaReading': '오아이데키테 우레시이데스',
      'situation': {'ko': '처음 만났을 때', 'ja': '初めて会った時'},
    };
    Future<void> show(String myLang) =>
        tester.pumpWidget(ShadApp(home: TodayPhraseCard(phrase: phrase, myLang: myLang)));

    await show('ko');
    expect(find.textContaining('오늘의 일본어'), findsOneWidget);
    expect(find.text('오아이데키테 우레시이데스'), findsOneWidget); // 한국인에겐 한글 발음
    expect(find.textContaining('처음 만났을 때'), findsOneWidget);

    await show('ja');
    expect(find.textContaining('今日の韓国語'), findsOneWidget);
    expect(find.text('マンナソ パンガウォヨ'), findsOneWidget); // 일본인에겐 카타카나 발음
    expect(find.textContaining('初めて会った時'), findsOneWidget);
  });

}
