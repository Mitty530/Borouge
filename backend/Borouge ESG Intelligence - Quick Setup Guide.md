# Borouge ESG Intelligence - Quick Setup Guide

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
npm install express cors @supabase/supabase-js
```

### 2. Environment Variables
Create `.env` file:
```bash
# Free API Keys (get these free)
GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here

# Your existing Supabase (already connected to Cursor)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Server config
PORT=3001
```

### 3. Setup Supabase Tables
- Go to your Supabase SQL Editor
- Run the SQL schema provided above
- Tables will be created automatically

### 4. Start Backend Server
```bash
node server.js
```

### 5. Connect Frontend
In your frontend code, update the API endpoint to:
```javascript
const API_URL = 'http://localhost:3001/api/esg-intelligence';

// Your existing frontend query function
async function processQuery(query) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  const result = await response.json();
  return result; // This matches your UI structure exactly
}
```

## 🎯 Response Format (Matches Your UI)

The backend returns exactly what your frontend expects:

```javascript
{
  "success": true,
  "articlesFound": 2,
  "priority": "HIGH", 
  "classification": "CRITICAL REGULATORY COMPLIANCE",
  
  "executiveSummary": "CBAM implementation will significantly impact...",
  
  "criticalFindings": [
    {
      "priority": "HIGH",
      "title": "Direct CBAM Cost Impact", 
      "description": "Estimated €45-75M annual CBAM liability...",
      "businessImpact": "Direct impact on EU exports"
    }
  ],
  
  "detailedAnalysis": "Full detailed analysis text...",
  "sources": [...],
  "followUpCapable": true
}
```

## 🔧 Free API Keys Setup

### Groq (30 requests/minute free)
1. Go to https://console.groq.com
2. Sign up → Create API key
3. Copy key to `.env`

### Gemini (60 requests/minute free) 
1. Go to https://aistudio.google.com
2. Get API key
3. Copy to `.env`

## ✅ Test Your Integration

### Test Backend:
```bash
curl -X POST http://localhost:3001/api/esg-intelligence \
  -H "Content-Type: application/json" \
  -d '{"query": "CBAM carbon border adjustment"}'
```

### Test Frontend:
- Click "CBAM carbon border adjustment" in your UI
- Should return structured analysis like your screenshot

## 🎨 Frontend Integration Points

Your existing frontend components should work perfectly:

1. **Search Bar** → POST to `/api/esg-intelligence`
2. **Suggested Queries** → GET from `/api/suggested-queries` 
3. **Results Display** → Response format matches your UI
4. **Follow-up Questions** → POST with `followUp: true`

## 📊 Caching & Performance

- **24-hour cache** for repeated queries
- **Sub-second response** for cached results
- **Automatic cleanup** of old cache entries
- **Query analytics** for optimization

## 💰 Cost Tracking

Current setup gives you:
- **1,800 queries/hour** (Groq: 30/min)
- **3,600 queries/hour** (Gemini: 60/min)  
- **100% free** for testing and demos
- **Easy upgrade** to Perplexity + Claude later

## 🔄 Upgrade Path

When ready for production:

1. Replace `getRelevantInformation()` with Perplexity API call
2. Add Claude API as alternative to Groq
3. Keep same response format → no frontend changes needed
4. Switch environment variables only

## 🐛 Quick Troubleshooting

**Backend won't start:**
- Check `.env` file exists
- Verify Supabase credentials

**API returns errors:**
- Check Groq/Gemini API keys are valid
- Verify Supabase connection

**Frontend can't connect:**
- Ensure backend running on port 3001
- Check CORS is enabled

## 🎯 Ready to Go!

Your frontend is already perfect - this backend will power it exactly as shown in your screenshots. The structured response format matches your UI components precisely.

Start the backend and your ESG Intelligence Engine is live! 🚀