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
      providesTags: (_result, _error, id) => [{ type: "Event", id }],
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
      invalidatesTags: (_result, _error, { id }) => [{ type: "Event", id }],
    }),

    // Join event
    joinEvent: builder.mutation<{ message: string }, string>({
      query: (eventId) => ({
        url: `${eventId}/join`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, eventId) => [
        { type: "Event", id: eventId },
      ],
    }),

    // Leave event
    leaveEvent: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `${id}/leave`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Event", id }],
    }),

    // Get my organized events
    getOrganizerEvents: builder.query<
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

    // Get user's attended/requested events
    getUserEvents: builder.query<
      EventsResponse,
      {
        status?: "PENDING" | "APPROVED" | "REJECTED";
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

        return `user-events?${searchParams.toString()}`;
      },
      providesTags: ["Event"],
    }),

    // Get event attendance requests (for organizers)
    getEventAttendanceRequests: builder.query<
      {
        success: boolean;
        requests: Array<{
          id: string;
          status: "PENDING" | "APPROVED" | "REJECTED";
          createdAt: string;
          updatedAt: string;
          user: {
            id: string;
            name: string;
            email: string;
          };
        }>;
      },
      string
    >({
      query: (eventId) => `${eventId}/requests`,
      providesTags: (_result, _error, eventId) => [
        { type: "Event", id: eventId },
        { type: "Event", id: "ATTENDANCE_REQUESTS" },
      ],
    }),

    // Manage attendance request (approve/reject)
    manageAttendanceRequest: builder.mutation<
      {
        success: boolean;
        message: string;
        request: {
          id: string;
          status: "APPROVED" | "REJECTED";
          createdAt: string;
          updatedAt: string;
        };
      },
      {
        attendanceId: string;
        status: "APPROVED" | "REJECTED";
      }
    >({
      query: ({ attendanceId, status }) => ({
        url: `attendance/${attendanceId}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: [{ type: "Event", id: "ATTENDANCE_REQUESTS" }, "Event"],
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
  useGetOrganizerEventsQuery,
  useGetUserEventsQuery,
  useGetEventAttendanceRequestsQuery,
  useManageAttendanceRequestMutation,
} = eventsApi;
