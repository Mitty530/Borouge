# Borouge ESG Intelligence Platform - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository
Ensure your code is pushed to GitHub with the latest changes:
```bash
git add .
git commit -m "Prepare for Vercel deployment with serverless functions"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
cd Borouge
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set up project settings
# - Deploy
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `Borouge` folder as the root directory
5. Configure environment variables (see step 3)
6. Deploy

### 3. Environment Variables Setup

#### Method 1: Upload .env File (Easiest)
1. In Vercel dashboard, go to your project
2. Navigate to Settings → Environment Variables
3. Click "Import .env" 
4. Upload the `vercel.env` file from your project root

#### Method 2: Manual Entry
Copy and paste these variables one by one in Vercel dashboard:

```env
NODE_ENV=production
VERCEL=1
VITE_SUPABASE_URL=https://dqvhivaguuyzlmxfvgrm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdmhpdmFndXV5emxteGZ2Z3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTMzOTgsImV4cCI6MjA2Mzc2OTM5OH0.TuGFEQlyvvrU_KzAwwGcJzRomb9DH_o-tN3xpdcqh24
GEMINI_API_KEY=AIzaSyD0wqgnyyHSgz0joVRQOhNZFjfctcdVpWg
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_MODEL=gemini-1.5-flash-latest
GEMINI_TIMEOUT=15000
GEMINI_RATE_LIMIT=900
GNEWS_API_KEY=3c576e2873be00982cd732cf83301022
GNEWS_BASE_URL=https://gnews.io/api/v4
GNEWS_RATE_LIMIT=100
GNEWS_DAILY_LIMIT=100
CACHE_TTL_HOURS=24
MAX_CACHE_ENTRIES=1000
PROVIDER_CACHE_TTL=300000
MAX_RESPONSE_TIME=10000
ENABLE_COMPRESSION=true
ENABLE_CACHING=true
ENABLE_ANALYTICS=true
ENABLE_MONITORING=true
LOG_LEVEL=info
ENABLE_PERFORMANCE_TRACKING=true
API_RATE_LIMIT=100
ENABLE_CORS=true
CORS_ORIGIN=*
DISABLE_ESLINT_PLUGIN=true
GENERATE_SOURCEMAP=false
SKIP_PREFLIGHT_CHECK=true
VERCEL_ENV=production
VERCEL_REGION=iad1
```

### 4. Verify Deployment

After deployment, test these endpoints:

#### Health Check
```
GET https://your-app.vercel.app/api/health
```

#### ESG Intelligence
```
POST https://your-app.vercel.app/api/esg-intelligence
Content-Type: application/json

{
  "query": "EU plastic waste regulations 2024"
}
```

#### Suggested Queries
```
GET https://your-app.vercel.app/api/suggested-queries
```

## 🏗️ Architecture Overview

### Frontend (React)
- Deployed as static files on Vercel
- Uses relative URLs to call API functions
- Optimized build with no source maps

### Backend (Serverless Functions)
- `/api/esg-intelligence.js` - Main ESG analysis endpoint
- `/api/health.js` - Health check endpoint  
- `/api/suggested-queries.js` - Popular queries endpoint
- Each function runs independently on Vercel's serverless infrastructure

### Database
- Supabase PostgreSQL database
- Handles caching, analytics, and data storage
- Configured with environment variables

## 🔧 Configuration Files

### `vercel.json`
- Configures serverless functions
- Sets up routing and CORS headers
- Optimizes for Node.js 18.x runtime

### `package.json`
- Removed proxy configuration (not needed for serverless)
- Optimized build scripts for Vercel
- Vercel-specific build command

## 🚨 Troubleshooting

### Common Issues

#### 1. "Backend: Error" Message
- Check environment variables are properly set
- Verify API endpoints are accessible
- Check Vercel function logs

#### 2. CORS Errors
- Ensure CORS headers are set in serverless functions
- Check `vercel.json` configuration

#### 3. Database Connection Issues
- Verify Supabase URL and keys
- Check database permissions
- Test connection in health endpoint

#### 4. API Rate Limits
- Monitor GNews API usage
- Check Gemini API quotas
- Implement proper error handling

### Debugging Steps

1. **Check Vercel Function Logs**
   ```bash
   vercel logs your-deployment-url
   ```

2. **Test API Endpoints Individually**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

3. **Verify Environment Variables**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Ensure all required variables are set

4. **Check Build Logs**
   - Review build process in Vercel dashboard
   - Look for any compilation errors

## 📊 Performance Optimization

### Caching Strategy
- Database-level caching for repeated queries
- 24-hour cache TTL for ESG analyses
- Efficient query hashing

### Response Time Targets
- Health check: < 500ms
- ESG Intelligence: < 10 seconds
- Suggested queries: < 1 second

### Monitoring
- Built-in analytics tracking
- Performance metrics collection
- Error logging and reporting

## 🔐 Security Features

- CORS protection
- Rate limiting per endpoint
- Input validation and sanitization
- Secure environment variable handling
- No sensitive data in client-side code

## 📈 Scaling Considerations

- Serverless functions auto-scale with demand
- Database connection pooling via Supabase
- CDN distribution for static assets
- Regional deployment optimization

## 🎯 Next Steps After Deployment

1. **Update Domain Settings** (if using custom domain)
2. **Configure Analytics** (Vercel Analytics integration)
3. **Set up Monitoring** (alerts and notifications)
4. **Performance Testing** (load testing with realistic queries)
5. **User Acceptance Testing** (validate all features work correctly)

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review Vercel documentation
3. Check Supabase status
4. Verify API key validity
5. Contact development team with specific error messages and logs
