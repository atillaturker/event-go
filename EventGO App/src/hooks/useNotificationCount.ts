import { useGetUserNotificationsQuery } from "../services/eventsApi";

export const useNotificationCount = () => {
  const { data, isLoading, isError } = useGetUserNotificationsQuery(undefined, {
    // Her 30 saniyede bir kontrol et
    pollingInterval: 30000,
    // Sadece sayı için lightweight query
    selectFromResult: ({ data, isLoading, isError }) => ({
      data: data ? { count: data.data?.length || 0 } : undefined,
      isLoading,
      isError,
    }),
  });

  return {
    notificationCount: data?.count || 0,
    isLoading,
    isError,
  };
};
