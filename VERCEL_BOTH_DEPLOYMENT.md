# 🚀 Deploy Both Frontend & Backend to Vercel

**Date:** March 31, 2026  
**Configuration:** Vercel for both Backend and Frontend  
**Database:** MongoDB Atlas (Production)

---

## 📋 Quick Overview

```
Frontend (Vercel)  ←→  Backend (Vercel)  ←→  MongoDB Atlas
```

---

## 🔧 STEP 1: Deploy Backend to Vercel

### Via Vercel Dashboard (Easiest)

1. **Go to:** https://vercel.com/new
2. **Import:** Select `PeterKiprotichK/Rentium` repository
3. **Configure Project:**
   - **Project Name:** `bomapro-backend`
   - **Framework:** Other
   - **Root Directory:** `bomapro-backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority
   JWT_SECRET=bomapro-production-secret-change-me-2026
   NODE_ENV=production
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://your-backend-domain.vercel.app/api/auth/google/callback
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   PORT=3400
   ```

5. **Click:** Deploy
6. **Wait** for build and deployment
7. **Get your URL:** Note it (example: `https://bomapro-backend-xxx.vercel.app`)

---

## 🌱 STEP 2: Seed Production Database

Once backend is deployed and running:

```bash
cd c:\Users\Lastborn\Desktop\Bomapro\bomapro-backend

# Seed all 4 user roles
MONGODB_URI="mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority" npm run seed:production
```

**Users created:**
- superadmin@bomapro.co.ke / SuperAdmin@2026
- manager@bomapro.co.ke / Manager@2026
- tenant@bomapro.co.ke / Tenant@2026
- accountant@bomapro.co.ke / Accountant@2026

---

## 🎨 STEP 3: Deploy Frontend to Vercel

### Update Backend URL First:

Edit `bomapro-frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-domain.vercel.app/api',  // ← Use your actual backend URL
};
```

Push the change:
```bash
cd c:\Users\Lastborn\Desktop\Bomapro\bomapro-frontend
git add src/environments/environment.prod.ts
git commit -m "Update backend API URL"
git push origin main
```

### Deploy Frontend:

1. **Go to:** https://vercel.com/new
2. **Import:** Select `PeterKiprotichK/Rentium` repository (same repo!)
3. **Configure Project:**
   - **Project Name:** `bomapro-frontend`
   - **Framework:** Angular
   - **Root Directory:** `bomapro-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/bomapro-frontend`

4. **Click:** Deploy

---

## ✅ Verification

### Test Backend:
```bash
# Visit Swagger docs
https://your-backend-domain.vercel.app/api/docs

# Test health check
curl https://your-backend-domain.vercel.app/api/health
```

### Test Frontend:
1. Visit: `https://your-frontend-domain.vercel.app`
2. Log in with: `superadmin@bomapro.co.ke` / `SuperAdmin@2026`
3. Test navigation and API calls

### Test Database:
```bash
mongosh "mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro"
db.bomaprocusers.find({}).limit(1)
```

---

## 📊 Deployment URLs

| Component | URL |
|-----------|-----|
| **Frontend** | https://your-frontend-domain.vercel.app |
| **Backend** | https://your-backend-domain.vercel.app |
| **API Docs** | https://your-backend-domain.vercel.app/api/docs |
| **Database** | MongoDB Atlas |

---

## 🔄 Updating Your Deployment

Whenever you make changes:

```bash
# Push to GitHub
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically redeploys!
```

---

## 🐛 Troubleshooting

**Backend build fails:**
- Check Vercel build logs
- Verify all env vars are set
- Ensure MongoDB URI is correct

**Frontend can't reach backend:**
- Check API URL in `environment.prod.ts`
- Verify backend domain is correct
- Ensure CORS is enabled (it is by default)

**Seed script fails:**
- Verify MongoDB connection string
- Ensure IP is whitelisted in MongoDB Atlas
- Test locally first

---

## 📝 Default Users

After seeding:

| Email | Password | Role |
|-------|----------|------|
| superadmin@bomapro.co.ke | SuperAdmin@2026 | Super Admin |
| manager@bomapro.co.ke | Manager@2026 | Property Manager |
| tenant@bomapro.co.ke | Tenant@2026 | Tenant |
| accountant@bomapro.co.ke | Accountant@2026 | Accountant |

⚠️ **Change passwords after first login!**

---

**Both your backend and frontend are now deployed to Vercel!** 🎉
