import React from 'react';
import {
  Clock, Brain, Newspaper, ExternalLink, TrendingUp, AlertTriangle,
  CheckCircle, X, Target, Lightbulb, BarChart3, Zap, ArrowRight,
  Globe, Calendar, Star, Award, Shield, Briefcase, DollarSign,
  FileText, Activity
} from 'lucide-react';
import './ResultsDisplay.css';

const ResultsDisplay = ({ results, query, onClear }) => {

  if (!results || !results.success) {
    return (
      <div className="results-error">
        <AlertTriangle size={48} className="error-icon" />
        <h3>No results available</h3>
        <p>Unable to display search results. Please try again.</p>
      </div>
    );
  }



  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="unified-results-display">
      {/* Hero Header */}
      <div className="results-hero">
        <div className="hero-content">
          <div className="hero-title">
            <Brain size={32} className="hero-icon" />
            <h1>ESG Intelligence Report</h1>
          </div>
          <div className="hero-subtitle">
            <span className="query-highlight">"{query}"</span>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <Clock size={16} />
              <span>{results.responseTime}ms</span>
            </div>
            {results.newsData?.articles && (
              <div className="stat-item">
                <Newspaper size={16} />
                <span>{results.newsData.articles.length} articles</span>
              </div>
            )}
            <div className="stat-item">
              <Zap size={16} />
              <span>AI + News Analysis</span>
            </div>
          </div>
        </div>

        <button onClick={onClear} className="hero-clear-button">
          <X size={20} />
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="results-grid">

        {/* AI Analysis Section - Enhanced Card Layout */}
        {results.aiAnalysis && (
          <div className="analysis-card full-width">
            <div className="card-header">
              <Brain size={24} className="card-icon ai-icon" />
              <h2>AI Analysis</h2>
              <div className="card-badge ai-badge">Expert Insights</div>
            </div>
            <div className="card-content">
              <div className="enhanced-analysis-layout">
                {parseEnhancedAIAnalysis(results.aiAnalysis)}
              </div>
            </div>
          </div>
        )}

        {/* Executive Dashboard */}
        {results.newsData?.executiveSummary && (
          <div className="dashboard-card">
            <div className="card-header">
              <BarChart3 size={24} className="card-icon dashboard-icon" />
              <h2>Executive Dashboard</h2>
              <div className="card-badge executive-badge">Strategic Overview</div>
            </div>
            <div className="card-content">

              {/* Executive Brief */}
              {results.newsData.executiveSummary.executive_brief && (
                <div className="executive-brief">
                  <div className="brief-header">
                    <Briefcase size={20} />
                    <h3>Executive Brief</h3>
                  </div>
                  <p className="brief-content">{results.newsData.executiveSummary.executive_brief}</p>
                </div>
              )}

              {/* Key Metrics Grid */}
              <div className="metrics-grid">
                {results.newsData.executiveSummary.urgency_level && (
                  <div className="metric-card urgency">
                    <div className="metric-icon">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="metric-content">
                      <span className="metric-label">Urgency Level</span>
                      <span className={`metric-value urgency-${results.newsData.executiveSummary.urgency_level.toLowerCase()}`}>
                        {results.newsData.executiveSummary.urgency_level}
                      </span>
                    </div>
                  </div>
                )}

                {results.newsData.analytics && (
                  <>
                    <div className="metric-card insights">
                      <div className="metric-icon">
                        <Lightbulb size={20} />
                      </div>
                      <div className="metric-content">
                        <span className="metric-label">Actionable Insights</span>
                        <span className="metric-value">{results.newsData.analytics.actionableInsights || 0}</span>
                      </div>
                    </div>

                    <div className="metric-card opportunities">
                      <div className="metric-icon">
                        <Target size={20} />
                      </div>
                      <div className="metric-content">
                        <span className="metric-label">Opportunities</span>
                        <span className="metric-value">{results.newsData.analytics.strategicOpportunities || 0}</span>
                      </div>
                    </div>

                    <div className="metric-card confidence">
                      <div className="metric-icon">
                        <Award size={20} />
                      </div>
                      <div className="metric-content">
                        <span className="metric-label">Confidence</span>
                        <span className="metric-value">{results.newsData.analytics.overallConfidence || 'Medium'}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Key Insights */}
              {(results.newsData.executiveSummary.key_insights || results.newsData.executiveSummary.key_findings) &&
               (results.newsData.executiveSummary.key_insights || results.newsData.executiveSummary.key_findings).length > 0 && (
                <div className="insights-section">
                  <div className="insights-header">
                    <Star size={20} />
                    <h3>Key Findings</h3>
                  </div>
                  <div className="insights-list">
                    {(results.newsData.executiveSummary.key_insights || results.newsData.executiveSummary.key_findings).map((insight, index) => (
                      <div key={index} className="insight-item">
                        <ArrowRight size={16} className="insight-arrow" />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategic Implications */}
              {(results.newsData.executiveSummary.business_impact || results.newsData.executiveSummary.strategic_implications) && (
                <div className="impact-section">
                  <div className="impact-header">
                    <TrendingUp size={20} />
                    <h3>Strategic Implications</h3>
                  </div>
                  <p className="impact-content">
                    {results.newsData.executiveSummary.business_impact || results.newsData.executiveSummary.strategic_implications}
                  </p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* News Articles */}
        {results.newsData?.articles && results.newsData.articles.length > 0 && (
          <div className="news-articles-card">
            <div className="card-header">
              <Newspaper size={24} className="card-icon news-icon" />
              <h2>Latest News & Analysis</h2>
              <div className="card-badge news-badge">{results.newsData.articles.length} Articles</div>
            </div>
            <div className="card-content">
              <div className="premium-articles-grid">
                {results.newsData.articles.map((article, index) => {
                  const impactLevel = (article.impact_level || article.impactLevel || 'medium').toLowerCase();
                  return (
                    <div key={article.id || index} className={`premium-article-card impact-${impactLevel}`}>
                      {/* Article Header with Impact Indicator */}
                      <div className="premium-article-header">
                        <div className={`impact-indicator impact-${impactLevel}`}>
                          {getImpactIcon(impactLevel)}
                        </div>
                        <div className="article-meta-info">
                          <div className="source-info">
                            <Globe size={12} />
                            <span className="source-name">{article.source}</span>
                          </div>
                          <div className="date-info">
                            <Calendar size={12} />
                            <span className="publish-date">{formatDate(article.published_at || article.publishedAt)}</span>
                          </div>
                        </div>
                        <div className={`impact-label impact-${impactLevel}`}>
                          {(article.impact_level || article.impactLevel || 'Medium').toUpperCase()}
                        </div>
                      </div>

                      {/* Article Content */}
                      <div className="premium-article-content">
                        <h3 className="premium-article-title">{article.title}</h3>

                        {article.description && (
                          <p className="premium-article-description">{article.description}</p>
                        )}

                        {/* Relevance and Action Bar */}
                        <div className="premium-article-footer">
                          <div className="relevance-indicator">
                            <div className="relevance-bar">
                              <div
                                className="relevance-fill"
                                style={{ width: `${article.relevance_score || article.relevanceScore || 0}%` }}
                              ></div>
                            </div>
                            <span className="relevance-text">
                              {article.relevance_score || article.relevanceScore || 0}% Relevant
                            </span>
                          </div>

                          {article.url && (
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`premium-read-btn impact-${impactLevel}`}
                            >
                              <ExternalLink size={14} />
                              Read Full Article
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Impact Decoration */}
                      <div className={`impact-decoration impact-${impactLevel}`}></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="unified-footer">
        <div className="footer-content">
          <div className="footer-branding">
            <Brain size={20} />
            <span>Powered by Gemini AI</span>
          </div>
          <div className="footer-meta">
            <span>Generated at {new Date(results.timestamp).toLocaleTimeString()}</span>
            {results.metadata?.intelligenceSuccess && results.metadata?.smartSearchSuccess && (
              <span className="success-badge">
                <CheckCircle size={14} />
                Full Analysis Complete
              </span>
            )}
          </div>
        </div>
      </div>
    </div>

  );
};

// Enhanced function to parse AI analysis into card-based sections for better readability
const parseEnhancedAIAnalysis = (analysisText) => {
  if (!analysisText) return null;

  // Remove markdown formatting and split into sections
  const cleanText = analysisText
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** formatting
    .replace(/\*(.*?)\*/g, '$1')     // Remove * formatting
    .trim();

  // Split by numbered sections (1., 2., 3., etc.) or section headers
  const sections = cleanText.split(/(?=\d+\.\s+\*?\*?[A-Z][^:]*:?|\n[A-Z][^:]*:\n)/);

  return (
    <div className="enhanced-analysis-grid">
      {sections.map((section, index) => {
        if (!section.trim()) return null;

        // Check if this is a numbered section
        const numberedMatch = section.match(/^(\d+)\.\s+\*?\*?([^:]+):?\s*([\s\S]*)/);

        if (numberedMatch) {
          const [, number, title, content] = numberedMatch;
          const sectionType = getSectionType(title.trim());

          return (
            <div key={index} className={`analysis-card-section ${sectionType}`}>
              <div className="section-card-header">
                <div className="section-number-badge">{number}</div>
                <h3 className="section-card-title">{title.trim()}</h3>
                <div className={`section-type-indicator ${sectionType}`}>
                  {getSectionIcon(sectionType)}
                </div>
              </div>
              <div className="section-card-content">
                {formatSectionContent(content.trim(), sectionType)}
              </div>
            </div>
          );
        } else {
          // Check for non-numbered section headers
          const headerMatch = section.match(/^([A-Z][^:]*):?\s*([\s\S]*)/);

          if (headerMatch) {
            const [, title, content] = headerMatch;
            const sectionType = getSectionType(title.trim());

            return (
              <div key={index} className={`analysis-card-section ${sectionType}`}>
                <div className="section-card-header">
                  <h3 className="section-card-title">{title.trim()}</h3>
                  <div className={`section-type-indicator ${sectionType}`}>
                    {getSectionIcon(sectionType)}
                  </div>
                </div>
                <div className="section-card-content">
                  {formatSectionContent(content.trim(), sectionType)}
                </div>
              </div>
            );
          } else {
            // Regular content block
            return (
              <div key={index} className="analysis-card-section general">
                <div className="section-card-content">
                  {formatSectionContent(section.trim(), 'general')}
                </div>
              </div>
            );
          }
        }
      })}
    </div>
  );
};

// Helper function to determine section type based on title
const getSectionType = (title) => {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('executive') || lowerTitle.includes('summary')) {
    return 'executive';
  } else if (lowerTitle.includes('quantitative') || lowerTitle.includes('financial') || lowerTitle.includes('cost') || lowerTitle.includes('investment')) {
    return 'financial';
  } else if (lowerTitle.includes('risk') || lowerTitle.includes('threat') || lowerTitle.includes('challenge')) {
    return 'risk';
  } else if (lowerTitle.includes('opportunity') || lowerTitle.includes('potential') || lowerTitle.includes('advantage')) {
    return 'opportunity';
  } else if (lowerTitle.includes('regulatory') || lowerTitle.includes('compliance') || lowerTitle.includes('legal')) {
    return 'regulatory';
  } else if (lowerTitle.includes('business') || lowerTitle.includes('impact') || lowerTitle.includes('operational')) {
    return 'business';
  } else if (lowerTitle.includes('strategic') || lowerTitle.includes('recommendation') || lowerTitle.includes('action')) {
    return 'strategic';
  } else if (lowerTitle.includes('esg') || lowerTitle.includes('sustainability') || lowerTitle.includes('environment')) {
    return 'esg';
  }
  return 'general';
};

// Helper function to get section icon based on type
const getSectionIcon = (sectionType) => {
  switch (sectionType) {
    case 'executive':
      return <Briefcase size={20} />;
    case 'financial':
      return <DollarSign size={20} />;
    case 'risk':
      return <AlertTriangle size={20} />;
    case 'opportunity':
      return <TrendingUp size={20} />;
    case 'regulatory':
      return <Shield size={20} />;
    case 'business':
      return <Activity size={20} />;
    case 'strategic':
      return <Target size={20} />;
    case 'esg':
      return <Award size={20} />;
    default:
      return <FileText size={20} />;
  }
};

// Helper function to format section content with better structure
const formatSectionContent = (content, sectionType) => {
  if (!content) return null;

  // Split content into paragraphs and bullet points
  const paragraphs = content.split('\n').filter(p => p.trim());

  return (
    <div className="formatted-content">
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim();

        // Check if it's a bullet point or list item
        if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./)) {
          return (
            <div key={index} className="content-list-item">
              <ArrowRight size={14} className="list-arrow" />
              <span>{trimmed.replace(/^[-•]\s*|\d+\.\s*/, '')}</span>
            </div>
          );
        }

        // Check if it contains numerical data (for financial/quantitative sections)
        if (sectionType === 'financial' && trimmed.match(/[\d,]+\.?\d*[%$€£¥]?|\$[\d,]+\.?\d*|€[\d,]+\.?\d*|\d+%/)) {
          return (
            <div key={index} className="content-highlight-data">
              <DollarSign size={16} className="data-icon" />
              <p>{trimmed}</p>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={index} className="content-paragraph">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};

// Helper function to get impact icons for premium cards
const getImpactIcon = (level) => {
  switch (level) {
    case 'high':
    case 'critical':
      return <AlertTriangle size={20} />;
    case 'opportunity':
      return <TrendingUp size={20} />;
    case 'medium':
      return <Shield size={20} />;
    case 'low':
    default:
      return <CheckCircle size={20} />;
  }
};

export default ResultsDisplay;
