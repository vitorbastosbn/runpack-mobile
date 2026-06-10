import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import type { NotificationPreferences } from '../types';

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: notificationsService.getNotificationPreferences,
  });

  const update = useMutation({
    mutationFn: ({ key, value }: { key: keyof NotificationPreferences; value: boolean }) =>
      notificationsService.updateNotificationPreference(key, value),
    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: ['notification-preferences'] });
      const prev = queryClient.getQueryData<NotificationPreferences>(['notification-preferences']);
      if (prev) {
        queryClient.setQueryData<NotificationPreferences>(['notification-preferences'], {
          ...prev,
          [key]: value,
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(['notification-preferences'], ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  return { ...query, update };
}
