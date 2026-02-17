# Supabase + Vercel Deployment Guide

## Problem

When deploying a Node.js/Express backend to Vercel with Supabase PostgreSQL, you encounter:

- SSL certificate validation errors (`SELF_SIGNED_CERT_IN_CHAIN`)
- 500 errors on authenticated API calls
- Token generation failures

## Root Causes

1. **Session Pooler Issues**: Vercel's short-lived serverless functions exhaust connections using the session pooler (port 5432)
2. **SSL Certificate Handling**: Node.js pg library requires explicit SSL configuration for self-signed certificates
3. **Missing Environment Variables**: JWT_SECRET and DATABASE_URL not set on Vercel

## Solution

### Step 1: Switch to Transaction Pooler

In Supabase dashboard, use the **Transaction Pooler** connection string instead of the default Session Pooler:

- **Port**: 6543 (not 5432)
- **URL Format**: `postgresql://postgres.[project]:password@aws-[region].pooler.supabase.com:6543/postgres`

Transaction pooler is ideal for serverless because it releases connections after each query instead of maintaining persistent sessions.

### Step 2: Configure SSL in Pool Connection

In your Express backend (`api/index.js`), set up the pg Pool with:

```javascript
// Disable certificate validation for self-signed certs on Vercel
if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const getPoolConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
  } else {
    // Local database connection
    return {
      user: process.env.LOCAL_USER,
      host: process.env.LOCAL_HOST,
      database: process.env.LOCAL_DATABASE,
      password: process.env.LOCAL_PASSWORD,
      port: process.env.LOCAL_PORT,
    };
  }
};

const pool = new Pool(getPoolConfig());
```

**Key points:**

- `NODE_TLS_REJECT_UNAUTHORIZED = "0"` disables Node.js certificate validation globally
- `ssl: { rejectUnauthorized: false }` tells pg library to accept self-signed certificates
- Local connections unaffected (uses LOCAL\_\* variables when DATABASE_URL not set)

### Step 3: Set Environment Variables on Vercel

In Vercel dashboard → **Settings > Environment Variables**, add:

1. **DATABASE_URL** → Transaction pooler connection string

   ```
   postgresql://postgres.[project]:password@aws-[region].pooler.supabase.com:6543/postgres
   ```

2. **JWT_SECRET** → Your JWT signing secret (must match local .env)

   ```
   your-jwt-secret-key-here
   ```

3. **NODE_ENV** → "production" (optional but recommended)

### Step 4: Verify Auth Configuration

Ensure your auth controller checks for JWT_SECRET:

```javascript
if (!process.env.JWT_SECRET) {
  console.error("CRITICAL: JWT_SECRET environment variable is not set!");
  return res.status(500).json({
    success: false,
    error: "Server configuration error: JWT_SECRET not set",
  });
}
```

## Testing Checklist

- [ ] Login succeeds and token is generated
- [ ] Check Supabase Auth > Logs for "User signed in" event
- [ ] Dashboard loads order data without 500 error
- [ ] Check Vercel runtime logs for no SSL or connection errors
- [ ] Other protected API endpoints work (`/api/items`, `/api/inventory`, etc.)

## Local Development (Unchanged)

Your local `.env` should NOT include `DATABASE_URL`. Instead use:

```
LOCAL_USER=postgres
LOCAL_HOST=localhost
LOCAL_DATABASE=shipping_db
LOCAL_PASSWORD=your_password
LOCAL_PORT=5432
JWT_SECRET=your-jwt-secret-key
```

The pool config automatically detects and uses local variables when `DATABASE_URL` is not set.

## Troubleshooting

### Still getting SSL errors?

- Verify `NODE_TLS_REJECT_UNAUTHORIZED=0` is being set before pool initialization
- Check that DATABASE_URL on Vercel uses port 6543 (transaction pooler, not 5432)
- Ensure `ssl: { rejectUnauthorized: false }` is in pool config object

### Token generation still fails?

- Confirm JWT_SECRET is added to Vercel environment variables
- Check value matches your local .env exactly
- Redeploy after adding the variable

### Connection timeouts?

- Verify DATABASE_URL is correct and accessible from Vercel region
- Check Supabase > Database > Connections to see active connections
- May need to increase `connectionTimeoutMillis` if region is far away

## Key Differences: Session vs Transaction Pooler

| Feature                | Session Pooler (5432)    | Transaction Pooler (6543) |
| ---------------------- | ------------------------ | ------------------------- |
| Connection Persistence | Per-client session       | Per-transaction           |
| Idle Timeout           | Minutes                  | Immediate release         |
| Best For               | Long-running connections | Serverless functions      |
| Vercel Compatibility   | ❌ Exhausts pool         | ✅ Recommended            |

## References

- Supabase Connection Pooling: https://supabase.com/docs/guides/database/connecting-to-postgres
- Node.js pg SSL Configuration: https://node-postgres.com/features/ssl
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
