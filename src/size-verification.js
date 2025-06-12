// SIZE VERIFICATION UTILITY
// This utility checks if our professional sizing is being applied correctly

export const verifySizing = () => {
  const results = {
    title: null,
    searchInput: null,
    searchContainer: null,
    sidebar: null,
    mainContent: null,
    bodyText: null,
    issues: []
  };

  // Check title sizing
  const title = document.querySelector('.clean-title, .title, h1');
  if (title) {
    const titleStyles = window.getComputedStyle(title);
    const titleFontSize = parseInt(titleStyles.fontSize);
    results.title = {
      element: title,
      fontSize: titleFontSize,
      expected: 28,
      isCorrect: titleFontSize <= 30 && titleFontSize >= 26
    };
    
    if (!results.title.isCorrect) {
      results.issues.push(`Title font size is ${titleFontSize}px, expected ~28px`);
    }
  } else {
    results.issues.push('Title element not found');
  }

  // Check search input sizing
  const searchInput = document.querySelector('.search-input, input[type="text"]');
  if (searchInput) {
    const inputStyles = window.getComputedStyle(searchInput);
    const inputFontSize = parseInt(inputStyles.fontSize);
    const inputHeight = parseInt(inputStyles.height);
    
    results.searchInput = {
      element: searchInput,
      fontSize: inputFontSize,
      height: inputHeight,
      expectedFontSize: 16,
      expectedHeight: 44,
      isFontSizeCorrect: inputFontSize <= 18 && inputFontSize >= 14,
      isHeightCorrect: inputHeight <= 48 && inputHeight >= 40
    };
    
    if (!results.searchInput.isFontSizeCorrect) {
      results.issues.push(`Search input font size is ${inputFontSize}px, expected ~16px`);
    }
    if (!results.searchInput.isHeightCorrect) {
      results.issues.push(`Search input height is ${inputHeight}px, expected ~44px`);
    }
  } else {
    results.issues.push('Search input element not found');
  }

  // Check search container sizing
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer) {
    const containerStyles = window.getComputedStyle(searchContainer);
    const containerMaxWidth = parseInt(containerStyles.maxWidth);
    
    results.searchContainer = {
      element: searchContainer,
      maxWidth: containerMaxWidth,
      expected: 560,
      isCorrect: containerMaxWidth <= 600 && containerMaxWidth >= 500
    };
    
    if (!results.searchContainer.isCorrect) {
      results.issues.push(`Search container max-width is ${containerMaxWidth}px, expected ~560px`);
    }
  }

  // Check sidebar sizing
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    const sidebarStyles = window.getComputedStyle(sidebar);
    const sidebarWidth = parseInt(sidebarStyles.width);
    
    results.sidebar = {
      element: sidebar,
      width: sidebarWidth,
      expected: 240,
      isCorrect: sidebarWidth <= 260 && sidebarWidth >= 220
    };
    
    if (!results.sidebar.isCorrect) {
      results.issues.push(`Sidebar width is ${sidebarWidth}px, expected ~240px`);
    }
  }

  // Check main content padding
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    const contentStyles = window.getComputedStyle(mainContent);
    const contentPadding = parseInt(contentStyles.padding);
    
    results.mainContent = {
      element: mainContent,
      padding: contentPadding,
      expected: 16,
      isCorrect: contentPadding <= 24 && contentPadding >= 12
    };
    
    if (!results.mainContent.isCorrect) {
      results.issues.push(`Main content padding is ${contentPadding}px, expected ~16px`);
    }
  }

  // Check body text sizing
  const bodyText = document.querySelector('p, div:not(.clean-title):not(.title), span');
  if (bodyText) {
    const textStyles = window.getComputedStyle(bodyText);
    const textFontSize = parseInt(textStyles.fontSize);
    
    results.bodyText = {
      element: bodyText,
      fontSize: textFontSize,
      expected: 14,
      isCorrect: textFontSize <= 16 && textFontSize >= 13
    };
    
    if (!results.bodyText.isCorrect) {
      results.issues.push(`Body text font size is ${textFontSize}px, expected ~14px`);
    }
  }

  return results;
};

// Auto-verify sizing after page load
export const autoVerifySizing = () => {
  setTimeout(() => {
    const results = verifySizing();
    
    if (results.issues.length === 0) {
      console.log('✅ Professional sizing verification PASSED');
      console.log('All elements are sized correctly according to industry standards');
    } else {
      console.warn('⚠️ Professional sizing verification FAILED');
      console.warn('Issues found:', results.issues);
      console.log('Full results:', results);
      
      // Attempt to fix issues
      fixSizingIssues(results);
    }
  }, 1000);
};

// Fix sizing issues if verification fails
const fixSizingIssues = (results) => {
  console.log('🔧 Attempting to fix sizing issues...');
  
  // Fix title if needed
  if (results.title && !results.title.isCorrect) {
    results.title.element.style.fontSize = '28px';
    results.title.element.style.lineHeight = '1.2';
    console.log('Fixed title sizing');
  }
  
  // Fix search input if needed
  if (results.searchInput && (!results.searchInput.isFontSizeCorrect || !results.searchInput.isHeightCorrect)) {
    results.searchInput.element.style.fontSize = '16px';
    results.searchInput.element.style.height = '44px';
    results.searchInput.element.style.padding = '12px 120px 12px 16px';
    console.log('Fixed search input sizing');
  }
  
  // Fix search container if needed
  if (results.searchContainer && !results.searchContainer.isCorrect) {
    results.searchContainer.element.style.maxWidth = '560px';
    console.log('Fixed search container sizing');
  }
  
  // Fix sidebar if needed
  if (results.sidebar && !results.sidebar.isCorrect) {
    results.sidebar.element.style.width = '240px';
    results.sidebar.element.style.minWidth = '240px';
    results.sidebar.element.style.maxWidth = '240px';
    console.log('Fixed sidebar sizing');
  }
  
  // Fix main content if needed
  if (results.mainContent && !results.mainContent.isCorrect) {
    results.mainContent.element.style.padding = '16px';
    console.log('Fixed main content sizing');
  }
  
  // Re-verify after fixes
  setTimeout(() => {
    const newResults = verifySizing();
    if (newResults.issues.length === 0) {
      console.log('✅ Sizing issues fixed successfully');
    } else {
      console.error('❌ Some sizing issues persist:', newResults.issues);
    }
  }, 500);
};

// Export for use in components
export default { verifySizing, autoVerifySizing, fixSizingIssues };
