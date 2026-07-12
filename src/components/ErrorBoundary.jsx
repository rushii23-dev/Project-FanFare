import { Component } from 'react'

// The last line of defence: a render crash anywhere in the tree lands here
// instead of white-screening the app. In a stadium context "reload this
// screen" beats a blank page — the crashed subtree remounts with fresh state
// while everything the user saved (ticket, prefs) is still in localStorage.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Log for diagnosis; never swallow silently.
    console.error('FanFare crashed:', error, info?.componentStack)
  }

  handleReset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 14,
          background: '#eef5f0', color: '#0b1f14', textAlign: 'center',
          padding: 24, fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Something went wrong on this screen</h1>
        <p style={{ margin: 0, maxWidth: 420, opacity: 0.8 }}>
          Your ticket and preferences are safe. Reload the screen to carry on.
        </p>
        <button
          onClick={this.handleReset}
          style={{
            padding: '12px 26px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: '#0a7d3e', color: '#ffffff', fontSize: 15, fontWeight: 600,
          }}
        >
          Reload screen
        </button>
      </div>
    )
  }
}
