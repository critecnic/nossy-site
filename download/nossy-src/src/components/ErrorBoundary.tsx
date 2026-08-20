"use client";
import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui" }}>
          <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>&#9888;&#65039;</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: ".5rem" }}>Something went wrong</p>
          <p style={{ fontSize: ".85rem", color: "#888", marginBottom: "1rem" }}>{this.state.error?.message || "An unexpected error occurred"}</p>
          <button onClick={() => window.location.reload()} style={{ padding: ".5rem 1.5rem", background: "#0ea5e9", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: ".9rem" }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
