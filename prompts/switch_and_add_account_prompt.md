# MASTER PROMPT — Implement Instagram-like Switch Account & Add Existing Account Backend for Travora

## ROLE

You are **Claude Opus**, acting as a Principal Backend Engineer, Security Architect, Product Architect, and System Designer with extensive experience building authentication systems for applications such as Instagram, Threads, Facebook, and other large-scale social media platforms.

Your task is not simply to implement authentication endpoints.

Your responsibility is to design and implement a **production-ready multi-account authentication system** that behaves exactly like Instagram's **Add Account** and **Switch Account** features while following modern backend architecture, security best practices, and scalability principles.

Think like you are building this feature for millions of users.

---

# Project Context

Project Name: **Travora**

Travora is an AI-powered travel social media platform where users can:

* Share travel experiences
* Upload photos and videos
* Follow travelers
* Like, comment, and save posts
* Discover destinations
* Plan trips
* Receive AI-powered recommendations
* Chat with an AI assistant (future)
* Book hotels and flights (future)

The authentication system already supports user registration and login.

Now the application needs an Instagram-style **Add Existing Account** and **Switch Account** mechanism.

The implementation should feel identical to Instagram from the user's perspective.

---

# Objective

Implement the backend for:

* Add Existing Account
* Switch Account
* Remove Account
* View Saved Accounts
* Logout Current Account
* Logout All Accounts

The implementation must support multiple accounts on the same device while keeping every account secure and independent.

---

# User Experience Flow

The flow should work exactly like Instagram.

### Scenario 1 — First Login

User logs into Travora.

Backend returns:

* Access Token
* Refresh Token
* User Profile

The account becomes the active account.

The account is also saved as a trusted device account.

---

### Scenario 2 — Add Existing Account

User opens

Settings

↓

Add Existing Account

↓

User enters

Email or Username

Password

↓

Backend validates credentials.

If valid:

* Login succeeds.
* Tokens are generated.
* The newly added account becomes the active account immediately.
* The previously active account remains saved.
* Both accounts remain available for future switching.

No previous account should be logged out.

---

### Scenario 3 — Switch Account

User selects another saved account.

Expected behavior:

No username/password should be requested.

Backend verifies that:

* The account is registered on this device.
* The session is still valid.

Backend issues fresh access tokens if necessary.

The selected account becomes active instantly.

The previous account remains saved.

Switching should feel almost instantaneous.

---

### Scenario 4 — Multiple Accounts

Example:

User has

Account A

Account B

Account C

All three remain available.

User can switch:

A → B

B → C

C → A

without entering passwords again.

Exactly like Instagram.

---

### Scenario 5 — Remove Account

User selects

Remove Account

Only that account is removed from the saved account list.

Other accounts remain unaffected.

---

### Scenario 6 — Logout Current Account

Only the current account logs out.

Other saved accounts remain available.

---

### Scenario 7 — Logout All Accounts

Every saved account is removed.

All refresh tokens become invalid.

Every device session ends.

---

# Authentication Rules

Each account must have its own:

* Access Token
* Refresh Token
* Session
* Device Registration
* Token Expiration

Never share tokens between accounts.

Never reuse tokens.

---

# Device Session Management

Treat every device independently.

One device may contain multiple Travora accounts.

Example:

Phone

Account A

Account B

Account C

Laptop

Account A

Tablet

Account D

Sessions must remain independent.

---

# Database Design

Design production-ready schemas.

Possible tables:

Users

DeviceSessions

RefreshTokens

SavedAccounts

UserSessions

TrustedDevices

SessionAuditLogs

Include:

Primary Keys

Foreign Keys

Indexes

Unique Constraints

Cascade Rules

Soft Deletes

Timestamps

---

# API Design

Design APIs for:

POST /auth/login

POST /auth/add-account

POST /auth/switch-account

POST /auth/logout

POST /auth/logout-all

DELETE /auth/remove-account

GET /auth/saved-accounts

POST /auth/refresh

For every endpoint include:

Purpose

Authentication

Validation

Permissions

Responses

Error Cases

Rate Limits

Security Considerations

---

# Security Requirements

Implement:

JWT Access Tokens

Refresh Tokens

Token Rotation

Refresh Token Revocation

Device Tracking

Session Validation

Rate Limiting

Password Hashing

Replay Attack Prevention

CSRF considerations

Input Validation

Authorization Guards

Secure Cookies (if applicable)

Ownership Validation

---

# Switch Account Logic

Switching accounts should NOT require passwords.

Instead:

Verify:

* Device Session
* Saved Account
* Refresh Token

If refresh token expired:

Return

"Session expired"

Frontend should request login again only for that account.

Do not affect other accounts.

---

# Saved Account Rules

The backend should maintain:

Saved Accounts List

Each item contains:

* User ID
* Username
* Display Name
* Profile Picture
* Last Active
* Device ID
* Session Status

Never expose:

Password

Password Hash

Refresh Token

Sensitive information

---

# Token Strategy

Every account has:

Access Token

Refresh Token

Session ID

Device ID

When switching:

Old access token becomes inactive.

New access token is generated.

Refresh token rotation should occur if appropriate.

---

# Edge Cases

Handle:

Invalid account

Expired refresh token

Deleted account

Disabled account

Password changed

Concurrent switching

Duplicate account addition

Device removal

Network interruption

Token replay

Race conditions

---

# Performance

Use:

Redis

Session Caching

Token Cache

Database Indexes

Optimized Queries

Connection Pooling

Efficient Token Lookup

---

# Architecture

Use:

NestJS

TypeScript

Prisma

PostgreSQL

Redis

JWT

Passport (if appropriate)

Repository Pattern

Dependency Injection

Service Layer

Modular Architecture

Event-driven Architecture where beneficial

---

# Code Quality

Generate:

Production-ready code

No placeholder implementations

Strong typing

Reusable services

DTO validation

Proper exception handling

Logging

Transactions where required

Comprehensive comments only where necessary

---

# Explain Every Decision

Whenever making architectural decisions explain:

Why this approach

Alternative approaches

Trade-offs

Security implications

Performance implications

Scalability

---

# Future Compatibility

Design the authentication system so future features can be added easily, including:

Two-Factor Authentication (2FA)

Biometric Login

Passkeys (WebAuthn)

Google Login

Apple Login

Facebook Login

Magic Links

Enterprise SSO

Session Management Dashboard

---

# Expected Output Order

Always respond in this order:

1. Functional Flow
2. User Journey
3. Authentication Flow
4. Session Management
5. Database Design
6. Folder Structure
7. API Design
8. Security Architecture
9. Token Management
10. Switch Account Logic
11. Add Account Logic
12. Remove Account Logic
13. Logout Logic
14. Edge Cases
15. Backend Implementation
16. Testing Strategy
17. Future Scalability

---

# Final Instruction

Do not simplify this implementation.

Implement the feature to behave as closely as possible to Instagram's multi-account system while following modern backend engineering practices.

The implementation must be secure, scalable, production-ready, maintainable, and capable of supporting millions of users.
