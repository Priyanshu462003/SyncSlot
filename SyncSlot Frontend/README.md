# SyncSlot Frontend

React + Vite frontend for the existing SyncSlot Spring Boot API.

## Requirements

- Node.js 18+
- SyncSlot backend running on `http://localhost:8081`

## Run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Vite proxies `/api` requests to the Spring Boot backend, so local development does not require a separate frontend CORS configuration.

## Existing backend endpoints used

- `/api/auth/register`
- `/api/auth/login`
- `/api/doctors`
- `/api/doctors/{id}`
- `/api/doctors/{id}/availability`
- `/api/appointments`
- `/api/appointments/me`
- `/api/appointments/{id}`
- `/api/doctor/availability`
- `/api/doctor/appointments`
- `/api/doctor/appointments/{id}/complete`
- `/api/admin/doctors`
- `/api/admin/doctors/{id}/verify`
- `/api/admin/appointments`
- `/api/admin/specializations`

The UI does not invent payment, rescheduling, notification, or prescription endpoints that are not present in the supplied backend.
