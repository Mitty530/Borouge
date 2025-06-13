# 🏢 Borouge ESG Intelligence Platform

A comprehensive, production-ready ESG intelligence platform for Borouge's strategic business intelligence needs.

## 🚀 Quick Deployment to Vercel

### Prerequisites
- GitHub repository with your code
- Vercel account
- All API keys ready (see environment variables below)

### Deploy Now
1. **Push to GitHub** (if not already done)
2. **Deploy to Vercel**: [Import Project](https://vercel.com/new)
3. **Set Environment Variables**: Upload `vercel.env` or copy-paste variables
4. **Test Deployment**: Use the test script provided

### Environment Variables for Vercel
Run this command to get formatted environment variables:
```bash
node format-env-for-vercel.js
```

Or manually copy from `vercel.env` file to Vercel dashboard.

### Test Your Deployment
```bash
node test-vercel-deployment.js https://your-app.vercel.app
```

📖 **Full deployment guide**: See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

## 📋 Project Overview

This platform provides AI-powered ESG intelligence analysis specifically tailored for Borouge's petrochemical operations, regulatory compliance, and competitive positioning in global markets.

### 🎯 Key Features
- **Multi-AI Engine Support**: Groq, Gemini, and OpenAI integration with intelligent failover
- **Advanced Caching**: Supabase-powered caching for optimal performance
- **Real-time Analytics**: Query tracking and performance monitoring
- **ESG-Focused Intelligence**: Specialized for petrochemical industry ESG requirements
- **Production-Ready**: Comprehensive error handling, rate limiting, and monitoring

## 🏗️ Project Structure

```
├── Bo_Prompt                    # 🎯 Master ESG Intelligence Prompt (CRITICAL - DO NOT MODIFY)
├── src/                        # ⚛️  React Frontend Application
│   ├── components/             # 🧩 Reusable UI Components
│   ├── App.js                  # 🏠 Main Application Component
│   └── index.js                # 🚀 Application Entry Point
├── backend/                    # 🔧 Node.js Backend Services
│   ├── services/               # 🤖 Core Business Logic Services
│   │   ├── esgIntelligenceService.js  # 🧠 Main ESG Processing
│   │   ├── aiService.js               # 🤖 AI Provider Management
│   │   ├── cacheService.js            # 💾 Caching Layer
│   │   └── responseParser.js          # 📝 Response Processing
│   ├── server.js               # 🌐 Express Server Configuration
│   └── package.json            # 📦 Backend Dependencies
├── public/                     # 🌐 Static Assets
└── package.json                # 📦 Frontend Dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account and project
- AI API keys (Groq, Gemini, OpenAI)

### Environment Setup

1. **Clone and Install Dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

2. **Environment Configuration**
Create `.env` file in the backend directory:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Engine Configuration
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama3-8b-8192
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Optional Configuration
NODE_ENV=development
PORT=3001
CACHE_TTL_HOURS=24
```

### 🏃‍♂️ Running the Application

**Development Mode:**
```bash
# Terminal 1: Start Backend Server
cd backend
npm run dev

# Terminal 2: Start Frontend Application
npm start
```

**Production Mode:**
```bash
# Backend
cd backend
npm start

# Frontend (build and serve)
npm run build
# Serve the build folder with your preferred static server
```

## 🔧 API Endpoints

### Core Endpoints
- `POST /api/esg-intelligence` - Main ESG query processing
- `GET /health` - Comprehensive health check
- `GET /api/status` - API status and statistics
- `GET /api/suggested-queries` - Popular query suggestions

### Monitoring Endpoints
- `GET /api/ai-providers/health` - AI engine health status
- `GET /api/ai-providers/stats` - Provider performance statistics
- `GET /api/performance-report` - System performance analytics

## 🧠 ESG Intelligence Features

### Specialized Analysis Areas
- **Regulatory Intelligence**: EU CBAM, REACH, packaging regulations
- **Market Intelligence**: Petrochemical trends, competitive analysis
- **Financial Impact**: Revenue quantification, CAPEX/OPEX analysis
- **Competitive Positioning**: SABIC, Dow, ExxonMobil benchmarking
- **Strategic Recommendations**: Immediate actions and long-term positioning

### AI Engine Strategy
- **Primary**: Groq (fast, cost-effective)
- **Secondary**: Gemini (comprehensive analysis)
- **Fallback**: OpenAI (emergency backup)
- **Intelligent Failover**: Automatic switching based on availability and performance

## 📊 Performance & Monitoring

### Caching Strategy
- **Cache TTL**: 24 hours (configurable)
- **Cache Hit Rate**: Tracked and optimized
- **Intelligent Invalidation**: Based on query similarity and freshness

### Analytics Tracking
- Query performance metrics
- AI provider performance
- User interaction patterns
- Error tracking and alerting

## 🔒 Security Features

- **Rate Limiting**: 100 requests/minute per IP
- **CORS Protection**: Configured for production domains
- **Input Validation**: Query sanitization and length limits
- **Error Handling**: Comprehensive error tracking without data leakage
- **Security Headers**: XSS protection, content type validation

## 🛠️ Development Guidelines

### Code Quality
- **ESLint**: Configured for React and Node.js
- **Error Handling**: Comprehensive async/await error handling
- **Logging**: Structured logging with timestamps and request tracking
- **Testing**: Ready for Jest/React Testing Library integration

### Deployment Considerations
- **Environment Variables**: All sensitive data externalized
- **Health Checks**: Comprehensive monitoring endpoints
- **Graceful Shutdown**: SIGTERM/SIGINT handling
- **Process Management**: Ready for PM2 or Docker deployment

## 📈 Current Status

✅ **Production-Ready Architecture**
✅ **Multi-AI Engine Integration**
✅ **Advanced Caching System**
✅ **Comprehensive Error Handling**
✅ **Real-time Performance Monitoring**
✅ **ESG-Specialized Intelligence**
✅ **Security Hardened**
✅ **Scalable Design**

## 🤝 Contributing

This platform is specifically designed for Borouge's ESG intelligence needs. All modifications should align with the master prompt requirements and maintain the specialized focus on petrochemical industry ESG analysis.

## 📞 Support

For technical issues or feature requests, refer to the comprehensive logging and monitoring systems built into the platform.
