# Dashboard Orders Integration

## Overview

The dashboard automatically fetches and displays user orders from the backend API, showing order IDs in a dropdown selector with full order details.

## Features

### ✅ Automatic Order Fetching
- Fetches orders on dashboard load
- Uses authentication token automatically
- Displays all user orders
- Auto-selects first order

### ✅ Professional Order Selector
- Dropdown with all order IDs
- Shows order details (challenge type, account size)
- Loading state while fetching
- Empty state if no orders
- Smooth animations

### ✅ User Profile Integration
- Displays user name from stored data
- Shows user email
- Dynamic avatar initials
- Synced with login session

## API Endpoint

### Get My Account Orders

**Endpoint:** `GET /orders/my-account`

**Authentication:** Bearer Token (automatically included)

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Response Format:**
```json
{
  "user": {
    "username": "cixom17322",
    "email": "cixom17322@juhxs.com",
    "name": "Jack"
  },
  "total_orders": 1,
  "orders": [
    {
      "order_id": "Genz#19599714",
      "username": "cixom17322",
      "status": "Live Account",
      "account_size": "5000",
      "challenge_type": "Alpha",
      "created_at": "2026-01-30T12:03:39.145298",
      "platform": "MT5",
      "payment_method": "CARD",
      "payment_status": "pending",
      "credentials": {
        "credential_id": 89273,
        "server": "string",
        "platform_login": "string",
        "platform_password": "string",
        "profit_target": 1000
      },
      "stage2_credentials": { ... },
      "live_credentials": { ... }
    }
  ]
}
```

## Visual Implementation

### Order Selector Display

**Closed State:**
```
┌─────────────────────────────────┐
│ Genz#19599714              ▼   │
│ Alpha • $5000                   │
└─────────────────────────────────┘
```

**Open State:**
```
┌─────────────────────────────────┐
│ Genz#19599714                   │ ← Selected
│ Alpha • $5000                   │
├─────────────────────────────────┤
│ Genz#19599715                   │
│ Beta • $10000                   │
├─────────────────────────────────┤
│ Genz#19599716                   │
│ Sigma • $25000                  │
└─────────────────────────────────┘
```

**Loading State:**
```
┌─────────────────────────────────┐
│ ⏳ Loading orders...        ▼  │
└─────────────────────────────────┘
```

**Empty State:**
```
┌─────────────────────────────────┐
│ No orders found             ▼  │
└─────────────────────────────────┘
```

## Technical Implementation

### API Function (lib/api/auth.ts)

```typescript
export interface Order {
  order_id: string;
  username: string;
  status: string;
  account_size: string;
  challenge_type: string;
  created_at: string;
  platform: string;
  payment_method: string;
  payment_status: string;
  credentials: OrderCredentials | null;
  stage2_credentials: OrderCredentials | null;
  live_credentials: OrderCredentials | null;
  // ... other fields
}

export interface MyAccountResponse {
  user: {
    username: string;
    email: string;
    name: string;
  };
  total_orders: number;
  orders: Order[];
}

export async function getMyAccount(): Promise<MyAccountResponse> {
  const response = await apiRequest<MyAccountResponse>('/orders/my-account', {
    method: 'GET',
  });
  return response;
}
```

### Header Component Updates

**State Management:**
```typescript
const [orders, setOrders] = useState<Order[]>([])
const [isLoadingOrders, setIsLoadingOrders] = useState(false)
const [selectedOrderId, setSelectedOrderId] = useState<string>("")
const [userData, setUserData] = useState<{ name: string; email: string } | null>(null)
```

**Fetch Orders:**
```typescript
const fetchOrders = async () => {
  setIsLoadingOrders(true)
  try {
    const response = await getMyAccount()
    setOrders(response.orders || [])
    
    // Auto-select first order
    if (response.orders && response.orders.length > 0) {
      setSelectedOrderId(response.orders[0].order_id)
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    setOrders([])
  } finally {
    setIsLoadingOrders(false)
  }
}
```

**useEffect Hook:**
```typescript
useEffect(() => {
  // Get user data from storage
  const user = getUser()
  if (user) {
    setUserData({
      name: user.name || user.username || 'User',
      email: user.email || ''
    })
  }

  // Fetch orders if order select is enabled
  if (useOrderIdSelect) {
    fetchOrders()
  }
}, [useOrderIdSelect])
```

## Order Data Display

### Information Shown

1. **Order ID** - Primary identifier (e.g., Genz#19599714)
2. **Challenge Type** - Alpha, Beta, or Sigma
3. **Account Size** - Dollar amount (e.g., $5000)
4. **Status** - Current order status
5. **Platform** - Trading platform (e.g., MT5)

### Dropdown Item Format

```typescript
<SelectItem key={order.order_id} value={order.order_id}>
  <div className="flex flex-col">
    <span>{order.order_id}</span>
    <span className="text-xs text-muted-foreground">
      {order.challenge_type} • ${order.account_size}
    </span>
  </div>
</SelectItem>
```

## User Profile Display

### Avatar Initials Logic

```typescript
const getUserInitials = () => {
  if (!userData?.name) return 'U'
  const names = userData.name.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase()
  }
  return userData.name.substring(0, 2).toUpperCase()
}
```

**Examples:**
- "John Doe" → "JD"
- "Jack" → "JA"
- No name → "U"

### Profile Display

```
┌────────────────────┐
│  [JD]  John Doe    │
│        john@e...   │
└────────────────────┘
```

## Authentication Flow

### Token Management

1. **Login** → Token stored in localStorage/sessionStorage
2. **Dashboard Load** → Token retrieved from storage
3. **API Request** → Token automatically included in Authorization header
4. **Response** → Orders displayed in dropdown

### Token Inclusion (Automatic)

The `apiRequest` function in `lib/api/client.ts` automatically includes the token:

```typescript
const token = typeof window !== 'undefined' 
  ? localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  : null;

const config: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  },
};
```

## Error Handling

### No Orders Available

**When:** User has no orders yet

**Display:**
```
┌─────────────────────────────────┐
│ No orders found             ▼  │
└─────────────────────────────────┘

Dropdown opens to show:
"No orders available"
```

### API Error

**When:** Failed to fetch orders (network error, auth error)

**Behavior:**
- Console error logged
- Empty orders array set
- Dropdown shows "No orders found"
- User can try again by refreshing

### Unauthorized (401)

**When:** Token expired or invalid

**Behavior:**
- API error thrown
- User should be redirected to login
- Token cleared from storage

## Usage in Dashboard

### Enable Order Selector

```typescript
<Header
  title="Forex Trading Dashboard"
  description="Monitor your trading performance..."
  useOrderIdSelect  // ← Enable order selector
  actions={...}
/>
```

### Disable Order Selector (Use Search Instead)

```typescript
<Header
  title="Page Title"
  description="Description..."
  // useOrderIdSelect not set (default: false)
  actions={...}
/>
```

## Order Status Types

Based on the API response, possible statuses:

- **Live Account** - Active funded account
- **Stage 2** - Passed stage 1, in stage 2
- **Stage 1** - Initial challenge phase
- **Pending** - Order created, awaiting payment
- **Failed** - Challenge failed
- **Completed** - Challenge completed

## Challenge Types

- **Alpha** - Entry level challenge
- **Beta** - Mid-level challenge
- **Sigma** - Advanced challenge

## Account Sizes

Common sizes from the API:
- $5,000
- $10,000
- $25,000
- $50,000
- $100,000
- $200,000

## Security Considerations

### ✅ Token Protection
- Token automatically included from secure storage
- Never exposed in UI
- Transmitted via HTTPS only

### ✅ User Data Privacy
- User data fetched from authenticated endpoint
- Displayed only to authenticated users
- No sensitive credentials shown in dropdown

### ✅ Error Messages
- Generic error messages to users
- Detailed errors only in console (development)
- No sensitive information leaked

## Testing

### Manual Tests

1. **Login and Navigate to Dashboard**
   - [ ] Orders dropdown appears
   - [ ] Shows loading state
   - [ ] Fetches orders successfully
   - [ ] Displays all order IDs

2. **Select Different Orders**
   - [ ] Click dropdown
   - [ ] See all orders listed
   - [ ] Select different order
   - [ ] Selection updates

3. **Empty State**
   - [ ] Login with account that has no orders
   - [ ] See "No orders found" message
   - [ ] Dropdown shows "No orders available"

4. **Network Error**
   - [ ] Disconnect internet
   - [ ] Refresh dashboard
   - [ ] See appropriate error handling
   - [ ] Reconnect and retry

5. **User Profile Display**
   - [ ] Avatar shows correct initials
   - [ ] Name displays correctly
   - [ ] Email displays correctly

### API Testing with curl

```bash
# Get orders (replace TOKEN with your auth token)
curl -X GET https://propakd.vercel.app/orders/my-account \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Future Enhancements

- [ ] **Order Filtering** - Filter by status, challenge type
- [ ] **Order Search** - Search orders by ID
- [ ] **Order Details Modal** - Click to see full order details
- [ ] **Refresh Button** - Manual refresh orders
- [ ] **Real-time Updates** - WebSocket for order status changes
- [ ] **Order Notifications** - Alert on status changes
- [ ] **Order History** - View archived/completed orders
- [ ] **Export Orders** - Download order history CSV

## Troubleshooting

### Issue: Orders not loading

**Possible causes:**
- Not logged in (no token)
- Token expired
- Backend API down
- Network connection issue

**Solutions:**
1. Check if token exists in storage
2. Try logging out and back in
3. Check network tab in DevTools
4. Verify API endpoint is accessible

### Issue: "No orders found" but user has orders

**Possible causes:**
- API response format changed
- Orders array is empty in response
- Backend issue

**Solutions:**
1. Check network response in DevTools
2. Verify API response structure
3. Check console for errors
4. Contact backend team

### Issue: Orders show but credentials missing

**Expected behavior:**
- Credentials only available for certain order statuses
- null credentials are normal for pending orders

### Issue: User profile not showing

**Possible causes:**
- User data not stored during login
- Storage cleared
- Different storage method (localStorage vs sessionStorage)

**Solutions:**
1. Re-login to refresh user data
2. Check if getUser() returns data
3. Verify storage in DevTools

## Files Modified

```
lib/
  api/
    auth.ts                    ← Added getMyAccount() function
components/
  dashboard/
    header.tsx                 ← Updated to fetch and display orders
docs/
  DASHBOARD_ORDERS.md          ← This documentation
```

## Support

For issues or questions:
- Check authentication token is valid
- Verify API endpoint is accessible
- Check console for error messages
- Contact: support@fxgenz.com

---

**Last Updated:** January 30, 2026
**Status:** ✅ Complete
**Endpoint:** `GET /orders/my-account`
**Component:** `components/dashboard/header.tsx`
