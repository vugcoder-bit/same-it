# Same-IT: Mobile Repair & Schematics Platform

Same-IT is a comprehensive ecosystem designed for mobile repair technicians. It provides secure access to device schematics, hardware diagrams, and specialized tools like an Arabic Hex Code converter.

## 🚀 Project Overview

The project is divided into three main components:

- **Backend**: A robust Node.js API that handles authentication, subscription management, and secure file serving.
- **Mobile App**: A high-performance React Native (Expo) application for technicians on the go.
- **Admin Panel**: A modern Next.js dashboard for administrators to manage users, devices, and upload new schematics.

---

## 🏗 System Architecture

### 1. Backend (`/backend`)
- **Runtime**: Node.js with Express.js.
- **Database**: MongoDB via Prisma ORM.
- **Security**: 
  - JWT Authentication.
  - Subscription-based middleware.
  - **Secure PDF View**: Implements a "Signed URL" pattern with one-time tokens and IP binding to prevent unauthorized sharing of proprietary schematics.
- **Storage**: Local file storage for PDF schematics and device images.

### 2. Mobile App (`/mobile`)
- **Framework**: React Native with Expo SDK.
- **Navigation**: Expo Router (file-based routing).
- **State Management**: Zustand (with persistence for Auth and Localization).
- **Key Features**:
  - **PDF Viewer**: Optimized native viewer with local caching for speed and reliability.
  - **Localization**: Full support for **Arabic** (RTL) and **English**, persisting user preferences across sessions.
  - **Arabic Code Converter**: Specialized Hex-based encoding/decoding tool for technicians.

### 3. Admin Panel (`/admin`)
- **Framework**: Next.js 15 (App Router).
- **Styling**: Tailwind CSS with a premium dark/light mode system.
- **Management**: full CRUD operations for Users, Device Models, and Schematic uploads.

---

## 🛠 Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Running instance or Atlas)
- Expo Go (for mobile testing) or a Dev Client build.

### 1. Backend Setup
```bash
cd backend
npm install
# Configure your .env (DATABASE_URL, JWT_SECRET, etc.)
npx prisma generate
npm run dev
```

### 2. Mobile App Setup
```bash
cd mobile
npm install
# Set EXPO_PUBLIC_API_URL in your .env
npx expo start
```

### 3. Admin Panel Setup
```bash
cd admin
npm install
npm run dev
```

---

## 🛡 Security Features

- **Signed Schematic Links**: Schematics are never served directly. The backend generates a temporary, 2-minute "View Token" bound to the user's IP address.
- **Subscription Guard**: Users are automatically locked out if their subscription expires, enforced at both the API and App layers.
- **Admin-Only Registration**: Registration is managed by administrators via contact links (Telegram/WhatsApp) for better user quality control.

---

## 📱 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express, Prisma, MongoDB |
| **Mobile** | React Native, Expo, Zustand, Tailwind (NativeWind) |
| **Admin** | Next.js, React, Tailwind CSS |
| **Language** | TypeScript (Strict Mode) |

---

## 📄 License
Internal proprietary project for Same-IT.
