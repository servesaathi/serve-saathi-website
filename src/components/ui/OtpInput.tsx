"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

// "Code Input" — Figma design system: N separate 64×64 squares (8px radius,
// 1.5px border, white fill), 24px gap. Border is hairline when empty, brand
// green once a digit is entered or the box is focused, red on error.

type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
};

export function OtpInput({
  length = 4,
  value,
  onChange,
  onComplete,
  error,
  autoFocus,
  disabled,
  ariaLabel = "Verification code",
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.split("").slice(0, length);

  const commit = (chars: string[]) => {
    const joined = chars.join("").slice(0, length);
    onChange(joined);
    if (joined.length === length) onComplete?.(joined);
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const next = value.split("");
    next[index] = digit;
    commit(next);
    if (index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = value.split("");
      if (next[index]) {
        next[index] = "";
        onChange(next.join(""));
      } else if (index > 0) {
        next[index - 1] = "";
        onChange(next.join(""));
        inputs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    commit(text.split(""));
    inputs.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-6" role="group" aria-label={ariaLabel}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          value={digits[i] ?? ""}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={error || undefined}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`size-16 rounded-card border-[1.5px] bg-bg-base text-center text-[26px] font-semibold text-text-primary outline-none transition-colors focus:border-primary disabled:cursor-not-allowed ${
            error ? "border-error" : digits[i] ? "border-primary" : "border-border-hairline"
          }`}
        />
      ))}
    </div>
  );
}

export default OtpInput;
