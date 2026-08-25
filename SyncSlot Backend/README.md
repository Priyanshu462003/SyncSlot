# 🩺 SyncSlot API — Doctor Appointment Booking & Scheduling Platform

🚀 A secure Spring Boot REST API for doctor discovery, availability management, and appointment booking — designed specifically to prevent **double-booking under concurrent requests**.

---

## 🏗️ Project Overview

SyncSlot is a backend appointment scheduling system with **JWT authentication, role-based access control, doctor verification, availability management, and concurrency-safe booking**.

The core problem is a race condition:

> Two patients may try to book overlapping appointments with the same doctor at almost the same time.

A simple `check → insert` approach can allow both requests to succeed.

SyncSlot prevents this using:

* JPQL time-range overlap detection
* `PESSIMISTIC_WRITE` database locking
* `@Transactional` booking flow
* JWT-based authentication
* Role-based authorization

### Overlap Logic

```text
existing.start < requested.end
AND
existing.end > requested.start
```

This correctly detects all overlapping time ranges.

---

## 🌟 Features

### 👤 Authentication & Security

* JWT authentication
* Patient, Doctor, and Admin roles
* Spring Security
* Role-based endpoint authorization
* Ownership-based access control

### 👨‍⚕️ Doctor Management

* Doctor profiles
* Doctor verification by Admin
* Doctor specialization management
* Weekly availability management
* View doctor-specific availability

### 📅 Appointment Management

* Book appointments
* Detect overlapping appointments
* Cancel appointments
* Doctor appointment calendar
* Mark appointments as completed

### ⚡ Concurrency Protection

* JPQL overlap detection
* `PESSIMISTIC_WRITE` locking
* Transactional booking
* Returns `409 Conflict` for competing bookings

---

## 🧰 Tech Stack

| Category    | Technologies                           |
| ----------- | -------------------------------------- |
| Backend     | Java 17, Spring Boot 3.2.5             |
| API         | Spring Web / REST                      |
| Security    | Spring Security, JWT                   |
| Database    | MySQL / H2                             |
| ORM         | Spring Data JPA, Hibernate             |
| Validation  | Spring Boot Validation                 |
| Testing     | Spring Boot Test, Spring Security Test |
| Build       | Maven                                  |
| Development | IntelliJ IDEA, Postman                 |

---

# 📁 SyncSlot API Structure

```text
SyncSlot/
│
├── src/
│   ├── main/
│   │   │
│   │   ├── java/com/syncslot/
│   │   │   │
│   │   │   ├── controller/
│   │   │   │   ├── AdminController.java
│   │   │   │   ├── AppointmentController.java
│   │   │   │   ├── AuthController.java
│   │   │   │   └── DoctorController.java
│   │   │   │
│   │   │   ├── dto/
│   │   │   │   ├── AppointmentRequest.java
│   │   │   │   ├── DoctorResponse.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   └── RegisterRequest.java
│   │   │   │
│   │   │   ├── entity/
│   │   │   │   ├── Appointment.java
│   │   │   │   ├── Doctor.java
│   │   │   │   ├── Specialization.java
│   │   │   │   ├── User.java
│   │   │   │   └── Availability.java
│   │   │   │
│   │   │   ├── enums/
│   │   │   │   ├── Role.java
│   │   │   │   └── AppointmentStatus.java
│   │   │   │
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   │
│   │   │   ├── repository/
│   │   │   │   ├── AppointmentRepository.java
│   │   │   │   ├── DoctorRepository.java
│   │   │   │   ├── UserRepository.java
│   │   │   │   └── SpecializationRepository.java
│   │   │   │
│   │   │   ├── security/
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── JwtService.java
│   │   │   │   └── SecurityConfig.java
│   │   │   │
│   │   │   ├── service/
│   │   │   │   ├── AppointmentService.java
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── DoctorService.java
│   │   │   │   └── AdminService.java
│   │   │   │
│   │   │   └── SyncSlotApplication.java
│   │   │
│   │   └── resources/
│   │       └── application.yml
│   │
│   └── test/
│       └── java/com/syncslot/
│
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

---

## 🏛️ Architecture

<div align="center">
  <img src="docs/syncslot architecture.png"
       alt="SyncSlot API Architecture"
       width="100%" />
</div>

### Request Flow

```text
Client
   │
   ▼
JWT Authentication
   │
   ▼
Controller
   │
   ▼
Service Layer
   │
   ├── Availability Check
   │
   ├── Overlap Detection
   │
   └── PESSIMISTIC_WRITE Lock
   │
   ▼
Repository Layer
   │
   ▼
MySQL Database
```

### Concurrency-Safe Booking

```text
Booking Request
      │
      ▼
Check Overlapping Appointments
      │
      ▼
PESSIMISTIC_WRITE Lock
      │
      ▼
@Transactional
      │
 ┌────┴─────┐
 │          │
Available  Overlap
 │          │
 ▼          ▼
201       409 Conflict
Created
```


## 🔌 API Reference

| Method   | Endpoint                                 | Access  | Description                   |
| -------- | ---------------------------------------- | ------- | ----------------------------- |
| `POST`   | `/api/auth/register`                     | Public  | Register patient/doctor/admin |
| `POST`   | `/api/auth/login`                        | Public  | Login and receive JWT         |
| `GET`    | `/api/doctors`                           | Public  | List verified doctors         |
| `GET`    | `/api/doctors/{id}`                      | Public  | View doctor profile           |
| `GET`    | `/api/doctors/{id}/availability?date=`   | Public  | View available slots          |
| `POST`   | `/api/appointments`                      | PATIENT | Book appointment              |
| `GET`    | `/api/appointments/me`                   | PATIENT | View own appointments         |
| `DELETE` | `/api/appointments/{id}`                 | PATIENT | Cancel appointment            |
| `POST`   | `/api/doctor/availability`               | DOCTOR  | Set working hours             |
| `GET`    | `/api/doctor/appointments`               | DOCTOR  | View own appointments         |
| `PUT`    | `/api/doctor/appointments/{id}/complete` | DOCTOR  | Complete appointment          |
| `GET`    | `/api/admin/doctors`                     | ADMIN   | List doctors                  |
| `PUT`    | `/api/admin/doctors/{id}/verify`         | ADMIN   | Verify doctor                 |
| `GET`    | `/api/admin/appointments`                | ADMIN   | View all appointments         |
| `POST`   | `/api/admin/specializations`             | ADMIN   | Add specialization            |

---

## 🚀 Running Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/SyncSlot.git
cd SyncSlot
```

### 2️⃣ Configure Environment Variables

```text
DB_URL=jdbc:mysql://localhost:3306/syncslot
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=your_secure_secret
```

### 3️⃣ Run the Application

```bash
./mvnw spring-boot:run
```

Windows:

```cmd
mvnw.cmd spring-boot:run
```

The API runs on:

```text
http://localhost:8081
```

---

## 🧪 Testing

The API was tested using Postman for:

* User registration and login
* JWT-protected endpoints
* Role-based authorization
* Doctor verification
* Appointment ownership
* Availability management
* Sequential booking conflicts
* Concurrent booking requests

### Concurrency Test

Two identical appointment requests were sent simultaneously.

```text
Request 1 → 201 Created
Request 2 → 409 Conflict
```

This confirms that the database locking strategy prevents double-booking under concurrent access.

---

## 🔐 Security

* JWT authentication
* Role-based authorization
* Doctor verification before accepting bookings
* Ownership validation
* Environment-based secrets
* Global exception handling
* Input validation

> Never commit database credentials or `JWT_SECRET` to GitHub.

---

## ✨ Future Enhancements

* Pagination for admin endpoints
* Refresh tokens
* Dockerized deployment
* Recurring appointments
* Advanced scheduling rules
* Email/SMS appointment notifications
* Appointment reminders

---

## 👨‍💻 Author

**Yash Yadav**

B.Tech CSE Student | Java & Spring Boot Developer

GitHub: https://github.com/yashyy455-ux

---

⭐ If you find **SyncSlot API** useful, consider starring the repository!

<div align="center">

### 🩺 SyncSlot API

**Concurrency-safe doctor appointment scheduling.**

Built with ❤️ using Java, Spring Boot, Spring Security, JWT, JPA & MySQL.

</div>
