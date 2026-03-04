import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', textAlign: 'center', background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
                    <h1 style={{ color: '#ef4444' }}>Something went wrong</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', margin: '10px 0 30px' }}>
                        The application crashed unexpectedly.
                    </p>
                    <pre style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', textAlign: 'left', maxWidth: '800px', overflowX: 'auto', border: '1px solid #e2e8f0', color: '#ef4444', fontSize: '0.85rem' }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                        style={{ marginTop: '30px', padding: '12px 30px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Reload Application
                    </button>
                    <button
                        onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                        className="btn-outline"
                        style={{ marginTop: '15px', padding: '10px 20px', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    >
                        Clear Session & Reset
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
