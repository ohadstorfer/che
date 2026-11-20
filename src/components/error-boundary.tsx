import { Component, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Catches a render crash in content that comes from the dashboard (a custom
// onboarding screen, a database first class) so a bad row costs that piece,
// never the app: `fallback` is drawn instead, and `onError` hears about it once.
// ---------------------------------------------------------------------------

export class ContentBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: (error: Error) => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.warn('[content] render failed, using the fallback:', error.message);
    this.props.onError?.(error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
