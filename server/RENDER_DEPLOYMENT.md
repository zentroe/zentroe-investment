# Zentroe Investment Backend - Render Deployment Guide

## 🚀 Render Deployment Setup

### Step 1: Connect Your Repository
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `zentroe-investment`
4. Select the `server` directory as the root directory

### Step 2: Configure Service Settings
- **Name**: `zentroe-investment-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Type `server` (this tells Render your app is in the server folder)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Step 3: Environment Variables
Add these environment variables in Render dashboard:

```bash
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
MAILTRAP_TOKEN=your_mailtrap_token  
MAILTRAP_SENDER_EMAIL=your_sender_email
PORT=5000
```

### Step 4: Advanced Settings
- **Auto-Deploy**: ✅ Yes (deploys on git push)
- **Health Check Path**: `/` 
- **Instance Type**: Starter (Free) or Standard ($7/month)

## 📅 Cron Jobs (Automatic)
Your cron jobs will run automatically:
- **Daily Returns**: Every day at 12:00 AM
- **Daily Profits**: Every day at 12:01 AM

## 🔧 Features Enabled
- ✅ Persistent service (24/7 uptime)
- ✅ Background processes and cron jobs
- ✅ File uploads support
- ✅ Database connection pooling
- ✅ Automatic HTTPS/SSL
- ✅ Custom domain support
- ✅ Auto-deployments from Git

## 🌐 Your API URL
After deployment, your API will be available at:
`https://zentroe-investment-backend.onrender.com`

## 💡 Pro Tips
1. **Free Tier**: Spins down after 15 minutes of inactivity
2. **Paid Tier**: Always running, faster performance
3. **Logs**: Check Render dashboard for real-time logs
4. **Database**: Make sure MongoDB allows connections from `0.0.0.0/0`

## 🔍 Testing Deployment
Test these endpoints after deployment:
- `GET /` - Should return "Zentroe Backend is running ✅"
- `POST /auth/login` - Test authentication
- Check logs for cron job initialization messages