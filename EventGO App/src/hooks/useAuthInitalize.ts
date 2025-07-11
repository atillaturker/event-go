import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, setLoading } from "../store/authSlice";
import { getToken } from "../utils/secureStorage";

export const useAuthInitialize = () => {
  const dispatch = useDispatch();

  const initializeAuth = useCallback(async () => {
    try {
      const token = await getToken();
      if (token) {
        dispatch(
          setCredentials({
            token,
            // Token varsa user bilgisini API'den çekebiliriz
          })
        );
      } else {
        // Token yoksa authenticated false olarak kalsın
        dispatch(setLoading(false));
      }
    } catch (error) {
      console.error("Error initializing authentication:", error);
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
};
