# Railway Deployment Configuration for Bomapro Backend

Vercel's serverless architecture is not optimal for NestJS full-stack applications. Railway.app is recommended instead.

## Quick Railway Deployment

### Prerequisites
- Railway account: https://railway.app (free tier available)
- GitHub account connected to Railway

### Option A: Deploy via Railway Dashboard (Easiest)

1. Go to https://railway.app/dashboard
2. Click **New Project** → **Deploy from GitHub**
3. Select your `PeterKiprotichK/Rentium` repository
4. Configure:
   - **Root Directory:** `bomapro-backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `node dist/main.js`
   - **Environment Variables:**
     ```
     MONGODB_URI=mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority
     JWT_SECRET=bomapro-production-secret-change-me-2026
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
     NODE_ENV=production
     ```
5. Click **Deploy**

### Option B: Deploy via Railway CLI

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Navigate to backend
cd c:\Users\Lastborn\Desktop\Bomapro\bomapro-backend

# 4. Link to Railway project
railway init

# 5. Set environment variables
railway variables set MONGODB_URI=mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority
railway variables set JWT_SECRET=bomapro-production-secret-change-me-2026
# ... set other variables

# 6. Deploy
railway up
```

## After Railway Deployment

1. Get your Railway domain (it will generate one like `https://bomapro-prod-XXXXX.railway.app`)
2. Update `bomapro-frontend/src/environments/environment.prod.ts` with your Railway backend URL
3. Redeploy frontend on Vercel
4. Seed the production database:
   ```bash
   MONGODB_URI="mongodb+srv://kiprotichkirui301_db_user:Li4YHJIsSHbkxW5E@cluster0.5plkme6.mongodb.net/bomapro?retryWrites=true&w=majority" npm run seed:production
   ```

## Why Railway Instead of Vercel?

- ✅ Full Node/NestJS server support (not serverless functions)
- ✅ Better for traditional applications
- ✅ Persistent processes
- ✅ Better WebSocket support
- ✅ Simpler configuration
- ✅ Free tier available

**Vercel** is great for Next.js, static sites, and serverless APIs.
**Railway** is better for NestJS, Express, and traditional Node.js servers.

---

**Backend on Railway + Frontend on Vercel = Perfect Setup** ✅
