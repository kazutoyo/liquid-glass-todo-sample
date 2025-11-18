import * as Notifications from 'expo-notifications';

/**
 * TODO通知をスケジュールする
 */
export async function scheduleTodoNotification(
  todoId: number,
  title: string,
  reminderTime: Date
): Promise<string> {
  // 既存の通知をキャンセル
  await cancelTodoNotification(todoId);

  // 新しい通知をスケジュール
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'TODOリマインダー',
      body: title,
      data: { todoId },
      sound: true,
    },
    trigger: {
      date: reminderTime,
    },
  });

  return identifier;
}

/**
 * TODO通知をキャンセルする
 */
export async function cancelTodoNotification(todoId: number): Promise<void> {
  // すべてのスケジュール済み通知を取得
  const allNotifications = await Notifications.getAllScheduledNotificationsAsync();

  // このTODOに関連する通知をフィルタリング
  const todoNotifications = allNotifications.filter(
    (n) => n.content.data?.todoId === todoId
  );

  // 通知をキャンセル
  for (const notification of todoNotifications) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
}

/**
 * 通知権限をリクエストする
 */
export async function registerForPushNotificationsAsync(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  return true;
}
