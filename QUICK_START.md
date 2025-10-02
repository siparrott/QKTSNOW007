# QuoteKits - Quick Start Guide

## Setup Database in 5 Minutes

### Option 1: Neon Database (Easiest - Recommended!)

1. **Go to** [https://neon.tech](https://neon.tech)

2. **Sign up** (free tier - no credit card needed!)

3. **Create Project**:
   - Name: `quotekits`
   - Region: Choose closest to you
   - Click "Create Project"

4. **Copy Connection String**:
   - You'll see: `postgresql://username:password@...`
   - Click the copy icon

5. **Create `.env` file** in your project root:
   ```env
   DATABASE_URL="paste-your-connection-string-here"
   JWT_SECRET="any-random-long-string-at-least-32-characters"
   ```

6. **Push Database Schema**:
   ```bash
   npm run db:push
   ```

7. **Restart Server**:
   ```bash
   npm run dev
   ```

8. **Done!** ✅ You should see: `[startup] Postgres initialized.`

---

## Generate JWT Secret

Run this in PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as your `JWT_SECRET` in `.env`

---

## Example .env File

```env
DATABASE_URL="postgresql://neondb_owner:abc123@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="f4e3d2c1b0a98765432109876543210fedcba9876543210"
```

---

## Verify It's Working

1. **Check terminal logs**:
   ```
   ✅ [startup] Postgres initialized.
   ```

2. **Register a test user** at `http://localhost:5000/register`

3. **Restart server** - your user should still be there!

4. **Check Neon Dashboard** - see your data in the `users` table

---

## Need More Details?

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for full documentation.

---

**That's it!** Your data now persists permanently. 🎉

