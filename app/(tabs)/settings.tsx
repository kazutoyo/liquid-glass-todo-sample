import { useCategoryStats } from '@/hooks/use-categories';
import { Button, Host, HStack, List, Text, VStack } from '@expo/ui/swift-ui';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { data: stats = [] } = useCategoryStats();

  // iOSではSwiftUIコンポーネントを使用
  if (Platform.OS === 'ios') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Host style={styles.host}>
          <VStack spacing={0}>
            {/* カテゴリ管理セクション */}
            <List listStyle="insetGrouped" scrollEnabled={false}>
              <Button
                onPress={() => router.push('/categories')}
                systemImage="folder"
                label="カテゴリ一覧"
              />
            </List>

            {/* カテゴリ統計 */}
            {stats.length > 0 && (
              <List listStyle="insetGrouped" scrollEnabled={false}>
                {stats.map((stat, index) => (
                  <HStack key={index} spacing={8}>
                    <Text>{stat.categoryName}</Text>
                    <Text>{`${stat.completed}/${stat.total}`}</Text>
                  </HStack>
                ))}
              </List>
            )}

            {/* アプリ情報セクション */}
            <List listStyle="insetGrouped" scrollEnabled={false}>
              <HStack spacing={8}>
                <Text>バージョン</Text>
                <Text>1.0.0</Text>
              </HStack>
              <HStack spacing={8}>
                <Text>データベース</Text>
                <Text>SQLite + FTS5</Text>
              </HStack>
            </List>

            {/* その他セクション */}
            <List listStyle="insetGrouped" scrollEnabled={false}>
              <Button
                onPress={() => router.push('/glass-effect')}
                systemImage="sparkles"
                label="Glass Effect"
              />
            </List>
          </VStack>
        </Host>
      </SafeAreaView>
    );
  }

  // Android/Webではフォールバック（既存のUI）
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <RNText style={styles.sectionTitle}>カテゴリ管理</RNText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  host: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
});
