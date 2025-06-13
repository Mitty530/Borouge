// Vercel Serverless Function for Suggested Queries
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Default ESG query suggestions
const defaultSuggestions = [
  'EU plastic waste regulations 2024',
  'Carbon border adjustment mechanism CBAM',
  'Circular economy petrochemicals',
  'REACH compliance requirements',
  'Sustainability reporting standards',
  'ESG disclosure requirements UAE',
  'Plastic recycling technologies',
  'Green hydrogen petrochemicals'
];

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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method is allowed'
      }
    });
  }

  try {
    // Try to fetch popular queries from database
    const { data, error } = await supabase
      .from('esg_popular_queries')
      .select('query, category, count')
      .order('count', { ascending: false })
      .limit(8);

    let suggestions = defaultSuggestions;
    let categories = {};

    if (!error && data && data.length > 0) {
      suggestions = data.map(item => item.query);
      categories = data.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item.query);
        return acc;
      }, {});
    }

    res.status(200).json({
      success: true,
      queries: suggestions,
      suggestions: suggestions, // For backward compatibility
      categories,
      timestamp: new Date().toISOString(),
      source: data && data.length > 0 ? 'database' : 'default'
    });

  } catch (error) {
    console.error('Suggested queries error:', error);
    
    // Return default suggestions on error
    res.status(200).json({
      success: true,
      queries: defaultSuggestions,
      suggestions: defaultSuggestions,
      categories: {
        'regulations': ['EU plastic waste regulations 2024', 'REACH compliance requirements'],
        'carbon': ['Carbon border adjustment mechanism CBAM'],
        'circular_economy': ['Circular economy petrochemicals', 'Plastic recycling technologies'],
        'reporting': ['Sustainability reporting standards', 'ESG disclosure requirements UAE'],
        'innovation': ['Green hydrogen petrochemicals']
      },
      timestamp: new Date().toISOString(),
      source: 'default',
      note: 'Using default suggestions due to database error'
    });
  }
};
