import { DevTools } from "@/components/DevTools";
import { SectionHeader } from "@/components/SectionHeader";
import { TodoCard } from "@/components/TodoCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useTodos, useTodoStats } from "@/hooks/use-todos";
import type { Todo } from "@/types/todo";
import { GlassView } from "expo-glass-effect";
import { useRouter } from "expo-router";
import { Inbox, Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [refreshing, setRefreshing] = useState(false);

  // すべてのTODO（親のみ）を取得
  const {
    todos: allTodos,
    loading,
    refresh: refreshTodos,
    toggleStatus,
  } = useTodos({ hasParent: false });

  // 統計情報を取得
  const { stats, refresh: refreshStats } = useTodoStats();

  // リフレッシュ処理
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshTodos(), refreshStats()]);
    setRefreshing(false);
  };

  // 期限が近いTODO（未完了、7日以内）
  const dueSoonTodos = useMemo(() => {
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return allTodos
      .filter((todo) => {
        if (todo.status === "completed" || !todo.dueDate) return false;
        const dueDate = new Date(todo.dueDate);
        return dueDate <= weekLater;
      })
      .sort((a, b) => {
        if (!a.dueDate || !b.dueDate) return 0;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 5);
  }, [allTodos]);

  // 直近追加されたTODO（未完了、5件）
  const recentTodos = useMemo(() => {
    return allTodos
      .filter((todo) => todo.status !== "completed")
      .sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .slice(0, 5);
  }, [allTodos]);

  // 今日のTODO（期限が今日）
  const todayTodos = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return allTodos.filter((todo) => {
      if (!todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
  }, [allTodos]);

  const handleTodoPress = (todo: Todo) => {
    router.push(`/todo/${todo.id}` as any);
  };

  const handleToggleStatus = async (todo: Todo) => {
    try {
      await toggleStatus(todo.id);
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            こんにちは👋
          </Text>
          <Text style={[styles.subtitle, { color: colors.text + "80" }]}>
            今日も頑張りましょう！
          </Text>
        </View>

        {/* 統計カード */}
        <View style={styles.statsContainer}>
          <View
            style={[styles.statCard, { backgroundColor: colors.tint + "20" }]}
          >
            <Text style={[styles.statNumber, { color: colors.tint }]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text + "80" }]}>
              全TODO
            </Text>
          </View>

          <View
            style={[styles.statCard, { backgroundColor: "#4CAF50" + "20" }]}
          >
            <Text style={[styles.statNumber, { color: "#4CAF50" }]}>
              {stats.completed}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text + "80" }]}>
              完了
            </Text>
          </View>

          <View
            style={[styles.statCard, { backgroundColor: "#FF9800" + "20" }]}
          >
            <Text style={[styles.statNumber, { color: "#FF9800" }]}>
              {stats.pending}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text + "80" }]}>
              未完了
            </Text>
          </View>

          <View
            style={[styles.statCard, { backgroundColor: colors.tint + "20" }]}
          >
            <Text style={[styles.statNumber, { color: colors.tint }]}>
              {Math.round(stats.completionRate)}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.text + "80" }]}>
              達成率
            </Text>
          </View>
        </View>

        {/* 今日のTODO */}
        {todayTodos.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="今日のTODO" count={todayTodos.length} />
            <View style={styles.todoContainer}>
              {todayTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onPress={() => handleTodoPress(todo)}
                  onToggleStatus={() => handleToggleStatus(todo)}
                />
              ))}
            </View>
          </View>
        )}

        {/* 期限が近いTODO */}
        {dueSoonTodos.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="期限が近いTODO"
              count={dueSoonTodos.length}
              onSeeAll={() => router.push("/(tabs)/todos" as any)}
            />
            <View style={styles.todoContainer}>
              {dueSoonTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onPress={() => handleTodoPress(todo)}
                  onToggleStatus={() => handleToggleStatus(todo)}
                />
              ))}
            </View>
          </View>
        )}

        {/* 直近追加されたTODO */}
        {recentTodos.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="最近追加したTODO"
              count={recentTodos.length}
              onSeeAll={() => router.push("/(tabs)/todos" as any)}
            />
            <View style={styles.todoContainer}>
              {recentTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onPress={() => handleTodoPress(todo)}
                  onToggleStatus={() => handleToggleStatus(todo)}
                />
              ))}
            </View>
          </View>
        )}

        {/* 空状態 */}
        {!loading && allTodos.length === 0 && (
          <View style={styles.emptyContainer}>
            <Inbox size={64} color={colors.text + "40"} />
            <Text style={[styles.emptyText, { color: colors.text + "60" }]}>
              TODOがまだありません
            </Text>
            <Text style={[styles.emptySubText, { color: colors.text + "40" }]}>
              右下の「+」ボタンから追加してみましょう
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB - TODO追加ボタン（Glass Effect） */}
      <GlassView
        style={styles.fab}
        glassEffectStyle="regular"
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => router.push("/todo/new" as any)}
          activeOpacity={0.8}
        >
          <Plus size={24} color={colorScheme === 'dark' ? 'white' : colors.tint} />
        </TouchableOpacity>
      </GlassView>

      {/* 開発ツール */}
      {__DEV__ && <DevTools />}
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
  scrollContent: {
    paddingBottom: 90, // FABとTabBarの高さ分の余白
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    marginTop: 8,
  },
  todoContainer: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 90, // TabBarの高さ(~50px) + マージン
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden", // Glass Effectの境界をクリップ
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
