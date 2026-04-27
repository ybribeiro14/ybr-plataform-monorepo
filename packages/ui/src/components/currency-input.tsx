"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CurrencyCode = "USD" | "BRL";

interface CurrencyInputProps {
  id?: string;
  name?: string;
  /**
   * Controlled value as a raw float string, e.g. "197.00".
   * Compatible with react-hook-form Controller's field.value.
   */
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  currency?: CurrencyCode;
  hasError?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  USD: "en-US",
  BRL: "pt-BR",
};

const formatCentsAsCurrency = (cents: number, currency: CurrencyCode): string =>
  new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);

const parseToCents = (floatStr: string): number => {
  const n = parseFloat(floatStr);
  return isNaN(n) ? 0 : Math.round(n * 100);
};

const MAX_CENTS = 99_999_999; // $999,999.99

/**
 * Currency input with a "cents-first" masking strategy.
 *
 * Typing "5", "0", "0", "0" produces: $0.05 → $0.50 → $5.00 → $50.00.
 * Backspace removes the last entered digit, shifting right.
 *
 * Use with react-hook-form's `Controller`:
 * ```tsx
 * <Controller
 *   name="priceDisplay"
 *   control={control}
 *   render={({ field }) => (
 *     <CurrencyInput
 *       value={field.value}
 *       onChange={field.onChange}
 *       onBlur={field.onBlur}
 *       currency={watchedCurrency}
 *     />
 *   )}
 * />
 * ```
 */
const CurrencyInput = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  currency = "USD",
  hasError = false,
  placeholder,
  disabled = false,
  className = "",
}: CurrencyInputProps) => {
  const [cents, setCents] = useState<number>(() => parseToCents(value ?? "0"));

  // Track the last value we emitted so we can distinguish external resets
  // from our own typing (avoids infinite update loops).
  const lastEmittedRef = useRef<number>(parseToCents(value ?? "0"));

  useEffect(() => {
    const incoming = parseToCents(value ?? "0");
    if (incoming !== lastEmittedRef.current) {
      setCents(incoming);
      lastEmittedRef.current = incoming;
    }
  }, [value]);

  const emitChange = useCallback(
    (newCents: number) => {
      lastEmittedRef.current = newCents;
      onChange?.((newCents / 100).toFixed(2));
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow browser shortcuts (copy, cut, paste, select all)
      if (e.metaKey || e.ctrlKey) return;

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        const newCents = Math.min(cents * 10 + parseInt(e.key, 10), MAX_CENTS);
        setCents(newCents);
        emitChange(newCents);
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        const newCents = Math.floor(cents / 10);
        setCents(newCents);
        emitChange(newCents);
        return;
      }

      if (e.key === "Delete") {
        e.preventDefault();
        setCents(0);
        emitChange(0);
        return;
      }

      // Allow focus-management keys to pass through
      const allowed = [
        "Tab",
        "Enter",
        "Escape",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ];
      if (!allowed.includes(e.key)) {
        e.preventDefault();
      }
    },
    [cents, emitChange],
  );

  // Handle paste and mobile IME input via the change event
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      const newCents = Math.min(parseInt(digits || "0", 10), MAX_CENTS);
      setCents(newCents);
      emitChange(newCents);
    },
    [emitChange],
  );

  const displayValue = cents > 0 ? formatCentsAsCurrency(cents, currency) : "";
  const defaultPlaceholder = currency === "USD" ? "$ 0.00" : "R$ 0,00";

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder ?? defaultPlaceholder}
      aria-label={`Valor em ${currency}`}
      className={`w-full rounded-lg border bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${
        hasError ? "border-error" : "border-outline-variant"
      } ${className}`}
    />
  );
};

export { CurrencyInput };
export type { CurrencyCode, CurrencyInputProps };
