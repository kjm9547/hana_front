import 'package:flutter_test/flutter_test.dart';
import 'package:hana/chat.dart';

void main() {
  final now = DateTime(2026, 11, 25, 0, 30); // 수요일 자정 직후

  test('시계: 오전/오후 12시 경계', () {
    expect(clockLabel(DateTime(2026, 1, 1, 0, 5)), '오전 12:05');
    expect(clockLabel(DateTime(2026, 1, 1, 12, 0)), '오후 12:00');
    expect(clockLabel(DateTime(2026, 1, 1, 15, 42)), '오후 3:42');
  });

  test('날짜 구분선: 시각이 아니라 달력 날짜로 오늘/어제를 가른다', () {
    expect(dayLabel(DateTime(2026, 11, 25, 0, 1), now), '오늘');
    expect(dayLabel(DateTime(2026, 11, 24, 23, 59), now), '어제'); // 31분 전이어도 어제
    expect(dayLabel(DateTime(2026, 11, 23, 12), now), '11월 23일 (월)');
    expect(dayLabel(DateTime(2025, 12, 31, 12), now), '2025년 12월 31일 (수)');
  });

  test('대화 목록 시간', () {
    String at(DateTime t) => chatTime(t.toUtc().toIso8601String(), now: now);
    expect(at(DateTime(2026, 11, 25, 0, 10)), '오전 12:10');
    expect(at(DateTime(2026, 11, 24, 9)), '어제');
    expect(at(DateTime(2026, 3, 1)), '3월 1일');
    expect(at(DateTime(2025, 3, 1)), '2025. 3. 1.');
  });
}
