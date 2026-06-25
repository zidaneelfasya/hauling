import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title?: string;
  description: string;
  type?: ToastType;
}

let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toastsList: Toast[] = [];

export function toast({ title, description, type = 'info' }: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: Toast = { id, title, description, type };
  toastsList = [...toastsList, newToast];
  toastListeners.forEach(listener => listener(toastsList));

  setTimeout(() => {
    toastsList = toastsList.filter(t => t.id !== id);
    toastListeners.forEach(listener => listener(toastsList));
  }, 4000);
}

export function useToast() {
  const [activeToasts, setActiveToasts] = useState<Toast[]>(toastsList);

  useEffect(() => {
    toastListeners.push(setActiveToasts);
    return () => {
      toastListeners = toastListeners.filter(listener => listener !== setActiveToasts);
    };
  }, []);

  return { toasts: activeToasts, toast };
}
