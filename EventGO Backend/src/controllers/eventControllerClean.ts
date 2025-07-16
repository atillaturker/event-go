import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { EventCategory, EventResponse, EventStatus } from "../types/eventType";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// List all events
export const getEvents = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
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

// Detail of a single event
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

export const createEvent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user || user.role !== "ORGANIZER") {
      res.status(403).json({
        error: "Only organizers can create events",
      });
      return;
    }

    // Validate required fields
    const { title, description, date, location, category, capacity, imageUrl } =
      req.body;

    if (
      !title ||
      !description ||
      !date ||
      !location ||
      !category ||
      !capacity
    ) {
      res.status(400).json({
        error:
          "Missing required fields: title, description, date, location, category, capacity",
      });
      return;
    }

    // Create event data matching Prisma Event model
    const eventData = {
      title: title,
      description: description,
      date: new Date(date), // Convert string to DateTime
      location: location, // Location type object
      category: category as EventCategory,
      capacity: parseInt(capacity),
      organizerId: user.id, // Foreign key to User
      status: EventStatus.ACTIVE, // Default status from schema
      imageUrl: imageUrl || null, // Optional field
      attendeeIds: [], // Empty array initially
    };

    const newEvent = await prisma.event.create({
      data: eventData,
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
        attendees: {
          select: { id: true, name: true },
        },
      },
    });

    // Create response matching EventResponse interface
    const eventResponse: EventResponse = {
      id: newEvent.id,
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date.toISOString(),
      location: newEvent.location,
      category: newEvent.category as EventCategory,
      capacity: newEvent.capacity,
      attendeeCount: newEvent.attendees.length,
      organizerId: newEvent.organizerId,
      organizerName: newEvent.organizer.name,
      imageUrl: newEvent.imageUrl,
      status: newEvent.status as EventStatus,
      createdAt: newEvent.createdAt.toISOString(),
      updatedAt: newEvent.updatedAt.toISOString(),
      isAttending: false,
    };

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: eventResponse,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      error: "Failed to create event",
      details: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};
