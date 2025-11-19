import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";

type DialogTone = "default" | "danger" | "info";

type BaseOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: DialogTone;
};

type ConfirmOptions = BaseOptions;

type PromptOptions = BaseOptions & {
  defaultValue?: string;
  placeholder?: string;
  multiline?: boolean;
  inputLabel?: string;
};

type AlertOptions = Omit<BaseOptions, "cancelLabel" | "confirmLabel"> & {
  confirmLabel?: string;
};

type DialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
  alert: (options: AlertOptions) => Promise<void>;
};

type DialogState =
  | ({
      type: "confirm";
      resolve: (value: boolean) => void;
    } & ConfirmOptions)
  | ({
      type: "prompt";
      resolve: (value: string | null) => void;
      value: string;
    } & PromptOptions)
  | ({
      type: "alert";
      resolve: () => void;
    } & AlertOptions);

const DialogContext = createContext<DialogContextValue | null>(null);

function toneClasses(tone: DialogTone | undefined) {
  switch (tone) {
    case "danger":
      return "border-[#d97767] bg-gradient-to-br from-[#4a1f16]/95 via-[#632a1e]/90 to-[#7a3121]/85 text-[#fbe1d4] shadow-[0_0_35px_rgba(122,49,33,0.45)]";
    case "info":
      return "border-[#d9b07a] bg-gradient-to-br from-[#2c1b11]/95 via-[#3b2416]/90 to-[#4a2b1a]/85 text-[#f6e8d2] shadow-[0_0_35px_rgba(58,36,22,0.5)]";
    default:
      return "border-[#cfa677] bg-gradient-to-br from-[#1b120c]/95 via-[#26170f]/90 to-[#3a2416]/85 text-[#f6e8d2] shadow-[0_0_35px_rgba(58,36,22,0.45)]";
  }
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const original = document.body.style.overflow;
    if (dialog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original;
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [dialog, mounted]);

  const close = useCallback(() => {
    setDialog(null);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setDialog({
          type: "confirm",
          resolve,
          confirmLabel: "Potwierdź",
          cancelLabel: "Anuluj",
          ...options,
        });
      }),
    []
  );

  const prompt = useCallback(
    (options: PromptOptions) =>
      new Promise<string | null>((resolve) => {
        setDialog({
          type: "prompt",
          resolve,
          confirmLabel: "Zapisz",
          cancelLabel: "Anuluj",
          value: options.defaultValue ?? "",
          ...options,
        });
      }),
    []
  );

  const alert = useCallback(
    (options: AlertOptions) =>
      new Promise<void>((resolve) => {
        setDialog({
          type: "alert",
          resolve,
          confirmLabel: "OK",
          message: options.message,
          title: options.title,
          tone: options.tone,
        });
      }),
    []
  );

  const value = useMemo(() => ({ confirm, prompt, alert }), [confirm, prompt, alert]);

  const onOverlayClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        if (dialog?.type === "alert") {
          dialog.resolve();
          close();
        } else if (dialog?.type === "confirm") {
          dialog.resolve(false);
          close();
        } else if (dialog?.type === "prompt") {
          dialog.resolve(null);
          close();
        }
      }
    },
    [dialog, close]
  );

  useEffect(() => {
    if (!dialog) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (dialog.type === "alert") {
          dialog.resolve();
        } else if (dialog.type === "confirm") {
          dialog.resolve(false);
        } else {
          dialog.resolve(null);
        }
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dialog, close]);

  const onCancel = useCallback(() => {
    if (!dialog) return;
    if (dialog.type === "confirm") {
      dialog.resolve(false);
    } else if (dialog.type === "prompt") {
      dialog.resolve(null);
    } else {
      dialog.resolve();
    }
    close();
  }, [dialog, close]);

  const onConfirm = useCallback(() => {
    if (!dialog) return;
    if (dialog.type === "confirm") {
      dialog.resolve(true);
    } else if (dialog.type === "prompt") {
      dialog.resolve(dialog.value ?? "");
    } else {
      dialog.resolve();
    }
    close();
  }, [dialog, close]);

  if (!mounted) {
    return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
  }

  return (
    <DialogContext.Provider value={value}>
      {children}
      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onOverlayClick}
        >
          <div
            className={`w-full max-w-xl rounded-3xl border p-[1px] ${toneClasses(dialog.tone)} animate-[fadeIn_0.15s_ease-out]`}
          >
            <div className="rounded-3xl bg-black/30 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {dialog.title && <h2 className="text-2xl font-semibold drop-shadow-sm">{dialog.title}</h2>}
                  <p className="mt-3 text-sm leading-relaxed text-white/90 whitespace-pre-wrap">{dialog.message}</p>
                </div>
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-white/80 hover:text-white focus:outline-none"
                  aria-label="Zamknij"
                >
                  ✕
                </button>
              </div>

              {dialog.type === "prompt" && (
                <div className="mt-4">
                  {dialog.inputLabel && <label className="mb-2 block text-sm font-semibold text-white/90">{dialog.inputLabel}</label>}
                  {dialog.multiline ? (
                    <textarea
                      className="w-full rounded-2xl border border-white/30 bg-black/40 px-4 py-3 text-sm text-white shadow-inner focus:border-white focus:outline-none focus:ring-2 focus:ring-white/70"
                      rows={8}
                      value={dialog.value}
                      placeholder={dialog.placeholder}
                      onChange={(e) =>
                        setDialog((prev) =>
                          prev && prev.type === "prompt" ? { ...prev, value: e.target.value } : prev
                        )
                      }
                    />
                  ) : (
                    <input
                      className="w-full rounded-2xl border border-white/30 bg-black/40 px-4 py-3 text-sm text-white shadow-inner focus:border-white focus:outline-none focus:ring-2 focus:ring-white/70"
                      value={dialog.value}
                      placeholder={dialog.placeholder}
                      onChange={(e) =>
                        setDialog((prev) =>
                          prev && prev.type === "prompt" ? { ...prev, value: e.target.value } : prev
                        )
                      }
                    />
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                {dialog.type !== "alert" && (
                  <button
                    type="button"
                    className="btn border-white/30 bg-white/10 text-white hover:bg-white/20"
                    onClick={onCancel}
                  >
                    {dialog.cancelLabel || "Anuluj"}
                  </button>
                )}
                <button
                  type="button"
                  className={`btn border-transparent bg-white text-base font-semibold text-black hover:bg-white/90 ${
                    dialog.tone === "danger" ? "bg-red-200 text-red-900 hover:bg-red-100" : ""
                  }`}
                  onClick={onConfirm}
                >
                  {dialog.confirmLabel || "OK"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return ctx;
}

export default DialogProvider;
