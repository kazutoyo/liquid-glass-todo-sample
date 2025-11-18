import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { seedData } from '@/utils/seed-data';
import { useColorScheme } from './useColorScheme';
import Colors from '@/constants/Colors';

/**
 * 開発用ツール（本番環境では非表示にする）
 */
export function DevTools() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSeedData = async () => {
    Alert.alert(
      'ダミーデータ挿入',
      'ダミーデータを挿入しますか？既存のデータは保持されます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '挿入',
          onPress: async () => {
            try {
              await seedData();
              Alert.alert('成功', 'ダミーデータを挿入しました。画面を更新してください。');
            } catch (error) {
              console.error('Failed to seed data:', error);
              Alert.alert('エラー', 'ダミーデータの挿入に失敗しました');
            }
          },
        },
      ]
    );
  };

  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => setIsExpanded(true)}
        activeOpacity={0.8}>
        <FontAwesome name="wrench" size={20} color="white" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.expandedContainer, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.text + '20' }]}>
        <Text style={[styles.title, { color: colors.text }]}>開発ツール</Text>
        <TouchableOpacity onPress={() => setIsExpanded(false)}>
          <FontAwesome name="times" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={handleSeedData}
          activeOpacity={0.8}>
          <FontAwesome name="database" size={18} color="white" />
          <Text style={styles.buttonText}>ダミーデータ挿入</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  expandedContainer: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    width: 280,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
