import bcrypt from "bcryptjs";
import { EventCategory, PrismaClient, Role } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Create Organizer Users
  const password = await bcrypt.hash("password123", 10);

  const organizer1 = await prisma.user.upsert({
    where: { email: "organizer1@eventgo.com" },
    update: {},
    create: {
      email: "organizer1@eventgo.com",
      name: "Music Masters Inc.",
      password: password,
      role: Role.ORGANIZER,
    },
  });

  const organizer2 = await prisma.user.upsert({
    where: { email: "organizer2@eventgo.com" },
    update: {},
    create: {
      email: "organizer2@eventgo.com",
      name: "Tech Conferences LLC",
      password: password,
      role: Role.ORGANIZER,
    },
  });

  console.log(`Created organizers: ${organizer1.name}, ${organizer2.name}`);

  // 2. Create Events
  const events = [
    {
      title: "Indie Rock Fest 2025",
      description:
        "Yerli sahnenin en iyi indie rock gruplarıyla patlamaya hazır bir gece. Rock yapmaya hazır olun!",
      date: new Date("2025-11-15T19:00:00Z"),
      location: {
        latitude: 41.0422,
        longitude: 28.979,
        address: "KüçükÇiftlik Park, Harbiye, İstanbul",
      },
      category: EventCategory.CONCERT,
      capacity: 300,
      imageUrl:
        "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      organizerId: organizer1.id,
    },
    {
      title: "React Native İstanbul Buluşması",
      description:
        "React Native geleceğini tartışmak için geliştiricilere katılın. Atölyeler, konuşmalar ve networking.",
      date: new Date("2025-12-05T09:00:00Z"),
      location: {
        latitude: 41.085,
        longitude: 29.047,
        address: "Kolektif House Levent, Levent, İstanbul",
      },
      category: EventCategory.TECHNOLOGY,
      capacity: 250,
      imageUrl:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80",
      organizerId: organizer2.id,
    },
    {
      title: "Bursa Gastronomi Festivali",
      description:
        "Şef Ali ile bir mutfak yolculuğu. Enfes modern yemekleri hazırlamayı ve tatmayı öğrenin.",
      date: new Date("2025-11-22T18:30:00Z"),
      location: {
        latitude: 40.1932,
        longitude: 29.0742,
        address: "Merinos AKKM, Osmangazi, Bursa",
      },
      category: EventCategory.FOOD_DRINK,
      capacity: 150,
      imageUrl:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
      organizerId: organizer1.id,
    },
    {
      title: "Yapay Zeka ve Makine Öğrenmesine Giriş",
      description:
        "Yapay Zeka ve Makine Öğrenmesinin temelleri üzerine başlangıç seviyesinde bir atölye.",
      date: new Date("2026-01-10T10:00:00Z"),
      location: {
        latitude: 40.7656,
        longitude: 29.9406,
        address: "Kocaeli Kongre Merkezi, İzmit, Kocaeli",
      },
      category: EventCategory.EDUCATION,
      capacity: 100,
      imageUrl:
        "https://images.unsplash.com/photo-1593349480503-685d394a2f17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      organizerId: organizer2.id,
    },
    {
      title: "Tekirdağ Bağ Bozumu Maratonu",
      description:
        "Yıllık bağ bozumu maratonu. Bir amaç için koşun ve sınırlarınızı zorlayın!",
      date: new Date("2025-11-30T07:00:00Z"),
      location: {
        latitude: 40.9781,
        longitude: 27.5117,
        address: "Tekirdağ Sahili, Süleymanpaşa, Tekirdağ",
      },
      category: EventCategory.SPORTS,
      capacity: 500,
      imageUrl:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      organizerId: organizer1.id,
    },
    {
      title: "Yıldızların Altında Caz Gecesi",
      description:
        "Güzel bir açık hava mekanında canlı caz müziği eşliğinde şık bir akşam. Şehrin en iyi müzisyenleri sahnede.",
      date: new Date("2025-12-12T20:00:00Z"),
      location: {
        latitude: 41.0333,
        longitude: 28.9833,
        address: "Sultanahmet Parkı, Fatih, İstanbul",
      },
      category: EventCategory.PERFORMING_ARTS,
      capacity: 150,
      imageUrl:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      organizerId: organizer1.id,
    },
    {
      title: "İleri Seviye TypeScript Atölyesi",
      description:
        "Decoratorlar, genericler ve conditional types gibi gelişmiş TypeScript özelliklerine derinlemesine bir bakış.",
      date: new Date("2026-02-20T09:30:00Z"),
      location: {
        latitude: 41.0255,
        longitude: 28.9744,
        address: "Bahçeşehir Üniversitesi, Beşiktaş, İstanbul",
      },
      category: EventCategory.TECHNOLOGY,
      capacity: 75,
      imageUrl:
        "https://images.unsplash.com/photo-1526666923127-b2970f64b422?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
      organizerId: organizer2.id,
    },
  ];

  for (const eventData of events) {
    const event = await prisma.event.create({
      data: eventData,
    });
    console.log(`Created event with id: ${event.id}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
