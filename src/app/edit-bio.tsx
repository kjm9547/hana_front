import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { t } from '@/i18n';
import { api } from '@/lib/api';
import { useMe, useSession } from '@/lib/session';
import { showError } from '@/lib/toast';
import { Button } from '@/ui/button';
import { Screen } from '@/ui/hana';
import { Text } from '@/ui/text';
import { Textarea } from '@/ui/textarea';

/** PROF-02 자기소개 수정 (모달) */
export default function EditBioScreen() {
  const me = useMe();
  const { reloadMe } = useSession();
  const [bio, setBio] = useState(me.bio);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api('PATCH', '/me', { bio });
      await reloadMe();
      router.back();
    } catch (e) {
      showError(e);
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View className="flex-1 px-page pt-6">
        <Text variant="title" className="mb-5">
          {t.editBio.title}
        </Text>
        <Textarea value={bio} onChangeText={setBio} placeholder={t.editBio.placeholder} aria-label={t.editBio.title} autoFocus />
      </View>
      <View className="flex-row gap-2 px-page pb-4">
        <Button variant="secondary" size="lg" className="flex-1" onPress={() => router.back()}>
          <Text>{t.common.cancel}</Text>
        </Button>
        <Button size="lg" className="flex-1" onPress={save} disabled={saving}>
          <Text>{t.editBio.save}</Text>
        </Button>
      </View>
    </Screen>
  );
}
