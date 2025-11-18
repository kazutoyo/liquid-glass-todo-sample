import { useEffect } from 'react';
import { registerForPushNotificationsAsync, scheduleTodoNotification, cancelTodoNotification } from '@/utils/notification-scheduler';

/**
 * 通知パーミッションを自動リクエストするフック
 */
export function useNotificationPermission() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);
}

/**
 * TODOの通知をスケジュールするフック
 */
export function useScheduleTodoNotification() {
  return async (todoId: number, title: string, reminderTime: Date | null) => {
    if (!reminderTime) {
      // リマインダーがない場合は既存の通知をキャンセル
      await cancelTodoNotification(todoId);
      return null;
    }

    // 通知をスケジュール
    const notificationId = await scheduleTodoNotification(todoId, title, reminderTime);
    return notificationId;
  };
}
