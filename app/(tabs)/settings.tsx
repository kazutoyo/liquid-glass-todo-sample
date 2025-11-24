import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useCategoryStats } from '@/hooks/use-categories';
import { useRouter } from 'expo-router';
import { Book, ChevronRight, Database, Folder, Info } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { data: stats = [] } = useCategoryStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* カテゴリ管理 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            カテゴリ管理
          </Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: colors.text + '05', borderColor: colors.text + '20' },
            ]}
            onPress={() => router.push('/categories')}
            activeOpacity={0.7}>
            <View style={styles.settingItemLeft}>
              <Folder size={20} color={colors.tint} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>
                カテゴリ一覧
              </Text>
            </View>
            <ChevronRight size={16} color={colors.text + '60'} />
          </TouchableOpacity>

          {/* カテゴリ統計 */}
          {stats.length > 0 && (
            <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View
                  key={index}
                  style={[
                    styles.statItem,
                    { borderColor: colors.text + '20' },
                  ]}>
                  <View style={styles.statLeft}>
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: stat.categoryColor },
                      ]}
                    />
                    <Text style={[styles.statName, { color: colors.text }]}>
                      {stat.categoryName}
                    </Text>
                  </View>
                  <Text style={[styles.statCount, { color: colors.text + '80' }]}>
                    {stat.completed}/{stat.total}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* アプリ情報 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            アプリ情報
          </Text>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: colors.text + '05', borderColor: colors.text + '20' },
            ]}>
            <View style={styles.settingItemLeft}>
              <Info size={20} color={colors.tint} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>
                バージョン
              </Text>
            </View>
            <Text style={[styles.settingItemValue, { color: colors.text + '60' }]}>
              1.0.0
            </Text>
          </View>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: colors.text + '05', borderColor: colors.text + '20' },
            ]}>
            <View style={styles.settingItemLeft}>
              <Database size={20} color={colors.tint} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>
                データベース
              </Text>
            </View>
            <Text style={[styles.settingItemValue, { color: colors.text + '60' }]}>
              SQLite + FTS5
            </Text>
          </View>
        </View>

        {/* その他 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            その他
          </Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: colors.text + '05', borderColor: colors.text + '20' },
            ]}
            onPress={() => router.push('/glass-effect')}
            activeOpacity={0.7}>
            <View style={styles.settingItemLeft}>
              <Book size={20} color={colors.tint} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>
                Glass Effect
              </Text>
            </View>
            <ChevronRight size={16} color={colors.text + '60'} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemText: {
    fontSize: 16,
  },
  settingItemValue: {
    fontSize: 14,
  },
  statsContainer: {
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statName: {
    fontSize: 15,
  },
  statCount: {
    fontSize: 14,
  },
});
