import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000); // Aumentado para 8 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  const toastElement = (
    <div
      className={`fixed z-[9999] bottom-6 right-6 min-w-[320px] max-w-md px-6 py-4 rounded-xl shadow-2xl text-white font-medium transition-all duration-500 ease-out transform scale-100 opacity-100 ${
        type === "success"
          ? "bg-gradient-to-r from-green-600 to-green-700 border-2 border-green-500/50"
          : "bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-500/50"
      }`}
      role="alert"
      style={{
        zIndex: 9999,
        animation: "slideInFromRight 0.5s ease-out",
      }}
    >
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <div className="flex items-center gap-3">
        {type === "success" ? (
          <CheckCircle2 className="h-6 w-6 text-green-200 flex-shrink-0" />
        ) : (
          <XCircle className="h-6 w-6 text-red-200 flex-shrink-0" />
        )}
        <span className="flex-1 text-lg">{message}</span>
        <button
          onClick={onClose}
          className="ml-3 text-xl leading-none hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors flex-shrink-0"
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
    </div>
  );

  // Renderizar o toast no body usando portal
  if (typeof window !== "undefined") {
    return createPortal(toastElement, document.body);
  }

  return toastElement;
}
