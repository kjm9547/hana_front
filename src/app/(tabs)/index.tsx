import { Fragment } from 'react';

import { api, type Conversation, type Page, type Phrase, type User } from '@/lib/api';
import { openChatRoom } from '@/lib/chat';
import { useApi, useMe } from '@/lib/session';
import { showError } from '@/lib/toast';
import { EmptyState, PersonRow, RowDivider, SectionHeader, Spinner, TabPage, TodayPhraseCard } from '@/ui/components';

/** HOME-01 메인: 오늘의 표현 + 언어교환 친구 목록 */
export default function MainTab() {
  const me = useMe();
  // ponytail: 친구 목록은 첫 페이지(50명)만. 사용자가 늘면 nextCursor로 무한 스크롤.
  const [page] = useApi<Page<User>>('/users?limit=50');
  const [phrase] = useApi<Phrase>('/phrases/today');

  // 상대와의 대화방을 열거나 만든 뒤 이동
  const startChat = async (partner: User) => {
    try {
      openChatRoom(await api<Conversation>('POST', '/conversations', { partnerId: partner.id }));
    } catch (e) {
      showError(e);
    }
  };

  if (!page || !phrase) return <TabPage title="Hana"><Spinner /></TabPage>;
  const partners = page.items;
  return (
    <TabPage title="Hana">
      <TodayPhraseCard phrase={phrase} myLang={me.nativeLang} />
      <SectionHeader title="언어교환 친구" trailing={`${partners.length}명`} />
      {partners.length === 0 ? (
        <EmptyState title="아직 친구가 없어요" subtitle="새 친구가 가입하면 여기에 보여요" />
      ) : (
        partners.map((p, i) => (
          <Fragment key={p.id}>
            {i > 0 && <RowDivider />}
            <PersonRow person={p} onPress={() => startChat(p)} />
          </Fragment>
        ))
      )}
    </TabPage>
  );
}
