import { Component } from 'react';

/**
 * Per-section error boundary so one failed section (bad query, thrown
 * render error, etc.) never takes down the rest of the Home page.
 * Fails silently-but-visibly: renders nothing but a tiny inline note in
 * dev, nothing in production, and logs to console either way.
 */
export default class HomeSectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error(`[HomeSection:${this.props.sectionId}] render error`, error, info);
  }

  render() {
    if (this.state.hasError) {
      if (import.meta.env?.DEV) {
        return (
          <div style={{ margin: '0 20px 24px', padding: 12, borderRadius: 12, background: '#FEF2F2', color: '#B91C1C', fontSize: 12 }}>
            Section "{this.props.sectionId}" failed to render.
          </div>
        );
      }
      return null;
    }
    return this.props.children;
  }
}
