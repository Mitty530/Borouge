#!/bin/bash

# Upload environment variables to Vercel
echo "🚀 Uploading environment variables to Vercel..."

# Critical environment variables
vercel env add NODE_ENV production production
vercel env add VERCEL 1 production
vercel env add VITE_SUPABASE_URL https://dqvhivaguuyzlmxfvgrm.supabase.co production
vercel env add VITE_SUPABASE_ANON_KEY eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdmhpdmFndXV5emxteGZ2Z3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTMzOTgsImV4cCI6MjA2Mzc2OTM5OH0.TuGFEQlyvvrU_KzAwwGcJzRomb9DH_o-tN3xpdcqh24 production
vercel env add GEMINI_API_KEY AIzaSyD0wqgnyyHSgz0joVRQOhNZFjfctcdVpWg production
vercel env add GEMINI_BASE_URL https://generativelanguage.googleapis.com/v1beta production
vercel env add GEMINI_MODEL gemini-1.5-flash-latest production
vercel env add GEMINI_TIMEOUT 15000 production
vercel env add GEMINI_RATE_LIMIT 900 production
vercel env add GNEWS_API_KEY 3c576e2873be00982cd732cf83301022 production
vercel env add GNEWS_BASE_URL https://gnews.io/api/v4 production
vercel env add GNEWS_RATE_LIMIT 100 production
vercel env add GNEWS_DAILY_LIMIT 100 production

# Caching configuration
vercel env add CACHE_TTL_HOURS 24 production
vercel env add MAX_CACHE_ENTRIES 1000 production
vercel env add PROVIDER_CACHE_TTL 300000 production

# Performance configuration
vercel env add MAX_RESPONSE_TIME 10000 production
vercel env add ENABLE_COMPRESSION true production
vercel env add ENABLE_CACHING true production

# Monitoring and analytics
vercel env add ENABLE_ANALYTICS true production
vercel env add ENABLE_MONITORING true production
vercel env add LOG_LEVEL info production
vercel env add ENABLE_PERFORMANCE_TRACKING true production

# Security configuration
vercel env add API_RATE_LIMIT 100 production
vercel env add ENABLE_CORS true production
vercel env add CORS_ORIGIN "*" production

# Frontend build configuration
vercel env add DISABLE_ESLINT_PLUGIN true production
vercel env add GENERATE_SOURCEMAP false production
vercel env add SKIP_PREFLIGHT_CHECK true production

# Vercel specific configuration
vercel env add VERCEL_ENV production production
vercel env add VERCEL_REGION iad1 production

echo "✅ Environment variables uploaded successfully!"
echo "🔄 Triggering production deployment..."

# Trigger a new deployment
vercel --prod

echo "🎉 Deployment complete! Check https://borouge.vercel.app"
