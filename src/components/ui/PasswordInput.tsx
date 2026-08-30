"use client";

import { useState, type ComponentProps } from "react";
import { TextInput } from "./TextInput";

// Password field — TextInput with a show/hide toggle (Figma "eye-off" glyph).
// A visible reveal control matters for this audience, so it's on by default.

type PasswordInputProps = Omit<ComponentProps<typeof TextInput>, "type" | "endAdornment">;

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      {off && (
        <path d="m4 4 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextInput
      {...props}
      type={visible ? "text" : "password"}
      autoComplete={props.autoComplete ?? "new-password"}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="flex size-6 items-center justify-center text-text-muted hover:text-text-secondary"
        >
          <EyeIcon off={!visible} />
        </button>
      }
    />
  );
}

export default PasswordInput;
