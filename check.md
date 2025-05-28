Borouge ESG Intelligence MVP - Perplexity + Claude Hybrid Architecture
Classification: Borouge Internal Development Guide
Document Type: Technical Architecture & Implementation Guide
Purpose: MVP development using Perplexity (web search) + Claude (business analysis)
Budget: $3 API allocation + Supabase free tier

🎯 Executive Summary
Project Overview
This document outlines the technical architecture for Borouge's ESG Intelligence MVP using a hybrid approach: Perplexity API for web search + Claude API for business analysis. This combination delivers enterprise-grade intelligence quality within a $3 budget constraint.
Strategic Approach
Two-Stage Intelligence Pipeline:

Stage 1: Perplexity performs comprehensive web search with source citations
Stage 2: Claude or chatGPT analyzes search results for Borouge-specific business intelligence
Result: Real-time, structured business intelligence with source credibility

Success Metrics

Cost Efficiency: 100+ full conversations within $3 budget
Quality: Enterprise-grade intelligence combining best web search + analysis
Speed: Real-time responses for stakeholder demonstrations
Credibility: Source citations + sophisticated business analysis

🏗️ System Architecture Overview
High-Level Architecture Flow
User Query → API Gateway → Perplexity Search → Claude Analysis → Structured Response → Frontend
                ↓                ↓                ↓
           Supabase Cache → Response Cache → Conversation History


Component Architecture
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│              React Conversational Interface                  │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                         │
│         API Gateway + Query Processing + Response           │
├─────────────────────────────────────────────────────────────┤
│                     INTELLIGENCE LAYER                      │
│    Perplexity Web Search + Claude Business Analysis        │
├─────────────────────────────────────────────────────────────┤
│                      CACHING LAYER                          │
│        Supabase + Redis (optional) + Response Cache        │
├─────────────────────────────────────────────────────────────┤
│                       DATA LAYER                            │
│      Conversation History + Query Analytics + Cache        │
└─────────────────────────────────────────────────────────────┘


🔄 Intelligence Processing Pipeline
Stage 1: Perplexity Web Search
Search Strategy:

Model: llama-3.1-sonar-large-128k-online (optimal balance)
Focus Areas: Regulatory changes, competitor moves, market developments
Search Optimization: Borouge-specific keywords and context
Output: Comprehensive research with source citations

Search Query Enhancement:
Original Query: "EU plastic regulations"
Enhanced Query: "EU plastic regulations 2024 2025 packaging directive single-use plastics petrochemicals polypropylene polyethylene CBAM carbon border adjustment"

Source Prioritization:

Primary: Government regulatory sites (europa.eu, echa.europa.eu)
Secondary: Industry publications (Chemical Week, ICIS, Plastics News)
Tertiary: Financial news (Reuters, Bloomberg, Financial Times)
Competitive: Company announcements (SABIC, Dow, ExxonMobil)

Business Context Integration:

Company Profile: UAE-based petrochemical producer, ADNOC subsidiary
Financial Exposure: €2.3B EU exports, $1.8B Asian markets
Product Focus: 5M tonnes polyolefins (PP/PE emphasis)
Competitive Landscape: SABIC, Dow, ExxonMobil, LyondellBasell
Regulatory Environment: EU CBAM, packaging directives, circular economy

Response Synthesis:

Intelligence Cards: Structured business impact analysis
Financial Quantification: Revenue/cost implications using actual exposure
Action Items: Specific, actionable next steps for Borouge teams
Timeline Assessment: Implementation deadlines and business impact timing
Competitive Context: Positioning vs key competitors


📊 Performance Monitoring & Analytics
System Performance Metrics
Response Time Tracking:

Perplexity Search: Average response time and success rate
Claude Analysis: Processing time and quality metrics
End-to-End: Total time from query to structured response
Caching Impact: Performance improvement from cache hits

Cost Monitoring:

Real-time Budget: Current spend vs. allocated budget
Cost per Query: Average cost breakdown by component
ROI Analysis: Cost vs. value delivered to users
Budget Forecasting: Predict when budget will be exhausted

User Experience Analytics
Usage Patterns:

Query Categories: Most common types of intelligence requests
User Behavior: Session duration, repeat usage, abandonment
Response Quality: User satisfaction and feedback metrics
Feature Adoption: Which intelligence features are most valuable

Business Impact Tracking:

Time Savings: Quantified reduction in manual research time
Decision Support: Intelligence leading to business actions
Coverage Quality: Percentage of critical developments captured
Stakeholder Engagement: Usage by different business functions