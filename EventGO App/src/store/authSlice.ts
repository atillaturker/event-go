import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi";
import { User } from "../types/auth";
import { deleteToken, getToken } from "../utils/secureStorage";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

const authInitialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  isInitialized: false,
};

export const logoutAsync = createAsyncThunk("auth/logoutAsync", async () => {
  await deleteToken();
  return true;
});

// authSlice.ts
export const checkAuthToken = createAsyncThunk(
  "auth/checkAuthToken",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log("🔍 Starting token check...");
      const token = await getToken();
      console.log("📱 Token from storage:", token ? "Found" : "Not found");

      if (!token) {
        console.log("❌ No token found in storage");
        return rejectWithValue("No token found");
      }

      console.log("🌐 Making profile API call...");
      const result = await dispatch(
        authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true })
      ).unwrap();

      console.log("✅ Profile API success:", result);
      console.log("✅ User data:", result.data);

      return {
        user: result.data,
        token: token,
      };
    } catch (error: any) {
      console.log("💥 Profile API error:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));

      await deleteToken();

      if (error.status === 401) {
        return rejectWithValue("Token expired or invalid");
      }

      return rejectWithValue("Token verification failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user?: User; token: string }>
    ) => {
      state.isAuthenticated = true;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.token = action.payload.token;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthToken.pending, (state) => {
        state.isLoading = true;
        state.isInitialized = false;
      })
      .addCase(checkAuthToken.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(checkAuthToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isLoading = false;
      })
      .addCase(logoutAsync.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { setCredentials, setLoading, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
