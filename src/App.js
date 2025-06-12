import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Bookmark, Menu, X } from 'lucide-react';
import ConversationView from './components/ConversationView';
import QueryGuidanceModal from './components/QueryGuidanceModal';
import { queryValidationService } from './services/queryValidationService';
import { injectNuclearCSS } from './nuclear-css-injection';
import { autoVerifySizing } from './size-verification';
import './App.css';
import './responsive-fixes.css';
import './vercel-deployment-fixes.css';
import './professional-normalization.css';
import './css-variables-override.css';
import './final-size-enforcement.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentView, setCurrentView] = useState('search'); // 'search' or 'conversation'
  const [activeQuery, setActiveQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Nuclear CSS injection and size verification on component mount
  useEffect(() => {
    injectNuclearCSS();

    // Re-inject after a short delay to ensure it overrides everything
    const timer = setTimeout(() => {
      injectNuclearCSS();
      // Verify sizing after injection
      autoVerifySizing();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // ESG-focused suggestion chips for Borouge
  const suggestionChips = [
    'EU plastic regulations 2024',
    'CBAM carbon border adjustment',
    'Circular economy packaging',
    'SABIC sustainability strategy',
    'Petrochemical market trends',
    'ESG reporting requirements',
    'Renewable feedstock adoption',
    'Carbon footprint reduction'
  ];

  const handleSearch = (query) => {
    if (!query || !query.trim()) {
      return;
    }

    // Validate the query
    const validation = queryValidationService.validateQuery(query);

    if (!validation.isValid) {
      // Show guidance modal for invalid queries
      setValidationResult(validation);
      setShowGuidanceModal(true);
      return;
    }

    // Query is valid, proceed with search
    setActiveQuery(query);
    setCurrentView('conversation');
    setSearchQuery('');
    setSidebarOpen(false);

    // Add to conversations
    const newConversation = {
      id: Date.now(),
      query: query,
      timestamp: new Date()
    };
    setConversations([newConversation, ...conversations]);
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setActiveQuery('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const selectConversation = (conversation) => {
    setActiveQuery(conversation.query);
    setCurrentView('conversation');
    setSidebarOpen(false);
  };

  const handleCloseGuidanceModal = () => {
    setShowGuidanceModal(false);
    setValidationResult(null);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowGuidanceModal(false);
    setValidationResult(null);
    // Automatically search with the suggestion
    handleSearch(suggestion);
  };

  return (
    <div className="app oversized-fix">
      {/* Mobile Menu Button */}
      <motion.button
        className="mobile-menu-btn"
        onClick={toggleSidebar}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1001,
          display: 'none',
          width: '44px',
          height: '44px',
          background: 'var(--background-white)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)',
          cursor: 'pointer'
        }}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </motion.button>

      {/* Sidebar */}
      <motion.div
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="logo-icon"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            B
          </motion.div>
          <span className="logo-text">Borouge ESG</span>
        </motion.div>

        {/* New Search Button */}
        <motion.button
          className="new-search-btn"
          onClick={handleBackToSearch}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MessageSquare size={18} />
          Start new search
        </motion.button>



        {/* Navigation */}
        <motion.div
          className="nav-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="nav-item"
            whileHover={{ x: 4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Users className="nav-icon" />
              All Intelligence
            </div>
            <motion.span
              className="nav-count"
              key={conversations.length}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {conversations.length}
            </motion.span>
          </motion.div>
          <motion.div
            className="nav-item"
            whileHover={{ x: 4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Bookmark className="nav-icon" />
              Saved
            </div>
            <span className="nav-count">0</span>
          </motion.div>
        </motion.div>

        {/* Recent Chats */}
        <motion.div
          className="recent-chats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Recent Chats</h3>
          <AnimatePresence>
            {conversations.length === 0 ? (
              <motion.div
                className="no-chats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No saved chats yet.
              </motion.div>
            ) : (
              <div>
                {conversations.slice(0, 5).map((conversation, index) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => selectConversation(conversation)}
                    style={{
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    whileHover={{
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      x: 4,
                      color: 'var(--text-primary)'
                    }}
                  >
                    {conversation.query}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentView === 'search' ? (
          <motion.div
            key="search"
            className="main-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <motion.div
              className="header"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.h1
                className="title clean-title main-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                whileHover={{
                  scale: 1.01
                }}
              >
                The ESG Intelligence Engine
              </motion.h1>
            </motion.div>

            {/* Search Container */}
            <motion.div
              className="search-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <motion.div
                className="search-box modern-search"
                whileHover={{ scale: 1.002 }}
                transition={{ duration: 0.2 }}
              >
                <div className="search-input-container">
                  <input
                    type="text"
                    className="search-input modern-input"
                    placeholder="ESG regulations affecting Borouge operations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <motion.button
                    className={`search-submit-btn ${searchQuery.trim() ? 'active' : 'inactive'}`}
                    onClick={() => handleSearch(searchQuery)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      backgroundColor: searchQuery.trim() ? '#0066cc' : '#9ca3af'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    ↑
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>

            {/* Suggestion Chips */}
            <motion.div
              className="suggestions"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {suggestionChips.map((chip, index) => (
                <motion.button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => handleSearch(chip)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.05, duration: 0.4 }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {chip}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <ConversationView
            key="conversation"
            initialQuery={activeQuery}
            onBack={handleBackToSearch}
          />
        )}
      </AnimatePresence>

      {/* Query Guidance Modal */}
      <QueryGuidanceModal
        isOpen={showGuidanceModal}
        onClose={handleCloseGuidanceModal}
        validationResult={validationResult}
        onSuggestionClick={handleSuggestionClick}
      />
    </div>
  );
}

export default App;
