# Quick Reference: Supabase + Hostinger Setup

## Environment Setup

### Step 1: .env File
Create or update `.env` in project root:
```
VITE_SUPABASE_URL=https://gjacbaypcldjhagsukbw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqYWNiYXlwY2xkamhhZ3N1a2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTc2NTYsImV4cCI6MjA5NzE3MzY1Nn0.UcXZIlDpVBZDpdXLvKJuRYXbpk_YzCU7xllEPFJDlOE
```

**Never commit `.env` to git!** Add to `.gitignore`:
```
.env
.env.local
.env.*.local
```

---

## Supabase Setup (30 mins)

### 1. Create Tables (SQL)
Go to **Supabase Dashboard** → **SQL Editor** → **New query**

Paste the SQL from [SUPABASE_SETUP.md](SUPABASE_SETUP.md#step-1-create-tables-in-supabase)

### 2. Create Admin User
Sign in to **Supabase Dashboard** → **Authentication** → **Users** → **Create new user**

- Email: `admin@lifehope.com`
- Password: `Admin@12345` (change if needed)
- Click **Create user**

Then run SQL:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'admin@lifehope.com';
```

### 3. Test
Visit your local app:
```bash
npm run dev
```
- Contact form: Fill & submit → Check **Supabase** `contact_requests` table
- Admin dashboard: `/admin` → Login with admin@lifehope.com

---

## Local Build (2 mins)

```bash
# Install deps (first time only)
npm install

# Build
npm run build

# Verify no /api calls
grep -r "/api/" dist/ || echo "✓ Clean"

# Preview (optional)
npm run preview
```

---

## Deploy to Hostinger (10 mins)

### 1. Upload via FTP or File Manager
- Connect to Hostinger (credentials in dashboard)
- Upload contents of `dist/` folder to `public_html/`

### 2. Create `.htaccess` in `public_html/`
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.html [L]
</IfModule>
```

### 3. Test
Visit `https://your-domain.com` and verify:
- Page loads (no 404)
- Contact form works
- Admin dashboard login works

---

## Important Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.js` | Supabase client initialization |
| `src/app/components/ContactSection.tsx` | Contact form (public) |
| `src/app/components/AdminPage.tsx` | Admin dashboard (authenticated) |
| `.env` | Supabase URL & API key |
| `dist/` | Built app for Hostinger |

---

## Common Tasks

### Add new admin user
```sql
-- Supabase SQL Editor
UPDATE public.users SET role = 'admin' WHERE email = 'newadmin@example.com';
```

### View all contacts in Supabase
**Dashboard** → **contact_requests** table → Filter/sort by `created_at`

### View admins
**Dashboard** → **users** table → Filter by `role = 'admin'`

### Rebuild & redeploy
```bash
npm run build          # Rebuild dist/
# Upload new dist/ to Hostinger public_html/
```

---

## Architecture

```
┌─────────────────┐
│  Hostinger      │
│  (static dist/) │
└────────┬────────┘
         │ HTTP
         ▼
    ┌────────────────────┐
    │  Your React App    │
    │  (ContactSection,  │
    │   AdminPage)       │
    └────────┬───────────┘
             │ HTTPS
             ▼
    ┌────────────────────────────┐
    │  Supabase                  │
    │  ├─ Auth (email/password)  │
    │  ├─ Database (tables)      │
    │  └─ RLS (policies)         │
    └────────────────────────────┘
```

**No Node backend needed!** ✅

---

## Support

If you encounter issues:

1. **Check Supabase setup**: Verify tables & RLS policies exist
2. **Check .htaccess**: Ensure SPA rewrite rules are in place
3. **Check browser console** (F12): Look for JavaScript errors
4. **Check Supabase logs**: Dashboard → **Logs** for API errors

---

## Next Steps

- [ ] Update `.env` with your Supabase credentials (already done)
- [ ] Run SQL migration to create tables
- [ ] Create admin user
- [ ] Test locally: `npm run dev`
- [ ] Build: `npm run build`
- [ ] Deploy to Hostinger
- [ ] Test live: admin login + contact form

**You're ready to launch! 🚀**

