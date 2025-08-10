import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export const updateEventCalculatedFields = async (eventId: string) => {
  try {
    // Count approved attendees
    const attendanceCount = await prisma.eventAttendance.count({
      where: {
        eventId,
        status: "APPROVED",
      },
    });

    // Count pending requests
    const pendingRequestsCount = await prisma.eventAttendance.count({
      where: {
        eventId,
        status: "PENDING",
      },
    });

    // Get event to check capacity
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { capacity: true },
    });

    if (!event) {
      throw new Error(`Event with id ${eventId} not found`);
    }

    // Calculate available spots and if full
    const availableSpots = event.capacity ? Math.max(0, event.capacity - attendanceCount) : null;
    const isFull = event.capacity ? attendanceCount >= event.capacity : false;

    // Update the event with calculated fields
    await prisma.event.update({
      where: { id: eventId },
      data: {
        attendanceCount,
        pendingRequestsCount,
        availableSpots,
        isFull,
      },
    });

    return {
      attendanceCount,
      pendingRequestsCount,
      availableSpots,
      isFull,
    };
  } catch (error) {
    console.error("Error updating event calculated fields:", error);
    throw error;
  }
};

export const updateMultipleEventsCalculatedFields = async (eventIds: string[]) => {
  try {
    const results = await Promise.all(
      eventIds.map(eventId => updateEventCalculatedFields(eventId))
    );
    return results;
  } catch (error) {
    console.error('Error updating multiple events calculated fields:', error);
    throw error;
  }
};

export const recalculateAllEventsFields = async () => {
  try {
    const events = await prisma.event.findMany({
      select: { id: true }
    });

    const eventIds = events.map(event => event.id);
    return await updateMultipleEventsCalculatedFields(eventIds);
  } catch (error) {
    console.error('Error recalculating all events fields:', error);
    throw error;
  }
};

export const onAttendanceChange = async (eventId: string) => {
  return await updateEventCalculatedFields(eventId);
};
