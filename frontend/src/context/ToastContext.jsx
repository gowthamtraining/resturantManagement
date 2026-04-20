import React, { createContext, useState, useContext, useCallback } from 'react';
import './Toast.css';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type} animate-slide-in`}>
            <div className="toast-icon">
              {toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : '💬'}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback for components outside provider — should not happen in normal flow
    return { addToast: () => {} };
  }
  return ctx;
};
