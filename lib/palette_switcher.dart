import 'package:material_ui/material_ui.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

import 'design_preview.dart';
import 'theme.dart';

// ponytail: 컬러 확정용 임시 도구. 디버그 빌드에서만 뜬다. 컬러가 정해지면 이 파일과 main.dart의 사용처를 지울 것.
final currentPalette = ValueNotifier<HanaPalette>(palettes.first);

/// 전환기는 Navigator 바깥(앱 builder)에 떠 있어서, 화면 이동은 이 키로 한다.
final hanaNavigatorKey = GlobalKey<NavigatorState>();

/// 화면 우하단의 팔레트 버튼. 펼치면 후보 컬러와 흰 글자 대비(4.5 이상 = WCAG AA)가 보인다.
class PaletteSwitcher extends StatefulWidget {
  const PaletteSwitcher({super.key});
  @override
  State<PaletteSwitcher> createState() => _PaletteSwitcherState();
}

class _PaletteSwitcherState extends State<PaletteSwitcher> {
  var _open = false;

  @override
  Widget build(BuildContext context) {
    final current = currentPalette.value;
    return Material(
      color: Colors.transparent,
      child: Column(
        mainAxisSize: .min,
        crossAxisAlignment: .end,
        spacing: 8,
        children: [
          if (_open)
            Container(
              width: 240,
              padding: const .all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: .circular(16),
                boxShadow: const [BoxShadow(color: Color(0x22000000), blurRadius: 24, offset: Offset(0, 8))],
              ),
              child: Column(
                mainAxisSize: .min,
                children: [
                  for (final p in palettes)
                    InkWell(
                      borderRadius: .circular(10),
                      onTap: () => currentPalette.value = p,
                      child: Container(
                        padding: const .symmetric(horizontal: 8, vertical: 8),
                        decoration: BoxDecoration(
                          color: p == current ? HanaColors.grey100 : null,
                          borderRadius: .circular(10),
                        ),
                        child: Row(
                          spacing: 10,
                          children: [
                            Container(
                              width: 22,
                              height: 22,
                              decoration: BoxDecoration(
                                color: p.primary,
                                shape: .circle,
                                border: .all(color: p.soft, width: 4, strokeAlign: BorderSide.strokeAlignOutside),
                              ),
                            ),
                            Expanded(child: Text(p.name, style: HanaText.sub.copyWith(color: HanaColors.grey900))),
                            _ContrastLabel(p.primary),
                          ],
                        ),
                      ),
                    ),
                  const Divider(height: 12, color: HanaColors.grey100),
                  InkWell(
                    borderRadius: .circular(10),
                    onTap: () {
                      setState(() => _open = false);
                      hanaNavigatorKey.currentState!.push(MaterialPageRoute(builder: (_) => const DesignPreviewScreen()));
                    },
                    child: Padding(
                      padding: const .all(8),
                      child: Row(
                        spacing: 10,
                        children: [
                          const Icon(LucideIcons.layoutGrid, size: 20, color: HanaColors.grey700),
                          Text('디자인 미리보기 열기', style: HanaText.sub.copyWith(color: HanaColors.grey900, fontWeight: .w600)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          FloatingActionButton.small(
            backgroundColor: current.primary,
            foregroundColor: Colors.white,
            onPressed: () => setState(() => _open = !_open),
            child: Icon(_open ? LucideIcons.x : LucideIcons.palette, size: 18),
          ),
        ],
      ),
    );
  }
}

class _ContrastLabel extends StatelessWidget {
  const _ContrastLabel(this.color);
  final Color color;

  @override
  Widget build(BuildContext context) {
    final ratio = contrastOnWhite(color);
    final ok = ratio >= 4.5;
    // Navigator 바깥(앱 builder)에 떠 있어서 Overlay가 없다 → Tooltip 대신 텍스트로 표시
    return Text(
      '${ok ? 'AA' : '⚠'} ${ratio.toStringAsFixed(1)}',
      style: HanaText.caption.copyWith(color: ok ? HanaColors.grey500 : HanaColors.danger),
    );
  }
}
