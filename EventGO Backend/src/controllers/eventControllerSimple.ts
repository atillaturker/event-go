import { Request, Response } from "express";

// Basit test endpoint'i
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    // Şimdilik mock veri döndürelim
    const mockEvents = [
      {
        id: "1",
        title: "React Native Workshop",
        description: "React Native ile mobil uygulama geliştirme workshop'u",
        date: "2025-07-20T14:00:00Z",
        location: {
          latitude: 41.0082,
          longitude: 28.9784,
          address: "İstanbul, Türkiye",
        },
        category: "TEKNOLOJI",
        capacity: 50,
        attendeeCount: 23,
        organizerId: "organizer1",
        organizerName: "Tech Academy",
        imageUrl: null,
        status: "ACTIVE",
        createdAt: "2025-07-14T10:00:00Z",
        updatedAt: "2025-07-14T10:00:00Z",
      },
      {
        id: "2",
        title: "UI/UX Design Masterclass",
        description: "Modern web ve mobil arayüz tasarımı eğitimi",
        date: "2025-07-25T16:30:00Z",
        location: {
          latitude: 41.0138,
          longitude: 28.9497,
          address: "Beşiktaş, İstanbul",
        },
        category: "TASARIM",
        capacity: 30,
        attendeeCount: 18,
        organizerId: "organizer2",
        organizerName: "Design Studio",
        imageUrl: null,
        status: "ACTIVE",
        createdAt: "2025-07-15T09:30:00Z",
        updatedAt: "2025-07-15T09:30:00Z",
      },
      {
        id: "3",
        title: "Startup Pitch Event",
        description: "Girişimciler için networking ve pitch etkinliği",
        date: "2025-08-02T19:00:00Z",
        location: {
          latitude: 41.0255,
          longitude: 28.9744,
          address: "Şişli, İstanbul",
        },
        category: "BUSINESS",
        capacity: 100,
        attendeeCount: 67,
        organizerId: "organizer3",
        organizerName: "Startup Hub",
        imageUrl: null,
        status: "ACTIVE",
        createdAt: "2025-07-16T11:15:00Z",
        updatedAt: "2025-07-16T11:15:00Z",
      },
    ];

    res.json({
      events: mockEvents,
      totalCount: mockEvents.length,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const mockEvent = {
      id: id,
      title: "React Native Workshop",
      description: "React Native ile mobil uygulama geliştirme workshop'u",
      date: "2025-07-20T14:00:00Z",
      location: {
        latitude: 41.0082,
        longitude: 28.9784,
        address: "İstanbul, Türkiye",
      },
      category: "TEKNOLOJI",
      capacity: 50,
      attendeeCount: 23,
      organizerId: "organizer1",
      organizerName: "Tech Academy",
      imageUrl: null,
      status: "ACTIVE",
      createdAt: "2025-07-14T10:00:00Z",
      updatedAt: "2025-07-14T10:00:00Z",
    };

    res.json(mockEvent);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};
