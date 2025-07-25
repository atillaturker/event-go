import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store/reduxStore";
import {
  AuthResponse,
  LoginRequest,
  ProfileResponse,
  RegisterRequest,
} from "../types/auth";
import { getToken } from "../utils/secureStorage";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.EXPO_PUBLIC_API_URL}/api/auth/`,
    prepareHeaders: async (headers, { getState }) => {
      let token = (getState() as RootState).auth.token;

      if (!token) {
        token = await getToken();
        console.log(
          "🔑 Token from storage in API:",
          token ? "Found" : "Not found"
        );
      }

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("content-type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "register",
        method: "POST",
        body: userData,
      }),
    }),
    getProfile: builder.query<ProfileResponse, void>({
      query: () => "profile",
      providesTags: ["User"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } =
  authApi;
