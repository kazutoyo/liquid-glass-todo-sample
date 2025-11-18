import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { createTodo, deleteTodo, updateTodo } from '@/db';
import { useCategories } from '@/hooks/use-categories';
import { useSubTodos, useTodo } from '@/hooks/use-todos';
import { useScheduleTodoNotification } from '@/hooks/use-notifications';
import type { CreateTodoInput, TodoPriority, TodoStatus } from '@/types/todo';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Calendar, CheckCircle, Circle, CircleDot, Trash, XCircle, Bell } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const PRIORITIES: { value: TodoPriority; label: string; color: string }[] = [
  { value: 'low', label: '低', color: '#4CAF50' },
  { value: 'medium', label: '中', color: '#FF9800' },
  { value: 'high', label: '高', color: '#F44336' },
];

const STATUSES: { value: TodoStatus; label: string; Icon: typeof Circle }[] = [
  { value: 'pending', label: '未着手', Icon: Circle },
  { value: 'in_progress', label: '進行中', Icon: CircleDot },
  { value: 'completed', label: '完了', Icon: CheckCircle },
];

export default function TodoDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation()
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const isNew = id === 'new';
  const todoId = isNew ? 0 : parseInt(id || '0', 10);

  const { todo, loading } = useTodo(todoId);
  const { subTodos } = useSubTodos(todoId);
  const { categories } = useCategories();
  const scheduleNotification = useScheduleTodoNotification();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [status, setStatus] = useState<TodoStatus>('pending');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  useEffect(() => {
    if (todo && !isNew) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority);
      setStatus(todo.status);
      setCategoryId(todo.categoryId);
      if (todo.dueDate) {
        setDueDate(new Date(todo.dueDate));
      }
      if (todo.reminderTime) {
        setReminderTime(new Date(todo.reminderTime));
      }
      navigation.setOptions({
        title: todo.title,
      })
    }
  }, [todo, isNew]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    try {
      const todoData: CreateTodoInput = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status,
        categoryId,
        dueDate: dueDate ? dueDate.toISOString() : null,
        tags: null,
        isRecurring: false,
        recurringPattern: null,
        parentId: null,
        sortOrder: 0,
        reminderTime: reminderTime ? reminderTime.toISOString() : null,
      };

      let savedTodoId = todoId;
      if (isNew) {
        const newTodo = await createTodo(todoData);
        savedTodoId = newTodo.id;
        Alert.alert('成功', 'TODOを作成しました', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await updateTodo({ id: todoId, ...todoData });
        Alert.alert('成功', 'TODOを更新しました', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }

      // 通知をスケジュール
      await scheduleNotification(savedTodoId, title.trim(), reminderTime);
    } catch (error) {
      console.error('Failed to save todo:', error);
      Alert.alert('エラー', 'TODOの保存に失敗しました');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '削除確認',
      'このTODOを削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTodo(todoId);
              router.back();
            } catch (error) {
              console.error('Failed to delete todo:', error);
              Alert.alert('エラー', 'TODOの削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* タイトル */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            タイトル <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.text + '10',
                color: colors.text,
                borderColor: colors.text + '20',
              },
            ]}
            placeholder="TODOのタイトル"
            placeholderTextColor={colors.text + '60'}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* 説明 */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>説明</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.text + '10',
                color: colors.text,
                borderColor: colors.text + '20',
              },
            ]}
            placeholder="詳細な説明（任意）"
            placeholderTextColor={colors.text + '60'}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* ステータス */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>ステータス</Text>
          <View style={styles.buttonGroup}>
            {STATUSES.map((s) => {
              const StatusIcon = s.Icon;
              return (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.button,
                    {
                      backgroundColor:
                        status === s.value ? colors.tint + '20' : colors.text + '10',
                      borderColor:
                        status === s.value ? colors.tint : colors.text + '20',
                    },
                  ]}
                  onPress={() => setStatus(s.value)}
                  activeOpacity={0.7}>
                  <StatusIcon
                    size={16}
                    color={status === s.value ? colors.tint : colors.text + '80'}
                  />
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: status === s.value ? colors.tint : colors.text + '80',
                      },
                    ]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 優先度 */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>優先度</Text>
          <View style={styles.buttonGroup}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      priority === p.value ? p.color + '20' : colors.text + '10',
                    borderColor:
                      priority === p.value ? p.color : colors.text + '20',
                  },
                ]}
                onPress={() => setPriority(p.value)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: priority === p.value ? p.color : colors.text + '80',
                    },
                  ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* カテゴリ */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>カテゴリ</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                {
                  backgroundColor:
                    categoryId === null ? colors.tint + '20' : colors.text + '10',
                  borderColor:
                    categoryId === null ? colors.tint : colors.text + '20',
                },
              ]}
              onPress={() => setCategoryId(null)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.categoryButtonText,
                  {
                    color: categoryId === null ? colors.tint : colors.text + '80',
                  },
                ]}>
                なし
              </Text>
            </TouchableOpacity>

            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      categoryId === category.id
                        ? category.color + '20'
                        : colors.text + '10',
                    borderColor:
                      categoryId === category.id
                        ? category.color
                        : colors.text + '20',
                  },
                ]}
                onPress={() => setCategoryId(category.id)}
                activeOpacity={0.7}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: category.color },
                  ]}
                />
                <Text
                  style={[
                    styles.categoryButtonText,
                    {
                      color:
                        categoryId === category.id
                          ? category.color
                          : colors.text + '80',
                    },
                  ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 期限 */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>期限</Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor: colors.text + '10',
                borderColor: colors.text + '20',
              },
            ]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}>
            <Calendar
              size={18}
              color={colors.text + '80'}
            />
            <Text style={[styles.dateButtonText, { color: colors.text }]}>
              {dueDate ? formatDate(dueDate) : '期限を設定'}
            </Text>
            {dueDate && (
              <TouchableOpacity
                onPress={() => setDueDate(null)}
                style={styles.clearDateButton}>
                <XCircle
                  size={18}
                  color={colors.text + '60'}
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* リマインダー */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>リマインダー</Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor: colors.text + '10',
                borderColor: colors.text + '20',
              },
            ]}
            onPress={() => setShowReminderPicker(true)}
            activeOpacity={0.7}>
            <Bell
              size={18}
              color={colors.text + '80'}
            />
            <Text style={[styles.dateButtonText, { color: colors.text }]}>
              {reminderTime ? formatDate(reminderTime) : 'リマインダーを設定'}
            </Text>
            {reminderTime && (
              <TouchableOpacity
                onPress={() => setReminderTime(null)}
                style={styles.clearDateButton}>
                <XCircle
                  size={18}
                  color={colors.text + '60'}
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* サブタスク */}
        {!isNew && subTodos.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>
              サブタスク ({subTodos.length})
            </Text>
            {subTodos.map((subTodo) => {
              const SubTaskIcon = subTodo.status === 'completed' ? CheckCircle : Circle;
              return (
                <View
                  key={subTodo.id}
                  style={[
                    styles.subTaskItem,
                    {
                      backgroundColor: colors.text + '05',
                      borderColor: colors.text + '20',
                    },
                  ]}>
                  <SubTaskIcon
                    size={16}
                    color={
                      subTodo.status === 'completed'
                        ? '#4CAF50'
                        : colors.text + '60'
                    }
                  />
                  <Text
                    style={[
                      styles.subTaskText,
                      { color: colors.text },
                      subTodo.status === 'completed' && styles.subTaskCompleted,
                    ]}>
                    {subTodo.title}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* 削除ボタン */}
        {!isNew && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.7}>
              <Trash size={18} color="#F44336" />
              <Text style={styles.deleteButtonText}>TODOを削除</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* 保存ボタン */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.text + '20' },
        ]}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          activeOpacity={0.7}>
          <Text style={[styles.cancelButtonText, { color: colors.text + '80' }]}>
            キャンセル
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.tint }]}
          onPress={handleSave}
          activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>
            {isNew ? '作成' : '保存'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* DateTimePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="datetime"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (event.type === 'set' && selectedDate) {
              setDueDate(selectedDate);
            }
          }}
        />
      )}

      {/* ReminderTimePicker */}
      {showReminderPicker && (
        <DateTimePicker
          value={reminderTime || new Date()}
          mode="datetime"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowReminderPicker(Platform.OS === 'ios');
            if (event.type === 'set' && selectedDate) {
              setReminderTime(selectedDate);
            }
          }}
        />
      )}
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryList: {
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
  },
  clearDateButton: {
    padding: 4,
  },
  subTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  subTaskText: {
    flex: 1,
    fontSize: 14,
  },
  subTaskCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  spacer: {
    height: 100,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
