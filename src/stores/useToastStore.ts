import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  /** Auto-dismiss delay in ms. */
  duration: number;
}

interface ToastState {
  toasts: ToastItem[];
  show: (type: ToastType, message: string, duration?: number) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;
/** Oldest toasts are dropped beyond this, so the stack never covers the screen. */
const MAX_VISIBLE = 3;

/** App-wide toast queue — drives the ToastOverlay mounted in the root layout. */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (type, message, duration = 3500) =>
    set((s) => ({
      toasts: [...s.toasts, { id: nextId++, type, message, duration }].slice(-MAX_VISIBLE),
    })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((item) => item.id !== id) })),
}));
