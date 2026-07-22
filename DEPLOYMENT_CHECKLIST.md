# Deployment Checklist – Hostinger Static Deploy (No Backend)

## Pre-Deployment Verification

### 1. Verify Supabase Setup ✓
- [ ] Tables created: `users`, `contact_requests`
- [ ] RLS policies enabled and configured
- [ ] Admin user created with `role = 'admin'` in `users` table
- [ ] Test credentials working: `admin@lifehope.com` / `Admin@12345`

### 2. Verify Frontend Code ✓
- [ ] `ContactSection.tsx` uses `supabase` client (no `/api` calls)
- [ ] `AdminPage.tsx` uses `supabase` client (no `/api` calls)
- [ ] `src/lib/supabase.js` exists and exports correct client
- [ ] No references to `VITE_API_URL` in frontend code
- [ ] Command to verify: 
  ```bash
  grep -r "/api/\|VITE_API_URL\|apiBaseUrl" src/ || echo "✓ Clean"
  ```

### 3. Environment Variables ✓
- [ ] `.env` has:
  ```
  VITE_SUPABASE_URL=https://gjacbaypcldjhagsukbw.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- [ ] `.env.local` (if exists) is NOT committed to git
- [ ] `.env` file is in `.gitignore`

---

## Build & Test Locally

### 4. Clean Build
```bash
# Clear previous build
rm -rf dist/

# Install dependencies (if needed)
npm install

# Run build
npm run build

# Output: check for errors in dist/ folder
ls -lh dist/
```

### 5. Verify dist/ has no backend calls
```bash
# Search for /api/ in built JS/CSS
grep -r "/api/" dist/ || echo "✓ No /api calls in dist"

# Verify index.html exists
file dist/index.html
```

### 6. Local Preview (Optional)
```bash
# Test locally with Vite preview
npm run preview

# Visit http://localhost:4173
# Test contact form submission
# Test admin dashboard login with admin@lifehope.com / Admin@12345
```

---

## Deploy to Hostinger

### 7. Connect to Hostinger

**Option A: FTP (Traditional)**
1. Get FTP credentials from Hostinger dashboard
2. Use FileZilla or similar FTP client:
   - Host: `ftp://your-domain.com`
   - Username & Password from Hostinger
   - Connect

**Option B: File Manager (Easier)**
1. Log in to Hostinger control panel
2. Go to **File Manager**
3. Browse to `public_html` folder

### 8. Upload dist/ Contents

1. **Delete old files** (optional, for clean slate):
   - Select all in `public_html/` and delete

2. **Upload dist/ contents**:
   - Drag & drop `dist/` folder contents into `public_html/`
   - Wait for upload to complete
   - Verify: `dist/index.html` → `public_html/index.html`

3. **Verify structure**:
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-XXXXXX.js
   │   ├── index-XXXXXX.css
   │   └── ...
   └── vite.svg (if present)
   ```

### 9. Configure .htaccess for SPA Routing

1. In **File Manager**, go to `public_html/`
2. Check if `.htaccess` exists:
   - If **no**: Create new file named `.htaccess`
   - If **yes**: Edit existing

3. **Add/Replace content**:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     
     # Don't rewrite real files or directories
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     
     # Rewrite everything else to index.html
     RewriteRule ^(.*)$ index.html [L]
   </IfModule>
   ```

4. **Save** and close

### 10. Verify Deployment

1. **Visit your domain**: `https://your-domain.com`
2. Page should load (no 404 or blank screen)
3. Click around sections:
   - [ ] Hero, About, Doctors, Services sections load
   - [ ] Contact form visible
   - [ ] Links navigate correctly

4. **Test Contact Form**:
   - Fill in name, phone, email, select service & concern
   - Click "Submit"
   - Success message: "Request submitted successfully!"
   - Check Supabase dashboard → `contact_requests` table (should have new row)

5. **Test Admin Dashboard**:
   - Go to `https://your-domain.com/admin` (or route configured)
   - Login with `admin@lifehope.com` / `Admin@12345`
   - Should see contacts table
   - Test edit/delete contact

### 11. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Blank page / 404 | `.htaccess` missing or invalid | Add `.htaccess` with SPA rewrite rules |
| "Contact request failed" | RLS policy issue | Verify anon key has INSERT on `contact_requests` |
| Admin login fails | User not in `users` table | Check Supabase: `SELECT * FROM users WHERE email = 'admin@lifehope.com'` |
| Admin can't view contacts | RLS policy blocked | Verify `role = 'admin'` in `users` table |
| Styling looks broken | Asset paths wrong | Check `dist/index.html` for correct asset paths |

---

## Post-Deployment

### 12. Monitor & Maintain

- [ ] Test form submissions weekly
- [ ] Check admin dashboard monthly
- [ ] Monitor Supabase usage (free tier: 50,000 read/write units/day)
- [ ] Keep dist/ updated by running `npm run build` after code changes

### 13. Update .env for Production (Optional)

If deploying to multiple environments:
1. Create `.env.production`
2. Set production Supabase keys (same as `.env` for now)
3. Build: `npm run build` (uses `.env.production` if present)

---

## One-Line Commands

**Full deploy workflow:**
```bash
# Local verification
grep -r "/api/" src/ || echo "✓ No backend calls"

# Build
rm -rf dist/ && npm run build

# Verify dist
grep -r "/api/" dist/ || echo "✓ Build clean"

# Ready to upload: dist/ to Hostinger public_html/
echo "✓ Ready for Hostinger upload"
```

---

## Summary

✅ **Frontend**: Fully Supabase-based, no Node backend  
✅ **Auth**: Supabase Auth (email/password)  
✅ **Database**: Supabase tables + RLS  
✅ **Hosting**: Hostinger static `dist/` only  
✅ **Deployment**: FTP/File Manager + `.htaccess` for SPA routing  

Your site is now **serverless and scalable**! 🚀

