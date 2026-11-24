import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:material_ui/material_ui.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

import 'api.dart';
import 'home.dart';
import 'palette_switcher.dart';
import 'theme.dart';
import 'widgets.dart';

void main() => runApp(const HanaApp());

class HanaApp extends StatelessWidget {
  const HanaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: currentPalette,
      builder: (context, palette, _) => ShadApp(
        title: 'Hana',
        navigatorKey: hanaNavigatorKey,
        theme: hanaTheme(palette),
        themeMode: ThemeMode.light, // ponytail: 다크모드는 토큰 확정 후
        materialThemeBuilder: hanaMaterialTheme,
        home: const AuthScreen(),
        builder: (context, child) => kDebugMode
            ? Stack(children: [child!, const Positioned(right: 16, bottom: 96, child: PaletteSwitcher())])
            : child!,
      ),
    );
  }
}

// ───────────────────────── 로그인 / 가입 ─────────────────────────

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});
  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _nickname = TextEditingController();
  var _signUp = false;
  var _lang = 'ko';
  var _busy = false;

  Future<void> _submit() async {
    setState(() => _busy = true);
    try {
      final res = await Api.call('POST', _signUp ? '/auth/register' : '/auth/token', {
        'email': _email.text,
        'password': _password.text,
        if (_signUp) 'nickname': _nickname.text,
        if (_signUp) 'nativeLang': _lang,
      });
      Api.token = res['accessToken'];
      if (!mounted) return;
      Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const HomeShell()));
    } catch (e) {
      if (mounted) showError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _quickLogin(String email) {
    _signUp = false;
    _email.text = email;
    _password.text = 'password123';
    _submit();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Column(
              children: [
                Expanded(
                  child: ListView(
                    padding: const .fromLTRB(24, 48, 24, 24),
                    children: [
                      Text(_signUp ? '반가워요!\n어떤 분인지 알려주세요' : 'Hana에서\n새로운 인연을 만나요', style: HanaText.title),
                      const SizedBox(height: 8),
                      Text(_signUp ? 'はじめまして！' : '一度の出会いが、ひとつの縁に', style: HanaText.sub),
                      const SizedBox(height: 36),
                      ShadInput(controller: _email, placeholder: const Text('이메일'), keyboardType: .emailAddress),
                      const SizedBox(height: 12),
                      ShadInput(controller: _password, placeholder: const Text('비밀번호 (8자 이상)'), obscureText: true),
                      if (_signUp) ...[
                        const SizedBox(height: 12),
                        ShadInput(controller: _nickname, placeholder: const Text('닉네임')),
                        const SizedBox(height: 28),
                        const Text('모국어를 골라주세요', style: HanaText.caption),
                        const SizedBox(height: 10),
                        Row(
                          spacing: 10,
                          children: [
                            for (final (lang, sub) in [('ko', '한국어로 말해요'), ('ja', '日本語で話します')])
                              Expanded(
                                child: ChoiceCard(
                                  title: langLabel[lang]!,
                                  subtitle: sub,
                                  selected: _lang == lang,
                                  onTap: () => setState(() => _lang = lang),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                // 토스식 하단 고정 CTA
                Padding(
                  padding: const .fromLTRB(24, 0, 24, 16),
                  child: Column(
                    crossAxisAlignment: .stretch,
                    children: [
                      ShadButton(
                        height: 56,
                        onPressed: _busy ? null : _submit,
                        child: Text(_signUp ? '가입하기' : '로그인', style: const TextStyle(fontSize: 17, fontWeight: .w600)),
                      ),
                      ShadButton.ghost(
                        onPressed: () => setState(() => _signUp = !_signUp),
                        child: Text(_signUp ? '이미 계정이 있어요' : '처음이에요 · 가입하기', style: HanaText.caption),
                      ),
                      // ponytail: 개발용 빠른 로그인 (디버그 빌드에만). 로컬 DB에 시드된 계정이 있어야 동작.
                      if (kDebugMode)
                        Row(
                          mainAxisAlignment: .center,
                          spacing: 6,
                          children: [
                            const Text('테스트 로그인', style: HanaText.caption),
                            for (final (email, label) in [('minsu@hana.dev', '민수 · 한국어'), ('yuki@hana.dev', 'ゆき · 日本語')])
                              ShadButton.outline(
                                size: .sm,
                                onPressed: _busy ? null : () => _quickLogin(email),
                                child: Text(label),
                              ),
                          ],
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

