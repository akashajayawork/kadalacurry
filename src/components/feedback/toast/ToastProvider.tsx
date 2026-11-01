import { useCallback, useMemo, useRef, useState, type PropsWithChildren } from "react";

import { ToastContext, type ToastTone } from "./ToastContext";
import "./Toast.css";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

const TOAST_DURATION_MS = 2800;
const MAX_TOASTS = 3;

/** Small, auto-dismissing messages at the top of the screen. Replaces alert(). */
export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    nextId.current += 1;
    const id = nextId.current;

    setToasts((current) => [...current, { id, message, tone }].slice(-MAX_TOASTS));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-region" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.tone}`} role="status">
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
