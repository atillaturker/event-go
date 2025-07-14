import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CreateEventRequest,
  Event,
  EventsResponse,
  UpdateEventRequest,
} from "../types/events";

export const eventsApi = createApi({
  reducerPath: "eventsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.EXPO_PUBLIC_API_URL}/api/events/`,
    prepareHeaders: (headers, { getState }) => {
      // Token'ı auth slice'dan al
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("content-type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Event"],
  endpoints: (builder) => ({
    // Tüm eventleri getir
    getEvents: builder.query<
      EventsResponse,
      {
        category?: string;
        status?: string;
        search?: string;
        limit?: number;
        offset?: number;
      }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.category) searchParams.append("category", params.category);
        if (params.status) searchParams.append("status", params.status);
        if (params.search) searchParams.append("search", params.search);
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.offset)
          searchParams.append("offset", params.offset.toString());

        return `?${searchParams.toString()}`;
      },
      providesTags: ["Event"],
    }),

    // Tek event detayı
    getEventById: builder.query<Event, string>({
      query: (id) => id,
      providesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    // Yeni event oluştur (sadece organizer)
    createEvent: builder.mutation<Event, CreateEventRequest>({
      query: (eventData) => ({
        url: "",
        method: "POST",
        body: eventData,
      }),
      invalidatesTags: ["Event"],
    }),

    // Event güncelle (sadece kendi eventi)
    updateEvent: builder.mutation<
      Event,
      { id: string; data: UpdateEventRequest }
    >({
      query: ({ id, data }) => ({
        url: id,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Event", id }],
    }),

    // Event'e katıl
    joinEvent: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `${id}/join`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    // Event'ten ayrıl
    leaveEvent: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `${id}/leave`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    // Kendi organize ettiğim eventler
    getMyEvents: builder.query<Event[], void>({
      query: () => "my/organized",
      providesTags: ["Event"],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useJoinEventMutation,
  useLeaveEventMutation,
  useGetMyEventsQuery,
} = eventsApi;
