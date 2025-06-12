// NUCLEAR CSS INJECTION - RUNTIME STYLE ENFORCEMENT
// This script injects critical CSS at runtime to override any remaining issues
/* eslint-disable no-unused-expressions */

export const injectNuclearCSS = () => {
  // Create a style element with maximum priority
  const nuclearStyle = document.createElement('style');
  nuclearStyle.id = 'nuclear-size-enforcement';
  nuclearStyle.setAttribute('data-priority', 'maximum');
  
  // CSS with maximum specificity and !important declarations
  const nuclearCSS = `
    /* NUCLEAR CSS INJECTION - RUNTIME ENFORCEMENT */
    
    /* Force base font size */
    html, html *, body, body * {
      font-size: 14px !important;
      line-height: 1.5 !important;
    }
    
    /* Nuclear title enforcement */
    .clean-title, .title, h1, [class*="title"], [class*="Title"],
    .app .main-content .header .clean-title,
    .app .main-content .header .title,
    .app .main-content .header h1 {
      font-size: 28px !important;
      line-height: 1.2 !important;
      margin-bottom: 16px !important;
      font-weight: 600 !important;
      letter-spacing: -0.01em !important;
      max-width: 800px !important;
      text-align: center !important;
    }
    
    /* Nuclear search input enforcement */
    .search-input, input[type="text"], input,
    .app .main-content .search-container .search-box .search-input,
    .search-container .search-box .search-input {
      font-size: 16px !important;
      padding: 14px 140px 14px 16px !important;
      height: 48px !important;
      line-height: 1.4 !important;
      box-sizing: border-box !important;
      min-height: 48px !important;
      max-height: 48px !important;
      border: none !important;
      background: transparent !important;
      outline: none !important;
      width: 100% !important;
    }

    /* Nuclear search box enforcement */
    .search-box,
    .app .main-content .search-container .search-box,
    .search-container .search-box {
      position: relative !important;
      width: 100% !important;
      background: var(--background-white, #ffffff) !important;
      border: 2px solid var(--border-light, #e5e7eb) !important;
      border-radius: 50px !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      overflow: hidden !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .search-box:hover {
      border-color: var(--border-medium, #d1d5db) !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
    }

    .search-box:focus-within {
      border-color: var(--primary-blue, #0066cc) !important;
      box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
    }
    
    /* Nuclear container enforcement */
    .search-container {
      max-width: 600px !important;
      margin: 0 auto 24px auto !important;
      width: 100% !important;
    }
    
    .main-content {
      padding: 16px !important;
    }
    
    .sidebar {
      width: 240px !important;
      min-width: 240px !important;
      max-width: 240px !important;
      padding: 12px !important;
    }
    
    /* Nuclear typography enforcement */
    p, div, span, li, td, th, label, a {
      font-size: 14px !important;
      line-height: 1.5 !important;
    }
    
    h2 { font-size: 22px !important; line-height: 1.3 !important; }
    h3 { font-size: 18px !important; line-height: 1.3 !important; }
    h4 { font-size: 16px !important; line-height: 1.4 !important; }
    h5 { font-size: 14px !important; line-height: 1.4 !important; }
    h6 { font-size: 13px !important; line-height: 1.4 !important; }
    
    /* Nuclear button enforcement */
    button, .btn, [role="button"] {
      font-size: 14px !important;
      line-height: 1.4 !important;
      padding: 8px 16px !important;
    }
    
    /* Nuclear component enforcement */
    .logo-text { font-size: 16px !important; }
    .nav-item { font-size: 14px !important; padding: 6px 12px !important; }
    .suggestion-chip { font-size: 13px !important; padding: 6px 12px !important; }
    .research-badge { font-size: 10px !important; padding: 4px 8px !important; }
    
    /* Nuclear mobile enforcement */
    @media (max-width: 768px) {
      .clean-title, .title, h1 {
        font-size: 24px !important;
      }
      
      .search-input {
        font-size: 16px !important;
        padding: 10px 80px 10px 12px !important;
        height: 40px !important;
      }
      
      .main-content {
        padding: 12px !important;
      }
      
      .sidebar {
        width: 100% !important;
        min-width: unset !important;
        max-width: unset !important;
      }
    }
    
    /* Nuclear anti-scaling enforcement - EXCLUDE LOADING AND ANIMATION ELEMENTS */
    *:not(.loading-spinner):not([class*="loading"]):not([class*="animate"]):not([class*="motion"]):not(.search-btn):not(.suggestion-chip) {
      zoom: 1 !important;
      max-width: 100vw !important;
      box-sizing: border-box !important;
    }

    /* Allow transforms for interactive elements - EXCLUDE LOADING SPINNER */
    .search-btn, .suggestion-chip, [class*="animate"]:not(.loading-spinner), [class*="motion"]:not(.loading-spinner) {
      transform: unset !important;
      -webkit-transform: unset !important;
      -moz-transform: unset !important;
      -ms-transform: unset !important;
    }

    /* PRESERVE LOADING SPINNER ANIMATION - DO NOT OVERRIDE TRANSFORMS */
    .loading-spinner {
      /* Allow animation transforms to work */
      transform: initial !important;
      -webkit-transform: initial !important;
      -moz-transform: initial !important;
      -ms-transform: initial !important;
    }

    /* Ensure loading elements are visible and centered */
    .loading-message {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      width: 100% !important;
      visibility: visible !important;
      opacity: 1 !important;
      z-index: 100 !important;
      margin: 40px auto !important;
    }

    .loading-content {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      visibility: visible !important;
      opacity: 1 !important;
      z-index: 100 !important;
      text-align: center !important;
      padding: 32px 40px !important;
      border-radius: 24px !important;
      background: white !important;
      border: 3px solid #0066cc !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
      min-width: 400px !important;
      max-width: 600px !important;
    }

    .loading-spinner {
      animation: spin 1s linear infinite !important;
      width: 28px !important;
      height: 28px !important;
      color: #0066cc !important;
      display: inline-block !important;
      visibility: visible !important;
      opacity: 1 !important;
      transform-origin: center center !important;
      /* Ensure animation is not overridden */
      animation-play-state: running !important;
      animation-fill-mode: none !important;
      animation-delay: 0s !important;
    }

    .loading-steps {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 12px !important;
      width: 100% !important;
      visibility: visible !important;
      opacity: 1 !important;
      margin-top: 24px !important;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg) !important;
        -webkit-transform: rotate(0deg) !important;
        -moz-transform: rotate(0deg) !important;
        -ms-transform: rotate(0deg) !important;
      }
      100% {
        transform: rotate(360deg) !important;
        -webkit-transform: rotate(360deg) !important;
        -moz-transform: rotate(360deg) !important;
        -ms-transform: rotate(360deg) !important;
      }
    }

    /* Webkit-specific keyframes for better browser support */
    @-webkit-keyframes spin {
      0% { -webkit-transform: rotate(0deg) !important; }
      100% { -webkit-transform: rotate(360deg) !important; }
    }

    /* Mozilla-specific keyframes for better browser support */
    @-moz-keyframes spin {
      0% { -moz-transform: rotate(0deg) !important; }
      100% { -moz-transform: rotate(360deg) !important; }
    }
    
    /* Nuclear viewport enforcement */
    html, body {
      overflow-x: hidden !important;
      max-width: 100vw !important;
      font-size: 14px !important;
      -webkit-text-size-adjust: none !important;
      -ms-text-size-adjust: none !important;
      text-size-adjust: none !important;
    }
    
    /* Nuclear final override - PRESERVE LOADING STATES */
    .app, .main-content, .conversation-view, .sidebar {
      zoom: 1 !important;
      overflow-x: hidden !important;
      font-size: 14px !important;
    }

    /* Ensure search controls are properly positioned */
    .search-controls {
      position: absolute !important;
      right: 10px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      display: flex !important;
      align-items: center !important;
      gap: 14px !important;
      background: var(--background-white, #ffffff) !important;
      padding: 6px !important;
      border-radius: 50px !important;
      z-index: 5 !important;
    }

    .research-badge {
      background: #f3f4f6 !important;
      color: #6b7280 !important;
      padding: 10px 18px !important;
      border-radius: 22px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      border: 1px solid #e5e7eb !important;
      white-space: nowrap !important;
    }

    .search-btn {
      width: 48px !important;
      height: 48px !important;
      background: var(--text-primary, #1a1a1a) !important;
      border: none !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
    }

    .search-btn:hover {
      background: #374151 !important;
      transform: scale(1.05) !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    }

    .search-icon {
      width: 22px !important;
      height: 22px !important;
      color: white !important;
    }
  `;
  
  nuclearStyle.textContent = nuclearCSS;
  
  // Insert at the very end of head to ensure maximum priority
  document.head.appendChild(nuclearStyle);
  
  // Also force immediate style application
  setTimeout(() => {
    // Force recalculation of styles
    document.body.style.display = 'none';
    // Trigger reflow
    void document.body.offsetHeight;
    document.body.style.display = '';
    
    // Apply direct style overrides to critical elements
    const title = document.querySelector('.clean-title, .title, h1');
    if (title) {
      title.style.fontSize = '28px';
      title.style.lineHeight = '1.2';
      title.style.fontWeight = '600';
    }
    
    const searchInput = document.querySelector('.search-input, input[type="text"]');
    if (searchInput) {
      searchInput.style.fontSize = '16px';
      searchInput.style.height = '48px';
      searchInput.style.padding = '14px 140px 14px 16px';
      searchInput.style.border = 'none';
      searchInput.style.background = 'transparent';
      searchInput.style.outline = 'none';
      searchInput.style.width = '100%';
      searchInput.style.display = 'block';
      searchInput.style.visibility = 'visible';
      searchInput.style.opacity = '1';
    }

    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
      searchBox.style.position = 'relative';
      searchBox.style.width = '100%';
      searchBox.style.background = '#ffffff';
      searchBox.style.border = '2px solid #e5e7eb';
      searchBox.style.borderRadius = '50px';
      searchBox.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      searchBox.style.overflow = 'hidden';
      searchBox.style.display = 'block';
      searchBox.style.visibility = 'visible';
      searchBox.style.opacity = '1';
      searchBox.style.zIndex = '1';
    }
    
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
      searchContainer.style.maxWidth = '560px';
    }
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.padding = '16px';
    }
    
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.style.width = '240px';
      sidebar.style.minWidth = '240px';
      sidebar.style.maxWidth = '240px';
    }
  }, 100);
};

// Auto-inject on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectNuclearCSS);
} else {
  injectNuclearCSS();
}

// Re-inject on any dynamic content changes
const observer = new MutationObserver(() => {
  injectNuclearCSS();
});

// Only observe if document.body exists
if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

export default injectNuclearCSS;
