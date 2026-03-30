# 🚀 Bomapro Deployment - Complete Setup Guide

**Status:** ✅ DEPLOYMENT COMPLETE  
**Date:** March 31, 2026  
**Environment:** Vercel + MongoDB Atlas Production

---

## ✨ What's Deployed

| Component | Platform | Domain | Status |
|-----------|----------|--------|--------|
| **Backend API** | Vercel | `rentium-jbb9l0gq-kiprotihs-projects.vercel.app` | ✅ Live |
| **Frontend Web** | Vercel | `rentium-liard.vercel.app` | ✅ Live (auto-deployed) |
| **Database** | MongoDB Atlas | `cluster0.5plkme6.mongodb.net` | ✅ Connected |

---

## 📋 Step 1: Initialize Database (5 minutes)

Your backend is already deployed with a database seeding endpoint. To create the 4 user roles:

### Option A: Via API Endpoint (Recommended)

```bash
curl -X POST https://rentium-jbb9l0gq-kiprotihs-projects.vercel.app/api/init/seed
```

This will create:
- **superadmin@bomapro.co.ke** / `SuperAdmin@2026`
- **manager@bomapro.co.ke** / `Manager@2026`
- **tenant@bomapro.co.ke** / `Tenant@2026`
- **accountant@bomapro.co.ke** / `Accountant@2026`

### Option B: Via Node.js Script (If API not ready)

If the endpoint isn't available yet (Vercel still building), you can seed locally:

1. **Add your IP to MongoDB Atlas:**
   - Go to: https://cloud.mongodb.com/v2/kiprotichkirui301_db_user#security/network/accessList
   - Click: "Add IP Address"
   - Select: "Add Current IP Address"
   - Confirm

2. **Run the seed script:**
   ```bash
   cd c:\Users\Lastborn\Desktop\Bomapro\bomapro-backend
   $env:MONGODB_URI="mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority"
   npm run seed:production
   ```

---

## 🔗 Step 2: Test the Deployment

### Backend API (Swagger Docs)
**URL:** https://rentium-jbb9l0gq-kiprotihs-projects.vercel.app/api/docs

You should see all available endpoints with request/response examples.

### Frontend Application
**URL:** https://rentium-liard.vercel.app

The app should load. If blank page:
- Wait 3-5 minutes for Vercel to redeploy backend
- Clear browser cache (Ctrl+F5)
- Check browser console for errors

---

## 🔐 Step 3: First Login

1. **Go to:** https://rentium-liard.vercel.app
2. **Login with:**
   - **Email:** `superadmin@bomapro.co.ke`
   - **Password:** `SuperAdmin@2026`

3. **You should see:**
   - Dashboard with property statistics
   - Sidebar with navigation menus
   - Your profile at the top right

---

## ⚠️ Step 4: Security - Change Default Credentials

**IMMEDIATELY after first login:**

1. Click your **profile icon** (top right)
2. Select **"Settings"** or **"Change Password"**
3. Change password for the admin account
4. Change passwords for other test accounts:
   - manager@bomapro.co.ke
   - tenant@bomapro.co.ke
   - accountant@bomapro.co.ke

---

## 📊 Test the Key Features

### 1. Create a Property
1. Go to **Properties** section
2. Click **"Add Property"**
3. Fill in details (name, address, etc.)
4. Save

### 2. Add a Tenant
1. Go to **Tenants** section
2. Click **"Add Tenant"**
3. Create a tenant profile
4. Assign to a property

### 3. Create a Lease
1. Go to **Leases** section
2. Click **"Create Lease"**
3. Select property & tenant
4. Define lease terms (amount, duration, etc.)
5. Submit

### 4. Record a Payment
1. Go to **Payments** section
2. Click **"Record Payment"**
3. Select a lease
4. Enter amount paid
5. Save

### 5. View Reports
1. Go to **Reports** section
2. Select report type (tenant, payment, maintenance)
3. View comprehensive analytics

---

## 🔧 Environment Variables Set in Vercel

Your backend is configured with these environment variables on Vercel:

```
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<production-secret>
NODE_ENV=production
FRONTEND_URL=https://rentium-liard.vercel.app
PORT=3400
```

**Google OAuth & Email:** Not yet configured (optional)

To add Google OAuth:
1. Get credentials from Google Cloud Console
2. Go to Vercel Dashboard → Backend Project → Settings → Environment Variables
3. Add: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`

---

## 📱 Architecture

```
┌─────────────────────────────────────────────────────┐
│           Browser (User)                             │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
┌───────▼──────────┐      ┌────────▼──────────┐
│  Frontend (SPA)  │      │   Backend API     │
│ rentium-liard    │      │ rentium-jbb9l0gq  │
│ (Angular)        │      │ (NestJS)          │
│                  │      │                   │
│ Vercel CDN       │      │ Vercel Serverless │
└──────────────────┘      └────────┬──────────┘
                                   │
                          ┌────────▼──────────┐
                          │  MongoDB Atlas    │
                          │  cluster0         │
                          │                   │
                          │ bomaprocusers     │
                          │ (and other DBs)   │
                          └───────────────────┘
```

---

## 🚀 Deployment Workflow

### How Updates Work:

1. **Make code changes locally**
   ```bash
   cd c:\Users\Lastborn\Desktop\Bomapro
   git add .
   git commit -m "Your change"
   git push origin main
   ```

2. **Vercel automatically deploys:**
   - **Backend:** Builds NestJS, uploads to Vercel Serverless
   - **Frontend:** Builds Angular, uploads to Vercel CDN
   - Both use the same environment variables

3. **View deployment status:**
   - Go to https://vercel.com/dashboard
   - Click on `Rentium` project
   - See build logs and deployment history

### Rollback (if needed):
- Go to Vercel Dashboard
- Click "Deployments" 
- Select a previous deployment
- Click "Promote to Production"

---

## 🐛 Troubleshooting

### 1. Frontend shows 404 error
- **Cause:** Angular app not built correctly
- **Fix:** Go to Vercel Dashboard → bomapro-frontend → Redeploy

### 2. API endpoint returns 500 error
- **Cause:** Backend environment variables missing
- **Fix:** Check Vercel Dashboard → bomapro-backend → Environment Variables
- Verify MongoDB connection string is set

### 3. Can't login
- **Cause:** Database not seeded yet
- **Fix:** Run the seed endpoint: `POST /api/init/seed`

### 4. CORS errors in console
- **Cause:** Frontend API URL wrong
- **Fix:** Check `environment.prod.ts` has correct backend URL
- Redeploy frontend

### 5. Slow page load
- **Cause:** Vercel cold start (first request after 15 min idle)
- **Fix:** Normal - second request will be fast. Consider upgrading Vercel plan

---

## 📚 Useful Links

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| MongoDB Atlas | https://cloud.mongodb.com |
| Backend Swagger Docs | https://rentium-jbb9l0gq-kiprotihs-projects.vercel.app/api/docs |
| GitHub Repository | https://github.com/PeterKiprotichK/Rentium |
| Frontend Source Code | /bomapro-frontend |
| Backend Source Code | /bomapro-backend |

---

## 🎯 Next Steps

1. **✅ Seed database** (if not done yet)
2. **✅ Test login** with default credentials
3. **✅ Change passwords** for all accounts
4. **✅ Add a property** to test full workflow
5. **📋 Add custom domain** (optional)
   - Go to Vercel → Project → Domains
   - Add your custom domain
6. **📧 Enable email notifications** (requires SMTP setup)
7. **👥 Create additional users** for your team
8. **🔒 Enable Google OAuth** (optional)

---

## 📞 Support

**If you encounter issues:**

1. Check Vercel deployment logs:
   - https://vercel.com/dashboard → Select project → Deployments

2. Check MongoDB Atlas connection:
   - https://cloud.mongodb.com → Networks → Verify your IP

3. Check browser console for errors:
   - Press F12 → Console tab → Look for error messages

4. Review GitHub commits:
   - Latest commits are at: https://github.com/PeterKiprotichK/Rentium/commits/main

---

## ✨ Congratulations!

Your Bomapro property management system is now **live in production**! 🎉

- **Backend API:** Serving requests from Vercel edge network
- **Frontend:** Cached globally on Vercel CDN
- **Database:** Securely connected to MongoDB Atlas
- **Auto-scaling:** Vercel handles traffic spikes automatically

**Next time someone logs in, they'll be using YOUR live system!** 🚀

---

**Last Updated:** March 31, 2026  
**Deployment Status:** ✅ COMPLETE AND LIVE
