# Quick Start Guide - Authentication Testing

## Prerequisites
- Node.js installed
- Backend API running at `https://propakd.vercel.app`

## Setup (First Time)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration (Optional)
If you want to use a different API URL:

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and update the API URL if needed
NEXT_PUBLIC_API_URL=https://your-custom-api-url.com
```

**Note:** If you don't create `.env.local`, it will automatically use the production API URL.

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Testing Authentication

### Test 1: Registration (Signup)

1. **Navigate to signup page:**
   ```
   http://localhost:3000/signup
   ```

2. **Fill in the form:**
   - Full Name: `John Doe`
   - Email: `john.doe@example.com`
   - Country: Select `United States` (or any country)
   - Referral Code: `TEST123` (optional)
   - Password: `TestPass123`
   - Confirm Password: `TestPass123`
   - Check "I agree to the terms" checkbox

3. **Submit the form**

4. **Expected behavior:**
   - Loading spinner appears
   - Success toast: "Account Created! Please check your email..."
   - Automatically redirected to verify-email page (after 2 seconds)

5. **Verify email page appears:**
   - URL: `/verify-email?email=john.doe@example.com`
   - Shows 6 code input boxes
   - Displays your email address
   - Shows helpful instructions

6. **Enter verification code:**
   - Check your email for 6-digit code
   - For testing: Enter any 6-digit code (e.g., 123456)
   - Code auto-advances to next box
   - Click "Verify email" button

7. **Expected behavior:**
   - Loading toast: "Verifying Code..."
   - Success toast: "Email Verified!"
   - Auto-redirect to login page (after 2.5 seconds)

### Test 2: Email Verification

1. **After signup, you're on verify-email page:**
   ```
   http://localhost:3000/verify-email?email=john.doe@example.com
   ```

2. **Test code input:**
   - Enter: `123456` (any 6 digits for testing)
   - Watch boxes auto-advance
   - Or paste: `123456` (fills all boxes at once)

3. **Test paste functionality:**
   - Click first input box
   - Paste 6-digit code
   - All boxes fill automatically

4. **Test backspace navigation:**
   - Use backspace in empty box
   - Cursor moves to previous box

5. **Submit code:**
   - Click "Verify email" button
   - Success toast appears
   - Redirects to login

6. **Test resend code:**
   - Click "Resend code" button
   - Loading toast: "Sending Code..."
   - Success toast: "Code Sent!"
   - Button shows countdown: "Resend in 60s"
   - After 60s, button re-enables

### Test 3: Login

1. **Navigate to login page:**
   ```
   http://localhost:3000/login
   ```

2. **Fill in the form:**
   - Email: `john.doe@example.com` (use the email from registration)
   - Password: `TestPass123`
   - Check "Remember this device" (optional)

3. **Submit the form**

4. **Expected behavior:**
   - Loading spinner appears
   - Success toast: "Login successful. Redirecting..."
   - Redirected to `/dashboard` after 1.5 seconds

5. **Verify in browser:**
   - DevTools → Application → Local Storage (if "Remember me" checked)
   - DevTools → Application → Session Storage (if "Remember me" unchecked)
   - Check for `auth_token` and `user` keys

### Test 4: Validation Errors

Try these to test client-side validation:

1. **Invalid email:**
   - Email: `notanemail`
   - Should show: "Use a valid email address"

2. **Weak password:**
   - Password: `weak`
   - Should show: "Mix upper, lower, numbers and make it at least 8 characters"

3. **Mismatched passwords:**
   - Password: `TestPass123`
   - Confirm: `TestPass456`
   - Should show: "That confirmation does not match"

4. **Empty fields:**
   - Leave any required field empty
   - Should show field-specific error messages

### Test 5: Rate Limiting

1. **Go to login page:**
   ```
   http://localhost:3000/login
   ```

2. **Enter wrong password 5 times:**
   - Email: `test@example.com`
   - Password: `WrongPassword123`
   - Click submit 5 times

3. **Expected behavior:**
   - After 5 attempts, should show:
     "Too many failed attempts. Please try again in 15 minutes."
   - Further login attempts are blocked

4. **To reset:**
   - Open DevTools → Application → Local Storage
   - Delete the `login_attempts` key
   - Or wait 15 minutes

### Test 6: Backend API Errors

Test how the app handles backend errors:

1. **Disconnect internet:**
   - Try to login/signup
   - Should show: "Network error occurred"

2. **Invalid credentials:**
   - Email: `test@example.com`
   - Password: `WrongPassword123`
   - Should show: "Invalid email or password"

## Debugging

### Check API Requests

**In Browser DevTools:**
1. Open Network tab (F12)
2. Filter by "Fetch/XHR"
3. Perform login/signup
4. Click on the request to see:
   - Request URL
   - Request Headers
   - Request Payload
   - Response

**Registration Request:**
```
POST https://propakd.vercel.app/auth/register
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "TestPass123",
  "name": "John Doe",
  "country": "United States",
  "phone_no": "",
  "address": "",
  "referral_code": "TEST123"
}
```

**Login Request:**
```
POST https://propakd.vercel.app/auth/signin
Content-Type: multipart/form-data

FormData:
username: john@example.com
password: TestPass123
```

### Check Console Logs

**Development Mode Only:**
- Open Console (F12)
- Look for sanitized error logs
- Sensitive data (passwords, tokens) are hidden

### Check Stored Data

**Local Storage:**
```javascript
// In DevTools Console
localStorage.getItem('auth_token')
localStorage.getItem('user')
localStorage.getItem('login_attempts')
```

**Session Storage:**
```javascript
// In DevTools Console
sessionStorage.getItem('auth_token')
sessionStorage.getItem('user')
```

## Common Issues

### Issue: "Network error occurred"

**Possible causes:**
- Backend API is down
- No internet connection
- CORS issues
- Wrong API URL

**Solutions:**
1. Check backend is running
2. Verify API URL in `.env.local` or code
3. Check browser console for CORS errors
4. Test API directly with Postman/curl

### Issue: "Failed to sign up"

**Possible causes:**
- Email already registered
- Backend validation failed
- Missing required fields

**Solutions:**
1. Try different email
2. Check backend error message in Network tab
3. Verify all required fields are filled

### Issue: Token not being stored

**Possible causes:**
- Browser privacy settings
- Private/Incognito mode
- Storage quota exceeded

**Solutions:**
1. Check browser storage settings
2. Use regular browsing mode
3. Clear old data from localStorage

### Issue: Redirects not working

**Possible causes:**
- Router not configured
- Dashboard route doesn't exist

**Solutions:**
1. Check `/dashboard` route exists
2. Verify `next/navigation` is working
3. Check console for errors

## Testing Backend API Directly

### Using curl

**Registration:**
```bash
curl -X POST https://propakd.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User",
    "country": "United States",
    "phone_no": "",
    "address": "",
    "referral_code": ""
  }'
```

**Login:**
```bash
curl -X POST https://propakd.vercel.app/auth/signin \
  -F "username=test@example.com" \
  -F "password=TestPass123"
```

### Using Postman

1. **Registration:**
   - Method: POST
   - URL: `https://propakd.vercel.app/auth/register`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "TestPass123",
       "name": "Test User",
       "country": "United States",
       "phone_no": "",
       "address": "",
       "referral_code": ""
     }
     ```

2. **Login:**
   - Method: POST
   - URL: `https://propakd.vercel.app/auth/signin`
   - Body: form-data
     - username: test@example.com
     - password: TestPass123

## Production Deployment

### Before deploying:

1. **Set environment variables on hosting platform:**
   ```
   NEXT_PUBLIC_API_URL=https://propakd.vercel.app
   NODE_ENV=production
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Test the production build locally:**
   ```bash
   npm start
   ```

4. **Verify HTTPS:**
   - Ensure both frontend and backend use HTTPS
   - HTTP will not work properly in production

## Next Steps

After successful authentication testing:

1. ✅ Implement dashboard page
2. ✅ Add logout functionality
3. ✅ Implement protected routes
4. ✅ Add password reset flow
5. ✅ Add email verification (if required)
6. ✅ Implement token refresh
7. ✅ Add user profile management

## Support

- Documentation: See `docs/AUTHENTICATION.md`
- Implementation Details: See `docs/IMPLEMENTATION_SUMMARY.md`
- Issues: Contact support@fxgenz.com

---

**Last Updated:** January 30, 2026
**Status:** Ready for Testing ✅
