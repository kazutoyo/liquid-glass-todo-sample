import { TodoList } from "@/components/TodoList";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
  useTodos,
  useToggleTodoStatus,
  useUpdateTodo,
} from "@/hooks/use-todos";
import type { Todo, TodoPriority, TodoStatus } from "@/types/todo";
import { Stack, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "all" | "pending" | "in_progress" | "completed";
type SortType = "dueDate" | "priority" | "createdAt";

export default function TodosScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("dueDate");

  // すべてのTODO（親のみ）を取得
  const { data: allTodos = [], isLoading } = useTodos({ hasParent: false });

  // ステータスをトグルするミューテーション
  const toggleStatusMutation = useToggleTodoStatus();

  // ステータスを更新するミューテーション
  const updateTodoMutation = useUpdateTodo();

  // フィルタとソートを適用
  const filteredAndSortedTodos = useMemo(() => {
    let filtered = allTodos;

    // フィルタ
    if (filterType !== "all") {
      filtered = filtered.filter((todo) => todo.status === filterType);
    }

    // ソート
    const sorted = [...filtered].sort((a, b) => {
      if (sortType === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortType === "priority") {
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
    router.push(`/todo/${todo.id}`);
  };

  const handleToggleStatus = (todo: Todo) => {
    toggleStatusMutation.mutate(todo.id);
  };

  const handleStatusChange = (todo: Todo, status: TodoStatus) => {
    updateTodoMutation.mutate({
      id: todo.id,
      status,
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: "TODO一覧" }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu icon="ellipsis.circle" title="オプション">
          <Stack.Toolbar.Menu
            icon="line.3.horizontal.decrease.circle"
            title="フィルター"
          >
            <Stack.Toolbar.MenuAction
              isOn={filterType === "all"}
              onPress={() => setFilterType("all")}
            >
              すべて
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              isOn={filterType === "pending"}
              onPress={() => setFilterType("pending")}
            >
              未着手
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              isOn={filterType === "in_progress"}
              onPress={() => setFilterType("in_progress")}
            >
              進行中
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              isOn={filterType === "completed"}
              onPress={() => setFilterType("completed")}
            >
              完了
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.Menu icon="arrow.up.arrow.down" title="並べ替え">
            <Stack.Toolbar.MenuAction
              isOn={sortType === "dueDate"}
              onPress={() => setSortType("dueDate")}
            >
              期限順
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              isOn={sortType === "priority"}
              onPress={() => setSortType("priority")}
            >
              優先度順
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              isOn={sortType === "createdAt"}
              onPress={() => setSortType("createdAt")}
            >
              作成日順
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["bottom"]}
      >
        {/* TODO一覧 */}
        <TodoList
          todos={filteredAndSortedTodos}
          loading={isLoading}
          emptyMessage={
            filterType === "all"
              ? "TODOがありません"
              : `${
                  filterType === "pending"
                    ? "未着手"
                    : filterType === "in_progress"
                      ? "進行中"
                      : "完了"
                }のTODOがありません`
          }
          onTodoPress={handleTodoPress}
          onToggleStatus={handleToggleStatus}
          onStatusChange={handleStatusChange}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
