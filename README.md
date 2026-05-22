<div align="center">
<img src="client/public/favicon.svg" alt="🍔" width="40" height="40" align="center">

# DropBite

### Distributed Microservices-Based Food Ordering Platform

<p align="center">
  <b>Production-inspired architecture built with scalable microservices, real-time communication, and containerized infrastructure.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Realtime-Socket.IO-010101?style=for-the-badge&logo=socket.io" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Broker-RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq" />
  <img src="https://img.shields.io/badge/Containerized-Docker-2496ED?style=for-the-badge&logo=docker" />
</p>

</div>

---

# 🚀 Live Deployment

### Live URL [[click here](https://dropbite.vercel.app/)]

---

# 📌 Project Overview & Features

**DropBite** is a full-stack, distributed microservices-based food ordering platform designed to replicate the core internal architectures of production applications like **Zomato** or **UberEats**. The platform coordinates isolated service domains to handle complex multi-role workflows natively.

---

## ✨ Key Capabilities

### 🔹 Multi-Role Workflows
Complete decoupled client-to-service flows for:
- Customers
- Outlets (Sellers)
- Delivery Partners (Riders)
- Admins

---

### 🔹 Real-Time Telemetry & Tracking
Live multi-point order updates and geospatial rider location tracking powered by **Socket.IO**.

---

### 🔹 In-App Mapping & Navigation
Interactive navigation utilities assisting riders with optimized route mapping alongside live client-side order maps for customers.

---

### 🔹 Asynchronous Event Processing
High-throughput message-driven communication between isolated microservices using **RabbitMQ** event queues.

---

### 🔹 Secure Payment Gateways
Atomic localized and global checkout pipelines utilizing:
- Stripe
- Razorpay

---

### 🔹 Reactive Audio Notifications
Automated auditory triggers alerting partners instantly on critical lifecycle events:
- Order received
- Delivery accepted
- Critical workflow events

---

### 🔹 Containerized Environments
Unified **Docker** & **Docker Compose** orchestration ensuring absolute parity between:
- Local development environments
- Target staging deployments

---

# 🛠️ Tech Stack Used

## 🎨 Frontend Application (`client`)

| Layer | Technologies |
|---|---|
| Core Engine | TypeScript, React.js, Vite |
| Real-Time State | Socket.IO Client |
| Geospatial Mapping | React Leaflet / Mapbox API |
| Style Architecture | Tailwind CSS |

---

## ⚙️ Backend Microservices (`services`)

| Layer | Technologies |
|---|---|
| Runtime Environment | Node.js (TypeScript) |
| Application Framework | Express (REST APIs) |
| Real-Time Layer | Socket.IO Server Gateway |
| Data Layer | MongoDB |
| Event Mesh & Message Broker | RabbitMQ |
| Infrastructure Architecture | Docker, Docker Compose |

---

# 🧱 Repository Folder Structure

```bash
dropbite/
|-- client/                     # Frontend Application SPA
|   |-- src/                    # React components, pages, context providers, hooks
|   |-- client/package.json     # Client-side dependencies & build scripts
|   |-- vite.config.ts          # Build bundler configuration
|   `-- tsconfig.json           # Frontend TypeScript specifications
|
`-- services/                   # Backend Microservices & Architecture Mesh
    |-- docker-compose.yml      # Local orchestration stack (Infrastructure & Brokers)
    |-- auth/                   # Secure Authentication Service (JWT & RBAC)
    |-- seller/                 # Outlet & Catalog Management Service
    |-- rider/                  # Delivery Partner Routing & Telemetry Service
    |-- admin/                  # Verification, Approvals & Auditing Service
    |-- realtime/               # Centralized WebSocket Socket.IO Traffic Gateway
    `-- utils/                  # Core Shared Utilities (Media Uploads, Payment Helpers)
```

---

# ⚡ Step-by-Step Installation & Local Setup

## 📋 Prerequisites

Ensure the following dependencies are installed:

- Node.js (>= 16.x recommended)
- npm or yarn
- Docker Desktop
- Docker Compose

---

# 🚀 Local Quickstart

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/gurwinder-s24/dropbite.git
cd dropbite
```

---

## 2️⃣ Spin Up Infrastructure Dependencies

Launch your containerized RabbitMQ instance and database clusters via Docker Compose inside the `services` workspace.

```bash
cd services
docker-compose up -d
```

---

## 3️⃣ Initialize Backend Microservices

Every individual service manages its own localized processes.

Example (`auth` service):

```bash
cd services/auth
npm install
npm run dev
```

Repeat this process for:
- seller
- rider
- realtime
- admin
- utils

Based on the workflow being tested.

---

## 4️⃣ Initialize Frontend Application

Open another terminal session from the root workspace directory.

```bash
cd client
npm install
npm run dev
```

Once initialized, navigate to:

```bash
http://localhost:5173
```

---

# 🔐 Environment Variables

To prevent credential leakage, environment templates must be set up locally within separate workspaces.

Create individual `.env` files matching the schemas below.

---

## ℹ️ INTERNAL_SERVICE_KEY

This key is a custom security layer used to authenticate and authorize server-to-server requests directly between your microservices.

For local development:
- Use any secure string
- Ensure it matches across participating services

---

# 🖥️ Frontend Configuration (`client/.env`)

```env
VITE_AUTH_SERVICE=http://localhost:5000
VITE_OUTLET_SERVICE=http://localhost:5001
VITE_UTILS_SERVICE=http://localhost:5002
VITE_RIDER_SERVICE=http://localhost:5003
VITE_REALTIME_SERVICE=http://localhost:5004
VITE_ADMIN_SERVICE=http://localhost:5005

VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

---

# 🛡️ Admin Service Configuration (`services/admin/.env`)

```env
PORT=5005
MONGODB_URI=your_mongodb_connection_uri
JWT_SEC=your_jwt_secret_key
DB_NAME=dropbite
```

---

# 🔑 Auth Service Configuration (`services/auth/.env`)

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_uri
JWT_SEC=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

# 📡 Realtime Service Configuration (`services/realtime/.env`)

```env
PORT=5004
JWT_SEC=your_jwt_secret_key
INTERNAL_SERVICE_KEY=your_secure_internal_key
```

---

# 🚴 Rider Service Configuration (`services/rider/.env`)

```env
PORT=5003
OUTLET_SERVICE=http://localhost:5001
UTILS_SERVICE=http://localhost:5002
REALTIME_SERVICE=http://localhost:5004

MONGODB_URI=your_mongodb_connection_uri
INTERNAL_SERVICE_KEY=your_secure_internal_key

RABBITMQ_URL=amqp://admin:admin123@localhost:5672
ORDER_READY_QUEUE=order_ready_queue_event
```

---

# 🏪 Seller Service Configuration (`services/seller/.env`)

```env
PORT=5001
UTILS_SERVICE=http://localhost:5002
REALTIME_SERVICE=http://localhost:5004

MONGODB_URI=your_mongodb_connection_uri
INTERNAL_SERVICE_KEY=your_secure_internal_key

RABBITMQ_URL=amqp://admin:admin123@localhost:5672
PAYMENT_QUEUE=payment_queue_event
ORDER_READY_QUEUE=order_ready_queue_event
```

---

# 🧰 Utils Service Configuration (`services/utils/.env`)

```env
PORT=5002
FRONTEND_URL=http://localhost:5173
OUTLET_SERVICE=http://localhost:5001

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_SECRET_KEY=your_cloudinary_secret_key

INTERNAL_SERVICE_KEY=your_secure_internal_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key

RABBITMQ_URL=amqp://admin:admin123@localhost:5672
PAYMENT_QUEUE=payment_queue_event
```

---

# 🐳 Running With Full Docker Containerization

To simulate a localized production-grade deployment:

```bash
cd services
docker-compose up --build -d
```

---

# 📜 Stream Runtime Container Logs

Inspect live container telemetry:

```bash
docker-compose logs -f <service-name>
```

---

# ☁️ Deployment Pipeline

## 🎯 Frontend Interface

- Connected directly to **Vercel**
- Root directory configured to `/client`
- Injected `VITE_` service endpoints mirrored inside deployment dashboards

---

## 🧩 Distributed Microservices

Every microservice is deployed independently as:
- Isolated container environments
- Web Services
- Render deployments

Environment variables must be configured manually for:
- Databases
- RabbitMQ queues
- Internal authentication keys
- Service mapping endpoints

---

# 🧪 Troubleshooting Matrix

| Issue | Resolution |
|---|---|
| Broker Connection Failures | Verify RabbitMQ containers are healthy using `docker ps` and ensure port `5672` is active |
| Database Context Timeouts | Confirm `MONGODB_URI` points to valid reachable database instances |
| WebSocket Gateway Drops | Ensure frontend realtime ports correctly map to the Socket.IO gateway |

---

<div align="center">

## ⭐ DropBite

### Scalable • Distributed • Real-Time • Production-Oriented

</div>