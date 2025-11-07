# Story 1.6: Notification Context & Toast System

Status: done

## Story

As a **user**,
I want **to receive notifications and see toast messages**,
So that **I am informed about important actions and updates**.

## Acceptance Criteria

1. **AC1: Toast Notifications**
   - When an action triggers a notification, a toast message appears with appropriate styling
   - The notification is created via `/api/notifications` endpoint
   - The notification is stored in NotificationContext
   - Toast messages are accessible (ARIA live regions)

2. **AC2: Notification Center**
   - When I click the notification center icon, notifications are fetched from `/api/notifications`
   - I see a list of all notifications
   - I can mark notifications as read (via `/api/notifications/:id/read`)
   - Unread count updates accordingly

3. **AC3: Unread Badge**
   - Unread count badge updates in header (fetched from API)
   - Badge shows correct count of unread notifications
   - Badge is visible only when there are unread notifications

4. **AC4: Notification Loading**
   - When I open the application, notifications are fetched from API on load
   - Unread count is displayed in header badge
   - Loading and error states are handled

5. **AC5: Real-time Updates (Optional)**
   - Real-time updates are received via Supabase real-time subscriptions
   - New notifications appear without page refresh

## Tasks / Subtasks

- [x] Task 1: Install Toast Component (AC: 1)
  - [x] Install sonner package (recommended replacement for deprecated toast)
  - [x] Add Toaster component to root layout
  - [x] Ensure ARIA accessibility (sonner handles this)

- [x] Task 2: Create NotificationContext (AC: 1, 2, 3, 4)
  - [x] Create NotificationContext with TypeScript types
  - [x] Define Notification type matching backend entity
  - [x] Create NotificationProvider component
  - [x] Create useNotifications hook
  - [x] Add loading and error states

- [x] Task 3: Create Notification API Client (AC: 1, 2, 4)
  - [x] Create API functions for fetching notifications
  - [x] Create API function for marking as read
  - [x] Create API function for marking all as read
  - [x] Create API function for creating notifications
  - [x] Handle errors appropriately

- [x] Task 4: Implement Toast System (AC: 1)
  - [x] Integrate sonner toast with NotificationContext
  - [x] Add toast variants (success, error, info, warning)
  - [x] Show toast when notifications are created
  - [x] Ensure proper styling and positioning

- [x] Task 5: Create Notification Center UI (AC: 2)
  - [x] Create notification center dropdown
  - [x] Display list of notifications (unread and read)
  - [x] Add mark-as-read functionality
  - [x] Add mark-all-as-read functionality
  - [x] Add empty state
  - [x] Add loading state
  - [x] Add relative time formatting

- [x] Task 6: Integrate with Header (AC: 3, 4)
  - [x] Update notification badge to show unread count
  - [x] Connect notification center to header button
  - [x] Fetch notifications on app load
  - [x] Update badge when notifications change
  - [x] Hide notification center when not authenticated

- [ ] Task 7: Add Real-time Subscriptions (AC: 5) - Optional
  - [ ] Set up Supabase real-time subscription
  - [ ] Handle new notification events
  - [ ] Update context on real-time events
  - Note: Marked as optional enhancement, can be added later

## Dev Notes

### Architecture Alignment

This story implements the notification system as specified in the architecture document:
- **Context Pattern:** React Context API for global state (similar to AuthContext and ThemeContext)
- **Toast System:** shadcn/ui toast component for user feedback
- **API Integration:** Uses minimal API client (will be refactored in Story 1.7)

### Implementation Patterns

- **Context Pattern:** Follow AuthContext pattern for consistency
- **Toast Component:** Use shadcn/ui toast (Radix UI based)
- **API Calls:** Create minimal API client for notification endpoints
- **Real-time:** Optional Supabase real-time subscriptions

### API Endpoints

- `GET /api/notifications` - Get all notifications for current user
- `POST /api/notifications` - Create new notification
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `GET /api/notifications/unread-count` - Get unread count (optional)

### Testing Standards

- Manual verification: Toast messages appear correctly
- Manual verification: Notification center displays notifications
- Manual verification: Mark as read functionality works
- Manual verification: Unread badge updates correctly
- No automated tests required for this story (will be covered in Story 1.11)

### Project Structure Notes

**Expected Directory Structure:**
```
miners-hub-frontend/
├── components/
│   ├── ui/
│   │   └── toast.tsx (shadcn/ui component)
│   └── NotificationCenter.tsx
├── lib/
│   ├── contexts/
│   │   └── NotificationContext.tsx
│   └── api/
│       └── notifications.ts (minimal API client)
```

**Alignment:** Matches AuthContext structure and follows existing patterns

### References

- [Source: docs/epics.md#Story-1.6] - Story acceptance criteria and technical notes
- [Source: docs/architecture.md] - Architecture patterns
- [Source: miners-hub-frontend/lib/contexts/AuthContext.tsx] - Context pattern reference
- [Source: miners-hub-backend/src/entities/notification.entity.ts] - Backend entity structure

### Learnings from Previous Stories

**From Story 1.5:**
- AuthContext pattern established
- Minimal API client pattern created
- Error handling patterns established

**Note on Story 1.7 Dependency:**
- Story 1.7 (API Client) is a prerequisite, but we'll create a minimal API client for notification endpoints
- This will be refactored when Story 1.7 is implemented
- Using fetch directly for now to avoid circular dependencies

## Dev Agent Record

### Context Reference

- `docs/stories/1-6-notification-context-toast-system.context.xml` (to be generated)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

**Implementation Notes:**
(To be filled during implementation)

### Completion Notes List

**Implementation Completed (2025-01-XX):**
- ✅ Installed sonner package for toast notifications (replacement for deprecated shadcn/ui toast)
- ✅ Created NotificationContext with full TypeScript types
- ✅ Created notification API client with all CRUD operations
- ✅ Integrated toast system with notification creation
- ✅ Created NotificationCenter component with dropdown UI
- ✅ Integrated with Header component (desktop and mobile)
- ✅ Added unread count badge that updates dynamically
- ✅ Added relative time formatting using date-fns
- ✅ Handles authentication state (hides when not authenticated)

**Optional Enhancement Not Implemented:**
- Real-time subscriptions via Supabase (marked as optional, can be added later)

### File List

**Created:**
- `lib/contexts/NotificationContext.tsx` - Notification context and provider
- `lib/api/notifications.ts` - Minimal API client for notifications
- `components/NotificationCenter.tsx` - Notification center dropdown UI

**Modified:**
- `app/layout.tsx` - Added NotificationProvider and Toaster
- `components/Header.tsx` - Replaced hardcoded notification button with NotificationCenter

---

## Senior Developer Review (AI)

**Review Date:** 2025-01-XX  
**Status:** ✅ **Approved**

**Summary:**
All acceptance criteria have been met. The notification system is fully implemented with:
- Toast notifications using sonner (modern replacement for deprecated shadcn/ui toast)
- Complete NotificationContext with TypeScript types
- Notification Center UI with mark-as-read functionality
- Dynamic unread count badge in header
- Proper integration with authentication state
- Error handling and loading states

**Implementation Highlights:**
- Used sonner instead of deprecated shadcn/ui toast component
- Follows AuthContext pattern for consistency
- Proper separation of concerns (API client, context, UI)
- Handles authentication state gracefully
- Relative time formatting for better UX

**Optional Enhancement:**
- Real-time subscriptions via Supabase marked as optional (can be added in future story)

**Story Status:** ✅ **Complete and Production Ready**

