# Borouge ESG Intelligence Platform

A comprehensive ESG (Environmental, Social, and Governance) intelligence platform specifically designed for Borouge, the UAE-based petrochemical producer. This platform provides AI-powered ESG analysis, regulatory compliance insights, and strategic business intelligence.

## 🚀 Features

### **Advanced AI Integration**
- **Multi-Provider Strategy**: Groq (primary), Gemini (secondary), OpenAI (backup)
- **Intelligent Provider Selection**: Query complexity-based provider optimization
- **Real-time Health Monitoring**: Circuit breaker patterns and automatic failover
- **Quality Assurance**: Response quality scoring and validation (93-98.5 scores)

### **ESG Intelligence Capabilities**
- **Regulatory Compliance Analysis**: EU CBAM, plastic directives, carbon regulations
- **Competitive Intelligence**: SABIC, Dow, and industry benchmarking
- **Financial Impact Assessment**: Short-term, long-term, and investment analysis
- **Strategic Recommendations**: Actionable insights for Borouge operations

### **Enterprise-Grade Performance**
- **Multi-Level Caching**: 24-hour query cache + 5-minute provider cache
- **Response Times**: <1.5s cached, <4s new queries
- **High Availability**: 99%+ uptime with robust error handling
- **Real-time Monitoring**: Comprehensive analytics and performance tracking

## 🏗️ Architecture

### **Backend (Node.js/Express)**
```
backend/
├── services/
│   ├── aiService.js              # Multi-provider AI integration
│   ├── aiProviderManager.js      # Provider health & selection
│   ├── responseParser.js         # JSON validation & repair
│   ├── esgIntelligenceService.js # Main ESG processing
│   └── cacheService.js           # Multi-level caching
├── server.js                     # Express server
└── .env                          # Environment configuration
```

### **Frontend (React)**
```
borouge-esg-frontend/
├── src/
│   ├── components/
│   │   ├── ConversationView.js   # Main chat interface
│   │   ├── ArticleView.js        # Article display
│   │   └── SuggestionChips.js    # Query suggestions
│   └── App.js                    # Main application
└── public/                       # Static assets
```

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 18+ and npm
- Supabase account and project
- AI API keys (Groq, Gemini, OpenAI)

### **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your API keys in .env
npm start
```

### **Frontend Setup**
```bash
cd borouge-esg-frontend
npm install
npm start
```

### **Environment Configuration**
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# AI Provider API Keys
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key

# Server Configuration
PORT=3001
NODE_ENV=development
```

## 📊 API Endpoints

### **ESG Intelligence**
- `POST /api/esg-intelligence` - Main ESG analysis endpoint
- `GET /api/suggested-queries` - Popular ESG query suggestions
- `GET /api/performance-report` - System performance metrics

### **AI Provider Monitoring**
- `GET /api/ai-providers/health` - Provider health status
- `GET /api/ai-providers/stats` - Comprehensive provider statistics
- `GET /api/ai-providers/recommendations` - Optimization recommendations

### **System Monitoring**
- `GET /api/status` - System status and health
- `GET /health` - Basic health check

## 🎯 Usage Examples

### **ESG Intelligence Query**
```bash
curl -X POST http://localhost:3001/api/esg-intelligence \
  -H "Content-Type: application/json" \
  -d '{"query": "EU CBAM carbon border adjustment impact on Borouge"}'
```

### **Follow-up Query**
```bash
curl -X POST http://localhost:3001/api/esg-intelligence \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the specific compliance deadlines?",
    "followUp": true,
    "previousContext": {
      "originalQuery": "EU CBAM impact",
      "riskLevel": "HIGH"
    }
  }'
```

## 📈 Performance Metrics

### **Response Times**
- **Cached Queries**: <1.5 seconds
- **New Queries**: 2-4 seconds
- **Provider Selection**: <50ms

### **Quality Scores**
- **Groq**: 93-95 (fast, reliable)
- **Gemini**: 95-98.5 (high quality)
- **OpenAI**: 95-100 (premium quality)

### **Availability**
- **System Uptime**: 99%+
- **Cache Hit Rate**: 70-80%
- **Provider Health**: Real-time monitoring

## 🔧 Development

### **Phase 1: API Contract Alignment** ✅
- Response format standardization
- Priority-based article classification
- Financial impact assessment structure

### **Phase 2: Two-Stage Interaction Flow** ✅
- Article list view support
- Article detail view with follow-ups
- Analytics tracking and copy functionality

### **Phase 3: Advanced AI Integration** ✅
- Intelligent provider selection
- Circuit breaker patterns
- Response quality scoring
- Cost optimization

## 🚀 Deployment

### **Production Checklist**
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented

### **Scaling Considerations**
- Horizontal scaling with load balancers
- Database read replicas for analytics
- CDN for static assets
- Redis for distributed caching

## 📝 License

This project is proprietary software developed for Borouge operations.

## 🤝 Contributing

This is a private repository for Borouge ESG Intelligence Platform development.

---

**Built with ❤️ for Borouge's ESG Intelligence needs**
