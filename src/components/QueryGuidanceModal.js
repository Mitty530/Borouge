import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Lightbulb, Target, Globe, Shield } from 'lucide-react';

const QueryGuidanceModal = ({ isOpen, onClose, validationResult, onSuggestionClick }) => {
  if (!isOpen || !validationResult) return null;

  const getCategoryIcon = (category) => {
    if (category.toLowerCase().includes('environmental')) return <Globe size={20} />;
    if (category.toLowerCase().includes('social')) return <Target size={20} />;
    if (category.toLowerCase().includes('governance')) return <Shield size={20} />;
    return <Lightbulb size={20} />;
  };

  const getCategoryColor = (category) => {
    if (category.toLowerCase().includes('environmental')) return '#10b981'; // Green
    if (category.toLowerCase().includes('social')) return '#3b82f6'; // Blue
    if (category.toLowerCase().includes('governance')) return '#8b5cf6'; // Purple
    return '#f59e0b'; // Amber
  };

  return (
    <AnimatePresence>
      <motion.div
        className="query-guidance-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="query-guidance-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="header-content">
              <Search size={24} className="header-icon" />
              <div>
                <h2>Search Guidance</h2>
                <p>Let's help you find relevant ESG intelligence</p>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Message */}
          <div className="modal-message">
            <div className="message-content">
              <Lightbulb size={20} className="message-icon" />
              <p>{validationResult.message}</p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="suggestions-section">
            <h3>Try searching for these ESG topics:</h3>
            
            {validationResult.suggestions.map((categoryGroup, groupIndex) => (
              <motion.div
                key={groupIndex}
                className="suggestion-category"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <div 
                  className="category-header"
                  style={{ color: getCategoryColor(categoryGroup.category) }}
                >
                  {getCategoryIcon(categoryGroup.category)}
                  <span>{categoryGroup.category}</span>
                </div>
                
                <div className="suggestion-chips">
                  {categoryGroup.suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      className="suggestion-chip"
                      onClick={() => onSuggestionClick(suggestion)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <p>
              <strong>Tip:</strong> Focus your search on Environmental, Social, or Governance topics 
              related to Borouge's petrochemical operations for the best results.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QueryGuidanceModal;
