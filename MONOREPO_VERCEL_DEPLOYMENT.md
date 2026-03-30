# 🚀 Deploy Bomapro as Monorepo on Vercel

**Configuration:** Root-level monorepo with separate projects  
**Status:** ✅ READY FOR DEPLOYMENT  
**Database:** MongoDB Atlas (Production)

---

## 📦 Monorepo Structure

```
Rentium (Repository)
├── vercel.json                 ← Root monorepo config
├── bomapro-backend/
│   ├── vercel.json            ← Backend config
│   ├── .env.production        ← Backend env vars
│   ├── seed-production.js     ← User seeding
│   └── ... (NestJS app)
├── bomapro-frontend/
│   ├── vercel.json            ← Frontend config
│   ├── src/environments/
│   │   └── environment.prod.ts
│   └── ... (Angular app)
└── MongoDB Atlas (Production database)
```

---

## 🎯 One-Click Monorepo Deployment

### Step 1: Connect Repository to Vercel

1. **Go to:** https://vercel.com/new
2. **Click:** "Add GitHub App" (if first time)
3. **Authorize** Vercel with GitHub
4. **Select:** `PeterKiprotichK/Rentium` repository
5. Vercel will **automatically detect** the monorepo configuration

### Step 2: Configure Projects

Vercel will detect `vercel.json` and show you **2 projects**:
- `bomapro-backend` (from `bomapro-backend/`)
- `bomapro-frontend` (from `bomapro-frontend/`)

**For Backend Project:**
- ✅ Root Directory: `bomapro-backend` (auto-detected)
- ✅ Build Command: `npm run build` (from vercel.json)
- ✅ Output: `dist` (from vercel.json)

**Add Environment Variables:**
```
MONGODB_URI=mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority
JWT_SECRET=bomapro-production-secret-change-me-2026
NODE_ENV=production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://bomapro-backend-xxx.vercel.app/api/auth/google/callback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=https://bomapro-frontend-xxx.vercel.app
PORT=3400
```

**For Frontend Project:**
- ✅ Root Directory: `bomapro-frontend` (auto-detected)
- ✅ Build Command: `npm run build` (from vercel.json)
- ✅ Output: `dist/bomapro-frontend` (from vercel.json)

### Step 3: Deploy Both Projects

Click **"Deploy"** and Vercel will:
1. Deploy both projects simultaneously
2. Generate separate URLs for each
3. Show you the domains

---

## 🌱 Step 2: Seed Production Database

Once backend is deployed:

```bash
cd c:\Users\Lastborn\Desktop\Bomapro\bomapro-backend

# Seed 4 user roles
MONGODB_URI="mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority" npm run seed:production
```

**Users created:**
- superadmin@bomapro.co.ke / SuperAdmin@2026
- manager@bomapro.co.ke / Manager@2026
- tenant@bomapro.co.ke / Tenant@2026
- accountant@bomapro.co.ke / Accountant@2026

---

## 🔗 Step 3: Connect Frontend to Backend

After both deploy, get your URLs from Vercel:
- Backend: `https://bomapro-backend-xxx.vercel.app`
- Frontend: `https://bomapro-frontend-xxx.vercel.app`

Update `bomapro-frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://bomapro-backend-xxx.vercel.app/api',  // ← Your actual backend URL
};
```

Push the change:
```bash
cd c:\Users\Lastborn\Desktop\Bomapro\bomapro-frontend
git add src/environments/environment.prod.ts
git commit -m "Update backend API URL"
git push origin main
```

Vercel will **automatically redeploy** the frontend with the updated API URL.

---

## ✅ Test the Deployment

### Backend API:
```
https://bomapro-backend-xxx.vercel.app/api/docs
```

### Frontend App:
```
https://bomapro-frontend-xxx.vercel.app
```

Login with: `superadmin@bomapro.co.ke` / `SuperAdmin@2026`

---

## 📊 Monorepo Configuration Files

### Root `vercel.json`
```json
{
  "version": 2,
  "projects": [
    {
      "name": "bomapro-backend",
      "rootDirectory": "bomapro-backend"
    },
    {
      "name": "bomapro-frontend",
      "rootDirectory": "bomapro-frontend"
    }
  ]
}
```

### Backend `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run start:dev",
  "installCommand": "npm install",
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    ...other vars...
  }
}
```

### Frontend `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/bomapro-frontend",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🔄 Updating After Deployment

Any time you push to GitHub:
```bash
git push origin main
```

Vercel **automatically redeploys both projects**.

---

## 🆚 Monorepo vs Separate Projects

| Aspect | Monorepo | Separate |
|--------|----------|----------|
| **Setup** | One repo, multiple Vercel projects | Multiple repos |
| **Deployment** | Single click in Vercel | Two separate deployments |
| **Updates** | One git push deploys both | Must push to two repos |
| **Shared Code** | Easier to share utilities | Not applicable |
| **Recommended** | ✅ YES | ❌ More work |

---

## 📋 Environment Variables for Backend

Backend needs these in Vercel settings:

```
MONGODB_URI
JWT_SECRET
NODE_ENV
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
FRONTEND_URL
PORT
```

All documented in `bomapro-backend/.env.production`

---

## 🎯 Default Users

After seeding:

| Email | Password | Role |
|-------|----------|------|
| superadmin@bomapro.co.ke | SuperAdmin@2026 | Super Admin |
| manager@bomapro.co.ke | Manager@2026 | Property Manager |
| tenant@bomapro.co.ke | Tenant@2026 | Tenant |
| accountant@bomapro.co.ke | Accountant@2026 | Accountant |

⚠️ **Change immediately after first login!**

---

## 🚀 Deploy Now!

**Go to:** https://vercel.com/new

Select `PeterKiprotichK/Rentium` and let Vercel do the rest! 

The monorepo configuration will be auto-detected and both projects will deploy with one click. ✨

---

## 💡 Pro Tips

- **Custom Domains:** Vercel supports custom domains for both projects
- **Environment Variables:** Manage per-project in Vercel dashboard
- **Logs:** View logs for each project separately in Vercel dashboard
- **Preview Deployments:** Each git branch gets preview URLs
- **Analytics:** Monitor performance of each project

---

**You're ready for monorepo deployment!** 🎉
