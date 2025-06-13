import React, { useState } from 'react';
import { Clock, Zap, FileText, ExternalLink, TrendingUp, AlertTriangle, CheckCircle, X } from 'lucide-react';
import './ResultsDisplay.css';

const ResultsDisplay = ({ results, query, searchMode, onClear }) => {
  const [expandedArticles, setExpandedArticles] = useState(new Set());

  if (!results || !results.success) {
    return (
      <div className="results-error">
        <h3>⚠️ No results available</h3>
        <p>Unable to display search results. Please try again.</p>
      </div>
    );
  }

  const toggleArticleExpansion = (articleId) => {
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId);
    } else {
      newExpanded.add(articleId);
    }
    setExpandedArticles(newExpanded);
  };

  const getImpactLevelIcon = (level) => {
    switch (level) {
      case 'CRITICAL':
        return <AlertTriangle className="impact-icon critical" size={16} />;
      case 'HIGH':
        return <TrendingUp className="impact-icon high" size={16} />;
      case 'OPPORTUNITY':
        return <CheckCircle className="impact-icon opportunity" size={16} />;
      case 'MEDIUM':
        return <FileText className="impact-icon medium" size={16} />;
      case 'LOW':
        return <FileText className="impact-icon low" size={16} />;
      default:
        return <FileText className="impact-icon medium" size={16} />;
    }
  };

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
    <div className="results-display">
      {/* Results Header */}
      <div className="results-header">
        <div className="results-meta">
          <h2 className="results-title">
            {searchMode === 'intelligence' ? (
              <>
                <Zap size={24} />
                ESG Intelligence Results
              </>
            ) : (
              <>
                <FileText size={24} />
                Smart Search Results
              </>
            )}
          </h2>
          <div className="results-info">
            <span className="query-text">"{query}"</span>
            <div className="results-stats">
              <span className="stat">
                <Clock size={14} />
                {results.responseTime}ms
              </span>
              {results.cached && (
                <span className="stat cached">
                  ⚡ Cached
                </span>
              )}
              {results.articles && (
                <span className="stat">
                  {results.articles.length} articles
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button onClick={onClear} className="clear-results-button">
          <X size={18} />
          Clear
        </button>
      </div>

      {/* ESG Intelligence Results */}
      {searchMode === 'intelligence' && results.response && (
        <div className="intelligence-results">
          <div className="intelligence-content">
            <h3>Analysis</h3>
            <div className="response-content">
              {results.response.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index}>{paragraph.trim()}</p>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Smart Search Results */}
      {searchMode === 'smart-search' && (
        <div className="smart-search-results">
          
          {/* Executive Summary */}
          {results.comprehensiveExecutiveSummary && (
            <div className="executive-summary">
              <h3>Executive Summary</h3>
              <div className="summary-content">
                {/* Executive Brief */}
                {results.comprehensiveExecutiveSummary.executive_brief && (
                  <div className="executive-brief">
                    <h4>Executive Brief</h4>
                    <p>{results.comprehensiveExecutiveSummary.executive_brief}</p>
                  </div>
                )}

                {/* Key Insights */}
                {results.comprehensiveExecutiveSummary.key_insights && results.comprehensiveExecutiveSummary.key_insights.length > 0 && (
                  <div className="key-insights">
                    <h4>Key Insights</h4>
                    <ul>
                      {results.comprehensiveExecutiveSummary.key_insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Immediate Priorities */}
                {results.comprehensiveExecutiveSummary.immediate_priorities && results.comprehensiveExecutiveSummary.immediate_priorities.length > 0 && (
                  <div className="immediate-priorities">
                    <h4>Immediate Priorities</h4>
                    <ul>
                      {results.comprehensiveExecutiveSummary.immediate_priorities.map((priority, index) => (
                        <li key={index}>{priority}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Business Impact */}
                {results.comprehensiveExecutiveSummary.business_impact && (
                  <div className="business-impact">
                    <h4>Business Impact</h4>
                    <p>{results.comprehensiveExecutiveSummary.business_impact}</p>
                  </div>
                )}

                {/* Urgency Level */}
                {results.comprehensiveExecutiveSummary.urgency_level && (
                  <div className="urgency-level">
                    <h4>Urgency Level</h4>
                    <span className={`urgency-badge ${results.comprehensiveExecutiveSummary.urgency_level.toLowerCase()}`}>
                      {results.comprehensiveExecutiveSummary.urgency_level}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Overview */}
          {results.analytics && (
            <div className="analytics-overview">
              <h3>Analysis Overview</h3>
              <div className="analytics-grid">
                <div className="analytics-item">
                  <span className="analytics-label">Total Articles</span>
                  <span className="analytics-value">{results.analytics.totalArticles || 0}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Actionable Insights</span>
                  <span className="analytics-value">{results.analytics.actionableInsights || 0}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Strategic Opportunities</span>
                  <span className="analytics-value">{results.analytics.strategicOpportunities || 0}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Urgent Attention</span>
                  <span className="analytics-value urgent">{results.analytics.urgentAttentionRequired || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Articles */}
          {results.articles && results.articles.length > 0 && (
            <div className="articles-section">
              <h3>Related Articles ({results.articles.length})</h3>
              <div className="articles-grid">
                {results.articles.map((article, index) => (
                  <div key={article.id || index} className="article-card">
                    <div className="article-header">
                      <div className="article-meta">
                        <span className="article-source">{article.source}</span>
                        <span className="article-date">{formatDate(article.published_at || article.publishedAt)}</span>
                      </div>
                      <div className="article-impact">
                        {getImpactLevelIcon(article.impact_level || article.impactLevel)}
                        <span className={`impact-level ${(article.impact_level || article.impactLevel || 'medium').toLowerCase()}`}>
                          {article.impact_level || article.impactLevel || 'Medium'}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="article-title">{article.title}</h4>
                    
                    {article.description && (
                      <p className="article-description">{article.description}</p>
                    )}
                    
                    {article.summary && (
                      <div className="article-summary">
                        <h5>AI Summary</h5>
                        <p>{article.summary}</p>
                      </div>
                    )}
                    
                    <div className="article-footer">
                      <div className="article-score">
                        Relevance: {article.relevance_score || article.relevanceScore || 0}%
                      </div>
                      
                      <div className="article-actions">
                        {article.url && (
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="article-link"
                          >
                            <ExternalLink size={14} />
                            Read Full Article
                          </a>
                        )}
                        
                        {(article.action_items || article.actionItems) && (
                          <button
                            onClick={() => toggleArticleExpansion(article.id || index)}
                            className="expand-button"
                          >
                            {expandedArticles.has(article.id || index) ? 'Hide' : 'Show'} Action Items
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {expandedArticles.has(article.id || index) && (article.action_items || article.actionItems) && (
                      <div className="action-items">
                        <h5>Action Items</h5>
                        <ul>
                          {(article.action_items || article.actionItems).map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Items Summary */}
          {results.actionItems && results.actionItems.length > 0 && (
            <div className="action-items-summary">
              <h3>Key Action Items</h3>
              <ul className="action-items-list">
                {results.actionItems.map((item, index) => (
                  <li key={index} className="action-item">
                    <CheckCircle size={16} className="action-icon" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Results Footer */}
      <div className="results-footer">
        <div className="footer-info">
          <span>Powered by Gemini AI</span>
          <span>•</span>
          <span>Generated at {new Date(results.timestamp).toLocaleTimeString()}</span>
          {results.requestId && (
            <>
              <span>•</span>
              <span className="request-id">ID: {results.requestId}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
