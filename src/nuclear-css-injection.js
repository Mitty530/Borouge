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
      padding: 12px 120px 12px 16px !important;
      height: 44px !important;
      line-height: 1.4 !important;
      box-sizing: border-box !important;
      min-height: 44px !important;
      max-height: 44px !important;
    }
    
    /* Nuclear container enforcement */
    .search-container {
      max-width: 560px !important;
      margin-bottom: 20px !important;
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
    
    /* Nuclear anti-scaling enforcement */
    * {
      zoom: 1 !important;
      transform: scale(1) !important;
      -webkit-transform: scale(1) !important;
      -moz-transform: scale(1) !important;
      -ms-transform: scale(1) !important;
      max-width: 100vw !important;
      box-sizing: border-box !important;
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
    
    /* Nuclear final override */
    .app, .main-content, .conversation-view, .sidebar {
      zoom: 1 !important;
      transform: scale(1) !important;
      overflow-x: hidden !important;
      font-size: 14px !important;
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
      searchInput.style.height = '44px';
      searchInput.style.padding = '12px 120px 12px 16px';
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
