import React from "react";

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
        <div style={{
          padding: "40px 20px",
          textAlign: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#334155",
          background: "#f8fafc",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <h1 style={{ fontSize: "28px", marginBottom: "16px", color: "#0f172a" }}>Something went wrong</h1>
          <p style={{ color: "#64748b", marginBottom: "24px", maxWidth: "480px" }}>
            An unexpected error occurred. Please try reloading the page or contact support if the issue persists.
          </p>
          <button
            onClick={() => {
              try {
                localStorage.clear();
                sessionStorage.clear();
              } catch (e) {
                console.error("Failed to clear storage:", e);
              }
              window.location.reload();
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
            }}
          >
            Clear Cache & Reload
          </button>
          {this.state.error && (
            <pre style={{
              marginTop: "24px",
              padding: "16px",
              background: "#e2e8f0",
              borderRadius: "6px",
              fontSize: "12px",
              textAlign: "left",
              maxWidth: "90%",
              overflowX: "auto",
              color: "#0f172a"
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
