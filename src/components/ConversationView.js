import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Loader2
} from 'lucide-react';
import smartSearchService from '../services/smartSearchService';
import './ConversationView.css';

// Helper function to format article dates
const formatArticleDate = (dateString) => {
  if (!dateString) return 'Invalid Date';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If within last 7 days, show relative time
    if (diffDays <= 7) {
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    }

    // Otherwise show formatted date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

const ConversationView = ({ initialQuery, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Scroll to top when new results are loaded (not bottom)
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'assistant' && lastMessage.content && !lastMessage.content.error) {
        // Results loaded successfully, scroll to top to show them
        scrollToTop();
      }
    }
  }, [messages]);

  useEffect(() => {
    if (initialQuery) {
      // Add initial user message
      const userMessage = {
        id: 1,
        type: 'user',
        content: initialQuery,
        timestamp: new Date()
      };

      setMessages([userMessage]);
      setIsLoading(true);

      // Call Smart Search API
      performSmartSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSmartSearch = async (query) => {
    try {
      const data = await smartSearchService.search(query);

      const aiResponse = {
        id: 2,
        type: 'assistant',
        content: data,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    } catch (error) {
      console.error('Smart search error:', error);
      const errorResponse = {
        id: 2,
        type: 'assistant',
        content: { error: 'Failed to fetch ESG intelligence data. Please try again.' },
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="conversation-view"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="conversation-header">
        <motion.button
          className="back-btn"
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          Back to Search
        </motion.button>
      </div>

      {/* Messages */}
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`message ${message.type}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {message.type === 'user' ? (
                <div className="user-message">
                  <div className="message-content">{message.content}</div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ) : (
                <div className="ai-message">
                  <div className="ai-response">
                    {typeof message.content === 'object' ? (
                      message.content.error ? (
                        <div className="error-response">{message.content.error}</div>
                      ) : (
                        <div className="json-response">
                          {/* Enhanced Executive Summary Section */}
                          {(message.content.comprehensiveExecutiveSummary || message.content.executiveSummary) && (() => {
                            // Handle both data structures - new comprehensive format and current backend format
                            const execSummary = message.content.comprehensiveExecutiveSummary || message.content.executiveSummary;
                            const strategicData = message.content.strategicInsights || {};
                            const analytics = message.content.analytics || {};
                            const articles = message.content.articles || [];

                            return (
                            <div className="comprehensive-executive-summary">
                              <h2>🎯 Executive Intelligence Report</h2>

                              {/* Executive Overview */}
                              <div className="executive-overview">
                                <h3>📋 Executive Overview</h3>
                                <div className="overview-content">
                                  <div className="key-findings">
                                    <strong>Key Findings:</strong>
                                    <div className="findings-text">{execSummary.keyFindings || execSummary.executive_overview?.key_findings || 'Analysis in progress'}</div>
                                  </div>
                                  <div className="strategic-implications">
                                    <strong>Strategic Implications:</strong>
                                    <div className="implications-text">{execSummary.strategicImplications || execSummary.executive_overview?.strategic_implications || 'Assessment pending'}</div>
                                  </div>
                                  <div className="urgency-assessment">
                                    <strong>Urgency Assessment:</strong>
                                    <div className="urgency-text">{execSummary.urgencyAssessment || execSummary.executive_overview?.urgency_assessment || 'Under review'}</div>
                                  </div>
                                  {(execSummary.executive_overview?.financial_impact_range || analytics.averageRelevance) && (
                                    <div className="financial-impact">
                                      <strong>Analysis Metrics:</strong>
                                      <div className="impact-text">
                                        {execSummary.executive_overview?.financial_impact_range || `Average Relevance: ${analytics.averageRelevance}%`}
                                      </div>
                                    </div>
                                  )}
                                  {execSummary.executive_overview?.competitive_urgency && (
                                    <div className="competitive-urgency">
                                      <strong>Competitive Urgency:</strong>
                                      <div className="urgency-text">{execSummary.executive_overview?.competitive_urgency}</div>
                                    </div>
                                  )}
                                  <div className="confidence-level">
                                    <strong>Confidence Level:</strong>
                                    <span className={`confidence-badge ${(execSummary.confidenceLevel || execSummary.executive_overview?.confidence_level || 'medium').toLowerCase()}`}>
                                      {(execSummary.confidenceLevel || execSummary.executive_overview?.confidence_level || 'MEDIUM').toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Current Backend Data Display */}
                              {!message.content.comprehensiveExecutiveSummary && message.content.executiveSummary && (
                                <div className="current-backend-analysis">
                                  <h3>📊 Intelligence Analysis Summary</h3>
                                  <div className="analysis-content">
                                    <div className="headline">
                                      <strong>Analysis:</strong> {execSummary.headline}
                                    </div>
                                    {execSummary.nextSteps && execSummary.nextSteps.length > 0 && (
                                      <div className="next-steps">
                                        <strong>Recommended Next Steps:</strong>
                                        <ul>
                                          {execSummary.nextSteps.map((step, index) => (
                                            <li key={index}>{step}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Strategic Insights from Backend */}
                              {strategicData.keyThemes && (
                                <div className="strategic-insights-backend">
                                  <h3>🎯 Strategic Intelligence Insights</h3>

                                  {strategicData.keyThemes.length > 0 && (
                                    <div className="key-themes">
                                      <h4>📈 Key Themes Identified</h4>
                                      <div className="themes-grid">
                                        {strategicData.keyThemes.map((theme, index) => (
                                          <div key={index} className="theme-item">
                                            <span className="theme-name">{theme.theme.toUpperCase()}</span>
                                            <span className="theme-count">{theme.count} articles ({theme.percentage}%)</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {strategicData.geographicFocus && (
                                    <div className="geographic-focus">
                                      <h4>🌍 Geographic Focus</h4>
                                      <div className="geo-grid">
                                        {Object.entries(strategicData.geographicFocus).map(([region, count]) => (
                                          count > 0 && (
                                            <div key={region} className="geo-item">
                                              <span className="geo-region">{region}</span>
                                              <span className="geo-count">{count} articles</span>
                                            </div>
                                          )
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {strategicData.esgImplications && (
                                    <div className="esg-implications">
                                      <h4>🌱 ESG Impact Distribution</h4>
                                      <div className="esg-grid">
                                        {Object.entries(strategicData.esgImplications).map(([category, count]) => (
                                          count > 0 && (
                                            <div key={category} className="esg-item">
                                              <span className="esg-category">{category}</span>
                                              <span className="esg-count">{count} articles</span>
                                            </div>
                                          )
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Analytics Dashboard */}
                              {analytics.totalArticles > 0 && (
                                <div className="analytics-dashboard">
                                  <h3>📊 Analysis Dashboard</h3>
                                  <div className="analytics-grid">
                                    <div className="metric-item">
                                      <span className="metric-label">Articles Analyzed</span>
                                      <span className="metric-value">{analytics.totalArticles}</span>
                                    </div>
                                    <div className="metric-item">
                                      <span className="metric-label">Average Relevance</span>
                                      <span className="metric-value">{analytics.averageRelevance}%</span>
                                    </div>
                                    <div className="metric-item">
                                      <span className="metric-label">Actionable Insights</span>
                                      <span className="metric-value">{analytics.actionableInsights}</span>
                                    </div>
                                    <div className="metric-item">
                                      <span className="metric-label">Strategic Opportunities</span>
                                      <span className="metric-value">{analytics.strategicOpportunities}</span>
                                    </div>
                                  </div>

                                  {analytics.impactDistribution && (
                                    <div className="impact-distribution">
                                      <h4>Impact Level Distribution</h4>
                                      <div className="impact-grid">
                                        {Object.entries(analytics.impactDistribution).map(([level, count]) => (
                                          count > 0 && (
                                            <div key={level} className={`impact-item impact-${level.toLowerCase()}`}>
                                              <span className="impact-level">{level}</span>
                                              <span className="impact-count">{count}</span>
                                            </div>
                                          )
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Business Impact Analysis */}
                              {message.content.comprehensiveExecutiveSummary.business_impact_analysis && (
                                <div className="business-impact-analysis">
                                  <h3>💼 Business Impact Analysis</h3>
                                  <div className="impact-grid">
                                    {message.content.comprehensiveExecutiveSummary.business_impact_analysis.revenue_implications && (
                                      <div className="impact-item">
                                        <h4>Revenue Implications</h4>
                                        <p>{message.content.comprehensiveExecutiveSummary.business_impact_analysis.revenue_implications}</p>
                                      </div>
                                    )}
                                    {message.content.comprehensiveExecutiveSummary.business_impact_analysis.operational_impact && (
                                      <div className="impact-item">
                                        <h4>Operational Impact</h4>
                                        <p>{message.content.comprehensiveExecutiveSummary.business_impact_analysis.operational_impact}</p>
                                      </div>
                                    )}
                                    {message.content.comprehensiveExecutiveSummary.business_impact_analysis.market_positioning && (
                                      <div className="impact-item">
                                        <h4>Market Positioning</h4>
                                        <p>{message.content.comprehensiveExecutiveSummary.business_impact_analysis.market_positioning}</p>
                                      </div>
                                    )}
                                    {message.content.comprehensiveExecutiveSummary.business_impact_analysis.regulatory_compliance && (
                                      <div className="impact-item">
                                        <h4>Regulatory Compliance</h4>
                                        <p>{message.content.comprehensiveExecutiveSummary.business_impact_analysis.regulatory_compliance}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Strategic Priorities */}
                              {message.content.comprehensiveExecutiveSummary.strategic_priorities && (
                                <div className="strategic-priorities">
                                  <h3>⚡ Strategic Priorities</h3>

                                  {message.content.comprehensiveExecutiveSummary.strategic_priorities.immediate_actions?.length > 0 && (
                                    <div className="immediate-actions">
                                      <h4>🚨 Immediate Actions (Next 30 Days)</h4>
                                      <div className="actions-list">
                                        {message.content.comprehensiveExecutiveSummary.strategic_priorities.immediate_actions.map((action, index) => (
                                          <div key={index} className="action-item priority-high enhanced">
                                            <div className="action-header">
                                              <span className="action-priority">🔴 CRITICAL</span>
                                              <span className="action-timeline">{action.timeline}</span>
                                            </div>
                                            <div className="action-content">
                                              <h5>{action.priority}</h5>

                                              <div className="action-section">
                                                <strong>Business Rationale:</strong>
                                                <p>{action.business_rationale}</p>
                                              </div>

                                              {action.urgency_drivers && (
                                                <div className="action-section">
                                                  <strong>Urgency Drivers:</strong>
                                                  <p>{action.urgency_drivers}</p>
                                                </div>
                                              )}

                                              {action.implementation_steps && (
                                                <div className="action-section">
                                                  <strong>Implementation Steps:</strong>
                                                  <p>{action.implementation_steps}</p>
                                                </div>
                                              )}

                                              <div className="action-details-grid">
                                                <div className="detail-item">
                                                  <strong>Success Metrics:</strong>
                                                  <span>{action.success_metrics}</span>
                                                </div>
                                                <div className="detail-item">
                                                  <strong>Resources Required:</strong>
                                                  <span>{action.resource_requirements || action.resource_requirement}</span>
                                                </div>
                                                {action.risk_of_delay && (
                                                  <div className="detail-item risk">
                                                    <strong>Risk of Delay:</strong>
                                                    <span>{action.risk_of_delay}</span>
                                                  </div>
                                                )}
                                                {action.dependencies && (
                                                  <div className="detail-item">
                                                    <strong>Dependencies:</strong>
                                                    <span>{action.dependencies}</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {message.content.comprehensiveExecutiveSummary.strategic_priorities.medium_term_initiatives?.length > 0 && (
                                    <div className="medium-term-initiatives">
                                      <h4>📈 Medium-Term Initiatives (6-18 Months)</h4>
                                      <div className="initiatives-list">
                                        {message.content.comprehensiveExecutiveSummary.strategic_priorities.medium_term_initiatives.map((initiative, index) => (
                                          <div key={index} className="initiative-item enhanced">
                                            <div className="initiative-header">
                                              <h5>{initiative.initiative}</h5>
                                              <span className="initiative-roi">{initiative.expected_roi}</span>
                                            </div>

                                            <div className="initiative-section">
                                              <strong>Strategic Value:</strong>
                                              <p>{initiative.strategic_value}</p>
                                            </div>

                                            <div className="initiative-details-grid">
                                              <div className="detail-item">
                                                <strong>Investment Required:</strong>
                                                <span>{initiative.investment_required}</span>
                                              </div>
                                              {initiative.implementation_roadmap && (
                                                <div className="detail-item">
                                                  <strong>Implementation Roadmap:</strong>
                                                  <span>{initiative.implementation_roadmap}</span>
                                                </div>
                                              )}
                                              {initiative.competitive_advantage && (
                                                <div className="detail-item">
                                                  <strong>Competitive Advantage:</strong>
                                                  <span>{initiative.competitive_advantage}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Risk and Opportunity Matrix */}
                              {message.content.comprehensiveExecutiveSummary.risk_and_opportunity_matrix && (
                                <div className="risk-opportunity-matrix">
                                  <h3>⚖️ Risk & Opportunity Matrix</h3>

                                  <div className="matrix-grid">
                                    {message.content.comprehensiveExecutiveSummary.risk_and_opportunity_matrix.critical_risks?.length > 0 && (
                                      <div className="risks-section">
                                        <h4>🚨 Critical Risks</h4>
                                        {message.content.comprehensiveExecutiveSummary.risk_and_opportunity_matrix.critical_risks.map((risk, index) => (
                                          <div key={index} className="risk-item">
                                            <div className="risk-header">
                                              <span className={`risk-probability ${risk.probability?.toLowerCase().replace(/[^a-z]/g, '')}`}>
                                                {risk.probability?.toUpperCase() || 'MEDIUM PROBABILITY'}
                                              </span>
                                              <span className={`risk-impact high`}>HIGH IMPACT</span>
                                            </div>
                                            <div className="risk-content">
                                              <p><strong>Risk:</strong> {risk.risk}</p>
                                              {risk.financial_impact && (
                                                <p><strong>Financial Impact:</strong> {risk.financial_impact}</p>
                                              )}
                                              {risk.operational_impact && (
                                                <p><strong>Operational Impact:</strong> {risk.operational_impact}</p>
                                              )}
                                              {risk.timeline && (
                                                <p><strong>Timeline:</strong> {risk.timeline}</p>
                                              )}
                                              {risk.mitigation_strategies && (
                                                <div className="mitigation-strategies">
                                                  <strong>Mitigation Strategies:</strong>
                                                  <p>{risk.mitigation_strategies}</p>
                                                </div>
                                              )}
                                              {risk.monitoring_indicators && (
                                                <p><strong>Monitoring Indicators:</strong> {risk.monitoring_indicators}</p>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {message.content.comprehensiveExecutiveSummary.risk_and_opportunity_matrix.strategic_opportunities?.length > 0 && (
                                      <div className="opportunities-section">
                                        <h4>🎯 Strategic Opportunities</h4>
                                        {message.content.comprehensiveExecutiveSummary.risk_and_opportunity_matrix.strategic_opportunities.map((opportunity, index) => (
                                          <div key={index} className="opportunity-item">
                                            <div className="opportunity-header">
                                              <strong>{opportunity.opportunity}</strong>
                                              {opportunity.market_size && (
                                                <span className="market-size">{opportunity.market_size}</span>
                                              )}
                                            </div>
                                            <div className="opportunity-content">
                                              {opportunity.revenue_potential && (
                                                <p><strong>Revenue Potential:</strong> {opportunity.revenue_potential}</p>
                                              )}
                                              {opportunity.competitive_advantage && (
                                                <p><strong>Competitive Advantage:</strong> {opportunity.competitive_advantage}</p>
                                              )}
                                              {opportunity.investment_thesis && (
                                                <p><strong>Investment Thesis:</strong> {opportunity.investment_thesis}</p>
                                              )}
                                              {opportunity.implementation_requirements && (
                                                <p><strong>Implementation Requirements:</strong> {opportunity.implementation_requirements}</p>
                                              )}
                                              {opportunity.success_probability && (
                                                <p><strong>Success Probability:</strong> {opportunity.success_probability}</p>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Enhanced ESG Analysis */}
                              {message.content.comprehensiveExecutiveSummary.enhanced_esg_analysis && (
                                <div className="enhanced-esg-analysis">
                                  <h3>🌱 Enhanced ESG Strategic Analysis</h3>

                                  {message.content.comprehensiveExecutiveSummary.enhanced_esg_analysis.materiality_assessment && (
                                    <div className="esg-section">
                                      <h4>🎯 Materiality Assessment</h4>
                                      <p>{message.content.comprehensiveExecutiveSummary.enhanced_esg_analysis.materiality_assessment}</p>
                                    </div>
                                  )}

                                  {message.content.comprehensiveExecutiveSummary.enhanced_esg_analysis.stakeholder_impact_analysis && (
                                    <div className="esg-section">
                                      <h4>👥 Stakeholder Impact Analysis</h4>
                                      <p>{message.content.comprehensiveExecutiveSummary.enhanced_esg_analysis.stakeholder_impact_analysis}</p>
                                    </div>
                                  )}

                                  {message.content.comprehensiveExecutiveSummary.enhanced_esg_analysis.long_term_value_creation && (
                                    <div className="esg-section">
                                      <h4>💎 Long-Term Value Creation</h4>
                                      <p>{message.content.comprehensiveExecutiveSummary.enhanced_esg_analysis.long_term_value_creation}</p>
                                    </div>
                                  )}

                                  {message.content.comprehensiveExecutiveSummary.enhanced_esg_analysis.strategic_roadmap && (
                                    <div className="esg-section strategic-roadmap">
                                      <h4>🗺️ Strategic Implementation Roadmap</h4>
                                      <div className="roadmap-content">
                                        <p>{message.content.comprehensiveExecutiveSummary.enhanced_esg_analysis.strategic_roadmap}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            );
                          })()}

                          {/* Enhanced Analytics Section */}
                          {(message.content.analytics || message.content.statistics) && (
                            <div className="enhanced-analytics-section">
                              <h3>📊 Intelligence Analytics</h3>
                              <div className="analytics-grid">
                                <div className="stat-card">
                                  <span className="stat-number">{message.content.analytics?.totalArticles || message.content.statistics?.totalArticles}</span>
                                  <span className="stat-label">Articles Analyzed</span>
                                </div>
                                <div className="stat-card">
                                  <span className="stat-number">{message.content.analytics?.urgentAttentionRequired || message.content.statistics?.highImpactCount}</span>
                                  <span className="stat-label">Urgent Items</span>
                                </div>
                                <div className="stat-card">
                                  <span className="stat-number">{message.content.analytics?.strategicOpportunities || message.content.statistics?.opportunityCount}</span>
                                  <span className="stat-label">Opportunities</span>
                                </div>
                                <div className="stat-card">
                                  <span className="stat-number">{message.content.analytics?.averageRelevance || message.content.statistics?.averageRelevance}%</span>
                                  <span className="stat-label">Avg Relevance</span>
                                </div>
                                <div className="stat-card">
                                  <span className="stat-number">{message.content.analytics?.actionableInsights || 'N/A'}</span>
                                  <span className="stat-label">Actionable Insights</span>
                                </div>
                                <div className="stat-card confidence">
                                  <span className={`stat-number confidence-${message.content.analytics?.overallConfidence || 'medium'}`}>
                                    {(message.content.analytics?.overallConfidence || 'medium').toUpperCase()}
                                  </span>
                                  <span className="stat-label">Confidence Level</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {message.content.summary && (
                            <div className="summary-section">
                              <h3>Executive Summary</h3>
                              <p>{message.content.summary}</p>
                            </div>
                          )}

                          {message.content.enhancedKeywords && message.content.enhancedKeywords.length > 0 && (
                            <div className="keywords-section">
                              <h3>🎯 Enhanced Search Terms</h3>
                              <div className="keywords-list">
                                {message.content.enhancedKeywords.map((keyword, index) => (
                                  <span key={index} className="keyword-tag">{keyword}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {message.content.actionItems && message.content.actionItems.length > 0 && (
                            <div className="action-items-section">
                              <h3>⚡ Immediate Action Items</h3>
                              <div className="action-items-list">
                                {message.content.actionItems.map((item, index) => (
                                  <div key={index} className="action-item">
                                    <div className="action-header">
                                      <span className={`priority-badge ${item.priority.toLowerCase()}`}>
                                        {item.priority}
                                      </span>
                                      <span className="department-tag">{item.department}</span>
                                    </div>
                                    <div className="action-text">{item.action}</div>
                                    <div className="action-timeframe">⏱️ {item.timeframe}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {message.content.articles && message.content.articles.length > 0 && (
                            <div className="articles-section">
                              <h3>📰 Related Articles ({message.content.articles.length})</h3>
                              <div className="articles-grid">
                                {message.content.articles.map((article, index) => (
                                  <div key={index} className="article-card">
                                    <div className="article-header">
                                      <h4>{article.title}</h4>
                                      <div className="article-badges">
                                        <span className={`impact-badge ${article.impact_level.toLowerCase()}`}>
                                          {article.impact_level}
                                        </span>
                                        <span className="relevance-score">
                                          {article.relevance_score}% relevant
                                        </span>
                                      </div>
                                    </div>
                                    <p className="article-description">{article.description}</p>
                                    <div className="article-meta">
                                      <span className="source">{article.source?.name || article.source}</span>
                                      <span className="date">{formatArticleDate(article.published_at || article.publishedAt)}</span>
                                    </div>
                                    {article.url && (
                                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more">
                                        Read Full Article
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {message.content.analysis && (
                            <div className="analysis-section">
                              <h3>🔍 ESG Analysis</h3>
                              <div className="analysis-content">
                                {Object.entries(message.content.analysis).map(([key, value]) => (
                                  <div key={key} className="analysis-item">
                                    <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>
                                    <span>{Array.isArray(value) ? value.join(', ') : value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="simple-response">{message.content}</div>
                    )}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            className="loading-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="loading-content">
              <Loader2 className="loading-spinner" size={20} />
              <span>Analyzing ESG intelligence...</span>
              <div className="loading-steps">
                <div>🎯 Enhancing query with Borouge context</div>
                <div>📰 Searching ESG news sources</div>
                <div>🤖 AI analysis for relevance and impact</div>
                <div>📊 Generating actionable insights</div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* System Status */}
      <div className="system-status-container">
        <div className="system-status-message">
          <p>✅ ESG Intelligence Engine powered by Smart Search API - Ready for real-time ESG data analysis</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ConversationView;
