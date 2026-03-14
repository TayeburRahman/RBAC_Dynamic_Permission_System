 
## Core Features Short overview
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


## Key Patterns & Conventions

### 1. Route Definition
```typescript
// src/app/modules/[module]/[module].routes.ts
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ModuleController } from './module.controller';
import { ModuleValidation } from './module.validation';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.ADMIN),
  validateRequest(ModuleValidation.createSchema),
  ModuleController.create
);

export const ModuleRoutes = router;
```

### 2. Controller Pattern
```typescript
// src/app/modules/[module]/[module].controller.ts
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';

const create = catchAsync(async (req, res) => {
  const result = await ModuleService.create(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Created successfully',
    data: result,
  });
});
```

### 3. Service Pattern
```typescript
// src/app/modules/[module]/[module].service.ts
const create = async (payload: IModule): Promise<IModule> => {
  const result = await Module.create(payload);
  return result;
};
```

### 4. Model Pattern
```typescript
// src/app/modules/[module]/[module].model.ts
import { Schema, model } from 'mongoose';
import { IModule, ModuleModel } from './module.interface';

const moduleSchema = new Schema<IModule, ModuleModel>(
  {
    name: { type: String, required: true },
    // ... fields
  },
  { timestamps: true }
);

export const Module = model<IModule, ModuleModel>('Module', moduleSchema);
```

### 5. Interface Pattern
```typescript
// src/app/modules/[module]/[module].interface.ts
import { Model, Types } from 'mongoose';

export type IModule = {
  name: string;
  status: 'active' | 'inactive';
  authId: Types.ObjectId;
  // ... fields
};

export type ModuleModel = Model<IModule>;
```

### 6. Validation Pattern
```typescript
// src/app/modules/[module]/[module].validation.ts
import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string().email(),
    // ... fields
  }),
});

export const ModuleValidation = { createSchema };
```

### 7. QueryBuilder Usage
```typescript
const query = new QueryBuilder(Model.find(), req.query)
  .search(['name', 'email'])
  .filter()
  .sort()
  .paginate()
  .fields()
  .populate('authId');

const result = await query.modelQuery;
const meta = await query.countTotal();
```

### 8. Route Registration
```typescript
// src/app/routes/index.ts
import { ModuleRoutes } from '../modules/module/module.routes';

const moduleRoutes = [
  { path: '/api/v1/module', route: ModuleRoutes },
  // ... other modules
];
```

---

## Adding a New Module (Step-by-Step)

1. Create folder: `src/app/modules/[moduleName]/`
2. Create files following the patterns above:
   - `moduleName.interface.ts` - Define types
   - `moduleName.model.ts` - Define Mongoose schema
   - `moduleName.validation.ts` - Define Zod schemas
   - `moduleName.service.ts` - Write business logic
   - `moduleName.controller.ts` - Write request handlers
   - `moduleName.routes.ts` - Define routes with middleware
3. Register routes in `src/app/routes/index.ts`

---

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + bcrypt password hashing
- **Real-time**: Socket.io (online user tracking, live notifications)
- **Validation**: Zod schema validation
- **Email**: Nodemailer with SMTP
- **Payments**: Stripe (configured)
- **File Upload**: Multer (multipart file uploads)
- **Logging**: Winston with daily rotation
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

