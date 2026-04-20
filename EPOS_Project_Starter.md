# Smart Restaurant Reservation & Pre‑Order System (EPOS Integrated)

## Final Year Project -- Starter Documentation

------------------------------------------------------------------------

## 1. Project Overview

The Smart Restaurant Reservation and Pre‑Order System is a centralized
restaurant automation platform designed to handle: - Table
reservations - Digital menu browsing - Pre‑ordering - EPOS billing -
Kitchen Display System (KDS) - Admin analytics dashboards

The system aims to reduce manual errors, improve customer experience,
and optimize restaurant workflow.

------------------------------------------------------------------------

## 2. Core System Modules

### 2.1 Customer Module

-   Table reservation (real‑time availability)
-   Digital menu browsing
-   Meal pre‑ordering
-   Online payment integration
-   Reservation & order history

### 2.2 Waiter Panel

-   Table status monitoring
-   Order placement for walk‑in customers
-   Order tracking
-   Customer assistance interface

### 2.3 Kitchen Display System (KDS)

-   Real‑time incoming order display
-   Order preparation status updates
-   Priority‑based order sorting

### 2.4 Billing / EPOS Module

-   Automatic invoice generation
-   Tax calculation
-   Multiple payment methods
-   Daily transaction logging

### 2.5 Admin Dashboard

-   Menu management
-   Reservation monitoring
-   Sales analytics
-   Staff account management
-   Reports and performance insights

------------------------------------------------------------------------

## 3. System Architecture

### Frontend

-   React.js
-   HTML5, CSS3, JavaScript

### Backend

-   Django (Python)
-   REST APIs
-   JWT Authentication
-   Role‑based Access Control

### Database

-   MySQL

### Integrations

-   Khalti Payment Gateway
-   Cloud deployment (Railway / Netlify)

------------------------------------------------------------------------

## 4. Initial Database Entities

-   Users
-   Roles
-   Customers
-   Reservations
-   Tables
-   Menu Items
-   Orders
-   Order Items
-   Payments
-   Staff

------------------------------------------------------------------------

## 5. Development Roadmap (Sprint Plan)

### Sprint 1 -- Core Setup

-   Project repository setup
-   Backend base architecture
-   Authentication module

### Sprint 2 -- Reservation Module

-   Table availability logic
-   Reservation API
-   Reservation UI

### Sprint 3 -- Menu & Pre‑Order

-   Menu management system
-   Order placement workflow

### Sprint 4 -- EPOS Billing

-   Billing system
-   Invoice generation
-   Payment integration

### Sprint 5 -- KDS Integration

-   Kitchen display interface
-   Order status tracking

### Sprint 6 -- Analytics Dashboard

-   Reports and statistics
-   Sales charts

------------------------------------------------------------------------

## 6. Expected Deliverables

-   Fully functional EPOS‑integrated restaurant system
-   Customer reservation platform
-   Real‑time KDS interface
-   Billing and analytics dashboard
-   Final documentation and deployment

------------------------------------------------------------------------

## 7. Suggested Folder Structure

    project-root/
    │
    ├── backend/
    │   ├── apps/
    │   ├── api/
    │   ├── models/
    │   └── settings/
    │
    ├── frontend/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── assets/
    │
    ├── database/
    ├── docs/
    └── README.md
