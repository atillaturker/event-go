# EventGO Backend - Rol Tabanlı Authentication Sistemi

Bu backend uygulaması, 2 farklı kullanıcı rolü (USER ve ORGANIZER) ile authentication ve authorization sistemi içerir.

## Roller

### USER (Kullanıcı)

- Event'leri görüntüleyebilir
- Event'lere katılabilir
- Profil bilgilerini görebilir

### ORGANIZER (Organizatör)

- Event oluşturabilir
- Event'leri yönetebilir
- Profil bilgilerini görebilir

## Kurulum

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. `.env` dosyası oluşturun:

```bash
cp .env.example .env
```

3. `.env` dosyasındaki değerleri güncelleyin:

- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: JWT token için güvenli bir anahtar

4. Prisma client'ı generate edin:

```bash
npx prisma generate
```

5. Database'i senkronize edin:

```bash
npx prisma db push
```

6. Sunucuyu başlatın:

```bash
npm run dev
```

## API Endpoints

### Authentication Endpoints

#### Kullanıcı Kayıt

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER" // veya "ORGANIZER"
}
```

#### Kullanıcı Giriş

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Profil Bilgisi

```
GET /api/auth/profile
Authorization: Bearer <JWT_TOKEN>
```

### Demo Endpoints (Rol Tabanlı Erişim)

#### Sadece Organizatörler

```
GET /api/demo/organizer-only
Authorization: Bearer <ORGANIZER_JWT_TOKEN>
```

#### Sadece Kullanıcılar

```
GET /api/demo/user-only
Authorization: Bearer <USER_JWT_TOKEN>
```

#### Her İki Rol

```
GET /api/demo/both-roles
Authorization: Bearer <JWT_TOKEN>
```

#### Event Oluşturma (Sadece Organizatörler)

```
POST /api/demo/events
Authorization: Bearer <ORGANIZER_JWT_TOKEN>
Content-Type: application/json

{
  "title": "Konser",
  "description": "Muhteşem bir konser",
  "date": "2024-12-31"
}
```

#### Event'e Katılma (Sadece Kullanıcılar)

```
POST /api/demo/events/:id/join
Authorization: Bearer <USER_JWT_TOKEN>
```

## Middleware'ler

### authenticateToken

JWT token'ı doğrular ve kullanıcı bilgilerini request'e ekler.

### requireOrganizer

Sadece ORGANIZER rolündeki kullanıcıların erişmesine izin verir.

### requireUser

Sadece USER rolündeki kullanıcıların erişmesine izin verir.

### requireRole(allowedRoles)

Belirtilen rollerdeki kullanıcıların erişmesine izin verir.

## Kullanım Örnekleri

### 1. Yeni bir protected route oluşturmak:

```typescript
import { authenticateToken } from "../middlewares/authMiddleware";
import { requireOrganizer } from "../middlewares/roleMiddleware";

// Sadece organizatörler erişebilir
router.post("/events", authenticateToken, requireOrganizer, (req, res) => {
  // Event oluşturma logic'i
});
```

### 2. Çoklu rol kontrolü:

```typescript
import { requireRole } from "../middlewares/roleMiddleware";

// Hem USER hem ORGANIZER erişebilir
router.get(
  "/dashboard",
  authenticateToken,
  requireRole(["USER", "ORGANIZER"]),
  (req, res) => {
    // Dashboard logic'i
  }
);
```

### 3. Kullanıcı rolüne göre farklı işlemler:

```typescript
router.get("/profile", authenticateToken, (req, res) => {
  const user = (req as any).user;

  if (user.role === "ORGANIZER") {
    // Organizatör için özel bilgiler
    return res.json({ ...user, canCreateEvents: true });
  } else {
    // Normal kullanıcı için bilgiler
    return res.json({ ...user, canJoinEvents: true });
  }
});
```

## Güvenlik Notları

1. JWT_SECRET'ı güvenli ve uzun bir string olarak ayarlayın
2. HTTPS kullanın (production'da)
3. Şifreleri plain text olarak loglamayın
4. Rate limiting ekleyin
5. Input validation'ları güçlendirin

## Teknolojiler

- **Express.js**: Web framework
- **Prisma**: ORM
- **MongoDB**: Database
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **TypeScript**: Type safety
