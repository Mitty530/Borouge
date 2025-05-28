-- Supabase Schema for Borouge ESG Intelligence Engine
-- Run this in your Supabase SQL Editor

-- Main cache table for ESG intelligence responses
CREATE TABLE IF NOT EXISTS esg_intelligence_cache (
  id SERIAL PRIMARY KEY,
  query_hash TEXT UNIQUE NOT NULL,
  query TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  hit_count INTEGER DEFAULT 0
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_esg_cache_hash ON esg_intelligence_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_esg_cache_created ON esg_intelligence_cache(created_at);

-- User interaction tracking
CREATE TABLE IF NOT EXISTS esg_user_sessions (
  id SERIAL PRIMARY KEY,
  session_id UUID DEFAULT gen_random_uuid(),
  user_id TEXT,
  queries JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Query analytics for optimization
CREATE TABLE IF NOT EXISTS esg_query_analytics (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  query_type TEXT, -- 'regulatory', 'competitive', 'financial', etc.
  response_time_ms INTEGER,
  sources_found INTEGER,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  follow_up_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Popular queries tracking
CREATE TABLE IF NOT EXISTS esg_popular_queries (
  id SERIAL PRIMARY KEY,
  query TEXT UNIQUE NOT NULL,
  count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT
);

-- Row Level Security (RLS) policies
ALTER TABLE esg_intelligence_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_query_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_popular_queries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for MVP (adjust based on your auth requirements)
CREATE POLICY "Allow anonymous access to ESG cache" ON esg_intelligence_cache
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to user sessions" ON esg_user_sessions
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to analytics" ON esg_query_analytics
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to popular queries" ON esg_popular_queries
  FOR ALL USING (true);

-- Function to clean up old cache entries
CREATE OR REPLACE FUNCTION cleanup_old_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM esg_intelligence_cache 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update popular queries
CREATE OR REPLACE FUNCTION update_popular_query(query_text TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO esg_popular_queries (query, count, last_used)
  VALUES (query_text, 1, NOW())
  ON CONFLICT (query) 
  DO UPDATE SET 
    count = esg_popular_queries.count + 1,
    last_used = NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert some initial suggested queries
INSERT INTO esg_popular_queries (query, count, category) VALUES
('EU plastic regulations 2024', 5, 'regulatory'),
('CBAM carbon border adjustment', 8, 'regulatory'),
('Circular economy packaging', 3, 'environmental'),
('SABIC sustainability strategy', 4, 'competitive'),
('Petrochemical market trends', 6, 'market'),
('ESG reporting requirements', 7, 'governance'),
('Renewable feedstock adoption', 2, 'environmental'),
('Carbon footprint reduction', 9, 'environmental')
ON CONFLICT (query) DO NOTHING;