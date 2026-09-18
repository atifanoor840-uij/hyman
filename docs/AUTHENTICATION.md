# Authentication System Documentation

## Overview

This document describes the authentication system implemented for the GenzProp application, including security features and best practices.

## Security Features

### 1. **Input Sanitization**
- All user inputs are sanitized to prevent XSS attacks
- HTML tags and special characters are stripped from inputs
- Email addresses are validated using regex patterns
- Password strength is enforced (8+ characters, uppercase, lowercase, numbers)

### 2. **Rate Limiting**
- Client-side rate limiting prevents brute force attacks
- Maximum 5 failed login attempts per email
- 15-minute lockout period after exceeding limit
- Attempts are tracked in localStorage

### 3. **Secure Token Storage**
- JWT tokens are stored in localStorage (remember me) or sessionStorage (session only)
- Token validation checks format and length
- Tokens are automatically included in API requests via Authorization header
- Sensitive data is never logged in production

### 4. **Password Security**
- Strong password requirements enforced
- Passwords are never logged or exposed in error messages
- Passwords are sent only over HTTPS
- Client-side validation before server submission

### 5. **API Communication**
- All API calls use HTTPS
- CORS is properly configured (credentials: 'omit')
- Content-Type headers are set appropriately
- Error messages are sanitized to prevent information leakage

### 6. **Data Privacy**
- User data is stored securely in browser storage
- Sensitive fields are redacted in development logs
- Clear authentication data on logout
- No cookies used (prevents CSRF attacks)

## API Endpoints

### Registration
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "country": "United States",
  "phone_no": "",
  "address": "",
  "referral_code": "ABC123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "message": "Registration successful"
}
```

### Login
**Endpoint:** `POST /auth/signin`

**Request Body (FormData):**
- `username`: user email
- `password`: user password

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "access_token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Authentication Utilities

### Core Functions

#### `sanitizeInput(input: string): string`
Removes HTML tags and special characters from user input.

#### `isValidEmail(email: string): boolean`
Validates email format using regex.

#### `isStrongPassword(password: string): boolean`
Checks password meets security requirements.

#### `setAuthToken(token: string, remember: boolean): void`
Stores authentication token securely.

#### `getAuthToken(): string | null`
Retrieves stored authentication token.

#### `clearAuth(): void`
Removes all authentication data (logout).

#### `trackLoginAttempt(email: string): boolean`
Tracks failed login attempts for rate limiting.

#### `clearLoginAttempts(email: string): void`
Clears failed login attempts (called on successful login).

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NODE_ENV=production
```

## Best Practices

### For Developers

1. **Never commit sensitive data**
   - Keep `.env.local` out of version control
   - Use `.env.local.example` for templates

2. **Validate all inputs**
   - Use provided utility functions
   - Validate on both client and server

3. **Handle errors gracefully**
   - Don't expose sensitive error details to users
   - Log errors appropriately in development

4. **Keep dependencies updated**
   - Regular security audits with `npm audit`
   - Update packages promptly

5. **Test authentication flows**
   - Test rate limiting
   - Test error scenarios
   - Verify token storage and retrieval

### For Users

1. **Use strong passwords**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, and numbers

2. **Enable "Remember Me" carefully**
   - Only on trusted devices
   - Logout when using shared computers

3. **Protect your account**
   - Never share credentials
   - Use unique passwords
   - Keep referral codes private

## Troubleshooting

### Login Issues

**Problem:** "Too many failed attempts"
- **Solution:** Wait 15 minutes or clear browser localStorage

**Problem:** "Invalid email or password"
- **Solution:** Check credentials, ensure caps lock is off, try password reset

**Problem:** "Network error occurred"
- **Solution:** Check internet connection, verify API URL is correct

### Registration Issues

**Problem:** "Email already exists"
- **Solution:** Use different email or try logging in

**Problem:** "Password too weak"
- **Solution:** Use stronger password with mixed characters

## Security Considerations

### HTTPS Only
All authentication must occur over HTTPS in production. The application will not function properly over HTTP.

### Token Expiration
Tokens may expire after a certain period. Implement token refresh logic if needed.

### Cross-Site Scripting (XSS)
All user inputs are sanitized to prevent XSS attacks. Never use `dangerouslySetInnerHTML` with user data.

### Cross-Site Request Forgery (CSRF)
Not using cookies prevents CSRF attacks. If cookies are added later, implement CSRF tokens.

### Man-in-the-Middle (MITM)
HTTPS encryption prevents MITM attacks. Ensure valid SSL certificates.

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Social login (OAuth)
- [ ] Token refresh mechanism
- [ ] Biometric authentication
- [ ] Session management dashboard
- [ ] Activity logs and alerts

## Support

For authentication issues or security concerns, contact:
- Support: helpdesk@genzprop.com
- Security: security@GenzProp.com

## License

Proprietary - GenzProp © 2026
