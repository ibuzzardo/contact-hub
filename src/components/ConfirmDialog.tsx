'use client';

import { useState } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false
}: ConfirmDialogProps): JSX.Element {
  if (!isOpen) return <div></div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-surface-light rounded-xl border border-border-light p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-text-main mb-2">{title}</h3>
        <p className="text-text-muted mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-muted hover:bg-slate-100 rounded-lg transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDestructive
                ? 'text-red-600 hover:bg-red-50 border border-red-200'
                : 'bg-primary hover:bg-primary-dark text-white shadow-sm shadow-primary/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}