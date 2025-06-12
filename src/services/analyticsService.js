// Analytics Service for Borouge ESG Intelligence Platform
// Tracks user behavior and interactions for insights

import { track } from '@vercel/analytics';

class AnalyticsService {
  constructor() {
    this.isEnabled = true;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track search queries
  trackSearch(query, isValid = true, validationReason = null) {
    if (!this.isEnabled) return;

    const eventData = {
      query: query.substring(0, 100), // Limit query length for privacy
      queryLength: query.length,
      isValid,
      validationReason,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    track('search_query', eventData);
    console.log('📊 Analytics: Search tracked', eventData);
  }

  // Track query validation failures
  trackValidationFailure(query, reason, suggestions) {
    if (!this.isEnabled) return;

    const eventData = {
      query: query.substring(0, 50), // Shorter for failed queries
      reason,
      suggestionsShown: suggestions?.length || 0,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    track('validation_failure', eventData);
    console.log('📊 Analytics: Validation failure tracked', eventData);
  }

  // Track suggestion clicks
  trackSuggestionClick(suggestion, category, originalQuery) {
    if (!this.isEnabled) return;

    const eventData = {
      suggestion,
      category,
      originalQuery: originalQuery?.substring(0, 50),
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    track('suggestion_click', eventData);
    console.log('📊 Analytics: Suggestion click tracked', eventData);
  }

  // Track search results interaction
  trackResultsInteraction(action, query, resultCount = 0) {
    if (!this.isEnabled) return;

    const eventData = {
      action, // 'view', 'scroll', 'article_click', etc.
      query: query?.substring(0, 100),
      resultCount,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    track('results_interaction', eventData);
    console.log('📊 Analytics: Results interaction tracked', eventData);
  }

  // Track modal interactions
  trackModalInteraction(modalType, action, data = {}) {
    if (!this.isEnabled) return;

    const eventData = {
      modalType, // 'guidance', 'error', etc.
      action, // 'open', 'close', 'suggestion_click', etc.
      ...data,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    track('modal_interaction', eventData);
    console.log('📊 Analytics: Modal interaction tracked', eventData);
  }

  // Track user session metrics
  trackSessionMetrics() {
    if (!this.isEnabled) return;

    const sessionDuration = Date.now() - this.startTime;
    const eventData = {
      sessionId: this.sessionId,
      sessionDuration,
      timestamp: new Date().toISOString()
    };

    track('session_metrics', eventData);
    console.log('📊 Analytics: Session metrics tracked', eventData);
  }

  // Track page performance
  trackPerformance(metric, value, context = {}) {
    if (!this.isEnabled) return;

    const eventData = {
      metric, // 'search_time', 'load_time', etc.
      value,
      ...context,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    track('performance_metric', eventData);
    console.log('📊 Analytics: Performance tracked', eventData);
  }

  // Track errors
  trackError(errorType, errorMessage, context = {}) {
    if (!this.isEnabled) return;

    const eventData = {
      errorType,
      errorMessage: errorMessage?.substring(0, 200),
      ...context,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    track('error_event', eventData);
    console.log('📊 Analytics: Error tracked', eventData);
  }

  // Track feature usage
  trackFeatureUsage(feature, action, metadata = {}) {
    if (!this.isEnabled) return;

    const eventData = {
      feature, // 'search', 'validation', 'suggestions', etc.
      action, // 'use', 'click', 'view', etc.
      ...metadata,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    track('feature_usage', eventData);
    console.log('📊 Analytics: Feature usage tracked', eventData);
  }

  // Track user engagement
  trackEngagement(engagementType, duration, context = {}) {
    if (!this.isEnabled) return;

    const eventData = {
      engagementType, // 'page_view', 'scroll_depth', 'time_on_results', etc.
      duration,
      ...context,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    track('user_engagement', eventData);
    console.log('📊 Analytics: Engagement tracked', eventData);
  }

  // Disable analytics (for privacy compliance)
  disable() {
    this.isEnabled = false;
    console.log('📊 Analytics: Disabled');
  }

  // Enable analytics
  enable() {
    this.isEnabled = true;
    console.log('📊 Analytics: Enabled');
  }

  // Get session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      duration: Date.now() - this.startTime,
      isEnabled: this.isEnabled
    };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
