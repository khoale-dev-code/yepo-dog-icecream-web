import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const SnackbarContext = createContext(null);

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    iconClassName: "text-emerald-600",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-800",
    iconClassName: "text-red-600",
  },
  info: {
    icon: Info,
    className: "border-[#d8b77e] bg-[#FFFAFA] text-[#3b2a18]",
    iconClassName: "text-[#b98c49]",
  },
  loading: {
    icon: Loader2,
    className: "border-[#d8b77e] bg-[#FFFAFA] text-[#3b2a18]",
    iconClassName: "animate-spin text-[#b98c49]",
  },
};

function createToastId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function SnackbarProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message, duration = 3200 }) => {
      const id = createToastId();

      setToasts((current) => [
        ...current,
        {
          id,
          type,
          title,
          message,
        },
      ]);

      if (duration > 0) {
        window.setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      removeToast,
      success(message, title = "Thành công") {
        return showToast({ type: "success", title, message });
      },
      error(message, title = "Có lỗi xảy ra") {
        return showToast({ type: "error", title, message, duration: 4200 });
      },
      info(message, title = "Thông báo") {
        return showToast({ type: "info", title, message });
      },
      loading(message, title = "Đang xử lý") {
        return showToast({ type: "loading", title, message, duration: 0 });
      },
    }),
    [removeToast, showToast]
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex flex-col items-center gap-3 px-3 sm:items-end sm:px-5">
        {toasts.map((toast) => (
          <SnackbarItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}

function SnackbarItem({ toast, onClose }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      className={[
        "pointer-events-auto flex w-full max-w-[420px] items-start gap-3 rounded-[22px] border px-4 py-3 shadow-[0_18px_60px_rgba(87,61,28,.14)] backdrop-blur-xl",
        "animate-[snackbar-in_.24s_ease-out]",
        style.className,
      ].join(" ")}
      role="status"
    >
      <div className="mt-0.5 shrink-0">
        <Icon size={20} className={style.iconClassName} />
      </div>

      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className="text-sm font-brand leading-5">{toast.title}</p>
        )}

        {toast.message && (
          <p className="mt-0.5 text-sm font-normal leading-6 opacity-85">
            {toast.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-black/5"
        aria-label="Đóng thông báo"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error("useSnackbar must be used inside SnackbarProvider");
  }

  return context;
}
