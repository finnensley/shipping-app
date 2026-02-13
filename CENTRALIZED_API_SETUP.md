# Centralized API Configuration

## Overview

All hardcoded `http://localhost:3000` URLs have been replaced with a centralized API utility that uses the `VITE_API_URL` environment variable.

## Files Modified

### New Files

- `src/utils/api.js` - Centralized API utility with fetch methods (get, post, put, delete)

### Environment Configuration

- `.env.local` - Local development: `VITE_API_URL=http://localhost:3000`
- Vercel Environment Variables (for production): Set `VITE_API_URL=https://your-vercel-url.vercel.app`

### Backend Changes

- `server.js` - Updated to use Supabase OR Local database based on environment variables
  - `app.listen()` only runs when `NODE_ENV !== 'production'` (for Vercel compatibility)
  - Database pool uses: `SUPABASE_*` variables with fallback to `LOCAL_*` variables

### Frontend Files Updated (All API calls now use API_URL)

1. `src/pages/auth/auth.jsx` - Login and signup
2. `src/pages/orders/orders.jsx` - Orders list
3. `src/pages/orders/orderDetails.jsx` - Order details
4. `src/pages/orders/orderEditModal.jsx` - Order editing
5. `src/pages/orders/components/useUpdateOrderData.jsx` - Order updates
6. `src/pages/inventory/inventory.jsx` - Inventory management
7. `src/pages/inventory/components/useUpdateInventoryData.jsx` - Inventory updates
8. `src/pages/picking/picking.jsx` - Picking workflow
9. `src/pages/packing/addressDetails.jsx` - Address details
10. `src/pages/packing/addressEditModal.jsx` - Address editing
11. `src/pages/storeFront/components/checkOut.jsx` - Stripe checkout

## Setup Instructions

### For Local Development

1. Keep `.env.local` with `VITE_API_URL=http://localhost:3000`
2. Run backend: `node server.js`
3. Run frontend: `npm run dev`

### For Vercel Production

1. Set `NODE_ENV=production` in Vercel environment variables
2. Set `SUPABASE_*` variables in Vercel environment variables
3. Set `VITE_API_URL=https://your-vercel-url.vercel.app` in Vercel environment variables
4. Backend will automatically:
   - Use Supabase database
   - Export as serverless function (Vercel handles the listening)
   - Frontend will use the Vercel API URL

## API Utility Usage

```javascript
import API_URL from "../../utils/api";

// Use in your fetch/axios calls:
const response = await fetch(`${API_URL}/endpoint`);
// or
const response = await axios.get(`${API_URL}/endpoint`);
```

All hardcoded URLs have been replaced with this pattern throughout the application.
