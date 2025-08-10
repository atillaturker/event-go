import { Request, Response } from "express";
import { AttendanceStatus, PrismaClient } from "../generated/prisma";
import { EventCategory, EventResponse, EventStatus } from "../types/eventType";
import { updateEventCalculatedFields } from "../utils/eventCalculations";
import {
  notifyEventCancellation,
  notifyEventUpdate,
} from "./notificationController";

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
      const statusArray =
        typeof status === "string"
          ? status.split(",").map((s) => s.trim())
          : Array.isArray(status)
          ? status
          : [status];

      where.status = {
        in: statusArray as EventStatus[],
      };
    } else {
      where.status = EventStatus.ACTIVE;
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
          select: { id: true, name: true, email: true },
        },
        attendanceRequests: {
          where: {
            status: {
              in: ["APPROVED", "PENDING"],
            },
          },
        },
      },
      orderBy: { date: "asc" },
      take: Number(limit),
      skip: Number(offset),
    });

    const eventResponses: EventResponse[] = events.map((event) => {
      const approvedCount = event.attendanceRequests.filter(
        (request) => request.status === "APPROVED"
      ).length;
      const pendingCount = event.attendanceRequests.filter(
        (request) => request.status === "PENDING"
      ).length;
      const availableSpots = event.capacity - (approvedCount + pendingCount);
      const isFull = approvedCount >= event.capacity;

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        location: event.location,
        category: event.category as EventCategory,
        capacity: event.capacity,
        attendeeCount: approvedCount + pendingCount,
        organizerId: event.organizerId,
        organizerName: event.organizer.name,
        imageUrl: event.imageUrl,
        status: event.status as EventStatus,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        pendingRequestsCount: pendingCount,
        attendanceCount: approvedCount,
        availableSpots: availableSpots,
        isFull: isFull,
      };
    });

    res.json({
      success: true,
      data: {
        events: eventResponses,
      },
      pagination: {
        currentPage: Math.floor(Number(offset) / Number(limit)) + 1,
        totalPages: Math.ceil(events.length / Number(limit)),
        pageSize: Number(limit),
        totalItems: events.length,
      },
      message: "Events fetched successfully",
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
    const { eventId } = req.params;
    const userId = (req as any).user?.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
        attendanceRequests: {
          where: {
            status: {
              in: ["APPROVED", "PENDING"],
            },
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    const approvedCount = event.attendanceRequests.filter(
      (request) => request.status === "APPROVED"
    ).length;
    const pendingCount = event.attendanceRequests.filter(
      (request) => request.status === "PENDING"
    ).length;
    const availableSpots = event.capacity - (approvedCount + pendingCount);
    const isFull = approvedCount >= event.capacity;

    // Check if current user is attending (if authenticated)
    let isAttending = false;
    if (userId) {
      const userAttendance = event.attendanceRequests.find(
        (request) => request.userId === userId && request.status === "APPROVED"
      );
      isAttending = !!userAttendance;
    }

    const eventResponse: EventResponse = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      location: event.location,
      category: event.category as EventCategory,
      capacity: event.capacity,
      attendeeCount: approvedCount + pendingCount,
      organizerId: event.organizerId,
      organizerName: event.organizer.name,
      imageUrl: event.imageUrl,
      status: event.status as EventStatus,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      pendingRequestsCount: pendingCount,
      attendanceCount: approvedCount,
      availableSpots: availableSpots,
      isFull: isFull,
      isAttending: isAttending,
    };

    res.json({
      success: true,
      data: {
        event: eventResponse,
      },
      message: "Event fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

// Create a new event
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
      location: location, // Location type object (address, latitude, longitude)
      category: category as EventCategory,
      capacity: parseInt(capacity),
      organizerId: user.id, // Foreign key to User
      status: EventStatus.ACTIVE, // Default status from schema
      imageUrl: imageUrl || null, // Optional field
    };

    const newEvent = await prisma.event.create({
      data: eventData,
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
        attendanceRequests: {
          select: { id: true, userId: true, status: true },
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
      attendeeCount: newEvent.attendanceRequests?.length || 0,
      organizerId: newEvent.organizerId,
      organizerName: newEvent.organizer.name,
      imageUrl: newEvent.imageUrl,
      status: newEvent.status as EventStatus,
      createdAt: newEvent.createdAt.toISOString(),
      updatedAt: newEvent.updatedAt.toISOString(),
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

// Get events created by the ORGANIZER user
export const getOrganizerEvents = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    const { status, search, limit = 20, offset = 0 } = req.query;

    const where: any = {
      organizerId: user?.id,
    };

    if (status) {
      where.status = status as EventStatus;
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
        attendanceRequests: {
          select: { id: true, userId: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      skip: Number(offset),
    });

    const totalCount = await prisma.event.count({ where });

    const eventResponses: EventResponse[] = events.map((event) => {
      const approvedCount = event.attendanceRequests.filter(
        (request) => request.status === "APPROVED"
      ).length;
      const pendingCount = event.attendanceRequests.filter(
        (request) => request.status === "PENDING"
      ).length;
      const availableSpots = event.capacity - (approvedCount + pendingCount);
      const isFull = approvedCount >= event.capacity;

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        location: event.location,
        category: event.category as EventCategory,
        capacity: event.capacity,
        attendeeCount: approvedCount + pendingCount,
        organizerId: event.organizerId,
        organizerName: event.organizer.name,
        imageUrl: event.imageUrl,
        status: event.status as EventStatus,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        pendingRequestsCount: pendingCount,
        attendanceCount: approvedCount,
        availableSpots: availableSpots,
        isFull: isFull,
      };
    });

    res.json({
      success: true,
      data: {
        events: eventResponses,
      },
      pagination: {
        currentPage: Math.floor(Number(offset) / Number(limit)) + 1,
        totalPages: Math.ceil(totalCount / Number(limit)),
        pageSize: Number(limit),
        totalItems: totalCount,
      },
      message: "Organizer events fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching organizer events:", error);

    res.status(500).json({
      error: "Failed to fetch events",
      details: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

export const getUserEvents = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    const { status, search, limit = 20, offset = 0 } = req.query;

    // Build where clause for EventAttendance
    const attendanceWhere: any = {
      userId: user?.id,
    };

    // Add status filter if provided
    if (status) {
      attendanceWhere.status = status as AttendanceStatus;
    }

    const userEventAttendances = await prisma.eventAttendance.findMany({
      where: attendanceWhere,
      include: {
        event: {
          include: {
            organizer: { select: { id: true, name: true, email: true } },
            attendanceRequests: {
              where: {
                status: {
                  in: ["APPROVED", "PENDING", "REJECTED"],
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: Number(offset),
      take: Number(limit),
    });

    const totalCount = await prisma.eventAttendance.count({
      where: {
        ...attendanceWhere,
      },
    });

    const eventResponses = userEventAttendances.map((attendance) => ({
      event: {
        id: attendance.event.id,
        title: attendance.event.title,
        description: attendance.event.description,
        date: attendance.event.date.toISOString(),
        location: attendance.event.location,
        category: attendance.event.category as EventCategory,
        capacity: attendance.event.capacity,
        attendeeCount: totalCount,
        organizerId: attendance.event.organizerId,
        organizerName: attendance.event.organizer.name,
        imageUrl: attendance.event.imageUrl,
        status: attendance.event.status as EventStatus,
        createdAt: attendance.event.createdAt.toISOString(),
        updatedAt: attendance.event.updatedAt.toISOString(),
      },
      request: {
        id: attendance.id,
        userStatus: attendance.status,
        isAttending: attendance.status === "APPROVED",
        requestDate: attendance.createdAt.toISOString(),
        updatedAt: attendance.updatedAt.toISOString(),
        userId: attendance.userId,
      },
    }));

    res.json({
      success: true,
      message: "User events fetched successfully",
      data: {
        events: eventResponses,
      },
      pagination: {
        currentPage: Math.floor(Number(offset) / Number(limit)) + 1,
        totalPages: Math.ceil(totalCount / Number(limit)),
        pageSize: Number(limit),
        totalItems: totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).json({
      error: "Failed to fetch user events",
      details: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

// Update an existing event
export const updateEvent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { eventId } = req.params;

    // Check if event exists and belongs to the user
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    if (existingEvent.organizerId !== user?.id) {
      res.status(403).json({ error: "You can only update your own events" });
      return;
    }

    // Get update data from request body
    const updateData: any = {};
    const allowedFields = [
      "title",
      "description",
      "date",
      "location",
      "category",
      "capacity",
      "imageUrl",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "date") {
          updateData[field] = new Date(req.body[field]);
        } else if (field === "capacity") {
          updateData[field] = parseInt(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    const oldEventData = {
      title: existingEvent.title,
      description: existingEvent.description,
      date: existingEvent.date,
      location: existingEvent.location,
      capacity: existingEvent.capacity,
      status: existingEvent.status,
    };

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
        attendanceRequests: {
          select: { id: true, userId: true, status: true },
        },
      },
    });

    const newEventData = {
      title: updatedEvent.title,
      description: updatedEvent.description,
      date: updatedEvent.date,
      location: updatedEvent.location,
      capacity: updatedEvent.capacity,
      status: updatedEvent.status,
    };

    const eventResponse: EventResponse = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      date: updatedEvent.date.toISOString(),
      location: updatedEvent.location,
      category: updatedEvent.category as EventCategory,
      capacity: updatedEvent.capacity,
      attendeeCount: updatedEvent.attendanceRequests.length,
      organizerId: updatedEvent.organizerId,
      organizerName: updatedEvent.organizer.name,
      imageUrl: updatedEvent.imageUrl,
      status: updatedEvent.status as EventStatus,
      createdAt: updatedEvent.createdAt.toISOString(),
      updatedAt: updatedEvent.updatedAt.toISOString(),
    };

    res.json({
      success: true,
      message: "Event updated successfully",
      event: eventResponse,
    });

    try {
      const notificationResult = await notifyEventUpdate(
        updatedEvent.id,
        oldEventData,
        newEventData,
        `"${updatedEvent.title}" event has been updated.`
      );
      console.log("Notification result:", notificationResult);
    } catch (notificationError) {
      console.error(
        "Failed to send notification, but event was updated:",
        notificationError
      );
    }
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      error: "Failed to update event",
      details: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

export const joinEvent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    if (event.status !== "ACTIVE") {
      res.status(400).json({ error: "Event is not active" });
      return;
    }

    // Check if event is full (only for events with capacity limit)
    if (event.capacity && event.capacity > 0) {
      const currentAttendees = await prisma.eventAttendance.count({
        where: {
          eventId: eventId,
          status: "APPROVED",
        },
      });

      if (currentAttendees >= event.capacity) {
        res.status(400).json({
          error: "Event is full",
          currentAttendees,
          capacity: event.capacity,
        });
        return;
      }
    }

    // Check if user is already attending or has a pending request
    const existingAttendance = await prisma.eventAttendance.findFirst({
      where: {
        eventId: eventId,
        userId: user.id,
      },
    });

    if (existingAttendance) {
      if (existingAttendance.status === "APPROVED") {
        res.status(400).json({ error: "You are already attending this event" });
        return;
      } else if (existingAttendance.status === "PENDING") {
        res
          .status(400)
          .json({ error: "You already have a pending request for this event" });
        return;
      }
    }

    // Create attendance request
    const attendanceRequest = await prisma.eventAttendance.create({
      data: {
        eventId: eventId,
        userId: user.id,
        status: "PENDING",
      },
    });

    // Update calculated fields after creating attendance request
    await updateEventCalculatedFields(eventId);

    res.json({
      success: true,
      attendanceRequest,
      message: "Event join request sent successfully",
    });
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({
      error: "Failed to join event",
      details: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

export const leaveEvent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    // Find user's attendance record for this event
    const attendanceRecord = await prisma.eventAttendance.findFirst({
      where: {
        eventId: eventId,
        userId: user.id,
      },
    });

    if (!attendanceRecord) {
      res.status(404).json({ error: "You are not attending this event" });
      return;
    }

    // Remove attendance record
    await prisma.eventAttendance.delete({
      where: { id: attendanceRecord.id },
    });

    // Update calculated fields after leaving event
    await updateEventCalculatedFields(eventId);

    res.json({
      success: true,
      message: "Successfully left the event",
    });
  } catch (error) {
    console.error("Error leaving event:", error);
    res.status(500).json({
      error: "Failed to leave event",
      details: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

export const cancelEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      res.status(404).json({
        error: "Event not found",
      });
      return;
    }
    if (event?.status !== "ACTIVE") {
      res.status(404).json({
        error: "Only active events can be cancelled",
      });
      return;
    }

    await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        status: "CANCELLED",
      },
    });

    // Update calculated fields after canceling event (this will set isFull to false)
    await updateEventCalculatedFields(eventId);

    res.json({
      success: true,
      message: `${event.title} cancelled successfully`,
    });

    // Notify all attendees about event cancellation
    try {
      await notifyEventCancellation(eventId, event.title);
    } catch (notificationError) {
      console.error(
        "Failed to send cancellation notification:",
        notificationError
      );
    }
  } catch (error) {
    console.error("Error updating event status:", error);
    res.status(500).json({
      error: "Failed to update event status",
      details: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};
