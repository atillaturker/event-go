import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetUserNotificationsQuery } from "../services/eventsApi";
import { RootState } from "../store/reduxStore";

export const useNotificationCount = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const { data, isLoading, isError, refetch } = useGetUserNotificationsQuery(
    undefined,
    {
      // Her 30 saniyede bir kontrol et
      pollingInterval: 30000,
      refetchOnMountOrArgChange: true, // Kullanıcı değiştiğinde hemen yenile
      refetchOnFocus: true,
      skip: !isAuthenticated || !user?.id, // Kullanıcı yoksa sorguyu atla
      // Sadece sayı için lightweight query
      selectFromResult: ({ data, isLoading, isError }) => ({
        data: data ? { count: data.data?.length || 0 } : undefined,
        isLoading,
        isError,
      }),
    }
  );

  // Kullanıcı değiştiğinde bildirimleri hemen yeniden çek
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refetch();
    }
  }, [user?.id, isAuthenticated, refetch]);

  return {
    notificationCount: data?.count || 0,
    isLoading,
    isError,
  };
};
