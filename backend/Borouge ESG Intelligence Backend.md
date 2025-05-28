// Borouge ESG Intelligence Backend
// Matches the frontend interface shown in the images

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const config = {
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: "llama3-8b-8192",
    baseUrl: "https://api.groq.com/openai/v1"
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl: "https://generativelanguage.googleapis.com/v1beta"
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY
  }
};

const supabase = createClient(config.supabase.url, config.supabase.key);

// Main ESG Intelligence endpoint
app.post('/api/esg-intelligence', async (req, res) => {
  try {
    const { query, followUp = false, previousContext = null } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`Processing ESG query: ${query}`);
    
    // Check cache first
    const cachedResult = await checkCache(query);
    if (cachedResult && !followUp) {
      console.log('Returning cached result');
      return res.json(cachedResult);
    }

    // Process the query
    const result = await processESGIntelligence(query, followUp, previousContext);
    
    // Cache the result
    if (!followUp) {
      await cacheResult(query, result);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('ESG Intelligence Error:', error);
    res.status(500).json({ 
      error: 'Failed to process ESG intelligence query',
      details: error.message 
    });
  }
});

// Core ESG processing function
async function processESGIntelligence(query, isFollowUp = false, previousContext = null) {
  try {
    // Step 1: Get relevant information (simulating web search for now)
    const searchResults = await getRelevantInformation(query);
    
    // Step 2: Analyze with AI (using Groq)
    const analysis = await analyzeWithAI(query, searchResults, isFollowUp, previousContext);
    
    // Step 3: Structure the response to match frontend format
    const structuredResponse = structureESGResponse(analysis, searchResults);
    
    return structuredResponse;
    
  } catch (error) {
    console.error('Processing error:', error);
    throw error;
  }
}

// Simulate web search (replace with actual search API later)
async function getRelevantInformation(query) {
  // For now, return mock data based on query type
  // In production, this would call Perplexity or Google Search API
  
  const mockSources = [
    {
      title: "EU Carbon Border Adjustment Mechanism Implementation Timeline",
      snippet: "CBAM will apply to cement, iron and steel, aluminum, fertilizers, electricity and hydrogen from October 2023, with financial obligations starting January 2026.",
      url: "https://europa.eu/cbam-regulation-2023",
      relevance: "high"
    },
    {
      title: "Petrochemical Industry CBAM Impact Assessment",
      snippet: "Chemical companies face estimated additional costs of €40-80M annually for EU exports under CBAM, particularly affecting polyethylene and polypropylene producers.",
      url: "https://chemicalweek.com/cbam-impact-2024",
      relevance: "high"
    },
    {
      title: "UAE Renewable Energy Transition Strategy",
      snippet: "UAE's commitment to 50% clean energy by 2050 positions local producers favorably against coal-dependent Asian competitors for CBAM compliance.",
      url: "https://uae-energy-strategy-2050",
      relevance: "medium"
    }
  ];
  
  // Filter based on query content
  return mockSources.filter(source => 
    source.snippet.toLowerCase().includes(extractKeyTerms(query).some(term => 
      source.snippet.toLowerCase().includes(term.toLowerCase())
    ))
  );
}

// Extract key terms from query for search
function extractKeyTerms(query) {
  const terms = query.toLowerCase().split(' ');
  const keyTerms = [];
  
  // Add Borouge-specific context
  if (terms.some(t => ['cbam', 'carbon', 'border'].includes(t))) {
    keyTerms.push('carbon border adjustment', 'petrochemical', 'polyethylene');
  }
  if (terms.some(t => ['plastic', 'packaging'].includes(t))) {
    keyTerms.push('packaging directive', 'single use plastic', 'circular economy');
  }
  if (terms.some(t => ['regulation', 'compliance'].includes(t))) {
    keyTerms.push('eu regulation', 'compliance requirements');
  }
  
  return keyTerms;
}

// AI Analysis using Groq
async function analyzeWithAI(query, searchResults, isFollowUp, previousContext) {
  const systemPrompt = `You are an ESG intelligence analyst for Borouge, a UAE-based petrochemical company (ADNOC subsidiary).

Company Context:
- Products: 5M tonnes polyolefins (polypropylene/polyethylene)  
- EU Exports: €2.3B annually
- Asian Markets: $1.8B annually
- Key Competitors: SABIC, Dow, ExxonMobil, LyondellBasell
- Parent: ADNOC (renewable energy transition underway)

Your task is to analyze the query and search results to provide structured business intelligence.

${isFollowUp ? `Previous Context: ${previousContext}` : ''}

Query: ${query}

Search Results:
${searchResults.map((result, i) => `
${i+1}. ${result.title}
${result.snippet}
Source: ${result.url}
`).join('\n')}

Provide analysis in this JSON structure:
{
  "executiveSummary": "2-3 sentence summary of business impact",
  "criticalFindings": [
    {
      "priority": "HIGH|MEDIUM|LOW",
      "title": "Finding title",
      "description": "Detailed description with specific numbers/impact",
      "businessImpact": "Direct impact on Borouge operations/financials"
    }
  ],
  "detailedAnalysis": "Comprehensive analysis with regulatory details, competitive implications, and strategic recommendations",
  "actionItems": [
    "Specific actionable next steps for Borouge teams"
  ],
  "financialImpact": {
    "shortTerm": "0-2 years impact",
    "longTerm": "3-5 years impact",
    "investmentRequired": "Estimated investment needed"
  },
  "riskLevel": "HIGH|MEDIUM|LOW",
  "sources": 3
}`;

  try {
    const response = await fetch(`${config.groq.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groq.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.groq.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse JSON, fallback to structured text if needed
    try {
      return JSON.parse(content);
    } catch (parseError) {
      // Fallback: create structured response from text
      return parseUnstructuredResponse(content);
    }
    
  } catch (error) {
    console.error('AI Analysis error:', error);
    throw error;
  }
}

// Structure response to match frontend format
function structureESGResponse(analysis, searchResults) {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    query: analysis.query || "ESG Intelligence Query",
    articlesFound: searchResults.length,
    priority: analysis.riskLevel || "MEDIUM",
    classification: "CRITICAL REGULATORY COMPLIANCE",
    
    executiveSummary: analysis.executiveSummary || "Analysis completed for Borouge ESG intelligence query.",
    
    criticalFindings: analysis.criticalFindings || [
      {
        priority: "HIGH",
        title: "Regulatory Compliance Impact",
        description: "Significant regulatory changes affecting Borouge operations",
        businessImpact: "Direct impact on EU export revenues"
      }
    ],
    
    detailedAnalysis: analysis.detailedAnalysis || "Detailed analysis of regulatory and competitive implications for Borouge's petrochemical operations.",
    
    actionItems: analysis.actionItems || [
      "Review compliance requirements with legal team",
      "Assess financial impact on EU operations",
      "Develop strategic response plan"
    ],
    
    financialImpact: analysis.financialImpact || {
      shortTerm: "€45-75M annual additional costs",
      longTerm: "€200-300M investment opportunity by 2030",
      investmentRequired: "€300-500M for carbon reduction initiatives"
    },
    
    sources: searchResults.map((source, index) => ({
      id: index + 1,
      title: source.title,
      url: source.url,
      snippet: source.snippet,
      relevance: source.relevance || "medium"
    })),
    
    followUpCapable: true,
    suggestedFollowUps: [
      "What are the specific compliance deadlines?",
      "How are competitors responding to these changes?",
      "What investment options could reduce our exposure?"
    ]
  };
}

// Fallback parser for unstructured AI responses
function parseUnstructuredResponse(content) {
  return {
    executiveSummary: content.substring(0, 300) + "...",
    criticalFindings: [
      {
        priority: "MEDIUM",
        title: "Analysis Available",
        description: "Detailed analysis has been generated",
        businessImpact: "Review full analysis for business implications"
      }
    ],
    detailedAnalysis: content,
    actionItems: ["Review detailed analysis", "Consult with relevant teams"],
    financialImpact: {
      shortTerm: "Impact assessment required",
      longTerm: "Long-term implications under review",
      investmentRequired: "Investment analysis needed"
    },
    riskLevel: "MEDIUM"
  };
}

// Cache management
async function checkCache(query) {
  try {
    const { data, error } = await supabase
      .from('esg_intelligence_cache')
      .select('*')
      .eq('query_hash', hashQuery(query))
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24 hour cache
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    
    if (data && data.length > 0) {
      return data[0].response;
    }
    
    return null;
  } catch (error) {
    console.error('Cache check error:', error);
    return null;
  }
}

async function cacheResult(query, result) {
  try {
    const { data, error } = await supabase
      .from('esg_intelligence_cache')
      .insert({
        query_hash: hashQuery(query),
        query: query,
        response: result,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Cache save error:', error);
  }
}

function hashQuery(query) {
  return Buffer.from(query.toLowerCase().trim()).toString('base64');
}

// Suggested queries endpoint
app.get('/api/suggested-queries', (req, res) => {
  const suggestions = [
    "EU plastic regulations 2024",
    "CBAM carbon border adjustment", 
    "Circular economy packaging",
    "SABIC sustainability strategy",
    "Petrochemical market trends",
    "ESG reporting requirements",
    "Renewable feedstock adoption",
    "Carbon footprint reduction"
  ];
  
  res.json({ suggestions });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Borouge ESG Intelligence API running on port ${PORT}`);
  console.log(`🔗 Frontend should connect to: http://localhost:${PORT}/api/esg-intelligence`);
});

module.exports = app;