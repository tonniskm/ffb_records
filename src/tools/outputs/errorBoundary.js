import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Keep crash details in the console for debugging.
    console.error('App crashed:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ maxWidth: '520px', width: '100%', background: '#fff', color: '#111', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ marginTop: 0 }}>Something Went Wrong</h2>
            <p style={{ marginBottom: '1rem' }}>
              The app hit an unexpected error. Try reloading. If this keeps happening, share your league URL and what action caused it.
            </p>
            <button type="button" onClick={this.handleReload} style={{ padding: '0.5rem 1rem' }}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
