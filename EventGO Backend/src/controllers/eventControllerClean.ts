import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { EventCategory, EventResponse, EventStatus } from "../types/eventType";

const prisma = new PrismaClient();

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

    const eventResponses: EventResponse[] = events.map((event: any) => ({
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
