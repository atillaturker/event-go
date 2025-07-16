import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetProfileQuery } from "../services/authApi";
import { setCredentials, setLoading } from "../store/authSlice";
import { RootState } from "../store/reduxStore";
import { getToken } from "../utils/secureStorage";

export const useAuthInitialize = () => {
  const [shouldFetchProfile, setShouldFetchProfile] = useState(false);
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);

  // Load the token from secure storage and dispatch it to the Redux store first.
  useEffect(() => {
    const loadTokenToRedux = async () => {
      try {
        const storedToken = await getToken();
        console.log("Loaded token:", storedToken);
        if (storedToken) {
          dispatch(setCredentials({ token: storedToken }));
          setShouldFetchProfile(true);
        } else {
          dispatch(setLoading(false));
        }
      } catch (error) {
        console.error("Error loading token:", error);
        dispatch(setLoading(false));
      }
    };
    loadTokenToRedux();
  }, [dispatch]);

  // Fetch the user profile if the token is available

  const {
    data: profileData,
    error,
    isLoading,
  } = useGetProfileQuery(undefined, {
    skip: !shouldFetchProfile,
  });

  useEffect(() => {
    if (profileData && token) {
      dispatch(setCredentials({ user: profileData, token }));
      setShouldFetchProfile(false);
    }
    if (error) {
      console.error("Error fetching profile:", error);
      dispatch(setLoading(false));
      setShouldFetchProfile(false);
    }
  }, [profileData, error, dispatch, token]);

  return { isLoading };
};
