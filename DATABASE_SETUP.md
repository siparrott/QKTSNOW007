# QuoteKits Database Setup Guide

## Quick Start - Neon Database (Recommended)

Neon is a serverless PostgreSQL database with a generous free tier. Perfect for this project!

### Step 1: Create a Neon Database

1. **Sign up at [Neon.tech](https://neon.tech)**
   - Click "Sign Up" (free tier available)
   - Sign in with GitHub, Google, or email

2. **Create a New Project**
   - Click "Create Project"
   - Choose a project name: `quotekits`
   - Select region closest to you
   - PostgreSQL version: 16 (latest)
   - Click "Create Project"

3. **Get Your Connection String**
   - After creation, you'll see a connection string
   - It looks like: `postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
   - **Copy this connection string!**

### Step 2: Configure Your App

1. **Create a `.env` file** in the project root:

```bash
# In Windows PowerShell:
New-Item -Path .env -ItemType File

# Or just create it manually in your code editor
```

2. **Add your database URL to `.env`**:

```env
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-random-secret-key-at-least-32-characters-long"
```

**Important:** Replace the DATABASE_URL with your actual Neon connection string!

### Step 3: Push Database Schema

Run the following command to create all tables:

```bash
npm run db:push
```

This will create all the tables defined in `shared/schema.ts`:
- users
- calculators
- user_calculators
- leads
- sessions
- subscriptions
- blog_posts
- calculator_visits
- admin_users
- support_tickets
- promo_codes
- admin_logs
- affiliates
- payments

### Step 4: Restart the Server

```bash
# Stop the current server (Ctrl+C in terminal)
npm run dev
```

You should see:
```
[startup] Postgres initialized.
```

Instead of:
```
[startup] DATABASE_URL not set – Postgres will be skipped
```

---

## Alternative: Supabase Database

Supabase includes PostgreSQL + Authentication + Storage. Great for full-featured apps!

### Step 1: Create Supabase Project

1. Go to [Supabase.com](https://supabase.com)
2. Sign up / Sign in
3. Create new project:
   - Project name: `quotekits`
   - Database password: (choose a strong password)
   - Region: Select closest to you
4. Wait for project to be ready (~2 minutes)

### Step 2: Get Connection String

1. Go to Project Settings > Database
2. Scroll to "Connection string" section
3. Select "URI" tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

### Step 3: Run SQL Schema

1. In Supabase dashboard, go to SQL Editor
2. Open the file `schema.sql` from this project
3. Copy all contents
4. Paste into Supabase SQL Editor
5. Click "Run"

This creates the calculator templates and sets up Row Level Security (RLS) policies.

### Step 4: Configure App

Add to your `.env` file:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
JWT_SECRET="your-random-secret-key"
```

---

## Verify Database Connection

After setup, test your connection:

1. **Check the terminal** when you start the server:
   ```
   [startup] Postgres initialized.
   ✅ Database connection successful
   ```

2. **Register a test user** at `http://localhost:5000/register`

3. **Check Neon Dashboard** or **Supabase Table Editor**:
   - You should see your user in the `users` table
   - Data persists even after server restart!

---

## Environment Variables Explained

### Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (generate random string)

### Optional (for full functionality):
- `STRIPE_SECRET_KEY` - For payment processing
- `SENDGRID_API_KEY` - For sending emails
- `OPENAI_API_KEY` - For AI-powered features

---

## Troubleshooting

### Error: "Failed to initialize Postgres"

**Solution:** Check your DATABASE_URL:
- Remove any smart quotes or extra spaces
- Ensure it starts with `postgresql://` or `postgres://`
- Verify the password is correct
- Check if your IP is whitelisted (Neon doesn't require this usually)

### Error: "relation 'users' does not exist"

**Solution:** Run the schema migration:
```bash
npm run db:push
```

### Data still not persisting?

**Solution:** 
1. Check `.env` file exists in project root
2. Restart the dev server completely
3. Verify `[startup] Postgres initialized.` appears in logs

---

## Database Backup & Duplication

### Export Database (Neon)
```bash
# Install pg_dump (comes with PostgreSQL client)
pg_dump "postgresql://your-connection-string" > backup.sql
```

### Import to Another Database
```bash
psql "postgresql://new-connection-string" < backup.sql
```

### Clone Project with Data
1. Export database using pg_dump
2. Clone git repository
3. Create new Neon/Supabase database
4. Import SQL dump
5. Update `.env` with new DATABASE_URL

---

## Next Steps

Once your database is set up:

1. ✅ User registrations persist
2. ✅ Calculator configurations saved
3. ✅ Leads/quotes stored permanently
4. ✅ Ready for production deployment
5. ✅ Can backup and duplicate easily

---

## Need Help?

- **Neon Docs:** https://neon.tech/docs
- **Supabase Docs:** https://supabase.com/docs
- **Drizzle ORM:** https://orm.drizzle.team/docs

---

**Ready to go!** 🚀 Choose Neon (simplest) or Supabase (full-featured) and follow the steps above.

