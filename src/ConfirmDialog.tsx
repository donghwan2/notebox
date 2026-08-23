import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export type ConfirmRequest = {
  title: string;
  message: string;
  /** Extra line rendered in a muted box — e.g. the item being deleted. */
  detail?: string;
  confirmLabel: string;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  request,
  onCancel,
}: {
  request: ConfirmRequest;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  // Focus the confirm button so Enter/Escape both work without reaching for the mouse.
  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 cursor-pointer"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl cursor-default overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-start gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </span>
            <div className="min-w-0 pt-0.5">
              <h3 className="font-semibold text-sm text-white">{request.title}</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{request.message}</p>
            </div>
          </div>

          {request.detail && (
            <p className="mt-3.5 text-xs text-slate-300 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 line-clamp-2 break-words">
              {request.detail}
            </p>
          )}

          <p className="mt-3 text-[11px] text-slate-500">이 작업은 되돌릴 수 없습니다.</p>
        </div>

        <div className="flex gap-2 p-4 pt-0">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            ref={confirmRef}
            onClick={request.onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 border border-rose-400/40 shadow-lg shadow-rose-900/30 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400/60"
          >
            {request.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
