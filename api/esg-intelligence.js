// Vercel Serverless Function for ESG Intelligence
const { createClient } = require('@supabase/supabase-js');

// Use built-in fetch if available (Node.js 18+), otherwise use node-fetch
const fetch = globalThis.fetch || require('node-fetch');

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// ESG Intelligence Service (simplified for serverless)
class ESGIntelligenceService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.gnewsApiKey = process.env.GNEWS_API_KEY;
    this.geminiBaseUrl = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
    this.gnewsBaseUrl = process.env.GNEWS_BASE_URL || "https://gnews.io/api/v4";
  }

  async processQuery(query) {
    const startTime = Date.now();
    
    try {
      // Step 1: Fetch news articles
      const articles = await this.fetchNewsArticles(query);
      
      // Step 2: Generate AI analysis
      const analysis = await this.generateGeminiAnalysis(query, articles);
      
      // Step 3: Cache the result
      await this.cacheResult(query, analysis);
      
      return {
        success: true,
        query,
        response: analysis,
        responseTime: Date.now() - startTime,
        cached: false,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'gemini_ai',
          articlesAnalyzed: articles.length
        }
      };
    } catch (error) {
      console.error('ESG Intelligence processing error:', error);
      throw error;
    }
  }

  async fetchNewsArticles(query) {
    try {
      const response = await fetch(
        `${this.gnewsBaseUrl}/search?q=${encodeURIComponent(query)}&lang=en&country=us&max=10&apikey=${this.gnewsApiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`GNews API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('News fetch error:', error);
      return [];
    }
  }

  async generateGeminiAnalysis(query, articles) {
    const prompt = `
As an ESG intelligence expert, analyze the following query and news articles to provide comprehensive insights:

Query: "${query}"

News Articles:
${articles.map((article, index) => `
${index + 1}. Title: ${article.title}
   Description: ${article.description}
   Published: ${article.publishedAt}
   Source: ${article.source.name}
`).join('\n')}

Please provide a comprehensive ESG analysis including:
1. Executive Summary
2. Key ESG Impacts and Trends
3. Strategic Recommendations
4. Risk Assessment
5. Opportunities Identified

Format your response as a professional executive report without using markdown formatting (no ** or * symbols).
`;

    try {
      const response = await fetch(
        `${this.geminiBaseUrl}/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'Analysis could not be generated.';
    } catch (error) {
      console.error('Gemini analysis error:', error);
      return 'ESG analysis is temporarily unavailable. Please try again later.';
    }
  }

  async cacheResult(query, analysis) {
    try {
      await supabase
        .from('esg_intelligence_cache')
        .upsert({
          query_hash: this.hashQuery(query),
          query_text: query,
          response: analysis,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          hit_count: 1
        });
    } catch (error) {
      console.error('Cache error:', error);
    }
  }

  hashQuery(query) {
    // Simple hash function for query caching
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

// Serverless function handler
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed'
      }
    });
  }

  try {
    const { query } = req.body;

    // Validate request
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: 'Query is required and must be a non-empty string'
        }
      });
    }

    if (query.length > 1000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'QUERY_TOO_LONG',
          message: 'Query too long. Maximum 1000 characters allowed'
        }
      });
    }

    // Process the query
    const esgService = new ESGIntelligenceService();
    const result = await esgService.processQuery(query);

    res.status(200).json(result);

  } catch (error) {
    console.error('ESG Intelligence API error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'PROCESSING_ERROR',
        message: 'Failed to process ESG intelligence query',
        timestamp: new Date().toISOString()
      }
    });
  }
};
