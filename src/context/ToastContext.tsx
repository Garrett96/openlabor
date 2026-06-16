// src/context/ToastContext.tsx

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    hasUndo?: boolean;
    undoAction?: () => void;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType, hasUndo?: boolean, undoAction?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType, hasUndo = false, undoAction?: () => void) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, hasUndo, undoAction }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
        {children}
        <div id="toast-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(toast => (
            <div key={toast.id} className={`toast ${toast.type}`} style={{ animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <span>{toast.message}</span>
            {toast.hasUndo && toast.undoAction && (
                <button
                className="toast-btn"
                onClick={() => {
                    removeToast(toast.id);
                    toast.undoAction!();
                }}
                >
                Undo
                </button>
            )}
            </div>
        ))}
        </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
}
