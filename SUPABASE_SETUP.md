# Supabase Setup Guide – No Backend Required

This guide walks you through setting up Supabase tables, authentication, and Row Level Security (RLS) policies so you can deploy only `dist` to Hostinger without a Node backend.

## Prerequisites
- Supabase project created (from `.env` you already have one: `https://gjacbaypcldjhagsukbw.supabase.co`)
- `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## Step 1: Create Tables in Supabase

Go to your Supabase Dashboard → **SQL Editor** → create new query and run the SQL below:

### SQL Migration

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create users table (for admin roles)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create contact_requests table
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_service TEXT,
  health_concern TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes for performance
CREATE INDEX idx_contact_requests_created_at ON public.contact_requests(created_at DESC);
CREATE INDEX idx_users_email ON public.users(email);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for users table
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin can read all users" ON public.users
  FOR SELECT
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- 6. RLS Policies for contact_requests table
-- Anyone can insert (public form submissions)
CREATE POLICY "Anyone can insert contact requests" ON public.contact_requests
  FOR INSERT
  WITH CHECK (TRUE);

-- Only authenticated admins can read/update/delete
CREATE POLICY "Admin can read contact requests" ON public.contact_requests
  FOR SELECT
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admin can update contact requests" ON public.contact_requests
  FOR UPDATE
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admin can delete contact requests" ON public.contact_requests
  FOR DELETE
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- 7. Create a function to set admin role on user signup (optional)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger on auth.users to create profile automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Step 2: Create Initial Admin User (Manual or via Supabase Console)

### Option A: Via Supabase Console (Easiest)

1. Go to **Authentication** → **Users** → **Create new user**
2. Email: `admin@lifehope.com` | Password: `Admin@12345` (or your choice)
3. Go to **SQL Editor** and run:

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@lifehope.com';
```

### Option B: Via SQL (Direct)

```sql
-- Insert admin user directly into auth
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'admin@lifehope.com',
  crypt('Admin@12345', gen_salt('bf')),
  NOW(),
  jsonb_build_object('full_name', 'Administrator')
)
ON CONFLICT DO NOTHING;

-- Manually insert into users profile table
INSERT INTO public.users (id, email, name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', email), 'admin'
FROM auth.users
WHERE email = 'admin@lifehope.com'
ON CONFLICT DO NOTHING;
```

---

## Step 3: Enable Email Authentication (Optional but Recommended)

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle **Enable Email Provider** (enabled by default)
3. Optionally configure email confirmation and password recovery

---

## Step 4: Test the Setup

### Test 1: Insert a contact request (public)
```sql
INSERT INTO public.contact_requests (name, phone, email, preferred_service, health_concern)
VALUES ('Test User', '+91 9999999999', 'test@example.com', 'Consultation', 'Stress');
```
Should succeed (anyone can insert).

### Test 2: Query contact requests (as public/anon)
```sql
SELECT * FROM public.contact_requests;
```
Should fail with permission error (only admin can read).

### Test 3: Sign in as admin
- Visit your app, go to Admin dashboard
- Sign in with `admin@lifehope.com` / `Admin@12345`
- Should see all contact requests (via AdminPage)

---

## Step 5: Environment Variables

Ensure `.env` has:
```
VITE_SUPABASE_URL=https://gjacbaypcldjhagsukbw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqYWNiYXlwY2xkamhhZ3N1a2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTc2NTYsImV4cCI6MjA5NzE3MzY1Nn0.UcXZIlDpVBZDpdXLvKJuRYXbpk_YzCU7xllEPFJDlOE
```

---

## Step 6: Deployment to Hostinger (Static `dist` Only)

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Verify no `/api` calls in dist:**
   ```bash
   grep -r "/api/" dist || echo "✓ No /api calls found"
   ```

3. **Upload to Hostinger:**
   - Connect to Hostinger via FTP or File Manager
   - Delete old `public_html` contents
   - Upload contents of `dist/` into `public_html/`

4. **Configure Hostinger for SPA (single-page app):**
   - Go to **File Manager** → `.htaccess`
   - Ensure SPA routing (all 404s → `index.html`):
     ```
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>
     ```

---

## Summary

✅ **Frontend ready:** ContactSection and AdminPage both use `supabase` client  
✅ **No Node backend:** All auth & data via Supabase  
✅ **RLS policies:** Anonymous can submit contacts, only admin can view/edit/delete  
✅ **Static deploy:** Only `dist` → Hostinger  

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Admin access is required" on sign in | Check user row in `public.users` has `role = 'admin'` |
| Contact form doesn't save | Check anon key has INSERT permission; review RLS policies |
| Admin can't view contacts | Verify JWT has correct user ID; check RLS SELECT policy |
| CORS errors | Supabase CORS is auto-configured for your domain; no action needed |

