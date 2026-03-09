import { StyleSheet, TouchableOpacity, View, Text, Platform } from 'react-native';
import { Circle, CircleDot, CheckCircle, Clock } from 'lucide-react-native';
import type { Todo, TodoStatus } from '@/types/todo';
import { useColorScheme } from './useColorScheme';
import Colors from '@/constants/Colors';
import { ContextMenu, Host, Button as SwiftButton } from '@expo/ui/swift-ui';

type TodoCardProps = {
  todo: Todo;
  onPress?: () => void;
  onToggleStatus?: () => void;
  onStatusChange?: (status: TodoStatus) => void;
};

const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
};

const STATUS_ICON_COMPONENTS = {
  pending: Circle,
  in_progress: CircleDot,
  completed: CheckCircle,
} as const;

const STATUS_LABELS = {
  pending: '未着手',
  in_progress: '進行中',
  completed: '完了',
} as const;

const STATUS_COLORS = {
  pending: '#9E9E9E',
  in_progress: '#2196F3',
  completed: '#4CAF50',
} as const;

export function TodoCard({ todo, onPress, onToggleStatus, onStatusChange }: TodoCardProps) {
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

  const cardContent = (
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
          {(() => {
            const IconComponent = STATUS_ICON_COMPONENTS[todo.status];
            return (
              <IconComponent
                size={24}
                color={
                  todo.status === 'completed'
                    ? PRIORITY_COLORS.low
                    : colors.text + '80'
                }
              />
            );
          })()}
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
            {/* ステータスバッジ */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: STATUS_COLORS[todo.status] + '30' },
              ]}>
              <Text
                style={[
                  styles.statusText,
                  { color: STATUS_COLORS[todo.status] },
                ]}>
                {STATUS_LABELS[todo.status]}
              </Text>
            </View>

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
                <Clock
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

  // iOSの場合、ContextMenuでラップ
  if (Platform.OS === 'ios' && onStatusChange) {
    return (
      <Host matchContents>
        <ContextMenu>
          <ContextMenu.Items>
            {(Object.keys(STATUS_LABELS) as TodoStatus[]).map((status) => (
              <SwiftButton
                key={status}
                onPress={() => onStatusChange(status)}
                label={STATUS_LABELS[status]}
                systemImage={
                  status === 'pending'
                    ? 'circle'
                    : status === 'in_progress'
                      ? 'circle.dotted'
                      : 'checkmark.circle.fill'
                }
              />
            ))}
          </ContextMenu.Items>
          <ContextMenu.Trigger>{cardContent}</ContextMenu.Trigger>
        </ContextMenu>
      </Host>
    );
  }

  return cardContent;
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
