import { Toaster as SonnerToaster, toast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--color-surface-light)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
        },
        classNames: {
          toast: 'bg-surface-light border border-white/10',
          title: 'text-white',
          description: 'text-white/60',
          actionButton: 'bg-primary-600 hover:bg-primary-500 text-white',
          cancelButton: 'bg-white/5 hover:bg-white/10 text-white/60',
          closeButton: 'text-white/40 hover:text-white',
        },
      }}
    />
  );
}

export { toast };
