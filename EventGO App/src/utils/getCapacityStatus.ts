import { Event } from "../types/events";

export const getCapacityStatus = (event: Event) => {
  const approvedCount = event.approvals?.length || 0;
  const pendingCount = event.pendingRequestsCount || 0;
  const totalRequests = pendingCount + approvedCount;

  if (approvedCount >= event.capacity) {
    return { status: "FULL", message: "Event capacity is full" };
  } else if (totalRequests >= event.capacity) {
    return { status: "ALMOST_FULL", message: "Join waitlist" };
  } else {
    return { status: "AVAILABLE", message: "Join event" };
  }
};
