-- ESG News Intelligence Schema Extension for Borouge Platform
-- Extends existing Supabase schema with news aggregation and analysis capabilities

-- =============================================================================
-- NEWS ARTICLES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS esg_news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  language TEXT DEFAULT 'en',
  
  -- Analysis fields
  relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
  impact_level TEXT CHECK (impact_level IN ('HIGH', 'MEDIUM', 'LOW', 'OPPORTUNITY')),
  summary TEXT,
  action_items JSONB,
  borouge_keywords TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'))
);

-- =============================================================================
-- SEARCH SESSIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS esg_search_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_query TEXT NOT NULL,
  enhanced_queries JSONB,
  search_keywords TEXT[],
  
  -- Results metrics
  articles_found INTEGER DEFAULT 0,
  relevant_articles INTEGER DEFAULT 0,
  high_impact_count INTEGER DEFAULT 0,
  medium_impact_count INTEGER DEFAULT 0,
  low_impact_count INTEGER DEFAULT 0,
  opportunity_count INTEGER DEFAULT 0,
  
  -- Performance metrics
  processing_time_ms INTEGER,
  api_calls_made INTEGER DEFAULT 0,
  cache_hits INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed'))
);

-- =============================================================================
-- API QUOTA TRACKING TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS esg_api_quota_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_provider TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  requests_made INTEGER DEFAULT 0,
  daily_limit INTEGER NOT NULL,
  last_request_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(api_provider, date)
);

-- =============================================================================
-- SEARCH KEYWORDS TRACKING
-- =============================================================================
CREATE TABLE IF NOT EXISTS esg_search_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  search_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  effectiveness_score DECIMAL(3,2) DEFAULT 0.0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(keyword)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- News articles indexes
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON esg_news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_relevance_score ON esg_news_articles(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_impact_level ON esg_news_articles(impact_level);
CREATE INDEX IF NOT EXISTS idx_news_articles_processing_status ON esg_news_articles(processing_status);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON esg_news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_articles_keywords ON esg_news_articles USING GIN(borouge_keywords);

-- Search sessions indexes
CREATE INDEX IF NOT EXISTS idx_search_sessions_created_at ON esg_search_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_sessions_status ON esg_search_sessions(status);

-- API quota tracking indexes
CREATE INDEX IF NOT EXISTS idx_api_quota_provider_date ON esg_api_quota_tracking(api_provider, date);

-- Search keywords indexes
CREATE INDEX IF NOT EXISTS idx_search_keywords_count ON esg_search_keywords(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_search_keywords_effectiveness ON esg_search_keywords(effectiveness_score DESC);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to news articles
CREATE TRIGGER update_esg_news_articles_updated_at 
    BEFORE UPDATE ON esg_news_articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INITIAL DATA SETUP
-- =============================================================================

-- Insert initial API quota tracking records
INSERT INTO esg_api_quota_tracking (api_provider, daily_limit) 
VALUES 
  ('gnews', 100),
  ('newsapi', 100)
ON CONFLICT (api_provider, date) DO NOTHING;

-- Insert common Borouge-related keywords
INSERT INTO esg_search_keywords (keyword) 
VALUES 
  ('polyethylene'),
  ('polypropylene'),
  ('petrochemical'),
  ('plastic waste'),
  ('circular economy'),
  ('CBAM'),
  ('REACH'),
  ('UAE'),
  ('Singapore'),
  ('Borouge'),
  ('ADNOC'),
  ('Borealis'),
  ('SABIC'),
  ('Dow Chemical'),
  ('ExxonMobil')
ON CONFLICT (keyword) DO NOTHING;

-- =============================================================================
-- VIEWS FOR ANALYTICS
-- =============================================================================

-- High-impact articles view
CREATE OR REPLACE VIEW high_impact_articles AS
SELECT 
  id,
  title,
  description,
  url,
  source,
  published_at,
  relevance_score,
  impact_level,
  summary,
  action_items,
  created_at
FROM esg_news_articles 
WHERE impact_level = 'HIGH' 
  AND processing_status = 'completed'
ORDER BY published_at DESC, relevance_score DESC;

-- Daily search analytics view
CREATE OR REPLACE VIEW daily_search_analytics AS
SELECT 
  DATE(created_at) as search_date,
  COUNT(*) as total_searches,
  AVG(articles_found) as avg_articles_found,
  AVG(relevant_articles) as avg_relevant_articles,
  SUM(high_impact_count) as total_high_impact,
  AVG(processing_time_ms) as avg_processing_time
FROM esg_search_sessions 
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY search_date DESC;

-- API usage analytics view
CREATE OR REPLACE VIEW api_usage_analytics AS
SELECT 
  api_provider,
  date,
  requests_made,
  daily_limit,
  ROUND((requests_made::DECIMAL / daily_limit * 100), 2) as usage_percentage,
  (daily_limit - requests_made) as remaining_quota
FROM esg_api_quota_tracking 
ORDER BY date DESC, api_provider;
