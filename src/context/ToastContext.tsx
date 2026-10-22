// src/context/ToastContext.tsx

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    undoAction?: () => void;
}

interface ToastContextType {
    showToast: (
        message: string,
        type?: 'success' | 'error' | 'info',
        showUndo?: boolean,
        undoAction?: () => void
    ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((
        message: string,
        type: 'success' | 'error' | 'info' = 'info',
        showUndo: boolean = false,
        undoAction?: () => void
    ) => {
        const id = crypto.randomUUID();
        const newToast: Toast = { id, message, type, undoAction: showUndo ? undoAction : undefined };

        setToasts(prev => [...prev, newToast]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
        {children}

        {/* Toast UI Container */}
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none'
        }}>
        {toasts.map(toast => (
            <div
            key={toast.id}
            style={{
                pointerEvents: 'auto',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#3b82f6',
                color: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                minWidth: '250px',
                maxWidth: '350px',
                fontSize: '0.9rem',
                fontWeight: 500,
                animation: 'slideIn 0.2s ease-out'
            }}
            >
            <span>{toast.message}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
            {toast.undoAction && (
                <button
                onClick={() => { toast.undoAction(); removeToast(toast.id); }}
                style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600
                }}
                >
                Undo
                </button>
            )}
            <button
            onClick={() => removeToast(toast.id)}
            style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem',
                lineHeight: 1,
                padding: 0
            }}
            >
            &times;
            </button>
            </div>
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
