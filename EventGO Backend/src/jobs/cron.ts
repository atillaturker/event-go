import { CronJob } from "cron";
import { createEventsCompletedNotification } from "../controllers/notificationController";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const updateEventStatusJob = new CronJob(
  "0 * * * *",
  async () => {
    console.log("Running cron job to update event statuses...");
    try {
      const now = new Date();

      const expiredEvents = await prisma.event.findMany({
        where: {
          date: {
            lt: now,
          },
          status: {
            not: "COMPLETED",
          },
        },
      });
      if (expiredEvents.length === 0) {
        console.log("No expired events found.");
        return;
      }
      const expiredEventsIds = expiredEvents.map((event) => event.id);

      const updatedEvents = await prisma.event.updateMany({
        where: {
          id: {
            in: expiredEventsIds,
          },
        },
        data: {
          status: "COMPLETED",
        },
      });

      if (updatedEvents && updatedEvents.count > 0) {
        await createEventsCompletedNotification(expiredEvents);
        console.log(`Created notifications for completed events.`);
      }

      console.log(`Updated ${updatedEvents.count} events to COMPLETED.`);
      // Optionally, you can add logic to notify users about the completed events
    } catch (error) {
      console.error("Error updating event statuses:", error);
    }
  },
  null,
  true,
  "UTC"
);

export const startCronJobs = () => {
  updateEventStatusJob.start();
  console.log("Cron jobs started.");
};
