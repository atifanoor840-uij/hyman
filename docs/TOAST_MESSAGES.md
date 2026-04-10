# Professional Toast Messages Guide

## Toast Component Features

### Visual Enhancements
✅ Animated slide-in/slide-out transitions
✅ Progress bar showing time remaining
✅ Professional icons for each message type
✅ Smooth animations and backdrop blur
✅ Auto-dismiss with manual close option
✅ Loading state with spinning icon

### Message Types
- **Success** - Green theme with checkmark icon
- **Error** - Red theme with alert icon
- **Info** - Blue theme with info icon
- **Loading** - Blue theme with spinning loader (no auto-dismiss)

---

## Signup Page Toast Messages

### 1. Loading State
**When:** Form submission starts
```
Title: "Creating Account"
Message: "Please wait while we set up your GenzProp account..."
Type: Loading (spinning icon, no auto-dismiss)
```

### 2. Successful Registration
**When:** Account created successfully
```
Title: "Welcome to GenzProp!"
Message: "Your account has been created successfully. You can now access your trading dashboard."
Type: Success
Duration: 6 seconds
```

### 3. Email Already Exists
**When:** User tries to register with existing email
```
Title: "Signup Failed"
Message: "An account with this email already exists. Please try logging in instead."
Type: Error
Duration: 5 seconds
```

### 4. Validation Error (422)
**When:** Backend rejects invalid data
```
Title: "Signup Failed"
Message: "Please check your information and try again."
Type: Error
Duration: 5 seconds
```

### 5. Generic Error
**When:** Unexpected backend error
```
Title: "Signup Failed"
Message: "Unable to create your account. Please try again."
Type: Error
Duration: 5 seconds
```

### 6. Network Error
**When:** Connection issues or server unreachable
```
Title: "Connection Error"
Message: "Unable to connect to the server. Please check your internet connection and try again."
Type: Error
Duration: 5 seconds
```

---

## Login Page Toast Messages

### 1. Loading State
**When:** Login form submission starts
```
Title: "Signing In"
Message: "Verifying your credentials..."
Type: Loading (spinning icon, no auto-dismiss)
```

### 2. Successful Login
**When:** Login successful
```
Title: "Welcome Back!"
Message: "Login successful. Taking you to your trading dashboard..."
Type: Success
Duration: 6 seconds
Action: Redirects to /dashboard after 2 seconds
```

### 3. Invalid Credentials (401/400)
**When:** Wrong email or password
```
Title: "Login Failed"
Message: "Invalid email or password. Please check your credentials and try again."
Type: Error
Duration: 5 seconds
```

### 4. Account Locked (Rate Limiting)
**When:** Too many failed attempts (5+)
```
Title: "Account Locked"
Message: "Too many failed login attempts. Please try again in X minutes."
Type: Error
Duration: 5 seconds
```

### 5. Too Many Requests (429)
**When:** Backend rate limiting triggered
```
Title: "Too Many Attempts"
Message: "You have made too many login attempts. Please wait a few minutes and try again."
Type: Error
Duration: 5 seconds
```

### 6. Account Suspended (403)
**When:** Account is suspended
```
Title: "Account Suspended"
Message: "Your account has been suspended. Please contact support for assistance."
Type: Error
Duration: 5 seconds
```

### 7. Invalid Input (422)
**When:** Malformed email or password
```
Title: "Invalid Input"
Message: "Please check your email and password format."
Type: Error
Duration: 5 seconds
```

### 8. Network Error
**When:** Connection issues
```
Title: "Connection Error"
Message: "Unable to connect to the server. Please check your internet connection and try again."
Type: Error
Duration: 5 seconds
```

---

## Visual Design Specifications

### Success Toast
- **Border:** Emerald (green) with 40% opacity
- **Background:** White with backdrop blur
- **Icon:** Green checkmark (CheckCircle2)
- **Progress Bar:** Emerald
- **Shadow:** Subtle emerald glow

### Error Toast
- **Border:** Red with 40% opacity
- **Background:** White with backdrop blur
- **Icon:** Red alert circle (AlertCircle)
- **Progress Bar:** Red
- **Shadow:** Subtle red glow

### Info Toast
- **Border:** Blue with 40% opacity
- **Background:** White with backdrop blur
- **Icon:** Blue info circle (Info)
- **Progress Bar:** Blue
- **Shadow:** Subtle blue glow

### Loading Toast
- **Border:** Blue with 40% opacity
- **Background:** White with backdrop blur
- **Icon:** Blue spinning loader (Loader2)
- **Progress Bar:** None (doesn't auto-dismiss)
- **Shadow:** Subtle blue glow
- **Close Button:** Hidden (no manual dismiss)

---

## Animation Details

### Slide In
- Duration: 400ms
- Easing: cubic-bezier(0.16, 1, 0.3, 1)
- Effect: Slides from right with slight scale

### Slide Out
- Duration: 300ms
- Easing: cubic-bezier(0.4, 0, 1, 1)
- Effect: Slides to right with slight scale

### Progress Bar
- Duration: Matches toast duration
- Easing: Linear
- Effect: Width decreases from 100% to 0%

### Loading Spinner
- Continuous rotation
- Smooth infinite animation

---

## Implementation Example

```tsx
// Show loading toast
setToastType('loading');
setToastTitle('Processing');
setToastMessage('Please wait...');

// After API call succeeds
setToastType('success');
setToastTitle('Success!');
setToastMessage('Operation completed successfully.');

// After API call fails
setToastType('error');
setToastTitle('Error');
setToastMessage('Something went wrong. Please try again.');
```

---

## Toast Component Props

```typescript
interface ToastProps {
  message: string | null;        // Main message text (required)
  type?: 'success' | 'error' | 'info' | 'loading';  // Toast type (default: 'success')
  title?: string;                // Optional bold title above message
  duration?: number;             // Auto-dismiss time in ms (default: 5000)
  onClose: () => void;          // Callback when toast closes
}
```

---

## Best Practices

### DO ✅
- Use loading state for async operations
- Provide clear, actionable messages
- Use appropriate titles for context
- Keep messages concise (under 100 characters)
- Use proper grammar and punctuation
- Provide next steps when applicable

### DON'T ❌
- Show multiple toasts simultaneously
- Use technical error messages
- Make messages too long
- Dismiss success messages too quickly
- Hide important error details
- Use generic messages like "Error occurred"

---

## Accessibility

- ✅ ARIA labels on close buttons
- ✅ Keyboard accessible (can close with click)
- ✅ High contrast text for readability
- ✅ Clear visual indicators (icons + colors)
- ✅ Non-color-dependent messaging (icons help)
- ✅ Appropriate timing for screen readers

---

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)
- ✅ Reduced motion support (respects user preferences)

---

## Future Enhancements

- [ ] Stack multiple toasts
- [ ] Action buttons in toasts
- [ ] Sound effects (optional)
- [ ] Custom positioning
- [ ] Persistent toasts (don't auto-dismiss)
- [ ] Rich content support (images, links)
- [ ] Toast history/log

---

**Last Updated:** January 30, 2026
**Component:** `app/components/Toast.tsx`
