import { Request, Response } from "express";
import { AttendanceStatus, PrismaClient } from "../generated/prisma";
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
          select: { id: true, name: true },
        },
        attendanceRequests: {
          where: { status: "APPROVED" },
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
      attendeeCount: event.attendanceRequests?.length || 0,
      organizerId: event.organizerId,
      organizerName: event.organizer.name,
      imageUrl: event.imageUrl,
      status: event.status as EventStatus,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      isAttending: false,
    }));

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

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
        attendanceRequests: {
          where: { status: "APPROVED" },
          select: { id: true, user: { select: { id: true, name: true } } },
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
      attendeeCount: event.attendanceRequests?.length || 0,
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

    const eventResponses: EventResponse[] = events.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      location: event.location,
      category: event.category as EventCategory,
      capacity: event.capacity,
      attendeeCount: event.attendanceRequests?.length || 0,
      organizerId: event.organizerId,
      organizerName: event.organizer.name,
      imageUrl: event.imageUrl,
      status: event.status as EventStatus,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      isAttending: false,
    }));

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
            organizer: { select: { id: true, name: true } },
            attendanceRequests: {
              where: { status: "APPROVED" },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: Number(offset),
      take: Number(limit),
    });

    const eventResponses = userEventAttendances.map((attendance) => ({
      id: attendance.event.id,
      title: attendance.event.title,
      description: attendance.event.description,
      date: attendance.event.date.toISOString(),
      location: attendance.event.location,
      category: attendance.event.category as EventCategory,
      capacity: attendance.event.capacity,
      attendeeCount: attendance.event.attendanceRequests?.length || 0,
      organizerId: attendance.event.organizerId,
      organizerName: attendance.event.organizer.name,
      imageUrl: attendance.event.imageUrl,
      status: attendance.event.status as EventStatus,
      createdAt: attendance.event.createdAt.toISOString(),
      updatedAt: attendance.event.updatedAt.toISOString(),
      isAttending: attendance.status === "APPROVED",
      userStatus: attendance.status,
      requestId: attendance.id,
      requestDate: attendance.createdAt.toISOString(),
    }));

    const totalRequestCount = await prisma.eventAttendance.count({
      where: {
        userId: user?.id,
        status: "PENDING",
      },
    });

    const totalJoinedCount = await prisma.eventAttendance.count({
      where: {
        userId: user?.id,
        status: "APPROVED",
      },
    });

    const totalRejectedCount = await prisma.eventAttendance.count({
      where: {
        userId: user?.id,
        status: "REJECTED",
      },
    });

    res.json({
      success: true,
      message: "User events fetched successfully",
      data: {
        events: eventResponses,
        counts: {
          total: userEventAttendances.length,
          joined: totalJoinedCount,
          pending: totalRequestCount,
          rejected: totalRejectedCount,
        },
      },
      pagination: {
        currentPage: Math.floor(Number(offset) / Number(limit)) + 1,
        totalPages: Math.ceil(userEventAttendances.length / Number(limit)),
        pageSize: Number(limit),
        totalItems: userEventAttendances.length,
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

    // Create response matching EventResponse interface
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
      isAttending: false,
    };

    res.json({
      success: true,
      message: "Event updated successfully",
      event: eventResponse,
    });
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

    // Validate eventId
    if (!eventId || eventId === "undefined" || eventId.length !== 24) {
      console.log("Invalid eventId:", eventId);
      res.status(400).json({ error: "Invalid event ID provided" });
      return;
    }

    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    // Check the user already has a pending request
    const existingRequest = await prisma.eventAttendance.findFirst({
      where: {
        eventId: eventId,
        userId: user.id,
        status: "PENDING",
      },
    });

    const approvedRequest = await prisma.eventAttendance.findFirst({
      where: {
        eventId: eventId,
        userId: user.id,
        status: "APPROVED",
      },
    });

    if (existingRequest) {
      res.status(400).json({
        error: "You already have a pending request to join this event",
      });
      return;
    }

    if (approvedRequest) {
      res.status(400).json({
        error: "You already have a joined this event",
      });
      return;
    }

    // Create a new attendance request
    const attendanceRequest = await prisma.eventAttendance.create({
      data: {
        eventId: eventId,
        userId: user.id,
        status: "PENDING",
      },
    });

    res.json({
      success: true,
      message: "Attendance request created successfully",
      request: attendanceRequest,
    });
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({
      error: "Failed to join event",
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

    res.json({
      success: true,
      message: `${event.title} cancelled successfully`,
    });
  } catch (error) {
    console.error("Error updating event status:", error);
    res.status(500).json({
      error: "Failed to update event status",
      details: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

// Get attendance requests for an event (for organizers)
export const getEventAttendanceRequests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const user = req.user;

    // Check if event exists and user is the organizer
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    if (event.organizerId !== user?.id) {
      res
        .status(403)
        .json({ error: "You can only view requests for your own events" });
      return;
    }

    // Get all attendance requests for this event
    const attendanceRequests = await prisma.eventAttendance.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      requests: attendanceRequests,
    });
  } catch (error) {
    console.error("Error fetching attendance requests:", error);
    res.status(500).json({
      error: "Failed to fetch attendance requests",
      details: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

export const getAllEventAttendanceRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;

  const allEventsAttendanceRequests = await prisma.eventAttendance.findMany({
    where: {
      status: "PENDING",
      event: {
        organizerId: user?.id,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(
    "All Events Attendance Requests:",
    JSON.stringify(allEventsAttendanceRequests, null, 2)
  );

  res.json({
    success: true,
    message: "All event attendance requests fetched successfully",
    data: allEventsAttendanceRequests,
  });
};

// Manage attendance request (approve/reject)
export const manageAttendanceRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'
    const user = req.user;

    // Validate status
    if (!["APPROVED", "REJECTED"].includes(status)) {
      res
        .status(400)
        .json({ error: "Status must be 'APPROVED' or 'REJECTED'" });
      return;
    }

    // Get attendance request with event info
    const attendanceRequest = await prisma.eventAttendance.findUnique({
      where: { id: attendanceId },
      include: { event: true },
    });

    if (!attendanceRequest) {
      res.status(404).json({ error: "Attendance request not found" });
      return;
    }

    // Check if user is the organizer of the event
    if (attendanceRequest.event.organizerId !== user?.id) {
      res
        .status(403)
        .json({ error: "You are not authorized to manage this request" });
      return;
    }

    if (status === "APPROVED") {
      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Update attendance request status - EventAttendance is our single source of truth
        const updatedRequest = await tx.eventAttendance.update({
          where: { id: attendanceId },
          data: { status: "APPROVED" },
        });

        return updatedRequest;
      });

      res.json({
        success: true,
        message: "Attendance request approved successfully",
        request: result,
      });
    } else {
      // Just update status for rejection
      const updatedRequest = await prisma.eventAttendance.update({
        where: { id: attendanceId },
        data: { status: "REJECTED" },
      });

      res.json({
        success: true,
        message: "Attendance request rejected",
        request: updatedRequest,
      });
    }
  } catch (error) {
    console.error("Error managing attendance request:", error);
    res.status(500).json({
      error: "Failed to manage attendance request",
      details: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};
