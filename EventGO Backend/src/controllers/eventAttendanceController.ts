import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import {
  notifyAttendanceApproved,
  notifyAttendanceRejected,
} from "./notificationController";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const prisma = new PrismaClient();

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
      include: {
        event: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
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

      // Notify user about approval
      try {
        await notifyAttendanceApproved(
          attendanceRequest.userId,
          attendanceRequest.eventId,
          attendanceRequest.event.title
        );
      } catch (notificationError) {
        console.error(
          "Failed to send approval notification:",
          notificationError
        );
      }
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

      // Notify user about rejection
      try {
        await notifyAttendanceRejected(
          attendanceRequest.userId,
          attendanceRequest.eventId,
          attendanceRequest.event.title
        );
      } catch (notificationError) {
        console.error(
          "Failed to send rejection notification:",
          notificationError
        );
      }
    }
  } catch (error) {
    console.error("Error managing attendance request:", error);
    res.status(500).json({
      error: "Failed to manage attendance request",
      details: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};
