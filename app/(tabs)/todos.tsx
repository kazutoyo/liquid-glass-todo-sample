import { TodoList } from '@/components/TodoList';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useTodos, useToggleTodoStatus } from '@/hooks/use-todos';
import type { Todo, TodoPriority } from '@/types/todo';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed';
type SortType = 'dueDate' | 'priority' | 'createdAt';

export default function TodosScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('dueDate');

  // すべてのTODO（親のみ）を取得
  const { data: allTodos = [], isLoading } = useTodos({ hasParent: false });

  // ステータスをトグルするミューテーション
  const toggleStatusMutation = useToggleTodoStatus();

  // フィルタとソートを適用
  const filteredAndSortedTodos = useMemo(() => {
    let filtered = allTodos;

    // フィルタ
    if (filterType !== 'all') {
      filtered = filtered.filter((todo) => todo.status === filterType);
    }

    // ソート
    const sorted = [...filtered].sort((a, b) => {
      if (sortType === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortType === 'priority') {
        const priorityOrder: Record<TodoPriority, number> = {
          high: 0,
          medium: 1,
          low: 2,
        };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        // createdAt
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

    return sorted;
  }, [allTodos, filterType, sortType]);

  const handleTodoPress = (todo: Todo) => {
    router.push(`/todo/${todo.id}` as any);
  };

  const handleToggleStatus = (todo: Todo) => {
    toggleStatusMutation.mutate(todo.id);
  };

  const getFilterCount = (type: FilterType) => {
    if (type === 'all') return allTodos.length;
    return allTodos.filter((todo) => todo.status === type).length;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* フィルタボタン */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.sortContainer}>
        <FilterButton
          label="すべて"
          count={getFilterCount('all')}
          active={filterType === 'all'}
          onPress={() => setFilterType('all')}
          color={colors.tint}
        />
        <FilterButton
          label="未着手"
          count={getFilterCount('pending')}
          active={filterType === 'pending'}
          onPress={() => setFilterType('pending')}
          color="#FF9800"
        />
        <FilterButton
          label="進行中"
          count={getFilterCount('in_progress')}
          active={filterType === 'in_progress'}
          onPress={() => setFilterType('in_progress')}
          color="#2196F3"
        />
        <FilterButton
          label="完了"
          count={getFilterCount('completed')}
          active={filterType === 'completed'}
          onPress={() => setFilterType('completed')}
          color="#4CAF50"
        />
      </ScrollView>

      {/* ソートボタン */}
      <View style={[styles.sortContainer, { borderBottomColor: colors.text + '20' }]}>
        <Text style={[styles.sortLabel, { color: colors.text + '80' }]}>
          並べ替え:
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortButtons}>
          <SortButton
            label="期限順"
            active={sortType === 'dueDate'}
            onPress={() => setSortType('dueDate')}
            color={colors.tint}
          />
          <SortButton
            label="優先度順"
            active={sortType === 'priority'}
            onPress={() => setSortType('priority')}
            color={colors.tint}
          />
          <SortButton
            label="作成日順"
            active={sortType === 'createdAt'}
            onPress={() => setSortType('createdAt')}
            color={colors.tint}
          />
        </ScrollView>
      </View>

      {/* TODO一覧 */}
      <TodoList
        todos={filteredAndSortedTodos}
        loading={isLoading}
        emptyMessage={
          filterType === 'all'
            ? 'TODOがありません'
            : `${filterType === 'pending' ? '未着手' : filterType === 'in_progress' ? '進行中' : '完了'}のTODOがありません`
        }
        onTodoPress={handleTodoPress}
        onToggleStatus={handleToggleStatus}
      />

      {/* FAB - TODO追加ボタン */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/todo/new' as any)}
        activeOpacity={0.8}>
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

type FilterButtonProps = {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
  color: string;
};

function FilterButton({
  label,
  count,
  active,
  onPress,
  color,
}: FilterButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.filterButton,
        active && { backgroundColor: color + '20', borderColor: color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text
        style={[
          styles.filterButtonText,
          active && { color, fontWeight: '600' },
        ]}>
        {label}
      </Text>
      <View
        style={[
          styles.filterBadge,
          active && { backgroundColor: color },
        ]}>
        <Text
          style={[
            styles.filterBadgeText,
            active && { color: 'white' },
          ]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

type SortButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  color: string;
};

function SortButton({ label, active, onPress, color }: SortButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.sortButton,
        active && { backgroundColor: color + '20' },
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text
        style={[
          styles.sortButtonText,
          active && { color, fontWeight: '600' },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#00000020',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonText: {
    fontSize: 14,
  },
  filterBadge: {
    backgroundColor: '#00000020',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  sortButtons: {
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sortButtonText: {
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
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
});
