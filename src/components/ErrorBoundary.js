import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and analytics
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Track error in analytics if available
    if (window.analyticsService) {
      window.analyticsService.trackError('component_crash', error.message, {
        context: 'error_boundary',
        componentStack: errorInfo.componentStack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-boundary-container" style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          margin: '20px',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>
            ⚠️
          </div>
          <h2 style={{
            color: '#dc3545',
            marginBottom: '16px',
            fontSize: '24px'
          }}>
            Something went wrong
          </h2>
          <p style={{
            color: '#6c757d',
            marginBottom: '24px',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            The ESG Intelligence component encountered an unexpected error. 
            This is likely a temporary issue.
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
              }}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => {
                window.location.reload();
              }}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Reload Page
            </button>
          </div>
          
          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              marginTop: '24px',
              textAlign: 'left',
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Error Details (Development)
              </summary>
              <pre style={{
                fontSize: '12px',
                color: '#dc3545',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
