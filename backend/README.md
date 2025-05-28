# Borouge ESG Intelligence Backend

Production-ready Express.js API server for the Borouge ESG Intelligence Platform with comprehensive error handling, monitoring, and multi-LLM strategy support.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- Supabase project with ESG Intelligence schema

### Installation
```bash
npm install
```

### Environment Setup
Copy the environment variables from `APIs` file to `.env`:
```bash
cp APIs .env
```

### Start Development Server
```bash
npm run dev
```

### Start Production Server
```bash
npm start
```

## 📊 API Endpoints

### Health & Status
- `GET /health` - Server health check with database connectivity test
- `GET /api/status` - API status with statistics

### ESG Intelligence
- `POST /api/esg-intelligence` - Main ESG intelligence processing with AI analysis ✅
- `GET /api/suggested-queries` - Get popular ESG queries by category ✅
- `GET /api/performance-report` - System performance metrics ✅

### Advanced AI Monitoring
- `GET /api/ai-providers/health` - AI provider health status and availability ✅
- `GET /api/ai-providers/stats` - Comprehensive AI provider statistics and metrics ✅
- `GET /api/ai-providers/recommendations` - Optimization recommendations for AI usage ✅

## 🔧 Configuration

### Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GROQ_API_KEY` - Primary AI engine (Groq)
- `GEMINI_API_KEY` - Secondary AI engine (Gemini)
- `OPENAI_API_KEY` - Emergency backup AI engine
- `NEWS_API_KEY` - News source API key
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

### Features
- ✅ **CORS Configuration** - Frontend integration ready
- ✅ **Rate Limiting** - 100 requests/minute per IP
- ✅ **Error Handling** - Comprehensive error tracking and logging
- ✅ **Security Headers** - Production-ready security configuration
- ✅ **Request Logging** - Detailed request/response monitoring
- ✅ **Database Integration** - Supabase with optimized queries
- ✅ **Performance Monitoring** - Real-time metrics and analytics
- ✅ **Graceful Shutdown** - Proper process management

## 🏗️ Architecture

### Core Infrastructure ✅ (Phase 1 - COMPLETED)
- Express.js server with production-ready middleware
- Environment variable validation
- CORS configuration for frontend integration
- Comprehensive error handling and logging
- Rate limiting and security headers
- Database connectivity with Supabase
- Health checks and monitoring endpoints

### ESG Intelligence Service ✅ (Phase 2 - COMPLETED)
- ✅ **Main Processing Endpoint** - `/api/esg-intelligence` with structured responses
- ✅ **Multi-AI Integration** - Groq (primary), Gemini (secondary), OpenAI (backup)
- ✅ **24-Hour Caching** - Intelligent query caching with hit tracking
- ✅ **Follow-up Processing** - Contextual follow-up query capabilities
- ✅ **Priority-based Sorting** - Critical Regulatory → High Financial → Competitive
- ✅ **Analytics Tracking** - Comprehensive query and performance analytics
- ✅ **Borouge Context** - UAE petrochemical producer specific intelligence

### Advanced AI Integration ✅ (Phase 3 - COMPLETED)
- ✅ **Intelligent Provider Selection** - Optimal provider selection based on query complexity
- ✅ **Advanced Health Monitoring** - Real-time provider health tracking with circuit breakers
- ✅ **Response Quality Scoring** - Automated quality assessment and validation
- ✅ **Provider-Level Caching** - 5-minute provider cache for performance optimization
- ✅ **Circuit Breaker Pattern** - Automatic failover for unavailable providers
- ✅ **Rate Limit Prediction** - Proactive provider switching before hitting limits
- ✅ **Response Parsing & Repair** - Advanced JSON validation and malformed response repair
- ✅ **Cost Optimization** - Intelligent cost tracking and provider cost optimization
- ✅ **Exponential Backoff** - Sophisticated retry logic with exponential backoff
- ✅ **Quality Assurance** - Completeness, relevance, and structure validation

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### API Status
```bash
curl http://localhost:3001/api/status
```

### Suggested Queries
```bash
curl http://localhost:3001/api/suggested-queries
```

### Performance Report
```bash
curl http://localhost:3001/api/performance-report
```

### ESG Intelligence Processing
```bash
# Main ESG intelligence query
curl -X POST http://localhost:3001/api/esg-intelligence \
  -H "Content-Type: application/json" \
  -d '{"query": "EU CBAM carbon border adjustment impact on Borouge"}'

# Follow-up query with context
curl -X POST http://localhost:3001/api/esg-intelligence \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the specific compliance deadlines?",
    "followUp": true,
    "previousContext": {
      "originalQuery": "EU CBAM carbon border adjustment impact on Borouge",
      "riskLevel": "HIGH"
    }
  }'
```

### Advanced AI Monitoring
```bash
# AI Provider health status
curl http://localhost:3001/api/ai-providers/health

# Comprehensive AI provider statistics
curl http://localhost:3001/api/ai-providers/stats

# AI optimization recommendations
curl http://localhost:3001/api/ai-providers/recommendations
```

## 📈 Monitoring

The server provides comprehensive monitoring through:
- Request/response logging with timing
- Error tracking with stack traces
- Performance metrics via `/api/performance-report`
- Database health monitoring
- Memory and uptime statistics

## 🔒 Security

- CORS policy enforcement
- Rate limiting (100 req/min)
- Security headers (XSS, CSRF protection)
- Input validation and sanitization
- Error message sanitization for production

## 🚀 Deployment Ready

The server is production-ready with:
- Environment-based configuration
- Graceful shutdown handling
- Process error management
- Comprehensive logging
- Health check endpoints for load balancers
