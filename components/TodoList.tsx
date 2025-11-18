import { FlatList, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import type { Todo } from '@/types/todo';
import { TodoCard } from './TodoCard';
import { useColorScheme } from './useColorScheme';
import Colors from '@/constants/Colors';

type TodoListProps = {
  todos: Todo[];
  loading?: boolean;
  emptyMessage?: string;
  onTodoPress?: (todo: Todo) => void;
  onToggleStatus?: (todo: Todo) => void;
};

export function TodoList({
  todos,
  loading = false,
  emptyMessage = 'TODOがありません',
  onTodoPress,
  onToggleStatus,
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
  },
});
