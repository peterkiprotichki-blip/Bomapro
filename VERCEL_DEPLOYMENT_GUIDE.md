# 🚀 Bomapro Vercel Deployment Guide

## Overview
This guide walks you through deploying Bomapro (NestJS Backend + Angular Frontend) to Vercel with MongoDB Atlas as your production database.

---

## 📋 Prerequisites

Before starting, you'll need:

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas Account** - Already configured with your cluster
3. **GitHub Account** - To connect your repositories
4. **Git installed** - For version control

---

## ✅ Configuration Files Created

The following files have been created for your deployment:

### Backend Files
- `bomapro-backend/vercel.json` - Vercel deployment configuration
- `bomapro-backend/.env.production` - Production environment variables
- `bomapro-backend/seed-production.js` - Production seeding script

### Frontend Files
- `bomapro-frontend/vercel.json` - Frontend deployment configuration
- `bomapro-frontend/src/environments/environment.prod.ts` - Production API URL configuration

---

## 🔧 Step 1: Update Backend Environment Variables

Edit `bomapro-backend/.env.production` and update:

```env
# MongoDB Atlas Production (Already set)
MONGODB_URI=mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority

# Change these to secure/production values:
JWT_SECRET=your-secure-jwt-secret-key-here

# Google OAuth (if using Google login)
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-domain.vercel.app/api/auth/google/callback

# Email Configuration (Gmail or other SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

---

## 🌐 Step 2: Deploy Backend to Vercel

### 2.1 Push to GitHub
```bash
cd bomapro-backend
git add .
git commit -m "Add Vercel configuration for production deployment"
git push origin main
```

### 2.2 Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Add GitHub App"** and authorize Vercel
3. Find and select your `bomapro-backend` repository
4. Configure the project:
   - **Framework Preset:** Other (NestJS)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. Click **"Environment Variables"** and add from `.env.production`:
   ```
   MONGODB_URI: mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority
   JWT_SECRET: your-secure-secret
   GOOGLE_CLIENT_ID: value
   GOOGLE_CLIENT_SECRET: value
   GOOGLE_CALLBACK_URL: value
   SMTP_HOST: smtp.gmail.com
   SMTP_PORT: 587
   SMTP_SECURE: false
   SMTP_USER: your-email
   SMTP_PASS: your-app-password
   FRONTEND_URL: https://your-frontend-domain.vercel.app
   ```

6. Click **"Deploy"** and wait for deployment to complete
7. Once deployed, note your backend URL (e.g., `https://bomapro-api.vercel.app`)

### 2.3 Seed Production Database

Once the backend is deployed, run the seed script:

```bash
cd bomapro-backend

# Using the production MongoDB URI
MONGODB_URI="mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority" node seed-production.js
```

This will create:
- ✅ **Super Admin** - superadmin@bomapro.co.ke / SuperAdmin@2026
- ✅ **Property Manager** - manager@bomapro.co.ke / Manager@2026
- ✅ **Tenant User** - tenant@bomapro.co.ke / Tenant@2026
- ✅ **Accountant** - accountant@bomapro.co.ke / Accountant@2026

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Update Environment Configuration

The `environment.prod.ts` has been configured to dynamically use your backend API. However, update the fallback URL in the file:

Edit `bomapro-frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: typeof window !== 'undefined' && window.location.origin
    ? `${window.location.origin.replace(/(:\d+)?$/, '')}/api`
    : 'https://your-backend-domain.vercel.app/api', // Update fallback
};
```

### 3.2 Push to GitHub
```bash
cd bomapro-frontend
git add .
git commit -m "Configure production deployment"
git push origin main
```

### 3.3 Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your `bomapro-frontend` repository
3. Configure the project:
   - **Framework:** Angular
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/bomapro-frontend`
   - **Install Command:** `npm install`

4. Add environment variable (if needed):
   ```
   API_URL: https://your-backend-domain.vercel.app/api
   ```

5. Click **"Deploy"** and wait for completion
6. Once deployed, note your frontend URL (e.g., `https://bomapro.vercel.app`)

---

## 🔗 Step 4: Connect Frontend to Backend

### Update both deployment configurations:

1. **In Backend (vercel.json environment variables):**
   - Set `FRONTEND_URL` to your frontend domain: `https://your-frontend-domain.vercel.app`

2. **In Frontend (environment.prod.ts):**
   - Update the fallback API URL to: `https://your-backend-domain.vercel.app/api`

3. **Redeploy both** to pick up the changes:
   ```bash
   git push origin main  # Automatic redeploy on Vercel
   ```

---

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if using OAuth
- [ ] Configure SMTP credentials for email notifications
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up CORS properly in backend
- [ ] Change default user passwords after first login
- [ ] Monitor MongoDB Atlas for suspicious activity
- [ ] Set up backups in MongoDB Atlas

---

## 📊 Database Management

### View Production Data
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Navigate to **Browse Collections**
3. View your `bomapro` database and `bomaprocusers` collection

### Backup Strategy
- Enable **Continuous Cloud Backup** in MongoDB Atlas
- Export collections periodically
- Monitor storage usage

---

## 🐛 Troubleshooting

### Backend not connecting to MongoDB
- **Solution:** Verify your IP is whitelisted in MongoDB Atlas
  - Go to MongoDB Atlas → Network Access
  - Add your Vercel deployment IP (or use 0.0.0.0 for testing)

### Frontend not loading
- **Solution:** Check CORS settings in backend `main.ts`
  - Should have `app.enableCors();`

### Seed script fails
- **Solution:** Ensure MongoDB URI is correct
  ```bash
  # Test connection
  mongosh "mongodb+srv://kiprotichkirui301_db_user:PASSWORD@cluster0.5plkme6.mongodb.net/bomapro"
  ```

### Environment variables not working
- **Solution:** Redeploy after adding environment variables
  - Vercel → Project settings → Environment variables

---

## 📱 Default User Credentials

After seeding, use these credentials to log in:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@bomapro.co.ke | SuperAdmin@2026 |
| Property Manager | manager@bomapro.co.ke | Manager@2026 |
| Tenant | tenant@bomapro.co.ke | Tenant@2026 |
| Accountant | accountant@bomapro.co.ke | Accountant@2026 |

⚠️ **Change these passwords immediately after first login!**

---

## 🔄 Deployment Pipeline

### For Updates:
```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically redeploys on push
```

### Manual Redeploy:
1. Go to your Vercel dashboard
2. Select the project
3. Click "Redeploy"

---

## 📞 Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **NestJS Docs:** https://docs.nestjs.com
- **Angular Docs:** https://angular.io/docs
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas

---

## ✨ Next Steps

1. Deploy backend to Vercel ✅
2. Run seed-production.js ✅
3. Deploy frontend to Vercel ✅
4. Test login with seeded credentials ✅
5. Update security configurations ⏳
6. Set up monitoring and alerts ⏳
7. Configure custom domain (optional) ⏳

---

**Good luck with your deployment! 🎉**
