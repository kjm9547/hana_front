import { api, type Conversation, type Page, type User } from '@/lib/api';
import { openChatRoom } from '@/lib/chat';
import { useApi } from '@/lib/session';
import { showError } from '@/lib/toast';
import { EmptyState, FieldTabPage, PersonRow, Spinner } from '@/ui/hana';

/** HOME-01 메인: 언어교환 친구 목록 (개편 방향 A, 오늘의 표현 없음) */
export default function MainTab() {
  // ponytail: 친구 목록은 첫 페이지(50명)만. 사용자가 늘면 nextCursor로 무한 스크롤.
  const [page] = useApi<Page<User>>('/users?limit=50');

  // 상대와의 대화방을 열거나 만든 뒤 이동
  const startChat = async (partner: User) => {
    try {
      openChatRoom(await api<Conversation>('POST', '/conversations', { partnerId: partner.id }));
    } catch (e) {
      showError(e);
    }
  };

  return (
    <FieldTabPage title="언어교환 친구">
      {!page ? (
        <Spinner />
      ) : page.items.length === 0 ? (
        <EmptyState title="아직 친구가 없어요" subtitle="새 친구가 가입하면 여기에 보여요" />
      ) : (
        page.items.map((p) => <PersonRow key={p.id} person={p} onPress={() => startChat(p)} />)
      )}
    </FieldTabPage>
  );
}
