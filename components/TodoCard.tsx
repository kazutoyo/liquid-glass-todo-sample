import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { Todo } from '@/types/todo';
import { useColorScheme } from './useColorScheme';
import Colors from '@/constants/Colors';

type TodoCardProps = {
  todo: Todo;
  onPress?: () => void;
  onToggleStatus?: () => void;
};

const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
};

const STATUS_ICONS = {
  pending: 'circle-o',
  in_progress: 'adjust',
  completed: 'check-circle',
} as const;

export function TodoCard({ todo, onPress, onToggleStatus }: TodoCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const isOverdue =
    todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'completed';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '明日';
    if (diffDays === -1) return '昨日';
    if (diffDays > 0 && diffDays <= 7) return `${diffDays}日後`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)}日前`;

    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.text + '20',
        },
        todo.status === 'completed' && styles.completed,
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        {/* ステータスアイコン */}
        <TouchableOpacity
          onPress={onToggleStatus}
          style={styles.statusButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome
            name={STATUS_ICONS[todo.status]}
            size={24}
            color={
              todo.status === 'completed'
                ? PRIORITY_COLORS.low
                : colors.text + '80'
            }
          />
        </TouchableOpacity>

        {/* メイン情報 */}
        <View style={styles.main}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
              todo.status === 'completed' && styles.completedText,
            ]}
            numberOfLines={2}>
            {todo.title}
          </Text>

          {todo.description && (
            <Text
              style={[
                styles.description,
                { color: colors.text + '80' },
                todo.status === 'completed' && styles.completedText,
              ]}
              numberOfLines={1}>
              {todo.description}
            </Text>
          )}

          {/* メタ情報 */}
          <View style={styles.meta}>
            {/* 優先度バッジ */}
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: PRIORITY_COLORS[todo.priority] + '30' },
              ]}>
              <Text
                style={[
                  styles.priorityText,
                  { color: PRIORITY_COLORS[todo.priority] },
                ]}>
                {todo.priority === 'low'
                  ? '低'
                  : todo.priority === 'medium'
                    ? '中'
                    : '高'}
              </Text>
            </View>

            {/* 期限 */}
            {todo.dueDate && (
              <View style={styles.dueDate}>
                <FontAwesome
                  name="clock-o"
                  size={12}
                  color={isOverdue ? PRIORITY_COLORS.high : colors.text + '60'}
                />
                <Text
                  style={[
                    styles.dueDateText,
                    {
                      color: isOverdue
                        ? PRIORITY_COLORS.high
                        : colors.text + '60',
                    },
                  ]}>
                  {formatDate(todo.dueDate)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 優先度インジケーター */}
        <View
          style={[
            styles.priorityIndicator,
            { backgroundColor: PRIORITY_COLORS[todo.priority] },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  completed: {
    opacity: 0.6,
  },
  statusButton: {
    marginRight: 12,
    paddingTop: 2,
  },
  main: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: 12,
  },
  priorityIndicator: {
    width: 4,
    alignSelf: 'stretch',
    marginLeft: 12,
    borderRadius: 2,
  },
});
