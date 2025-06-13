import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import './App.css';
import SearchInterface from './components/SearchInterface';
import ResultsDisplay from './components/ResultsDisplay';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { esgIntelligenceService } from './services/esgIntelligenceService';
import { smartSearchService } from './services/smartSearchService';
import { queryValidationService } from './services/queryValidationService';

function App() {
  const [currentQuery, setCurrentQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Unified search - no mode switching needed
  const [backendHealth, setBackendHealth] = useState(null);

  // Check backend health on component mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch('/health');
      const data = await response.json();
      setBackendHealth(data);
      console.log('✅ Backend health check:', data);
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      setBackendHealth({ status: 'error', message: error.message });
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    // Validate query for ESG relevance
    const validation = queryValidationService.validateQuery(query);
    if (!validation.isValid) {
      setError({
        type: 'validation',
        message: validation.message,
        suggestions: validation.suggestions
      });
      return;
    }

    setCurrentQuery(query);
    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      console.log('🔍 Performing Unified ESG Intelligence search...');

      // Perform both searches in parallel for comprehensive results
      const [intelligenceResults, smartSearchResults] = await Promise.allSettled([
        esgIntelligenceService.searchESGIntelligence(query),
        smartSearchService.performSmartSearch(query)
      ]);

      // Combine results from both sources
      const combinedResults = {
        success: true,
        query: query,
        timestamp: new Date().toISOString(),
        responseTime: Math.max(
          intelligenceResults.status === 'fulfilled' ? intelligenceResults.value.responseTime || 0 : 0,
          smartSearchResults.status === 'fulfilled' ? smartSearchResults.value.responseTime || 0 : 0
        ),

        // AI Analysis from ESG Intelligence
        aiAnalysis: intelligenceResults.status === 'fulfilled' && intelligenceResults.value.success
          ? intelligenceResults.value.response
          : null,

        // News and Executive Summary from Smart Search
        newsData: smartSearchResults.status === 'fulfilled' && smartSearchResults.value.success
          ? {
              articles: smartSearchResults.value.articles || [],
              executiveSummary: smartSearchResults.value.comprehensiveExecutiveSummary || null,
              analytics: smartSearchResults.value.analytics || null,
              actionItems: smartSearchResults.value.actionItems || []
            }
          : null,

        // Combined metadata
        metadata: {
          intelligenceSuccess: intelligenceResults.status === 'fulfilled' && intelligenceResults.value.success,
          smartSearchSuccess: smartSearchResults.status === 'fulfilled' && smartSearchResults.value.success,
          source: 'unified_esg_platform'
        }
      };

      setSearchResults(combinedResults);
      console.log(`✅ Unified search completed in ${combinedResults.responseTime}ms`);

    } catch (error) {
      console.error('❌ Search error:', error);
      setError({
        type: 'search',
        message: error.message || 'An error occurred during search',
        details: error.details || null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearResults = () => {
    setSearchResults(null);
    setCurrentQuery('');
    setError(null);
  };



  return (
    <ErrorBoundary>
      <div className="App">
        <Analytics />
        
        {/* Header */}
        <header className="app-header">
          <div className="container">
            <h1 className="app-title">The ESG Intelligence Engine</h1>
            <p className="app-subtitle">
              Advanced ESG intelligence and analysis for the petrochemical industry
            </p>
            
            {/* Backend Status Indicator */}
            {backendHealth && (
              <div className={`backend-status ${backendHealth.status === 'healthy' ? 'healthy' : 'error'}`}>
                <span className="status-indicator"></span>
                Backend: {backendHealth.status === 'healthy' ? 'Connected' : 'Error'}
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="app-main">
          <div className="container">
            
            {/* Search Interface */}
            <SearchInterface
              onSearch={handleSearch}
              isLoading={isLoading}
              currentQuery={currentQuery}
            />

            {/* Error Display */}
            {error && (
              <div className="error-container">
                <div className="error-message">
                  <h3>⚠️ {error.type === 'validation' ? 'Query Validation Error' : 'Search Error'}</h3>
                  <p>{error.message}</p>
                  
                  {error.suggestions && (
                    <div className="error-suggestions">
                      <h4>Try searching for:</h4>
                      <ul>
                        {error.suggestions.map((suggestion, index) => (
                          <li key={index}>
                            <button 
                              className="suggestion-button"
                              onClick={() => handleSearch(suggestion)}
                            >
                              {suggestion}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading Spinner */}
            {isLoading && (
              <div className="loading-container">
                <LoadingSpinner />
                <p>Analyzing ESG intelligence...</p>
              </div>
            )}

            {/* Results Display */}
            {searchResults && !isLoading && (
              <ResultsDisplay
                results={searchResults}
                query={currentQuery}
                onClear={handleClearResults}
              />
            )}

            {/* Welcome Message */}
            {!searchResults && !isLoading && !error && (
              <div className="welcome-container">
                <div className="welcome-card">
                  <h2>Welcome to the ESG Intelligence Engine</h2>
                  <p>
                    Get instant access to comprehensive ESG intelligence and analysis 
                    tailored for the petrochemical industry. Our AI-powered platform 
                    provides real-time insights on sustainability, governance, and 
                    environmental regulations.
                  </p>
                  
                  <div className="feature-grid">
                    <div className="feature-item">
                      <h3>🔍 ESG Intelligence</h3>
                      <p>Comprehensive AI analysis of ESG topics and regulations</p>
                    </div>
                    <div className="feature-item">
                      <h3>📰 Smart Search</h3>
                      <p>Real-time news analysis with executive summaries</p>
                    </div>
                    <div className="feature-item">
                      <h3>⚡ Fast Results</h3>
                      <p>Get insights in 5-10 seconds with Gemini AI</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="container">
            <p>&copy; 2024 Borouge ESG Intelligence Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
