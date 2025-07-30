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
  date: string; // ISO tarih: ör: "2025-07-01T18:30:00Z"
  location: Location;
  category: EventCategory;
  capacity: number; // maksimum kişi sayısı
  status: EventStatus;
  imageUrl?: string; // opsiyonel kapak fotoğrafı
  createdAt: string;
  updatedAt: string;

  // Relations (Prisma'dan gelen)
  organizerId: string; // organizatör kullanıcı id
  organizer?: {
    // Prisma relation
    id: string;
    name: string;
    email?: string;
  };
  attendees?: {
    // Prisma relation
    id: string;
    name: string;
  }[];
  attendeeIds: string[]; // Prisma array field

  // Computed fields (API response'da hesaplanır)
  attendeeCount?: number; // attendees.length'den hesaplanır
  organizerName?: string; // organizer.name'den gelir
  isAttending?: boolean; // kullanıcının bu event'e katılıp katılmadığı
}

// API Request/Response types
export interface CreateEventRequest {
  title: string;
  description: string;
  date: string | Date;
  location: Location;
  category: EventCategory;
  capacity: number;
  imageUrl?: string | null;
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

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  location: Location;
  category: EventCategory;
  capacity: number;
  attendeeCount: number;
  organizerId: string;
  organizerName: string;
  imageUrl?: string | null;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  isAttending?: boolean;
}
