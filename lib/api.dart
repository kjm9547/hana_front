import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:material_ui/material_ui.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

// Android 에뮬레이터에서는 --dart-define=API_BASE=http://10.0.2.2:3000
const apiBase = String.fromEnvironment('API_BASE', defaultValue: 'http://localhost:3000');

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
      throw ApiException(msg is List ? msg.join('\n') : '$msg');
    }
    return data;
  }
}

void showError(BuildContext context, Object e) =>
    ShadToaster.of(context).show(ShadToast.destructive(description: Text('$e')));

void showInfo(BuildContext context, String message) =>
    ShadToaster.of(context).show(ShadToast(description: Text(message)));
