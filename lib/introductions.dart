import 'package:material_ui/material_ui.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

import 'api.dart';
import 'chat.dart';
import 'theme.dart';
import 'widgets.dart';

/// 오늘의 인연: 하루 3명. 한 번 소개된 사람은 넘겼든 안 열어봤든 다시 오지 않는다 (一期一会).
class TodayIntroductions extends StatefulWidget {
  const TodayIntroductions({super.key, required this.meId});
  final int meId;

  @override
  State<TodayIntroductions> createState() => _TodayIntroductionsState();
}

class _TodayIntroductionsState extends State<TodayIntroductions> {
  List<Map>? _items;
  int? _busyId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await Api.call('GET', '/introductions/today');
      if (mounted) setState(() => _items = (res['items'] as List).cast());
    } catch (e) {
      if (mounted) showError(context, e);
    }
  }

  void _setStatus(int id, String status, {int? conversationId}) => setState(() {
    _items = [
      for (final i in _items!)
        if (i['id'] == id) {...i, 'status': status, 'conversationId': conversationId ?? i['conversationId']} else i,
    ];
  });

  Future<void> _pass(Map intro) async {
    final ok = await showShadDialog<bool>(
      context: context,
      builder: (ctx) => ShadDialog(
        title: Text('${intro['candidate']['nickname']}님을 넘길까요?'),
        description: const Text('넘긴 인연은 다시 소개되지 않아요'),
        actions: [
          ShadButton.secondary(onPressed: () => Navigator.pop(ctx, false), child: const Text('취소')),
          ShadButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('넘기기')),
        ],
      ),
    );
    if (ok != true) return;
    await _run(intro, () async {
      await Api.call('POST', '/introductions/${intro['id']}/pass');
      _setStatus(intro['id'], 'passed');
    });
  }

  Future<void> _accept(Map intro) => _run(intro, () async {
    final res = await Api.call('POST', '/introductions/${intro['id']}/accept');
    final conversation = res['conversation'] as Map;
    _setStatus(intro['id'], 'accepted', conversationId: conversation['id']);
    if (!mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) =>
            ChatRoomScreen(conversationId: conversation['id'], partner: conversation['partner'], meId: widget.meId),
      ),
    );
  });

  Future<void> _run(Map intro, Future<void> Function() action) async {
    if (_busyId != null) return;
    setState(() => _busyId = intro['id']);
    try {
      await action();
    } catch (e) {
      if (mounted) showError(context, e);
    } finally {
      if (mounted) setState(() => _busyId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = _items;
    return Column(
      crossAxisAlignment: .stretch,
      children: [
        const SectionHeader('오늘의 인연', trailing: '하루 3명'),
        const Text('한 번 소개된 인연은 다시 오지 않아요', style: HanaText.caption),
        const SizedBox(height: HanaSpace.md),
        if (items == null)
          Padding(
            padding: const .symmetric(vertical: HanaSpace.xxl),
            child: Center(child: CircularProgressIndicator(color: context.primary)),
          )
        else if (items.isEmpty)
          const EmptyState(title: '오늘은 소개할 인연이 없어요', subtitle: '내일 새로운 인연이 찾아와요')
        else
          for (final intro in items)
            Padding(
              padding: const .only(bottom: HanaSpace.md),
              child: _IntroCard(
                intro: intro,
                busy: _busyId == intro['id'],
                onPass: () => _pass(intro),
                onAccept: () => _accept(intro),
              ),
            ),
      ],
    );
  }
}

class _IntroCard extends StatelessWidget {
  const _IntroCard({required this.intro, required this.busy, required this.onPass, required this.onAccept});
  final Map intro;
  final bool busy;
  final VoidCallback onPass;
  final VoidCallback onAccept;

  @override
  Widget build(BuildContext context) {
    final candidate = intro['candidate'] as Map;
    final status = intro['status'] as String;
    final passed = status == 'passed';
    return Opacity(
      opacity: passed ? 0.45 : 1,
      child: Container(
        padding: const .all(HanaSpace.lg),
        decoration: BoxDecoration(
          borderRadius: .circular(16),
          border: .all(color: HanaColors.grey200),
        ),
        child: Column(
          crossAxisAlignment: .stretch,
          spacing: HanaSpace.md,
          children: [
            PersonRow(person: candidate),
            if (passed)
              const Text('넘긴 인연이에요', style: HanaText.caption, textAlign: .center)
            else
              Row(
                spacing: HanaSpace.sm,
                children: [
                  if (status == 'pending')
                    Expanded(
                      child: ShadButton.outline(onPressed: busy ? null : onPass, child: const Text('넘기기')),
                    ),
                  Expanded(
                    flex: 2,
                    child: ShadButton(
                      onPressed: busy ? null : onAccept,
                      child: Text(status == 'accepted' ? '대화 이어가기' : '편지 쓰기'),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

/// 차단한 사람 목록과 해제
class BlockedUsersScreen extends StatefulWidget {
  const BlockedUsersScreen({super.key});

  @override
  State<BlockedUsersScreen> createState() => _BlockedUsersScreenState();
}

class _BlockedUsersScreenState extends State<BlockedUsersScreen> {
  List? _items;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await Api.call('GET', '/blocks');
      if (mounted) setState(() => _items = res['items']);
    } catch (e) {
      if (mounted) showError(context, e);
    }
  }

  Future<void> _unblock(Map user) async {
    try {
      await Api.call('DELETE', '/users/${user['id']}/block');
      _load();
    } catch (e) {
      if (mounted) showError(context, e);
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = _items;
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: ListView(
              padding: const .fromLTRB(HanaSpace.page, HanaSpace.sm, HanaSpace.page, HanaSpace.xxl),
              children: [
                Row(
                  children: [
                    ShadIconButton.ghost(
                      icon: const Icon(LucideIcons.chevronLeft, size: 22),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const Text('차단한 사람', style: HanaText.section),
                  ],
                ),
                const SizedBox(height: HanaSpace.lg),
                if (items == null)
                  Center(child: CircularProgressIndicator(color: context.primary))
                else if (items.isEmpty)
                  const EmptyState(title: '차단한 사람이 없어요', subtitle: '대화방 메뉴에서 차단하거나 신고할 수 있어요')
                else
                  for (final u in items)
                    Row(
                      children: [
                        Expanded(child: PersonRow(person: u)),
                        ShadButton.outline(size: .sm, onPressed: () => _unblock(u), child: const Text('해제')),
                      ],
                    ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
