# Code Review: Story 1.6 - Notification Context & Toast System

**Review Date:** 2025-01-XX  
**Reviewer:** Developer Agent (Amelia)  
**Story:** 1.6-notification-context-toast-system  
**Status:** ⚠️ **Needs Reimplementation**

---

## Executive Summary

Story 1.6 has been **partially implemented** but does **not meet the acceptance criteria**. The current implementation uses localStorage instead of API endpoints, lacks API integration, and does not follow the story requirements for backend communication.

**Overall Assessment:** ⚠️ **Incomplete - Missing API Integration**

---

## Critical Issues Found

### 1. **Missing API Integration** ⚠️ CRITICAL

**Story Requirement:**
- AC1: Notifications created via `/api/notifications` endpoint
- AC2: Notifications fetched from `/api/notifications`
- AC2: Mark as read via `/api/notifications/:id/read`
- AC4: Notifications fetched from API on load

**Current Implementation:**
- ❌ Uses localStorage for storage (`miners_hub_notifications`)
- ❌ No API client for notifications (`lib/api/notifications.ts` does not exist)
- ❌ No API calls to fetch notifications
- ❌ No API calls to mark as read
- ❌ No API calls to create notifications

**Files Affected:**
- `contexts/NotificationContext.tsx` - Uses localStorage instead of API
- Missing: `lib/api/notifications.ts` - API client not created

**Impact:** High - Core functionality missing, does not meet acceptance criteria

---

### 2. **Missing Toast Library** ⚠️ HIGH PRIORITY

**Story Requirement:**
- Task 1: Install sonner package (recommended replacement for deprecated toast)
- Task 1: Add Toaster component to root layout
- Task 1: Ensure ARIA accessibility (sonner handles this)

**Current Implementation:**
- ❌ No sonner package installed
- ❌ Custom `NotificationToast` component instead of sonner
- ❌ No Toaster component in root layout
- ✅ Custom toast has basic ARIA support (but not via sonner)

**Files Affected:**
- `components/NotificationToast.tsx` - Custom implementation instead of sonner
- `app/layout.tsx` - No Toaster component
- Missing: sonner package installation

**Impact:** Medium - Works but doesn't follow story requirements

---

### 3. **No Authentication Integration** ⚠️ HIGH PRIORITY

**Story Requirement:**
- AC4: Notifications fetched on app load (should use authenticated API)
- Task 6: Hide notification center when not authenticated

**Current Implementation:**
- ❌ No authentication check before fetching notifications
- ❌ No use of auth token in API calls (no API calls exist)
- ✅ Notification center visibility handled in Header (but no auth check for API)

**Files Affected:**
- `contexts/NotificationContext.tsx` - No auth integration
- `components/Header.tsx` - Shows notification center regardless of auth state

**Impact:** High - Security and functionality issue

---

### 4. **Missing Loading and Error States** ⚠️ MEDIUM PRIORITY

**Story Requirement:**
- AC4: Loading and error states are handled
- Task 2: Add loading and error states to NotificationContext

**Current Implementation:**
- ❌ No loading state in NotificationContext
- ❌ No error state in NotificationContext
- ❌ No error handling for API calls (no API calls exist)

**Files Affected:**
- `contexts/NotificationContext.tsx` - Missing loading/error states

**Impact:** Medium - Poor UX without loading/error handling

---

### 5. **No Real-time Updates** ⚠️ LOW PRIORITY (Optional)

**Story Requirement:**
- AC5: Real-time updates via Supabase real-time subscriptions (Optional)

**Current Implementation:**
- ❌ No Supabase real-time subscriptions
- ✅ Marked as optional in story, so acceptable

**Impact:** Low - Optional feature, acceptable to skip

---

## Acceptance Criteria Verification

### AC1: Toast Notifications ⚠️ PARTIAL
- ✅ Toast messages appear with appropriate styling
- ❌ Notifications NOT created via `/api/notifications` endpoint (uses localStorage)
- ✅ Notifications stored in NotificationContext
- ⚠️ Toast messages have basic accessibility (but not via sonner as required)

**Status:** ⚠️ **Partially Met** - Missing API integration

### AC2: Notification Center ⚠️ PARTIAL
- ❌ Notifications NOT fetched from `/api/notifications` (uses localStorage)
- ✅ List of all notifications displayed
- ❌ Mark as read NOT via `/api/notifications/:id/read` (uses localStorage)
- ✅ Unread count updates accordingly

**Status:** ⚠️ **Partially Met** - Missing API integration

### AC3: Unread Badge ✅ MET
- ✅ Unread count badge updates in header
- ✅ Badge shows correct count of unread notifications
- ✅ Badge visible only when there are unread notifications

**Status:** ✅ **Fully Met**

### AC4: Notification Loading ❌ NOT MET
- ❌ Notifications NOT fetched from API on load (uses localStorage)
- ✅ Unread count displayed in header badge
- ❌ Loading and error states NOT handled

**Status:** ❌ **Not Met** - Missing API integration and loading states

### AC5: Real-time Updates ⚠️ OPTIONAL
- ❌ Real-time updates NOT implemented
- ✅ Marked as optional, acceptable to skip

**Status:** ⚠️ **Optional - Not Implemented**

---

## Code Quality Issues

### 1. **Inconsistent with Story Requirements**

**Issue:** Implementation uses localStorage instead of API endpoints as specified in the story.

**Current Code:**
```typescript
// contexts/NotificationContext.tsx
useEffect(() => {
  try {
    const storedNotifications = localStorage.getItem('miners_hub_notifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  } catch (error) {
    console.error("Failed to load notifications:", error);
  }
}, []);
```

**Expected:** API calls to `/api/notifications` endpoint

---

### 2. **Missing API Client**

**Issue:** No API client file exists for notifications.

**Expected File:** `lib/api/notifications.ts` (similar to `lib/api/auth.ts`)

**Expected Structure:**
```typescript
// lib/api/notifications.ts
export async function getNotifications(): Promise<Notification[]>
export async function createNotification(data: CreateNotificationRequest): Promise<Notification>
export async function markAsRead(id: string): Promise<void>
export async function markAllAsRead(): Promise<void>
export async function getUnreadCount(): Promise<number>
```

---

### 3. **No Authentication Integration**

**Issue:** NotificationContext doesn't check authentication state or use auth tokens.

**Expected:**
- Check if user is authenticated before fetching notifications
- Use auth token in API requests
- Handle 401/403 responses appropriately

---

### 4. **Missing Loading States**

**Issue:** No loading indicators while fetching notifications.

**Expected:**
```typescript
interface NotificationContextType {
  // ... existing
  isLoading: boolean;
  error: string | null;
}
```

---

### 5. **Custom Toast Instead of Sonner**

**Issue:** Story requires sonner package, but custom NotificationToast is used.

**Current:** Custom `NotificationToast` component
**Expected:** sonner toast library with Toaster in root layout

---

## Positive Aspects ✅

1. **Good UI Implementation:**
   - NotificationCenter component is well-designed
   - Toast animations and styling are good
   - Relative time formatting works well

2. **Proper Context Pattern:**
   - Follows React Context pattern correctly
   - Good separation of concerns

3. **Type Safety:**
   - Proper TypeScript types
   - Notification interface matches requirements

4. **Header Integration:**
   - Notification badge properly integrated
   - Notification center properly connected

---

## Recommendations

### Must Fix (Critical):

1. **Create API Client** (`lib/api/notifications.ts`):
   - Implement all required endpoints
   - Use auth token from AuthContext
   - Handle errors appropriately
   - Follow pattern from `lib/api/auth.ts`

2. **Update NotificationContext**:
   - Remove localStorage usage
   - Add API integration
   - Add loading and error states
   - Fetch notifications on mount (if authenticated)
   - Use API calls for mark as read

3. **Add Authentication Integration**:
   - Check auth state before fetching
   - Use auth token in API requests
   - Handle 401/403 responses

### Should Fix (Important):

4. **Install Sonner Package**:
   - Install sonner: `npm install sonner`
   - Add Toaster to root layout
   - Replace custom NotificationToast with sonner
   - Update NotificationContext to use sonner

5. **Add Loading States**:
   - Add `isLoading` to context
   - Show loading indicator in NotificationCenter
   - Handle loading during initial fetch

6. **Add Error Handling**:
   - Add `error` state to context
   - Display error messages
   - Handle network errors gracefully

### Nice to Have (Optional):

7. **Real-time Subscriptions**:
   - Set up Supabase real-time subscriptions
   - Handle new notification events
   - Update context on real-time events

---

## Implementation Checklist

### Required Changes:

- [ ] Create `lib/api/notifications.ts` with all API functions
- [ ] Update `NotificationContext` to use API instead of localStorage
- [ ] Add loading state to NotificationContext
- [ ] Add error state to NotificationContext
- [ ] Integrate authentication (check auth, use token)
- [ ] Fetch notifications on mount (if authenticated)
- [ ] Update markAsRead to use API
- [ ] Update markAllAsRead to use API
- [ ] Update addNotification to use API (if creating server-side)

### Optional Changes:

- [ ] Install sonner package
- [ ] Replace custom toast with sonner
- [ ] Add Toaster to root layout
- [ ] Add real-time subscriptions

---

## Files That Need Changes

**Create:**
- `lib/api/notifications.ts` - API client for notifications

**Modify:**
- `contexts/NotificationContext.tsx` - Remove localStorage, add API integration
- `app/layout.tsx` - Add Toaster component (if using sonner)
- `components/NotificationCenter.tsx` - Add loading/error states

**Optional:**
- `components/NotificationToast.tsx` - Replace with sonner (or remove if using sonner)
- `package.json` - Add sonner dependency

---

## Testing Recommendations

### Manual Testing Checklist:

- [ ] Fetch notifications from API on app load
- [ ] Create notification via API
- [ ] Mark notification as read via API
- [ ] Mark all as read via API
- [ ] Loading state during fetch
- [ ] Error handling for API failures
- [ ] Authentication integration (only fetch when authenticated)
- [ ] Toast notifications appear correctly
- [ ] Unread count updates correctly
- [ ] Notification center displays correctly

### Edge Cases:

- [ ] Network failure during fetch
- [ ] 401/403 responses (unauthorized)
- [ ] Empty notification list
- [ ] Concurrent mark as read operations
- [ ] Multiple tabs with same auth state

---

## Comparison with Story 1.5

**Story 1.5 (Auth) - ✅ Complete:**
- Has API client (`lib/api/auth.ts`)
- Uses API endpoints
- Has authentication integration
- Has loading/error states

**Story 1.6 (Notifications) - ⚠️ Incomplete:**
- Missing API client
- Uses localStorage instead of API
- No authentication integration
- Missing loading/error states

**Recommendation:** Follow the same pattern as Story 1.5 for consistency.

---

## Summary

The notification system has a **good UI implementation** but is **missing critical backend integration**. The current implementation:

✅ **Works:** UI components, toast display, notification center
❌ **Missing:** API integration, authentication, loading/error states
⚠️ **Inconsistent:** Uses localStorage instead of API as specified

**Priority:** High - Needs reimplementation to meet acceptance criteria

**Estimated Effort:** Medium - Similar to Story 1.5 reimplementation

---

**Review Status:** ⚠️ **Needs Reimplementation** - API Integration Required

