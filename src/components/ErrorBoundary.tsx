import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Kuch masla hua.</h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Application mein koi unexpected error aa gaya hai. Baraye meherbani page refresh karein.
            </p>
            <button 
              onClick={this.handleRefresh}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              <RefreshCw size={20} />
              Page Refresh Karein
            </button>
            <div className="mt-8 p-4 bg-red-50 rounded-xl text-left overflow-auto max-h-40">
              <p className="text-[10px] font-mono text-red-600 break-all">
                {error?.toString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
