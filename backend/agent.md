Project## User Review Required

> [!IMPORTANT]
> - **API Routing**: Using regex constraints on `:id` parameters to prevent collisions with static sub-routes (e.g., `/device-types`).
> - **Safe Area**: Ensuring top spacing is consistent across mobile devices using `SafeAreaProvider` and `useSafeAreaInsets`.

## Proposed Changes
Overview

This project is a backend API for a mobile technician service application.
The system supports two mobile applications:

User App – used by technicians to access repair tools, schematics, compatibility data, and purchase services.

Admin App – used by administrators to manage users, data, services, and orders.

The backend is built with:

Node.js

Express.js

MYSQL

prisma

JWT Authentication

The API follows REST architecture and MVC design pattern.

System Architecture

The project follows a modular backend structure.

src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  uploads/
server.js
Folder Responsibilities

config/
Environment configuration and database connection.

controllers/
Handles request logic and communicates with services and models.

middleware/
Authentication, validation, and security middleware.

models/
prisma schemas for database collections.

routes/
API endpoint definitions.

services/
Business logic layer between controllers and models.

utils/
Helper utilities.

uploads/
Stores uploaded files.

User Roles

There are two roles:

Admin

Has full system access.

Admin can:

Manage users

Manage compatibility data

Manage error logs

Upload schematics

Manage services

Manage orders

User

Limited access.

Users can:

Check compatibility

View error logs

Convert Arabic text

Download schematics

Purchase services

Track orders

### [Refinements]

#### [MODIFY] [deviceRoutes.ts](file:///c:/Users/qozeem/Desktop/mobile/same%20it/backend/src/routes/deviceRoutes.ts)
- Add regex `(\\d+)` to `:id` parameter to avoid collision with `/device-types`.

#### [MODIFY] [_layout.tsx](file:///c:/Users/qozeem/Desktop/mobile/same%20it/admin/src/app/admin/_layout.tsx)
- Ensure consistent Safe Area padding for both mobile and desktop views.

#### [MODIFY] [devices.tsx](file:///c:/Users/qozeem/Desktop/mobile/same%20it/admin/src/app/admin/devices.tsx)
- Use global Safe Area logic to prevent overlapping with status bar and headers.

## Verification Plan

### Automated Tests
- `curl http://localhost:3000/api/devices/device-types`: Should return the list of brands without triggering `getById`.
- `curl http://localhost:3000/api/devices/1`: Should return device with ID 1.

### Manual Verification
- View Admin Panel on mobile: Check for top padding/Safe Area.
- Navigate between tabs in Device Catalog: Ensure 404 errors are gone.

Authentication System

Authentication uses JWT tokens.

Login Flow

User sends credentials.

Backend verifies password using bcrypt.

Server generates JWT token.

Token is used in future requests.

Authorization header:

Authorization: Bearer TOKEN
Core Modules

The backend consists of the following modules:

Authentication

Users & Subscriptions

Compatibility System

Error Logs

Arabic Conversion

Schematics

Services

Orders

Module: Authentication

Handles login and session validation.

Endpoint

POST /auth/login

Request:

{
 "username": "user",
 "password": "password"
}

Response:

{
 token,
 user,
 role
}
Module: Users & Subscriptions

Each user contains:

username

password

subscriptionExpireDate

role

createdAt

Admin Endpoints

Create user

POST /admin/users

Update user

PUT /admin/users/:id

Delete user

DELETE /admin/users/:id

List users

GET /admin/users
Module: Component Compatibility

Stores compatibility between device models and components.

Fields:

componentType

deviceModel

compatibleModels

Example:

deviceModel: A1
compatibleModels: [A2, A3]
componentType: Screen
Admin Endpoints

Create compatibility

POST /admin/compatibility

Update compatibility

PUT /admin/compatibility/:id

Delete compatibility

DELETE /admin/compatibility/:id

List compatibility

GET /admin/compatibility
User Endpoint

Check compatibility

GET /compatibility?model=A1&type=screen
Module: Error Logs

Stores error codes and solutions.

Fields:

errorCode

description

solution

Example:

errorCode: ABC
solution: Replace Battery
Admin Endpoints

Create error

POST /admin/errors

Update error

PUT /admin/errors/:id

Delete error

DELETE /admin/errors/:id

List errors

GET /admin/errors
User Endpoint

Search error

GET /errors?code=ABC
Module: Arabic Conversion

Converts Arabic text to symbols based on mapping rules.

Example mapping:

ا -> #
ب -> %
ت -> &
Admin Endpoints

Create rule

POST /admin/conversion-rules

Update rule

PUT /admin/conversion-rules/:id

Delete rule

DELETE /admin/conversion-rules/:id
User Endpoint

Convert text

POST /convert

Request:

{
 "text": "مرحبا"
}

Response:

{
 "converted": "#$%&"
}
Module: Schematics

Stores repair diagrams.

Files are uploaded as PDF.

Fields:

deviceName

schematicType

pdfFile

uploadedAt

Admin Endpoints

Upload schematic

POST /admin/schematics

Update schematic

PUT /admin/schematics/:id

Delete schematic

DELETE /admin/schematics/:id

List schematics

GET /admin/schematics
User Endpoints

Search schematics

GET /schematics?device=iphone

Download schematic

GET /schematics/:id/download
Module: Services

Digital services sold to technicians.

Fields:

title

description

price

image

requiresSN

Admin Endpoints

Create service

POST /admin/services

Update service

PUT /admin/services/:id

Delete service

DELETE /admin/services/:id

List services

GET /admin/services
User Endpoint

List services

GET /services
Module: Orders

Users submit service requests.

Fields:

userId

serviceId

quantity

phone1

phone2

telegramUsername

serialNumber

paymentScreenshot

status

Status values:

processing
failed
successful
User Endpoints

Create order

POST /orders

View own orders

GET /orders/my
Admin Endpoints

View all orders

GET /admin/orders

Update status

PUT /admin/orders/:id/status

Filter orders

GET /admin/orders?status=processing
File Upload Handling

Uploads handled via Multer.

Upload directories:

uploads/
  services/
  payments/
  schematics/

File types allowed:

images

PDF

Security Rules

The backend must enforce:

JWT authentication

Admin role protection

Input validation

Rate limiting

Secure file uploads

Sanitized queries

API Design Principles

The backend must follow:

REST conventions

Proper HTTP status codes

Consistent response format

Separation of concerns

Scalable architecture

Running the Server

Install dependencies:

npm install

Run development server:

npm run dev

Start production server:

npm start

Environment variables stored in:

.env

Required variables:

PORT
MYSQL
JWT_SECRET