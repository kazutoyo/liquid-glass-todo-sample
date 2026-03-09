import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import {
  InputAccessoryView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const INPUT_ACCESSORY_ID = "quickAddInput";

type QuickAddAccessoryContentProps = {
  title: string;
  onChangeTitle: (text: string) => void;
  onSubmit: () => void;
  isPending: boolean;
};

export function QuickAddAccessoryContent({
  title,
  onChangeTitle,
  onSubmit,
  isPending,
}: QuickAddAccessoryContentProps) {
  const placement = NativeTabs.BottomAccessory.usePlacement();
  const router = useRouter();

  if (placement === "inline") {
    return (
      <Pressable
        style={styles.inlineContainer}
        onPress={() => router.push("/todo/new")}
      >
        <FontAwesome name="plus-circle" size={22} color="#007AFF" />
      </Pressable>
    );
  }

  return (
    <>
      <View style={styles.regularContainer}>
        <TextInput
          style={styles.input}
          placeholder="TODOをサクッと追加..."
          placeholderTextColor="#999"
          value={title}
          onChangeText={onChangeTitle}
          onSubmitEditing={onSubmit}
          returnKeyType="done"
          editable={!isPending}
          inputAccessoryViewID={INPUT_ACCESSORY_ID}
        />
        <Pressable
          style={[styles.addButton, !title.trim() && styles.addButtonDisabled]}
          onPress={title.trim() ? onSubmit : () => router.push("/todo/new")}
          disabled={isPending}
        >
          <FontAwesome
            name={title.trim() ? "plus" : "pencil-square-o"}
            size={16}
            color={title.trim() ? "#fff" : "#007AFF"}
          />
        </Pressable>
      </View>

      <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
        <View style={styles.keyboardAccessory}>
          <View style={styles.keyboardTextContainer}>
            <Text
              style={[
                styles.keyboardText,
                !title.trim() && styles.keyboardPlaceholder,
              ]}
              numberOfLines={1}
            >
              {title || "TODOをサクッと追加..."}
            </Text>
          </View>
          <Pressable
            style={[
              styles.addButton,
              !title.trim() && styles.addButtonDisabled,
            ]}
            onPress={onSubmit}
            disabled={!title.trim() || isPending}
          >
            <FontAwesome
              name="plus"
              size={16}
              color={title.trim() ? "#fff" : "#ccc"}
            />
          </Pressable>
        </View>
      </InputAccessoryView>
    </>
  );
}

const styles = StyleSheet.create({
  regularContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(120, 120, 128, 0.12)",
    paddingHorizontal: 16,
    fontSize: 15,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(120, 120, 128, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  inlineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAccessory: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: "rgba(245, 245, 245, 1)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  keyboardTextContainer: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 1)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  keyboardText: {
    fontSize: 15,
    color: "#000",
  },
  keyboardPlaceholder: {
    color: "#999",
  },
});
