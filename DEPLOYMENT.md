# 🚀 Borouge ESG Intelligence Platform - Deployment Guide

## 📋 Overview

This guide covers deployment strategies for the Borouge ESG Intelligence Platform across different environments.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend │    │   Supabase DB   │
│   (Port 3000)   │◄──►│   (Port 3001)   │◄──►│   (Cloud/Self)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   Redis Cache   │    │   AI Providers  │
│   (Port 80/443) │    │   (Port 6379)   │    │  Groq/Gemini/AI │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: 10GB available space
- **Network**: Stable internet connection for AI APIs

### Required Services
- **Supabase Account**: For database and authentication
- **AI API Keys**: Groq, Gemini, and OpenAI accounts
- **Domain**: For production deployment (optional)
- **SSL Certificate**: For HTTPS (recommended)

## 🌍 Environment Setup

### 1. Development Environment

```bash
# Clone repository
git clone https://github.com/Mitty530/Borouge.git
cd Borouge

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your actual values

# Start development servers
npm run dev  # Backend
cd ..
npm start    # Frontend
```

### 2. Production Environment

#### Option A: Traditional Deployment

```bash
# Build frontend
npm run build

# Install PM2 for process management
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start server.js --name "borouge-esg-backend"

# Serve frontend with nginx or static server
# Configure nginx to serve build/ directory
```

#### Option B: Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# For production with monitoring
docker-compose --profile production --profile monitoring up -d

# Scale services if needed
docker-compose up -d --scale backend=3
```

#### Option C: Cloud Platform Deployment

**Vercel (Frontend)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
vercel --prod
```

**Railway/Heroku (Backend)**
```bash
# Add environment variables in platform dashboard
# Deploy backend to Railway/Heroku
# Update frontend API URL to backend URL
```

## 🔐 Environment Variables

### Critical Variables (Required)
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# AI Providers
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

### Optional Variables
```env
# Performance
NODE_ENV=production
PORT=3001
CACHE_TTL_HOURS=24

# Security
CORS_ORIGINS=https://your-domain.com
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
ENABLE_ANALYTICS=true
SENTRY_DSN=your_sentry_dsn
```

## 🗄️ Database Setup

### Supabase Tables Required

```sql
-- ESG Intelligence Cache
CREATE TABLE esg_intelligence_cache (
  id SERIAL PRIMARY KEY,
  query_hash VARCHAR(64) UNIQUE NOT NULL,
  query TEXT NOT NULL,
  response JSONB NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Query Analytics
CREATE TABLE esg_query_analytics (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  query_type VARCHAR(50),
  response_time_ms INTEGER,
  sources_found INTEGER,
  user_rating INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Popular Queries
CREATE TABLE esg_popular_queries (
  id SERIAL PRIMARY KEY,
  query TEXT UNIQUE NOT NULL,
  category VARCHAR(100),
  count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes for Performance
```sql
CREATE INDEX idx_cache_query_hash ON esg_intelligence_cache(query_hash);
CREATE INDEX idx_analytics_created_at ON esg_query_analytics(created_at);
CREATE INDEX idx_popular_count ON esg_popular_queries(count DESC);
```

## 🔍 Health Checks

### Backend Health Check
```bash
curl -f http://localhost:3001/health
```

### Frontend Health Check
```bash
curl -f http://localhost:3000
```

### Database Health Check
```bash
curl -f http://localhost:3001/api/status
```

## 📊 Monitoring Setup

### Application Monitoring
- **Health Endpoints**: Built-in health checks
- **Performance Metrics**: Response times and cache hit rates
- **Error Tracking**: Comprehensive error logging
- **AI Provider Monitoring**: Provider health and failover status

### Infrastructure Monitoring
- **Docker**: Container health checks
- **Nginx**: Access and error logs
- **Database**: Connection pool and query performance
- **Redis**: Cache performance and memory usage

## 🔒 Security Checklist

### Pre-Deployment Security
- [ ] All environment variables secured
- [ ] API keys rotated and secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Error messages sanitized

### Production Security
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Security headers configured
- [ ] Database access restricted
- [ ] Regular security updates scheduled
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured

## 🚨 Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check environment variables
cat backend/.env

# Check logs
npm run dev
# or
docker logs borouge-esg-backend
```

**Frontend build fails**
```bash
# Clear cache and reinstall
npm run clean
npm install
npm run build
```

**Database connection issues**
```bash
# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     "https://your-project.supabase.co/rest/v1/"
```

**AI API failures**
```bash
# Check API key validity
curl -H "Authorization: Bearer YOUR_GROQ_KEY" \
     "https://api.groq.com/openai/v1/models"
```

## 📈 Performance Optimization

### Frontend Optimization
- Bundle analysis: `npm run analyze`
- Code splitting implemented
- Lazy loading for components
- Image optimization
- Service worker for caching

### Backend Optimization
- Response caching with Redis
- Database query optimization
- AI provider intelligent failover
- Request/response compression
- Connection pooling

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy Borouge ESG Platform
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      # Deploy steps here
```

## 📞 Support

For deployment issues:
1. Check logs first: `docker logs [container-name]`
2. Verify environment variables
3. Test API endpoints individually
4. Check database connectivity
5. Verify AI provider API keys

## 🔄 Updates and Maintenance

### Regular Maintenance
- **Weekly**: Check logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and rotate API keys
- **Annually**: Full security audit and architecture review
