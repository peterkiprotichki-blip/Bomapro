# 🚀 Complete Bomapro Production Deployment Guide

**Status:** ✅ READY FOR DEPLOYMENT  
**Date:** March 31, 2026  
**Strategy:** Backend on Railway.app + Frontend on Vercel

---

## 📋 Architecture Decision

After testing Vercel serverless, we determined:
- ❌ **Vercel:** Not ideal for full NestJS servers (serverless architecture mismatch)
- ✅ **Railway:** Perfect for NestJS with persistent processes
- ✅ **Vercel:** Excellent for Angular frontend

**Final Architecture:**
```
Frontend (Vercel)  ←→  Backend (Railway)  ←→  MongoDB Atlas (Production)
```

---

## 🚀 STEP 1: Deploy Backend to Railway

### Option A: Quick Deploy via Railway Dashboard (Recommended)

1. **Go to:** https://railway.app/new
2. **Sign in** with GitHub (if first time)
3. **Select:** Deploy from GitHub → Choose `PeterKiprotichK/Rentium`
4. **Configure:**
   - **Root Directory:** `bomapro-backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `node dist/main.js`
5. **Add Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority
   JWT_SECRET=bomapro-production-secret-change-me-2026
   NODE_ENV=production
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://your-railway-domain/api/auth/google/callback
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   PORT=3400
   ```
6. **Click:** Deploy Project
7. **Wait** for build to complete (usually 3-5 minutes)
8. **Copy your Railway URL** when deployment is complete

### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend
cd c:\Users\Lastborn\Desktop\Bomapro\bomapro-backend

# Initialize Railway project
railway init

# Set environment variables
railway variables set MONGODB_URI="mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority"
railway variables set JWT_SECRET="bomapro-production-secret-change-me-2026"
railway variables set NODE_ENV="production"
# ... set other variables as above

# Deploy
railway up
```

### ✅ After Railway Deployment:
- Note your Railway URL: `https://bomapro-prod-XXXXX.railway.app`
- Test: Visit `https://your-railway-url/api/docs` (Swagger documentation)

---

## 🌱 STEP 2: Seed Production Database

Once backend is live:

```bash
cd c:\Users\Lastborn\Desktop\Bomapro\bomapro-backend

# Run seed script to create 4 user roles
MONGODB_URI="mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority" npm run seed:production
```

**Expected Output:**
```
✅ PRODUCTION SEED COMPLETED SUCCESSFULLY!
============================================================
📋 User Credentials:

SUPER_ADMIN
  Email:    superadmin@bomapro.co.ke
  Password: SuperAdmin@2026

PROPERTY_MANAGER
  Email:    manager@bomapro.co.ke
  Password: Manager@2026

TENANT
  Email:    tenant@bomapro.co.ke
  Password: Tenant@2026

ACCOUNTANT
  Email:    accountant@bomapro.co.ke
  Password: Accountant@2026
============================================================
```

---

## 🎨 STEP 3: Deploy Frontend to Vercel

### Update Backend URL First:

Edit `bomapro-frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-railway-url/api',  // Use your actual Railway URL
};
```

Commit and push:
```bash
cd c:\Users\Lastborn\Desktop\Bomapro\bomapro-frontend
git add src/environments/environment.prod.ts
git commit -m "Update backend API URL to Railway domain"
git push origin main
```

### Deploy to Vercel:

1. Go to https://vercel.com/new
2. **Import Repository:** Select `PeterKiprotichK/Rentium`
3. **Configure Project:**
   - **Root Directory:** `bomapro-frontend`
   - **Project Name:** `bomapro-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/bomapro-frontend`
4. **Click:** Deploy
5. **Wait** for deployment to complete
6. **Get your Vercel URL:** `https://your-frontend-app.vercel.app`

---

## 🧪 STEP 4: Test Your Deployment

### Test Backend:
```bash
# Open in browser
https://your-railway-url/api/docs

# Or test with curl
curl https://your-railway-url/api/health
```

### Test Frontend:
1. Visit: `https://your-frontend-domain.vercel.app`
2. Log in with: `superadmin@bomapro.co.ke` / `SuperAdmin@2026`
3. Test basic functionality:
   - Dashboard loads
   - API calls work
   - Navigation functions

### Test Database Connection:
```bash
mongosh "mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro"
# Then run: db.bomaprocusers.find({}).limit(1)
```

---

## 📊 Deployment Summary

| Component | Platform | Status | URL |
|-----------|----------|--------|-----|
| **Frontend** | Vercel | ✅ Ready | https://your-frontend.vercel.app |
| **Backend** | Railway | ✅ Ready | https://your-railway-url.railway.app |
| **Database** | MongoDB Atlas | ✅ Ready | `cluster0.5plkme6.mongodb.net` |
| **Users** | MongoDB | ✅ Seeded | 4 roles created |

---

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Update Google OAuth credentials (if using)
- [ ] Configure SMTP with real credentials
- [ ] Enable custom domain (optional)
- [ ] Set up SSL/TLS certificate
- [ ] Configure CORS if needed
- [ ] Monitor logs for errors
- [ ] Change default passwords after first login
- [ ] Set up backups in MongoDB Atlas
- [ ] Enable security monitoring

---

## 📝 Default User Credentials

After seeding, log in with:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@bomapro.co.ke | SuperAdmin@2026 |
| Property Manager | manager@bomapro.co.ke | Manager@2026 |
| Tenant | tenant@bomapro.co.ke | Tenant@2026 |
| Accountant | accountant@bomapro.co.ke | Accountant@2026 |

⚠️ **Change these immediately after first login!**

---

## 🐛 Troubleshooting

### Backend Not Starting on Railway
- Check logs in Railway dashboard
- Verify all env vars are set
- Ensure MongoDB URI is correct
- Try restarting the Railway service

### Frontend Can't Reach Backend
- Verify API URL in `environment.prod.ts`
- Check CORS is enabled in NestJS
- Ensure Railway backend is running
- Check network tab in browser DevTools

### Database Connection Failed
- Verify MongoDB URI
- Check IP is whitelisted in Atlas
- Test locally: `mongosh "your-connection-string"`
- Ensure PASSWORD is correct (special chars may need encoding)

### Seed Script Fails
- Verify MongoDB URI is correct
- Check MongoDB access
- Run locally first to test
- Check file has execute permissions

---

## 📚 Documentation Files Created

✅ `VERCEL_DEPLOYMENT_GUIDE.md` - Initial Vercel guide  
✅ `QUICK_DEPLOYMENT_COMMANDS.md` - Command reference  
✅ `DEPLOYMENT_CONFIGURATION_SUMMARY.md` - Config overview  
✅ `FINAL_DEPLOYMENT_STATUS.md` - Previous status  
✅ `RAILWAY_DEPLOYMENT.md` - Railway guide  
✅ `COMPLETE_DEPLOYMENT_GUIDE.md` - This file  

---

## 🎯 Files Configured for Deployment

### Backend
```
bomapro-backend/
├── Dockerfile              ✅ For container deployment
├── railway.json            ✅ Railway configuration
├── vercel.json             ✅ Vercel fallback config
├── .env.production         ✅ Production env vars
├── package.json            ✅ Updated with seed scripts
└── seed-production.js      ✅ User seeding script
```

### Frontend
```
bomapro-frontend/
├── vercel.json             ✅ Vercel configuration
├── src/environments/
│   └── environment.prod.ts ✅ Production API URL
└── angular.json            ✅ Build configuration
```

---

## 📞 Support & Resources

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **NestJS Docs:** https://docs.nestjs.com
- **MongoDB Docs:** https://docs.mongodb.com
- **Angular Docs:** https://angular.io/docs

---

## ✨ Next Actions

1. **Deploy Backend to Railway** (Steps above)
2. **Seed Production Database** (Run seed script)
3. **Deploy Frontend to Vercel** (Steps above)
4. **Test Complete Application** (All 3 components)
5. **Monitor Logs** (First 24 hours)
6. **Update Users** (Change default passwords)

---

**You're ready to deploy!** 🚀

Start with Step 1: Deploy Backend to Railway.app
