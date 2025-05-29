import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Loader2
} from 'lucide-react';
import './ConversationView.css';

const ConversationView = ({ initialQuery, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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

      // Simulate AI response after delay
      setTimeout(() => {
        const aiResponse = {
          id: 2,
          type: 'assistant',
          content: `Thank you for your query: "${initialQuery}". The system has been cleaned and is ready for the new implementation.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 2000);
    }
  }, [initialQuery]);

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
                    <div className="simple-response">{message.content}</div>
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
              <span>Analyzing ESG data and regulations...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* System Status */}
      <div className="system-status-container">
        <div className="system-status-message">
          <p>✅ System cleaned and ready for new article display implementation</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ConversationView;
