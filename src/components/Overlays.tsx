import { X } from 'lucide-react';

export interface ConfirmState { message: string; confirmLabel?: string; danger?: boolean; onYes: () => void }

export function ConfirmDialog({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  return <div className="modal-backdrop confirm-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="confirm" role="alertdialog" aria-modal="true">
      <p>{state.message}</p>
      <div className="confirm-actions">
        <button className={state.danger ? 'danger' : 'primary-solid'} onClick={() => { state.onYes(); onClose(); }}>{state.confirmLabel || 'تأیید'}</button>
        <button className="secondary" onClick={onClose}>انصراف</button>
      </div>
    </section>
  </div>;
}

export function PhotoViewer({ src, onClose }: { src: string; onClose: () => void }) {
  return <div className="viewer" onClick={onClose}>
    <button className="viewer-close" onClick={onClose} aria-label="بستن"><X /></button>
    <img src={src} alt="" />
  </div>;
}
