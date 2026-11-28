import { EmptyState, FieldTabPage } from '@/ui/hana';

/** BOARD-01 게시판 (준비 중) */
export default function BoardTab() {
  return (
    <FieldTabPage title="게시판">
      <EmptyState title="게시판은 준비 중이에요" subtitle="여행 후기, 질문, 동행 모집을 나눌 공간이에요" />
    </FieldTabPage>
  );
}
