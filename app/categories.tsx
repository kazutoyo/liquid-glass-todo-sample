import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pencil, Trash2, ArrowLeft, Plus, FolderOpen, Check } from 'lucide-react-native';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/use-categories';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import type { Category, CreateCategoryInput } from '@/types/todo';

const PRESET_COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
];

export default function CategoriesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: categories = [], isLoading } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setSelectedColor(PRESET_COLORS[0]);
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setSelectedColor(category.color);
    setShowModal(true);
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      Alert.alert('エラー', 'カテゴリ名を入力してください');
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate(
        {
          id: editingCategory.id,
          name: categoryName.trim(),
          color: selectedColor,
          sortOrder: editingCategory.sortOrder,
        },
        {
          onSuccess: () => {
            Alert.alert('成功', 'カテゴリを更新しました');
            setShowModal(false);
          },
          onError: (error) => {
            console.error('Failed to update category:', error);
            Alert.alert('エラー', 'カテゴリの更新に失敗しました');
          },
        }
      );
    } else {
      const categoryData: CreateCategoryInput = {
        name: categoryName.trim(),
        color: selectedColor,
        icon: null,
        sortOrder: categories.length,
      };
      createCategoryMutation.mutate(categoryData, {
        onSuccess: () => {
          Alert.alert('成功', 'カテゴリを作成しました');
          setShowModal(false);
        },
        onError: (error) => {
          console.error('Failed to create category:', error);
          Alert.alert('エラー', 'カテゴリの作成に失敗しました');
        },
      });
    }
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      '削除確認',
      `「${category.name}」を削除してもよろしいですか？\nこのカテゴリに関連付けられたTODOは「未分類」になります。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            deleteCategoryMutation.mutate(category.id, {
              onError: (error) => {
                console.error('Failed to delete category:', error);
                Alert.alert('エラー', 'カテゴリの削除に失敗しました');
              },
            });
          },
        },
      ]
    );
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <View
      style={[
        styles.categoryItem,
        { backgroundColor: colors.text + '05', borderColor: colors.text + '20' },
      ]}>
      <View style={styles.categoryLeft}>
        <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
        <Text style={[styles.categoryName, { color: colors.text }]}>
          {item.name}
        </Text>
      </View>

      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditCategory(item)}
          activeOpacity={0.7}>
          <Pencil size={18} color={colors.tint} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteCategory(item)}
          activeOpacity={0.7}>
          <Trash2 size={18} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* ヘッダー */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.background, borderBottomColor: colors.text + '20' },
        ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          カテゴリ管理
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCategory}
          activeOpacity={0.7}>
          <Plus size={20} color={colors.tint} />
        </TouchableOpacity>
      </View>

      {/* カテゴリ一覧 */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategory}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FolderOpen size={64} color={colors.text + '40'} />
            <Text style={[styles.emptyText, { color: colors.text + '60' }]}>
              カテゴリがまだありません
            </Text>
            <Text style={[styles.emptySubText, { color: colors.text + '40' }]}>
              右上の「+」ボタンから追加してみましょう
            </Text>
          </View>
        }
      />

      {/* カテゴリ作成/編集モーダル */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* モーダルヘッダー */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: colors.text + '20' },
            ]}>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              activeOpacity={0.7}>
              <Text style={[styles.modalCancelText, { color: colors.text + '80' }]}>
                キャンセル
              </Text>
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingCategory ? 'カテゴリ編集' : '新規カテゴリ'}
            </Text>

            <TouchableOpacity onPress={handleSaveCategory} activeOpacity={0.7}>
              <Text style={[styles.modalSaveText, { color: colors.tint }]}>
                保存
              </Text>
            </TouchableOpacity>
          </View>

          {/* モーダルコンテンツ */}
          <View style={styles.modalContent}>
            {/* カテゴリ名 */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>
                カテゴリ名 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.text + '10',
                    color: colors.text,
                    borderColor: colors.text + '20',
                  },
                ]}
                placeholder="例: 仕事、趣味、買い物"
                placeholderTextColor={colors.text + '60'}
                value={categoryName}
                onChangeText={setCategoryName}
              />
            </View>

            {/* カラー選択 */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>
                カラー
              </Text>
              <View style={styles.colorGrid}>
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColorButton,
                    ]}
                    onPress={() => setSelectedColor(color)}
                    activeOpacity={0.7}>
                    {selectedColor === color && (
                      <Check size={20} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* プレビュー */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>
                プレビュー
              </Text>
              <View
                style={[
                  styles.previewContainer,
                  {
                    backgroundColor: selectedColor + '20',
                    borderColor: selectedColor,
                  },
                ]}>
                <View
                  style={[styles.previewDot, { backgroundColor: selectedColor }]}
                />
                <Text style={[styles.previewText, { color: selectedColor }]}>
                  {categoryName || 'カテゴリ名'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalCancelText: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorButton: {
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
