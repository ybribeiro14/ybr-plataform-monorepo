"use client";

import { useToast } from "@/lib/hooks/use-toast";
import * as RadixToast from "@radix-ui/react-toast";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

const variantStyles = {
  default: {
    root: "bg-surface-container-low border border-outline-variant text-on-surface",
    icon: null,
  },
  error: {
    root: "bg-red-50 border border-error text-error",
    icon: <AlertCircle className="h-5 w-5 shrink-0 text-error" />,
  },
  success: {
    root: "bg-success-container border border-success text-success",
    icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />,
  },
};

const Toaster = () => {
  const { toasts, dismiss } = useToast();

  return (
    <RadixToast.Provider swipeDirection="right" duration={5000}>
      {toasts.map((t) => {
        const styles = variantStyles[t.variant ?? "default"];
        return (
          <RadixToast.Root
            key={t.id}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id);
            }}
            className={`
              flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg
              data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full
              data-[state=closed]:animate-out data-[state=closed]:fade-out-80
              data-[swipe=end]:translate-x-[--radix-toast-swipe-end-x]
              data-[swipe=move]:translate-x-[--radix-toast-swipe-move-x]
              data-[swipe=cancel]:translate-x-0
              transition-all duration-200 max-w-sm w-full
              ${styles.root}
            `}
          >
            {styles.icon}
            <div className="flex-1 min-w-0">
              <RadixToast.Title className="text-sm font-semibold leading-snug">
                {t.title}
              </RadixToast.Title>
              {t.description && (
                <RadixToast.Description className="text-xs mt-0.5 opacity-80 leading-snug">
                  {t.description}
                </RadixToast.Description>
              )}
            </div>
            <RadixToast.Close
              aria-label="Fechar"
              onClick={() => dismiss(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
            >
              <X className="h-4 w-4" />
            </RadixToast.Close>
          </RadixToast.Root>
        );
      })}
      <RadixToast.Viewport className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 outline-none" />
    </RadixToast.Provider>
  );
};

export { Toaster };
