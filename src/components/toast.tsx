"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export type ToastType = {
  id: number;
  message: string;
  type: "success" | "error";
};

type ToastItemProps = {
  toast: ToastType;
  onRemove: (id: number) => void;
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const show = setTimeout(() => setVisible(true), 10);
    // Auto dismiss after 3.5s
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 3500);

    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [toast.id, onRemove]);

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm w-full transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        ${isSuccess ? "bg-white border-emerald-100" : "bg-white border-red-100"}`}
    >
      {isSuccess ? (
        <CheckCircle2
          size={18}
          className="text-emerald-500 flex-shrink-0 mt-0.5"
        />
      ) : (
        <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
      )}
      <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

type ToastContainerProps = {
  toasts: ToastType[];
  onRemove: (id: number) => void;
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Hook untuk pakai toast
export function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (message: string) => addToast(message, "success"),
    error: (message: string) => addToast(message, "error"),
  };

  return { toasts, removeToast, toast };
}
