AGENT.md (Mobile Frontend)
Project Overview

This project is a mobile application for repair technicians that connects to a REST API backend.

The system includes two mobile apps:

User App

Admin App

Both apps communicate with the backend API built with Node.js and Express.js.

The application allows users to:

Check device component compatibility

View error codes and solutions

Convert Arabic text into symbols

View and download schematics

Purchase digital services

Track service request status

Technology Stack

The mobile frontend must use:

Flutter

Dart

REST API

JWT Authentication

Provider or Riverpod for state management

HTTP / Dio for API requests

Other required packages:

file_picker

image_picker

cached_network_image

flutter_secure_storage

pdf_viewer

Application Architecture

The project must follow clean architecture and modular design.

Project structure:

lib/
  core/
  config/
  models/
  services/
  providers/
  screens/
  widgets/
  routes/
  utils/
main.dart
Folder Responsibilities

core/
Shared constants and API configuration.

config/
App configuration and environment variables.

models/
Data models that match backend responses.

services/
API communication layer.

providers/
State management logic.

screens/
UI screens for each module.

widgets/
Reusable UI components.

routes/
Navigation configuration.

utils/
Helper functions.

User Roles

There are two roles:

Admin

Access to:

User management

Compatibility management

Error management

Schematics upload

Service management

Order management

User

Access to:

Compatibility search

Error log search

Arabic conversion

Schematics viewer

Services marketplace

Order tracking

Authentication Flow
Login Process

User enters username and password

App sends request to:

POST /auth/login

Backend returns:

{
 token,
 user,
 role
}

Token must be stored using:

flutter_secure_storage

Token is attached to future requests:

Authorization: Bearer TOKEN
Main User Application Screens

The user app must contain the following screens.

Login Screen

Fields:

username

password

Button:

login

Dashboard Screen

Shows quick access to:

Compatibility

Error Logs

Arabic Converter

Schematics

Services

My Requests

Compatibility Screen

Users can:

select component type

enter device model

Request:

GET /compatibility?model=A1&type=screen

Display compatible models.

Error Logs Screen

Users search error codes.

Request:

GET /errors?code=ABC

Display:

error code

description

solution

Arabic Converter Screen

User enters Arabic text.

Request:

POST /convert

Body:

{
 text: "مرحبا"
}

Display converted symbols.

Schematics Screen

Features:

search device name

list schematic types

view PDF diagrams

download PDF

Request:

GET /schematics?device=iPhone
Services Marketplace

Display list of services.

Request:

GET /services

Each service card displays:

image

title

description

price

Submit Service Request

Form fields:

payment screenshot

quantity

phone number 1

phone number 2 (optional)

telegram username

serial number (optional)

Request:

POST /orders
My Requests Screen

Shows user orders.

Request:

GET /orders/my

Display status:

Processing

Failed

Successful

Admin Application Screens

Admin app must include the following panels.

User Management

Admin can:

create user

edit user

delete user

manage subscription expiration

API:

POST /admin/users
PUT /admin/users/:id
DELETE /admin/users/:id
GET /admin/users
Compatibility Management

Admin can:

add compatibility

edit compatibility

delete compatibility

API:

POST /admin/compatibility
PUT /admin/compatibility/:id
DELETE /admin/compatibility/:id
GET /admin/compatibility
Error Management

Admin manages error codes.

API:

POST /admin/errors
PUT /admin/errors/:id
DELETE /admin/errors/:id
GET /admin/errors
Schematics Management

Admin uploads schematics.

Upload PDF.

API:

POST /admin/schematics
PUT /admin/schematics/:id
DELETE /admin/schematics/:id
GET /admin/schematics
Services Management

Admin can:

upload service image

edit title

edit description

edit price

delete service

API:

POST /admin/services
PUT /admin/services/:id
DELETE /admin/services/:id
GET /admin/services
Order Management

Admin can:

view orders

update order status

filter orders

API:

GET /admin/orders
PUT /admin/orders/:id/status

Statuses:

processing
failed
successful
File Upload Features

The mobile app must support uploads for:

payment screenshots

service images

schematic PDFs (admin)

Use:

image_picker

file_picker

Uploads sent via:

multipart/form-data
UI Design Principles

The UI must follow:

clean technician-friendly layout

fast navigation

search functionality

clear status indicators

minimal steps for submitting requests

Error Handling

The mobile app must handle:

network failures

authentication errors

expired token

file upload errors

API validation errors

Performance Requirements

The app must:

cache images

minimize API calls

use pagination for large lists

avoid blocking UI threads

Deployment

The mobile app must support:

Android APK

Android Play Store

iOS App Store

Environment variables stored in:

.env

Variables:

API_BASE_URL