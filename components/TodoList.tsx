import Colors from '@/constants/Colors';
import type { Todo, TodoStatus } from '@/types/todo';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { TodoCard } from './TodoCard';
import { useColorScheme } from './useColorScheme';

type TodoListProps = {
  todos: Todo[];
  loading?: boolean;
  emptyMessage?: string;
  onTodoPress?: (todo: Todo) => void;
  onToggleStatus?: (todo: Todo) => void;
  onStatusChange?: (todo: Todo, status: TodoStatus) => void;
};

export function TodoList({
  todos,
  loading = false,
  emptyMessage = 'TODOがありません',
  onTodoPress,
  onToggleStatus,
  onStatusChange,
}: TodoListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (todos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.emptyText, { color: colors.text + '60' }]}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TodoCard
          todo={item}
          onPress={() => onTodoPress?.(item)}
          onToggleStatus={() => onToggleStatus?.(item)}
          onStatusChange={(status) => onStatusChange?.(item, status)}
        />
      )}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    gap: 16
  },
});
