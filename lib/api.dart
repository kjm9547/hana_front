import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:material_ui/material_ui.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

// Android 에뮬레이터에서는 --dart-define=API_BASE=http://10.0.2.2:3000
const apiBase = String.fromEnvironment('API_BASE', defaultValue: 'http://localhost:3000');

/// 서버 오류 문구 → 사용자에게 보여줄 말. 없는 문구는 그대로 보여준다
const _friendlyErrors = {
  'Invalid email or password': '이메일 또는 비밀번호가 맞지 않아요',
  'Email already registered': '이미 가입된 이메일이에요',
  'You cannot message this user': '메시지를 보낼 수 없는 상대예요',
  'Conversation is closed': '대화가 끝난 방이에요',
  'First message must be a letter of at least 40 characters': '첫 메시지는 40자 이상의 편지로 보내주세요',
  'Both of you need to exchange messages first': '서로 메시지를 주고받은 뒤에 신청할 수 있어요',
  'A request is already pending': '이미 진행 중인 신청이 있어요',
  'Your request was declined': '거절된 신청은 다시 보낼 수 없어요',
  'Already serious': '이미 진지한 인연이에요',
  'Already passed': '이미 넘긴 인연이에요',
  'Introduction not found': '오늘의 인연이 바뀌었어요. 새로고침 해주세요',
};

class ApiException implements Exception {
  ApiException(this.message);
  final String message;
  @override
  String toString() => message;
}

class Api {
  // ponytail: 토큰은 메모리에만 보관 → 새로고침하면 다시 로그인. 자동 로그인이 필요해지면 secure storage로.
  static String? token;

  static Future<dynamic> call(String method, String path, [Map<String, dynamic>? body]) async {
    final req = http.Request(method, Uri.parse('$apiBase$path'))..headers['content-type'] = 'application/json';
    if (token != null) req.headers['authorization'] = 'Bearer $token';
    if (body != null) req.body = jsonEncode(body);
    final res = await http.Response.fromStream(await req.send());
    final data = res.body.isEmpty ? null : jsonDecode(res.body);
    if (res.statusCode >= 400) {
      final msg = data is Map ? data['message'] : res.body;
      final text = msg is List ? msg.join('\n') : '$msg';
      throw ApiException(_friendlyErrors[text] ?? text);
    }
    return data;
  }
}

void showError(BuildContext context, Object e) =>
    ShadToaster.of(context).show(ShadToast.destructive(description: Text('$e')));

void showInfo(BuildContext context, String message) =>
    ShadToaster.of(context).show(ShadToast(description: Text(message)));
