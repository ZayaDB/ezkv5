"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  durationMs?: number;
  closeLabel?: string;
}

const styles: Record<ToastVariant, string> = {
  success: "bg-emerald-950 text-white border-emerald-800",
  error: "bg-red-950 text-white border-red-800",
  info: "bg-slate-900 text-white border-slate-700",
};

export default function Toast({
  message,
  variant = "info",
  onClose,
  durationMs = 4200,
  closeLabel = "Close",
}: ToastProps) {
  useEffect(() => {
    const t = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(t);
  }, [onClose, durationMs]);

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[100] w-[min(92vw,28rem)] -translate-x-1/2 opacity-100 transition-opacity duration-200"
      role="status"
    >
      <div
        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl ${styles[variant]}`}
      >
        <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 opacity-80 hover:opacity-100 hover:bg-white/10 transition-colors"
          aria-label={closeLabel}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
