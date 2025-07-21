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
      // Get token from auth slice
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

    // Single event details
    getEventById: builder.query<Event, string>({
      query: (id) => id,
      providesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    // Create new event (organizer only)
    createEvent: builder.mutation<Event, CreateEventRequest>({
      query: (eventData) => ({
        url: "",
        method: "POST",
        body: eventData,
      }),
      invalidatesTags: ["Event"],
    }),

    // Update event (own events only)
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

    // Join event
    joinEvent: builder.mutation<
      { message: string },
      { id: string; eventId: string }
    >({
      query: ({ id, eventId }) => ({
        url: `${id}/join`,
        method: "POST",
        body: { eve: eventId },
      }),
      invalidatesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    // Leave event
    leaveEvent: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `${id}/leave`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    // Get my organized events
    getMyEvents: builder.query<
      EventsResponse,
      {
        status?: string;
        search?: string;
        limit?: number;
        offset?: number;
      }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append("status", params.status);
        if (params.search) searchParams.append("search", params.search);
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.offset)
          searchParams.append("offset", params.offset.toString());

        return `my-events?${searchParams.toString()}`;
      },
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
