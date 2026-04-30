# YBR Platform - Product Requirements & Design Specification

## Project Overview

A complete online course platform for Brazilian women in the US, focused on confectionery (confeitaria) courses.

## Visual Identity & Design System

- **Colors:** White-label — primary color set per creator at runtime via `--color-primary`. Base: Warm Stone (#fafaf9) background, neutral surfaces.
- **Typography:** Inter for all text (single typeface, neutral, adapts to any brand).
- **Language:** Portuguese (pt-BR).
- **Style:** Neutral, warm, professional — designed to showcase the creator's brand, not the platform's.

## Key Features & Flows

1. **Authentication:** Login, Register, Forgot/Reset Password.
2. **Student Experience:** Dashboard (Home), My Courses, Course Overview, Video Player/Lesson Page (with tabs for materials and notes).
3. **Public/Sales:** Landing Page, Checkout, Order Confirmation.
4. **Certification:** Certificate View and Public Verification.
5. **Account Management:** Profile & Settings.
6. **Creator/Admin:** Dashboard (KPIs), Course Manager (Basic info, Media, Pricing), Content Builder (Modules/Lessons with drag-and-drop), Student Manager, Analytics, Coupons, and Platform Settings.

## Technical Stack

React, TypeScript, Shadcn/UI, TailwindCSS.

## Screen List

- **Auth:** Login, Register, Forgot Password, Reset Password.
- **Student:** Dashboard, My Courses, Course Overview, Lesson Player, Materials, My Notes.
- **Commerce:** Landing Page, Checkout, Order Confirmation.
- **Others:** Certificate (Private/Public), Profile.
- **Admin:** Dashboard, Course List, Create/Edit Course, Content Manager, Students, Analytics, Coupons, Settings.
