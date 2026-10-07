"use client";

import { useState, type ReactNode } from "react";
import { getErrorMessage } from "@/lib/api/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

// "Are you sure?" step for ban / delete / reject. Runs `onConfirm`, keeps the
// dialog open with the error if it fails, closes on success.

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => Promise<void>;
};

export function ConfirmDialog({ open, onClose, title, message, confirmLabel, destructive, onConfirm }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  function close() {
    if (busy) return;
    setError(undefined);
    onClose();
  }

  async function confirm() {
    setBusy(true);
    setError(undefined);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      size="sm"
      actions={
        <>
          <Button variant="light" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button variant={destructive ? "destructive" : "primary"} onClick={confirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 text-[16px] leading-[22px] text-text-secondary">
        {message}
        {error && (
          <p role="alert" className="text-[14px] leading-5 text-error">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
