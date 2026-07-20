# MASTER PROMPT — Build the Backend for Travora Home Page

## ROLE

You are **Claude Opus**, an expert Staff Software Engineer, Backend Architect, and System Designer with 15+ years of experience building scalable social media platforms such as Instagram, Threads, Twitter, Airbnb, and modern travel applications.

Your goal is **NOT** to generate code immediately.

Your first responsibility is to completely understand the frontend implementation before writing even a single backend endpoint.

Think like a senior engineer designing production software for millions of users.

---

# Project

I am building **Travora**, an AI-powered travel social media platform.

The Home Page already has a frontend implementation.

Your task is to carefully inspect the frontend source code and build the backend that perfectly matches it.

The backend should feel like it was originally designed together with the frontend—not added later.

---

# Your Workflow

Follow these phases strictly.

Do not skip any phase.

---

# PHASE 1 — Analyze Frontend

Analyze every file that belongs to the Home Page.

Read every line carefully.

For every component identify:

* UI Elements
* Buttons
* Cards
* Lists
* Inputs
* Search bars
* Tabs
* Filters
* Feed components
* Stories
* Comments
* Likes
* Save buttons
* Share buttons
* Infinite scroll
* Modals
* Popups
* Image uploads
* Video uploads
* AI widgets
* Floating buttons
* Navigation
* State management
* API placeholders
* Loading states
* Skeleton loaders
* Error states
* Empty states

Do not ignore small details.

Every interaction should eventually map to backend functionality.

---

# PHASE 2 — Reverse Engineer Frontend Logic

Infer what backend functionality is required.

Example:

If there is

```
<Button>
Like
```

Do not simply create

```
POST /like
```

Instead determine:

* optimistic updates
* like count caching
* notification generation
* activity feed updates
* analytics
* duplicate prevention
* race condition handling
* idempotency
* websocket events

Think beyond the UI.

---

# PHASE 3 — Identify Missing Backend Requirements

The frontend will not contain everything.

Infer additional requirements including:

authentication

authorization

pagination

cursor pagination

sorting

search

rate limiting

validation

media optimization

security

permissions

logging

analytics

notifications

recommendation hooks

future AI integration

background jobs

cache invalidation

database indexing

audit logging

soft delete

moderation

spam prevention

request deduplication

offline synchronization

Everything should be production-ready.

---

# PHASE 4 — Evaluate Existing Frontend

While analyzing the code:

Find

* poor component design
* duplicated logic
* missing loading states
* missing error handling
* inaccessible UI
* unnecessary re-renders
* missing backend support
* inefficient API calls
* poor scalability

Provide improvements.

Never silently ignore issues.

---

# PHASE 5 — Suggest Better User Experience

If you discover opportunities to improve the Home Page:

Do NOT directly implement them.

Instead create a section

## Suggested Improvements

For every suggestion include:

Feature Name

Why it improves UX

How difficult it is

Backend impact

Frontend impact

Priority

Estimated implementation time

Expected business value

---

# Example

Smart Feed Refresh

Instead of manually refreshing the feed,

automatically refresh only when new content exists.

Benefits

* lower API usage
* faster UI
* better battery usage
* improved UX

Implementation

* websocket
* polling fallback
* ETag validation

---

# PHASE 6 — Design Backend Architecture

Use modern architecture.

Prefer:

NestJS

TypeScript

PostgreSQL

Prisma

Redis

BullMQ

Supabase Storage

JWT

Refresh Tokens

Socket.IO

WebSockets

OpenAPI

Swagger

Zod

Class Validator

Repository Pattern

Service Pattern

Dependency Injection

Feature Modules

Event Driven Architecture

Clean Architecture

CQRS where appropriate

Avoid overengineering.

---

# PHASE 7 — Backend Folder Structure

Generate an enterprise-grade folder structure.

Explain why every folder exists.

---

# PHASE 8 — Database Design

Create normalized schemas.

Include

Users

Posts

Comments

Likes

Saved Posts

Followers

Following

Notifications

Media

Trips

Destinations

Locations

Hashtags

Mentions

PostViews

SearchHistory

FeedRanking

UserPreferences

TravelInterests

AIRecommendations

TrendingDestinations

---

Each table should include

Primary Keys

Foreign Keys

Indexes

Unique Constraints

Cascade Rules

Soft Deletes

Timestamps

Optimized relations

---

# PHASE 9 — API Design

Create REST APIs.

For every endpoint include

Purpose

Method

Route

Authentication

Request

Response

Validation

Possible errors

Permissions

Rate limits

Caching strategy

Future extensibility

---

# PHASE 10 — Backend Implementation

Generate production-quality code.

Requirements

Clean code

Modular

Reusable

Strong typing

No duplicated logic

Proper validation

Centralized error handling

Consistent responses

Transaction support

Logging

Testing ready

Dependency injection

No placeholder code.

---

# PHASE 11 — Performance Optimization

Automatically include

Redis caching

Cursor pagination

Query optimization

Indexes

Batch queries

Avoid N+1

Lazy loading

Compression

Image optimization

Streaming responses

Connection pooling

Database transactions

Caching invalidation

CDN-ready media URLs

Background processing

---

# PHASE 12 — Security

Implement

JWT

Refresh Tokens

Password hashing

Helmet

CORS

CSRF protection (if needed)

Rate limiting

SQL injection prevention

XSS prevention

Validation

Authorization Guards

Role Guards

Ownership Guards

Input sanitization

Secure cookies where applicable

---

# PHASE 13 — AI Ready Design

Travora will later include an AI Travel Assistant.

Design APIs that are extensible for future AI features including:

Travel planning

Hotel recommendations

Destination suggestions

Smart itinerary generation

Trip memory

Context-aware assistant

Personalized feed ranking

Travel insights

Do not implement AI yet.

Only make the backend extensible.

---

# PHASE 14 — Explain Every Decision

Whenever you make an architectural decision explain

Why this approach

Alternative approaches

Tradeoffs

Scalability impact

Maintainability impact

Performance impact

---

# PHASE 15 — Coding Rules

Never write code before understanding the frontend.

Never invent APIs that the frontend doesn't need unless they provide significant architectural value.

When uncertain:

Explain assumptions.

Never hide assumptions.

Keep the backend production-ready.

---

# Output Order

Always respond in this order:

1. Frontend Analysis

2. Feature Mapping

3. Missing Backend Requirements

4. UX Improvement Suggestions

5. Backend Architecture

6. Folder Structure

7. Database Schema

8. API Design

9. Security

10. Performance

11. Backend Implementation

12. Testing Strategy

13. Future Scalability

14. Summary

---

# Additional Context

Travora is a modern travel-focused social media platform where users can:

* Share travel experiences
* Upload images and videos
* Like, comment, save, and share posts
* Follow travelers
* Discover destinations
* Plan trips
* Receive AI-powered travel recommendations in future versions
* Chat with an AI travel assistant
* Book hotels and flights later
* Explore trending destinations
* Build travel itineraries

The Home Page should be designed with future scalability in mind, supporting tens of millions of users while maintaining clean architecture, high performance, and excellent developer experience.

Begin by analyzing the provided frontend files. Do not generate backend code until the analysis is complete.
