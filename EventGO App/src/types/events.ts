export enum EventCategory {
  CONCERT = "CONCERT",
  SPORTS = "SPORTS",
  PERFORMING_ARTS = "PERFORMING_ARTS",
  TECHNOLOGY = "TECHNOLOGY",
  EDUCATION = "EDUCATION",
  FOOD_DRINK = "FOOD_DRINK",
  ART = "ART",
  OTHER = "OTHER",
}

export enum EventStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date format: e.g. "2025-07-01T18:30:00Z"
  location: Location;
  category: EventCategory;
  capacity: number; // maximum number of attendees
  attendeeCount: number; // current number of attendees
  organizerId: string; // organizer user id
  organizerName: string; // organizer name
  imageUrl?: string | null; // optional cover image
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  isAttending?: boolean; // whether the user is attending this event
}

// API Request types
export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  location: Location;
  category: EventCategory | "";
  capacity: number | null;
  imageUrl?: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  date?: string;
  location?: Location;
  category?: EventCategory;
  capacity?: number;
  imageUrl?: string;
  status?: EventStatus;
}

// API Response types
export interface EventsResponse {
  events: Event[];
  totalCount: number;
}
