import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { api } from '@/lib/api';
import { useMe, useSession } from '@/lib/session';
import { showError } from '@/lib/toast';
import { Button, Input, Screen } from '@/ui/components';
import { space, text } from '@/ui/theme';

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
      <View style={styles.body}>
        <Text style={text.section}>자기소개</Text>
        <Text style={[text.sub, { marginTop: space.xs, marginBottom: space.lg }]}>어떤 언어를, 왜 배우고 있는지 적어보세요</Text>
        <Input value={bio} onChangeText={setBio} multiline autoFocus style={styles.textarea} textAlignVertical="top" />
      </View>
      <View style={styles.footer}>
        <Button variant="secondary" title="취소" onPress={() => router.back()} style={{ flex: 1 }} />
        <Button title="저장" onPress={save} disabled={saving} style={{ flex: 1 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: space.page, paddingTop: space.xl },
  textarea: { height: 140, paddingVertical: space.md },
  footer: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.page, paddingBottom: space.lg },
});
