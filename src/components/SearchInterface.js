import React, { useState, useEffect } from 'react';
import { Search, Zap, FileText } from 'lucide-react';
import './SearchInterface.css';
import { esgIntelligenceService } from '../services/esgIntelligenceService';

const SearchInterface = ({ 
  onSearch, 
  isLoading, 
  searchMode, 
  onModeChange, 
  currentQuery 
}) => {
  const [query, setQuery] = useState(currentQuery || '');
  const [suggestedQueries, setSuggestedQueries] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Load suggested queries on component mount
    loadSuggestedQueries();
  }, []);

  useEffect(() => {
    setQuery(currentQuery || '');
  }, [currentQuery]);

  const loadSuggestedQueries = async () => {
    try {
      const suggestions = await esgIntelligenceService.getSuggestedQueries();
      setSuggestedQueries(suggestions.slice(0, 6)); // Show top 6 suggestions
    } catch (error) {
      console.error('Failed to load suggested queries:', error);
      // Use default suggestions
      setSuggestedQueries([
        'EU plastic waste regulations 2024',
        'Carbon border adjustment mechanism CBAM',
        'Circular economy petrochemicals',
        'REACH compliance requirements',
        'Sustainability reporting standards',
        'ESG disclosure requirements UAE'
      ]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleModeToggle = (mode) => {
    onModeChange(mode);
  };

  return (
    <div className="search-interface">
      {/* Search Mode Toggle */}
      <div className="search-mode-toggle">
        <button
          className={`mode-button ${searchMode === 'intelligence' ? 'active' : ''}`}
          onClick={() => handleModeToggle('intelligence')}
          disabled={isLoading}
        >
          <Zap size={18} />
          ESG Intelligence
        </button>
        <button
          className={`mode-button ${searchMode === 'smart-search' ? 'active' : ''}`}
          onClick={() => handleModeToggle('smart-search')}
          disabled={isLoading}
        >
          <FileText size={18} />
          Smart Search
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <Search 
              className={`search-icon ${query.length > 0 ? 'active' : ''}`} 
              size={20} 
            />
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder={
                searchMode === 'intelligence' 
                  ? "Ask about ESG topics, regulations, or sustainability..." 
                  : "Search for ESG news and analysis..."
              }
              className="search-input"
              disabled={isLoading}
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setShowSuggestions(false);
                }}
                className="clear-button"
                disabled={isLoading}
              >
                ×
              </button>
            )}
          </div>
          
          <button
            type="submit"
            className="search-button"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <div className="button-spinner"></div>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Search Mode Description */}
        <div className="search-mode-description">
          {searchMode === 'intelligence' ? (
            <p>Get comprehensive AI-powered analysis of ESG topics and regulations</p>
          ) : (
            <p>Search real-time news with AI analysis and executive summaries</p>
          )}
        </div>
      </form>

      {/* Suggested Queries */}
      {showSuggestions && suggestedQueries.length > 0 && (
        <div className="suggestions-container">
          <h4>Suggested searches:</h4>
          <div className="suggestions-grid">
            {suggestedQueries.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Suggestions (when no input) */}
      {!query && !showSuggestions && suggestedQueries.length > 0 && (
        <div className="quick-suggestions">
          <h4>Popular searches:</h4>
          <div className="suggestions-grid">
            {suggestedQueries.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInterface;
