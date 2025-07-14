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
  attendeeCount: number; // şu anda katılan kişi sayısı (computed field)
  organizerId: string; // organizatör kullanıcı id
  organizerName: string; // (computed field - organizer.name'den gelir)
  imageUrl?: string; // opsiyonel kapak fotoğrafı
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response types
export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  location: Location;
  category: EventCategory;
  capacity: number;
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
  imageUrl?: string | null; // null'a da izin ver
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  isAttending?: boolean; // kullanıcının bu event'e katılıp katılmadığı
}
