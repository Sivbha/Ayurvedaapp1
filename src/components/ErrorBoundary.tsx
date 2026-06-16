'use client';

import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="font-medium text-red-800">Something went wrong</h3>
          <p className="mt-1 text-sm text-red-600">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
