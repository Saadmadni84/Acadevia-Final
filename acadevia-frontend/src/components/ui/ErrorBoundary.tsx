import { Component, type ReactNode } from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary CAUGHT ERROR]', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary ERROR DETAILS]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center max-w-2xl mx-auto">
          <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-4 max-w-md">We&apos;re sorry for the inconvenience. Please try refreshing the page.</p>
          {this.state.error && (
            <div className="w-full text-left bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-4 mb-4 text-xs font-mono text-rose-800 dark:text-rose-200 overflow-x-auto max-h-60">
              <p className="font-bold text-sm mb-1">{this.state.error.name}: {this.state.error.message}</p>
              {this.state.error.stack && (
                <pre className="text-[11px] opacity-80 whitespace-pre-wrap">{this.state.error.stack}</pre>
              )}
            </div>
          )}
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export { ErrorBoundary };
