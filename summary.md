# Project Summary: ILMS (Incodere Learning Management System)

## Overview
ILMS is a multi-role Learning Management System built for corporate training, targeting the UK and Australian markets. The MVP is largely complete, with core functionality across three primary roles implemented.

## Roles
1. **Super Admin (Incodere Staff):** Manages the platform, organizations, and the course catalogue.
2. **Company Admin:** Manages learners, enrollments, and compliance reporting within their specific organization.
3. **Learner:** Views assigned courses, tracks lesson progress, and downloads certificates upon completion.

## Tech Stack
- **Frontend:** React 19 (Vite), Tailwind CSS v4, React Router DOM
- **Backend:** Node.js, Express 5
- **Database & Storage:** PostgreSQL via Supabase, Supabase Storage
- **Authentication:** Supabase Auth (JWT)
- **Email:** Resend.com
- **Certificate Generation:** `pdf-lib` (Server-side PDF generation)

## Current Status
- **Completed (Parts 1-9):** Project scaffolding, Database schema, Authentication (All roles), Course Management, Organization & Learner Management, Enrollment, Course Player & Progress Tracking, and Certificate Generation & Delivery.
- **Pending (Part 10):** Compliance Reporting, Frontend Polish (loading skeletons, empty states, mobile responsiveness), and Production Deployment.

## Brand Identity & Color System
The project is transitioning to a new professional design system:
- **Primary Canvas:** `#FFFFFF` (White) for main content and cards.
- **Structural Neutral:** `#F9F9FA` (Soft Light Gray) for sidebars and secondary zones.
- **Typography & Core Shapes:** `#3A3A3A` (Deep Charcoal) for sharp legibility.
- **Borders & Grids:** `#E5E7EB` (Delicate Gray) for functional dividers.
- **The Identity Pop:** `#9333EA` / `#8B5CF6` (Vibrant Purple) for interactive accents and high-importance visual anchors.
- **The Technical Gradient:** Deep Indigo (`#312E81`) to Cyan (`#06B6D4`), reserved for the core logo mark.
