# 🔐 FileSanctum 2.0 – Distributed & Secure File Storage System

## 📝 Overview

**FileSanctum 2.0** is a distributed file storage system designed to ensure secure, scalable, and fault-tolerant storage of user data. It supports dynamic node management, encryption, erasure coding, and real-time monitoring through an interactive frontend. Built using **Node.js**, **PostgreSQL**, and **JavaScript**, the system is ideal for understanding the principles of decentralized file systems and data redundancy.

---

## ⚙️ Key Features

- 📦 **File Chunking & Distribution**  
  Files are automatically split into chunks based on size and distributed across nodes.

- 🔐 **Encryption**  
  Each chunk is encrypted before storage to ensure data privacy and security.

- ☁️ **Upload & Download Support**  
  Users can securely upload and retrieve complete files reconstructed from distributed chunks.

- 🧠 **Erasure Coding**  
  Built-in redundancy allows recovery of lost chunks, improving fault tolerance.

- 📊 **Dynamic UI & Charts**  
  Interactive charts and real-time status visualizations of storage usage, node distribution, etc.

- 🩺 **Node Health Monitoring**  
  Live health checks of all active nodes, indicating their status and availability.

- ➕ **Scalable Node Deployment**  
  Add as many nodes as needed for distributed file storage, all locally or remotely simulated.

- 🧾 Access logs & usage analytics

- 🔐 Multi-user authentication with role-based access

- 🗃️ Deduplication of identical files

---

## 🚀 Getting Started

### ✅ Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [PostgreSQL](https://www.postgresql.org/)
- `npm` (Node Package Manager)

---

### 🧪 Setup Instructions

#### 1. Clone the Repository

```bash
git clone https://github.com/ANAMIKATIWARI2002/FileSanctum-2.0.git
cd FileSanctum-2.0
```

### 2. Create PostgreSQL Database
```bash
psql -U postgres
create database "database_name";
\q
```
Replace "database_name" with a name like filesanctum.

### 3. Push Database Schema using Prisma
```bash
npm run db:push
```

### 4. Start the Development Server
```bash
npm run dev
```

### 5. (Optional) Simulate Local Nodes
```bash
node local-setup.cjs
```

## 🛠️ Tech Stack

Frontend: HTML, CSS, JavaScript (Charts, Dynamic UI)

Backend: Node.js (Express/custom)

Database: PostgreSQL

ORM: Prisma

Security: Chunk-level encryption

Reliability: Erasure coding for redundancy

## 📌 Future Enhancements

🌐 Remote node integration (over network)

🌩️ Integration with cloud storage (AWS S3, etc.)
