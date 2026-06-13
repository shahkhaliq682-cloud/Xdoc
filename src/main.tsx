import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
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

  // Global override for JSON.stringify to preemptively handle all circular reference structures
  const originalStringify = JSON.stringify;
  JSON.stringify = function (value: any, replacer?: any, space?: any) {
    const seen = new Set();
    
    function customReplacer(key: string, val: any) {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) {
          return '[Circular]';
        }
        seen.add(val);
      }
      
      if (typeof replacer === 'function') {
        return replacer(key, val);
      }
      return val;
    }

    try {
      if (Array.isArray(replacer)) {
        const allowedKeys = new Set(replacer.map(String));
        const circularReplacerWithArray = function(key: string, val: any) {
          if (key !== '' && !allowedKeys.has(key)) {
            return undefined;
          }
          if (typeof val === 'object' && val !== null) {
            if (seen.has(val)) {
              return '[Circular]';
            }
            seen.add(val);
          }
          return val;
        };
        return originalStringify(value, circularReplacerWithArray, space);
      }

      return originalStringify(value, customReplacer, space);
    } catch (err) {
      try {
        return originalStringify({
          [typeof value === 'object' && value !== null ? (value.constructor?.name || 'Object') : typeof value]: '[Unserializable]'
        });
      } catch (e) {
        return '"[Serialization Failure]"';
      }
    }
  };

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
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);

