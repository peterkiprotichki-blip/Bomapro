# Quick Vercel Deployment Commands

## 🚀 One-Time Setup

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Authenticate with Vercel
```bash
vercel login
```

---

## 📦 Backend Deployment

### Push Backend Code
```bash
cd bomapro-backend
git add .
git commit -m "Add Vercel configuration and seed scripts"
git push origin main
```

### Deploy Backend (if using CLI)
```bash
cd bomapro-backend
vercel --prod
```

### Seed Production Database
```bash
cd bomapro-backend

# Option 1: Using npm script
MONGODB_URI="mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority" npm run seed:production

# Option 2: Direct node command
MONGODB_URI="mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority" node seed-production.js
```

---

## 🎨 Frontend Deployment

### Push Frontend Code
```bash
cd bomapro-frontend
git add .
git commit -m "Configure production environment and Vercel deployment"
git push origin main
```

### Deploy Frontend (if using CLI)
```bash
cd bomapro-frontend
vercel --prod
```

---

## 🔑 Environment Variables

### Set Variables via Vercel CLI
```bash
# Backend
cd bomapro-backend
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add GOOGLE_CLIENT_ID
# ... add other variables

# Frontend
cd bomapro-frontend
vercel env add API_URL
```

### View Environment Variables
```bash
vercel env ls
```

---

## 🧪 Testing

### Test Backend Locally with Production Vars
```bash
cd bomapro-backend
npm install
MONGODB_URI="your-prod-uri" npm run start:prod
```

### Test Frontend Build
```bash
cd bomapro-frontend
npm install
npm run build
```

---

## 📊 User Credentials After Seeding

```
ROLE: Super Admin
Email: superadmin@bomapro.co.ke
Password: SuperAdmin@2026

ROLE: Property Manager
Email: manager@bomapro.co.ke
Password: Manager@2026

ROLE: Tenant
Email: tenant@bomapro.co.ke
Password: Tenant@2026

ROLE: Accountant
Email: accountant@bomapro.co.ke
Password: Accountant@2026
```

---

## 🔄 Redeploy After Changes

### Automatic (Recommended)
Simply push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```
Vercel will automatically redeploy.

### Manual via CLI
```bash
cd bomapro-backend  # or bomapro-frontend
vercel --prod
```

---

## 🐛 Debugging

### View Logs
```bash
vercel logs
```

### Check Build Status
Visit your Vercel dashboard at https://vercel.com/dashboard

### Test MongoDB Connection
```bash
mongosh "mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro"
```

---

## ✅ Pre-Deployment Checklist

- [ ] Update JWT_SECRET in environment variables
- [ ] Add Google OAuth credentials (if using)
- [ ] Configure SMTP for email
- [ ] Update FRONTEND_URL for backend
- [ ] Update API_URL for frontend
- [ ] Test seed script locally
- [ ] Commit all changes to git
- [ ] Push to GitHub
- [ ] Monitor Vercel deployment logs

---

## 📞 Help & Troubleshooting

If deployment fails:
1. Check Vercel logs: `vercel logs`
2. Verify environment variables are set
3. Ensure MongoDB URI is correct
4. Check that IP is whitelisted in MongoDB Atlas
5. Review build output for errors

---

Generated: March 30, 2026
