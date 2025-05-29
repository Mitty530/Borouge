# 🚀 Borouge ESG Intelligence Platform - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. **Clone & Install** (2 minutes)
```bash
# Clone the repository
git clone https://github.com/Mitty530/Borouge.git
cd Borouge

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. **Environment Setup** (2 minutes)
```bash
# Copy environment template
cd backend
cp .env.example .env

# Edit .env with your API keys
nano .env  # or use your preferred editor
```

**Required API Keys:**
- **Supabase**: [Get from Supabase Dashboard](https://supabase.com/dashboard)
- **Groq**: [Get from Groq Console](https://console.groq.com/keys)
- **Gemini**: [Get from AI Studio](https://aistudio.google.com/app/apikey)
- **OpenAI**: [Get from OpenAI Platform](https://platform.openai.com/api-keys)

### 3. **Start Development** (1 minute)
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd ..
npm start
```

**🎉 Done!** Open http://localhost:3000

---

## 🐳 Docker Quick Start (Alternative)

### One Command Setup
```bash
# Clone and start everything
git clone https://github.com/Mitty530/Borouge.git
cd Borouge
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
docker-compose up -d
```

**🎉 Done!** Open http://localhost:3000

---

## 🔧 Essential Configuration

### Minimum .env Configuration
```env
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# AI Providers (At least one required)
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

### Supabase Database Setup
```sql
-- Run these in Supabase SQL Editor
CREATE TABLE esg_intelligence_cache (
  id SERIAL PRIMARY KEY,
  query_hash VARCHAR(64) UNIQUE NOT NULL,
  query TEXT NOT NULL,
  response JSONB NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE esg_query_analytics (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  query_type VARCHAR(50),
  response_time_ms INTEGER,
  sources_found INTEGER,
  user_rating INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE esg_popular_queries (
  id SERIAL PRIMARY KEY,
  query TEXT UNIQUE NOT NULL,
  category VARCHAR(100),
  count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Health Checks

### Verify Everything Works
```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000

# Test ESG intelligence
curl -X POST http://localhost:3001/api/esg-intelligence \
  -H "Content-Type: application/json" \
  -d '{"query": "EU plastic regulations impact"}'
```

---

## 🎯 Test Queries

Try these ESG intelligence queries:
- "EU plastic regulations 2024"
- "CBAM carbon border adjustment"
- "Circular economy packaging"
- "SABIC sustainability strategy"
- "Petrochemical market trends"

---

## 🚨 Troubleshooting

### Backend Won't Start
```bash
# Check environment variables
cat backend/.env

# Check logs
cd backend
npm run dev
```

### Frontend Build Issues
```bash
# Clear cache and reinstall
npm run clean
npm install
```

### Database Connection Issues
```bash
# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     "https://your-project.supabase.co/rest/v1/"
```

---

## 📚 Next Steps

1. **Read Full Documentation**: [README.md](./README.md)
2. **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Cleaning Report**: [CODEBASE_CLEANING_REPORT.md](./CODEBASE_CLEANING_REPORT.md)

---

## 🆘 Need Help?

1. **Check Logs**: Always check console/terminal logs first
2. **Verify API Keys**: Ensure all API keys are valid and have sufficient quota
3. **Database Setup**: Confirm Supabase tables are created
4. **Network Issues**: Check firewall and network connectivity

---

**🎉 You're Ready!** The Borouge ESG Intelligence Platform is now running and ready for ESG analysis.
