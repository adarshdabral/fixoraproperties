"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: "success" | "error";
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = ++idCounter;
    setItems((prev) => [...prev, { ...item, id }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const dismiss = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white p-4 shadow-card",
                item.variant === "success" ? "border-sage/30" : "border-red-200"
              )}
            >
              {item.variant === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{item.title}</p>
                {item.description && <p className="mt-0.5 text-sm text-ink-300">{item.description}</p>}
              </div>
              <button
                onClick={() => dismiss(item.id)}
                className="text-ink-300 hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
