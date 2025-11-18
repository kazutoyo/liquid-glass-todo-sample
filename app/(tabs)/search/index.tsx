import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSearchTodos } from '@/hooks/use-todos';
import { TodoCard } from '@/components/TodoCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import type { Todo } from '@/types/todo';
import { useTodos } from '@/hooks/use-todos';

export default function SearchScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [searchText, setSearchText] = useState('');
  const { results, loading, search } = useSearchTodos();
  const { toggleStatus } = useTodos({ hasParent: false });

  const handleSearchTextChange = useCallback(
    (text: string) => {
      setSearchText(text);
      if (text.trim()) {
        search(text.trim());
      }
    },
    [search]
  );

  const handleSearch = () => {
    if (searchText.trim()) {
      search(searchText.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
  };

  const handleTodoPress = (todo: Todo) => {
    router.push(`/todo/${todo.id}` as any);
  };

  const handleToggleStatus = async (todo: Todo) => {
    try {
      await toggleStatus(todo.id);
      // 検索結果を再取得
      if (searchText.trim()) {
        search(searchText.trim());
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: '検索',
            headerSearchBarOptions: {
              placement: 'automatic',
              placeholder: 'TODOを検索...',
              onChangeText: (event: { nativeEvent: { text: string } }) => {
                handleSearchTextChange(event.nativeEvent.text);
              },
            },
          }}
        />
      )}

      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        {/* Android用の検索バー */}
        {Platform.OS !== 'ios' && (
          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchInputContainer,
                {
                  backgroundColor: colors.text + '10',
                  borderColor: colors.text + '20',
                },
              ]}>
              <FontAwesome
                name="search"
                size={18}
                color={colors.text + '60'}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="TODOを検索..."
                placeholderTextColor={colors.text + '60'}
                value={searchText}
                onChangeText={handleSearchTextChange}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearSearch}
                  style={styles.clearButton}>
                  <FontAwesome
                    name="times-circle"
                    size={18}
                    color={colors.text + '60'}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* 検索結果 */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : results.length > 0 ? (
            <>
              <View style={styles.resultHeader}>
                <Text style={[styles.resultCount, { color: colors.text }]}>
                  {results.length}件の結果
                </Text>
              </View>
              <View style={styles.todoList}>
                {results.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onPress={() => handleTodoPress(todo)}
                    onToggleStatus={() => handleToggleStatus(todo)}
                  />
                ))}
              </View>
            </>
          ) : searchText.trim().length > 0 ? (
            <View style={styles.centerContainer}>
              <FontAwesome name="search" size={64} color={colors.text + '40'} />
              <Text style={[styles.emptyText, { color: colors.text + '60' }]}>
                「{searchText}」に一致するTODOが見つかりませんでした
              </Text>
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <FontAwesome name="search" size={64} color={colors.text + '40'} />
              <Text style={[styles.emptyText, { color: colors.text + '60' }]}>
                {Platform.OS === 'ios'
                  ? '上の検索バーからTODOを検索できます'
                  : 'TODOを検索してみましょう'}
              </Text>
              <Text style={[styles.emptySubText, { color: colors.text + '40' }]}>
                タイトルや説明文から全文検索できます
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  resultHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  todoList: {
    paddingHorizontal: 16,
  },
  centerContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
