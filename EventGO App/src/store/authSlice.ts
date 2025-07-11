import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../types/auth";
import { deleteToken } from "../utils/secureStorage";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const authInitialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
};

export const logoutAsync = createAsyncThunk("auth/logoutAsync", async () => {
  await deleteToken();
  return true;
});

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
