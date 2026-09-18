# Email Verification Flow

## Overview

Professional email verification system that sends a 6-digit code to users after registration to verify their email address before allowing login access.

## User Flow

```
Signup → Email Sent → Verify Email Page → Enter Code → Login
```

### Step-by-Step Process

1. **User Completes Signup**
   - Fills out registration form
   - Submits with name, email, password, country
   - Backend creates account

2. **Verification Email Sent**
   - Backend sends 6-digit code to user's email
   - User sees success toast: "Account Created!"
   - Automatically redirected to verify-email page

3. **Verify Email Page**
   - User receives email with 6-digit code
   - Enters code on verification page
   - Code is validated against backend

4. **Verification Success**
   - Success toast appears
   - Auto-redirect to login page
   - User can now log in

## Features

### ✅ Professional UI
- Clean, modern design matching signup/login pages
- Split-screen layout with info sidebar
- Responsive on all devices
- Smooth animations and transitions

### ✅ 6-Digit Code Input
- Individual input boxes for each digit
- Auto-focus next box on input
- Auto-focus previous box on backspace
- Paste support (full code at once)
- Numeric keyboard on mobile

### ✅ Smart Validations
- Real-time error messages
- Code completeness check
- Backend validation
- Clear error states

### ✅ Resend Functionality
- Resend button with 60-second cooldown
- Loading state while sending
- Success/error toasts
- Countdown timer display

### ✅ Professional Toast Messages
- Loading state: "Verifying Code"
- Success: "Email Verified!"
- Error: "Verification Failed"
- Resend: "Code Sent!"

### ✅ User Experience
- Email displayed prominently
- Helpful instructions sidebar
- Auto-redirect after success
- Back to login option
- Code expiry information

## Visual Design

### Verify Email Page Layout

```
┌─────────────────────────────────────────────────────┐
│                  Left Sidebar (Dark)                │
│                                                     │
│  🏢 GenzProp Logo                                     │
│                                                     │
│  📧 Check your email                               │
│                                                     │
│  We've sent a code to:                             │
│  user@example.com                                  │
│                                                     │
│  ✓ Check your inbox                               │
│  ✓ Check spam folder                              │
│  ✓ Valid for 15 minutes                           │
│                                                     │
├─────────────────────────────────────────────────────┤
│                  Right Side (White)                 │
│                                                     │
│  Enter verification code                           │
│  Enter the 6-digit code sent to your email         │
│                                                     │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐           │
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │           │
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘           │
│                                                     │
│  [     Verify email     ]                          │
│                                                     │
│  Didn't receive the code?                          │
│  🔄 Resend code                                    │
│                                                     │
│  ← Back to login                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## API Integration

### Endpoints (To Be Implemented)

#### 1. Verify Email
```typescript
POST /auth/verify-email

Request:
{
  "email": "user@example.com",
  "code": "123456"
}

Response (Success):
{
  "success": true,
  "message": "Email verified successfully"
}

Response (Error):
{
  "success": false,
  "message": "Invalid verification code"
}
```

#### 2. Resend Verification Code
```typescript
POST /auth/resend-code

Request:
{
  "email": "user@example.com"
}

Response (Success):
{
  "success": true,
  "message": "Verification code sent"
}

Response (Error):
{
  "success": false,
  "message": "Failed to send code"
}
```

## Implementation Details

### URL Structure

**Verify Email Page URL:**
```
/verify-email?email=user@example.com
```

The email parameter is passed via URL query string to:
- Display user's email on the page
- Send resend requests to correct address
- Prevent manual navigation without email

### State Management

```typescript
// Code input state
const [code, setCode] = useState(['', '', '', '', '', '']);

// Loading states
const [isSubmitting, setIsSubmitting] = useState(false);
const [isResending, setIsResending] = useState(false);

// Error handling
const [error, setError] = useState<string | null>(null);

// Resend cooldown
const [resendCooldown, setResendCooldown] = useState(0);

// Verification status
const [isVerified, setIsVerified] = useState(false);
```

### Code Input Logic

**Auto-Focus Next Input:**
```typescript
const handleCodeChange = (value: string, index: number) => {
  // Update code array
  const next = [...code];
  next[index] = value;
  setCode(next);
  
  // Auto-focus next input if value entered
  if (value && index < CODE_LENGTH - 1) {
    inputRefs.current[index + 1]?.focus();
  }
};
```

**Backspace Navigation:**
```typescript
const handleKeyDown = (event, index) => {
  if (event.key === 'Backspace' && !code[index] && index > 0) {
    inputRefs.current[index - 1]?.focus();
  }
};
```

**Paste Support:**
```typescript
const handlePaste = (event) => {
  event.preventDefault();
  const pastedData = event.clipboardData.getData('text');
  const digits = pastedData.replace(/\D/g, '').slice(0, 6);
  // Set all digits at once
};
```

### Resend Cooldown

```typescript
// Start 60-second cooldown
setResendCooldown(60);

// Countdown timer
useEffect(() => {
  if (resendCooldown === 0) return;
  
  const interval = setInterval(() => {
    setResendCooldown(prev => prev > 0 ? prev - 1 : 0);
  }, 1000);
  
  return () => clearInterval(interval);
}, [resendCooldown]);
```

## Toast Messages

### Verification Flow

| Action | Title | Message | Type | Duration |
|--------|-------|---------|------|----------|
| **Submitting** | Verifying Code | Please wait while we verify your email address... | Loading | Until complete |
| **Success** | Email Verified! | Your email has been successfully verified. Redirecting to login... | Success | 6s |
| **Invalid Code** | Verification Failed | Invalid verification code. Please check your email and try again. | Error | 5s |
| **Resending** | Sending Code | Sending a new verification code to your email... | Loading | Until complete |
| **Code Sent** | Code Sent! | A new verification code has been sent to your email. Please check your inbox. | Success | 6s |
| **Resend Failed** | Failed to Send | Unable to send verification code. Please try again later. | Error | 5s |

## Security Features

### ✅ Code Validation
- 6-digit numeric code only
- One-time use codes
- Time-limited validity (15 minutes)
- Rate limiting on verification attempts

### ✅ Email Protection
- Email passed via URL query (not exposed in URL history)
- Redirect to signup if no email provided
- Cannot access page without email parameter

### ✅ Resend Protection
- 60-second cooldown between resends
- Invalidates previous codes
- Rate limiting on backend

### ✅ Input Sanitization
- Only numeric input allowed
- Max 6 digits
- No special characters
- Auto-trim whitespace

## User Experience Details

### Helpful Instructions

**Left Sidebar Information:**
1. **Email Confirmation** - Shows exact email address
2. **Check Inbox** - Reminds to check main inbox
3. **Check Spam** - Suggests checking spam/junk folder
4. **Validity Period** - Informs about 15-minute expiration

### Success State

**After Verification:**
```
┌────────────────────────────────────┐
│           ✅                       │
│     Email Verified!                │
│  Redirecting you to login...       │
└────────────────────────────────────┘
```

- Green success box appears
- Check icon animation
- Auto-redirect after 2.5 seconds
- User can manually click "Back to login"

### Error States

**Invalid Code:**
```
┌────────────────────────────────────┐
│  ⚠ The verification code you       │
│     entered is incorrect.          │
│     Please try again.              │
└────────────────────────────────────┘
```

**Expired Code:**
```
┌────────────────────────────────────┐
│  ⚠ This verification code has      │
│     expired. Please request a      │
│     new one.                       │
└────────────────────────────────────┘
```

## Mobile Optimization

### ✅ Responsive Design
- Single column layout on mobile
- Larger tap targets for code inputs
- Numeric keyboard auto-appears
- Smooth scrolling if needed

### ✅ Touch Friendly
- Large code input boxes (56px height)
- Adequate spacing between inputs
- Easy to tap resend button
- Readable text sizes

## Testing Checklist

### Manual Tests

- [ ] Enter valid 6-digit code → Success
- [ ] Enter invalid code → Error message
- [ ] Paste 6-digit code → Auto-fills all boxes
- [ ] Backspace navigation → Moves to previous box
- [ ] Tab through inputs → Works correctly
- [ ] Click resend → Code sent, 60s cooldown starts
- [ ] Wait 60s → Resend button re-enabled
- [ ] Complete verification → Redirects to login
- [ ] Navigate without email param → Redirects to signup
- [ ] Mobile keyboard → Shows numeric keypad

### Edge Cases

- [ ] Paste non-numeric text → Ignores
- [ ] Paste partial code → Fills available boxes
- [ ] Rapid resend clicks → Prevented by cooldown
- [ ] Network error during verification → Error toast
- [ ] Network error during resend → Error toast
- [ ] Leave page and return → State preserved (or reset)
- [ ] Refresh page → State resets, email param persists

## Integration with Signup

### Signup Page Changes

**Before:**
```typescript
// Old: Show complete step
setStep('complete');
```

**After:**
```typescript
// New: Redirect to verify email
router.push(`/verify-email?email=${encodeURIComponent(email)}`);
```

### Flow Diagram

```
┌────────────┐
│   Signup   │
└─────┬──────┘
      │
      ├─> Submit Form
      │
      ├─> Backend Creates Account
      │
      ├─> Backend Sends Email
      │
      ├─> Success Toast
      │
      ├─> Auto-redirect (2s)
      │
┌─────▼────────────┐
│  Verify Email    │
└─────┬────────────┘
      │
      ├─> Enter Code
      │
      ├─> Submit Code
      │
      ├─> Backend Validates
      │
      ├─> Success Toast
      │
      ├─> Auto-redirect (2.5s)
      │
┌─────▼──────┐
│   Login    │
└────────────┘
```

## Future Enhancements

- [ ] **Magic Link Alternative** - Click link in email instead of code
- [ ] **QR Code Option** - Scan QR from email
- [ ] **SMS Verification** - Send code via SMS as backup
- [ ] **Email Preview** - Show preview of verification email
- [ ] **Code Generator** - Testing tool for developers
- [ ] **Retry Counter** - Show remaining verification attempts
- [ ] **Auto-verify** - Verify automatically if user clicks email link
- [ ] **Remember Device** - Skip verification on trusted devices

## Troubleshooting

### Common Issues

**Issue: Code not received**
- Check spam/junk folder
- Wait 2-3 minutes (email delays)
- Click resend after cooldown
- Verify email address is correct

**Issue: Code invalid**
- Check for typos
- Ensure latest code (old codes expire)
- Request new code
- Check if code expired (15 min limit)

**Issue: Resend button disabled**
- Wait for cooldown to complete
- Shows countdown: "Resend in 45s"
- Will re-enable automatically

**Issue: Page blank/error**
- Ensure email parameter in URL
- Check network connection
- Clear browser cache
- Try different browser

## Files Modified/Created

```
app/
  verify-email/
    page.tsx                 ← Updated with new design
  signup/
    page.tsx                 ← Updated to redirect
lib/
  api/
    auth.ts                  ← Added verify/resend functions
docs/
  EMAIL_VERIFICATION.md      ← This documentation
```

## Support

For issues or questions:
- Check spam folder first
- Wait 2-3 minutes for email delivery
- Use resend button if needed
- Contact: helpdesk@genzprop.com

---

**Last Updated:** January 30, 2026
**Status:** ✅ Frontend Complete, Backend Pending
**Page:** `/verify-email`
