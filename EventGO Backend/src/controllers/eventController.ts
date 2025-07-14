import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import {
  CreateEventRequest,
  EventCategory,
  EventResponse,
  EventStatus,
  UpdateEventRequest,
} from "../types/eventType";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Tüm eventleri listele
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status, search, limit = 20, offset = 0 } = req.query;

    const where: any = {};

    if (category) {
      where.category = category as EventCategory;
    }

    if (status) {
      where.status = status as EventStatus;
    } else {
      where.status = EventStatus.ACTIVE; // Varsayılan olarak sadece aktif eventler
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: { id: true, name: true },
        },
        attendees: {
          select: { id: true },
        },
      },
      orderBy: { date: "asc" },
      take: Number(limit),
      skip: Number(offset),
    });

    const eventResponses: EventResponse[] = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      location: event.location,
      category: event.category as EventCategory,
      capacity: event.capacity,
      attendeeCount: event.attendees.length,
      organizerId: event.organizerId,
      organizerName: event.organizer.name,
      imageUrl: event.imageUrl,
      status: event.status as EventStatus,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      isAttending: false, // Bu bilgi auth middleware'den gelecek
    }));

    res.json({
      events: eventResponses,
      totalCount: events.length,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// Tek event detayı
export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
        attendees: {
          select: { id: true, name: true },
        },
      },
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    const eventResponse: EventResponse = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      location: event.location,
      category: event.category as EventCategory,
      capacity: event.capacity,
      attendeeCount: event.attendees.length,
      organizerId: event.organizerId,
      organizerName: event.organizer.name,
      imageUrl: event.imageUrl,
      status: event.status as EventStatus,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      isAttending: false, // Bu bilgi auth middleware'den gelecek
    };

    res.json(eventResponse);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

// Yeni event oluştur (sadece ORGANIZER)
export const createEvent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      date,
      location,
      category,
      capacity,
      imageUrl,
    }: CreateEventRequest = req.body;
    const organizerId = req.user?.id; // Auth middleware'den gelir

    if (!organizerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        category,
        capacity,
        imageUrl,
        organizerId,
        status: EventStatus.ACTIVE,
      },
      include: {
        organizer: {
          select: { id: true, name: true },
        },
      },
    });

    const eventResponse: EventResponse = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      location: event.location,
      category: event.category as EventCategory,
      capacity: event.capacity,
      attendeeCount: 0,
      organizerId: event.organizerId,
      organizerName: event.organizer.name,
      imageUrl: event.imageUrl,
      status: event.status as EventStatus,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    res.status(201).json(eventResponse);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
};

// Event güncelle (sadece organizer)
export const updateEvent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateEventRequest = req.body;
    const userId = (req as any).user.id;

    // Event'in sahibi olup olmadığını kontrol et
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      select: { organizerId: true },
    });

    if (!existingEvent) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    if (existingEvent.organizerId !== userId) {
      res.status(403).json({ error: "You can only update your own events" });
      return;
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...updateData,
        date: updateData.date ? new Date(updateData.date) : undefined,
      },
      include: {
        organizer: {
          select: { id: true, name: true },
        },
        attendees: {
          select: { id: true },
        },
      },
    });

    const eventResponse: EventResponse = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      location: event.location,
      category: event.category as EventCategory,
      capacity: event.capacity,
      attendeeCount: event.attendees.length,
      organizerId: event.organizerId,
      organizerName: event.organizer.name,
      imageUrl: event.imageUrl,
      status: event.status as EventStatus,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    res.json(eventResponse);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
};

// Event'e katıl
export const joinEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        attendees: {
          select: { id: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.status !== EventStatus.ACTIVE) {
      return res.status(400).json({ error: "Event is not active" });
    }

    // Zaten katılmış mı kontrol et
    const isAlreadyAttending = event.attendees.some(
      (attendee) => attendee.id === userId
    );
    if (isAlreadyAttending) {
      return res.status(400).json({ error: "Already attending this event" });
    }

    // Kapasite kontrolü
    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ error: "Event is full" });
    }

    await prisma.event.update({
      where: { id },
      data: {
        attendees: {
          connect: { id: userId },
        },
      },
    });

    res.json({ message: "Successfully joined the event" });
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({ error: "Failed to join event" });
  }
};

// Event'ten ayrıl
export const leaveEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        attendees: {
          select: { id: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Katılmış mı kontrol et
    const isAttending = event.attendees.some(
      (attendee) => attendee.id === userId
    );
    if (!isAttending) {
      return res.status(400).json({ error: "Not attending this event" });
    }

    await prisma.event.update({
      where: { id },
      data: {
        attendees: {
          disconnect: { id: userId },
        },
      },
    });

    res.json({ message: "Successfully left the event" });
  } catch (error) {
    console.error("Error leaving event:", error);
    res.status(500).json({ error: "Failed to leave event" });
  }
};

// Kullanıcının organizatörlük yaptığı eventler
export const getMyEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const events = await prisma.event.findMany({
      where: { organizerId: userId },
      include: {
        attendees: {
          select: { id: true },
        },
      },
      orderBy: { date: "asc" },
    });

    const eventResponses: EventResponse[] = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      location: event.location,
      category: event.category as EventCategory,
      capacity: event.capacity,
      attendeeCount: event.attendees.length,
      organizerId: event.organizerId,
      organizerName: "", // Kendi eventi olduğu için gerek yok
      imageUrl: event.imageUrl,
      status: event.status as EventStatus,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));

    res.json(eventResponses);
  } catch (error) {
    console.error("Error fetching my events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};
