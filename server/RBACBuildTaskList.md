 
## Core Features Short overview...
Project Overview
RBAC System — Full Project Specification (Dynamic Permission Platform)
Project Overview

This project is a Role-Based Access Control (RBAC) web platform with dynamic permissions where permissions control every part of the system — including which pages users can access, what features they can see, and what actions they can perform.

Unlike traditional systems where access is fixed by role (for example: Manager dashboard vs Agent dashboard), this platform allows fully dynamic permission control.

Access is granted permission-by-permission (atom-based) rather than role-based restrictions. Administrators and Managers can configure permissions through a UI without needing code changes.

The system will be a single web application with a shared codebase where the interface dynamically adjusts based on the user's resolved permission set.

Core Concept

Every page in the application requires one specific permission atom.

If a user has the required permission:

The page is accessible.

If the user does not have the permission:

The system returns a 403 Forbidden page.

Roles (Admin, Manager, Agent, Customer) are only organizational labels, not access controllers.

Permissions determine access.

User Roles
1. Admin

Admin represents the business owner or IT administrator.

Responsibilities:

Full system control

Manage all users

Assign Managers

Configure permissions

Access system-wide audit logs

Restrict or grant permissions to Managers

Capabilities:

Create / Edit / Suspend / Ban users

Manage role hierarchy

View all activity logs

Configure system settings

2. Manager

Managers are team leaders or department heads.

Responsibilities:

Manage their assigned team

Create and manage Agents

Manage Customers under their scope

Assign permissions to Agents

Restriction:

Managers cannot grant permissions they do not have themselves.

Example:

If a Manager does not have the Reports permission, they cannot assign that permission to an Agent.

This rule is called the Grant Ceiling.

3. Agent

Agents are staff members or operational users.

They work inside the modules their Manager has enabled for them.

Agents can perform tasks such as:

Managing leads

Updating tasks

Running reports (if permitted)

Working with assigned customer data

Agents cannot modify system permissions.

4. Customer

Customers are end users or clients.

Customers only have access to their own portal where they can:

View tickets

View orders

Track interactions

Manage their profile

Customers cannot access internal system operations unless explicitly granted.

Key Feature — Dynamic Permission Routing

Every page in the application is mapped to a single permission atom.

Example:

/dashboard → view_dashboard
/users → manage_users
/leads → manage_leads
/tasks → manage_tasks
/reports → view_reports
/audit-log → view_audit_logs
/settings → manage_settings

The system checks permissions before rendering the page.

If the permission exists:

Page loads.

If the permission does not exist:

User is redirected to a 403 Forbidden page.

Tech Stack
Frontend

Framework:

Next.js 14 (App Router)

Language:

TypeScript

Reason:

Next.js App Router allows server-side permission validation using middleware before page rendering.

UI Requirements:

Fully responsive

Follow the provided Figma design

Mobile / Tablet / Desktop compatibility

Recommended UI tools:

Tailwind CSS

Shadcn UI

React Query / TanStack Query

Backend

Preferred framework:

NestJS

Alternative allowed:

Node.js with Express

Any backend that fulfills the required API contract

Guard system

Modular architecture

Strong TypeScript support

Core tables:

users
roles
permissions
role_permissions
user_permissions
audit_logs
sessions
Authentication System

Authentication will use JWT with Refresh Tokens.

Access Token:

Lifetime: 15 minutes

Stored in memory (not localStorage)

Refresh Token:

Lifetime: 7 days

Stored as httpOnly cookie

Security Features:

Session blacklist

Token rotation

Rate limiting for login attempts

Brute force protection

Core Features
Authentication

Login

Logout

Refresh token system

Session validation

User Management

Admin and Managers can:

Create users

Edit user details

Suspend accounts

Ban users

Reset passwords

Permission Management UI

Permissions are managed through a visual interface.

Example permission toggles:

Dashboard      ✓
Users          ✓
Leads          ✓
Tasks          ✓
Reports        ✗
Settings       ✗

Managers can only assign permissions that they already possess.

Dynamic Sidebar Navigation

The sidebar is generated dynamically based on permissions.

Example:

Agent Sidebar

Dashboard
Leads
Tasks

Manager Sidebar

Dashboard
Users
Leads
Tasks
Reports
Core Modules

The application will contain the following modules:

Dashboard

Overview of system activity and metrics.

Possible components:

User statistics

Lead statistics

Task activity

Charts and summaries

Users Module

User management interface.

Features:

Search users

Create users

Edit roles

Suspend / ban users

Leads Module

Lead management system.

Features:

Create leads

Update lead status

Assign leads

Tasks Module

Task tracking system.

Features:

Create tasks

Assign tasks

Update progress

Reports Module

Reporting and analytics dashboard.

Access controlled by permission.

Audit Log

An append-only activity log that records all administrative actions.

Examples:

Admin created a user
Manager updated permissions
Agent modified a lead
User account suspended

Audit logs cannot be modified or deleted.

Customer Portal

Customer-facing portal where users can:

View tickets

Track service requests

View order history

Manage profile

Settings

System configuration settings.

Examples:

Permission configuration

System preferences

User policies

UI Requirements

The frontend must follow the provided Figma design.

Requirements:

Pixel-accurate implementation

Fully responsive layout

Accessible UI

Consistent spacing and typography

Login page must match the Figma prototype.

 