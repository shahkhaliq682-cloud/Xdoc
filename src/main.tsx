import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {AuthProvider} from './contexts/AuthContext';
import {LanguageProvider} from './contexts/LanguageContext';
import {ToastProvider} from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

// --- Pre-emptive protection against "Converting circular structure to JSON" ---
// This prevents crashes if browser extensions, devtools, or platform loggers serialize DOM Elements, Events, or Errors.
(() => {
  if (typeof window === 'undefined') return;

  // 1. Protect DOM Nodes
  if (typeof Node !== 'undefined' && !(Node.prototype as any).toJSON) {
    Object.defineProperty(Node.prototype, 'toJSON', {
      value: function(this: any) {
        return {
          nodeType: this.nodeType,
          nodeName: this.nodeName,
          id: this.id || '',
          className: this.className || '',
          src: this.src || null,
          href: this.href || null,
        };
      },
      configurable: true,
      writable: true
    });
  }

  // 2. Protect Events
  if (typeof Event !== 'undefined' && !(Event.prototype as any).toJSON) {
    Object.defineProperty(Event.prototype, 'toJSON', {
      value: function(this: any) {
        return {
          type: this.type,
          isTrusted: this.isTrusted,
          message: this.message || '',
          filename: this.filename || '',
          lineno: this.lineno || '',
          colno: this.colno || '',
        };
      },
      configurable: true,
      writable: true
    });
  }

  // 3. Protect Errors
  if (typeof Error !== 'undefined' && !(Error.prototype as any).toJSON) {
    Object.defineProperty(Error.prototype, 'toJSON', {
      value: function(this: any) {
        const seen = new Set();
        const clean: any = {};
        Object.getOwnPropertyNames(this).forEach((key) => {
          try {
            const val = this[key];
            if (typeof val === 'object' && val !== null) {
              if (seen.has(val)) {
                clean[key] = '[Circular]';
                return;
              }
              seen.add(val);
            }
            clean[key] = val;
          } catch (e) {
            clean[key] = '[Unreadable]';
          }
        });
        return clean;
      },
      configurable: true,
      writable: true
    });
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);

