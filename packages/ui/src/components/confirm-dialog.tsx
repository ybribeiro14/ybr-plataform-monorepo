"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /**
   * 'default' renders the confirm button in primary terracotta.
   * 'danger' renders it in error red — use for destructive actions.
   */
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onCancel();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-on-surface/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby="confirm-dialog-description"
          className="fixed left-1/2 top-1/2 z-50 w-[min(500px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {/* Close button */}
          <Dialog.Close asChild>
            <button
              type="button"
              onClick={onCancel}
              aria-label={cancelLabel}
              className="absolute right-4 top-4 rounded-full p-1 text-outline transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          {/* Icon badge */}
          <div
            className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${
              variant === "danger" ? "bg-error/10" : "bg-primary-light"
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${variant === "danger" ? "text-error" : "text-primary"}`}
            />
          </div>

          <Dialog.Title className="mb-2 font-title-lg text-title-lg text-on-surface">
            {title}
          </Dialog.Title>

          <Dialog.Description
            id="confirm-dialog-description"
            className="mb-6 text-sm leading-relaxed text-on-surface-variant"
          >
            {description}
          </Dialog.Description>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-10 flex-1 rounded-full border border-outline-variant text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`h-10 flex-1 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                variant === "danger"
                  ? "bg-error text-white hover:bg-error/90 focus-visible:ring-error"
                  : "bg-primary text-on-primary hover:bg-primary-container focus-visible:ring-primary"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { ConfirmDialog };
export type { ConfirmDialogProps };
