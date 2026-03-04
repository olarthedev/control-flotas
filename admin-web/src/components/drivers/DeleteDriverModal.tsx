import { useEffect, useState } from 'react';
import { MdClose, MdDeleteOutline } from 'react-icons/md';

interface DeleteDriverModalProps {
    isOpen: boolean;
    driverName?: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isDeleting?: boolean;
}

export function DeleteDriverModal({
    isOpen,
    driverName,
    onClose,
    onConfirm,
    isDeleting = false,
}: DeleteDriverModalProps) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const frame = requestAnimationFrame(() => setIsVisible(true));
            return () => cancelAnimationFrame(frame);
        }

        setIsVisible(false);
        const timeout = setTimeout(() => setShouldRender(false), 180);
        return () => clearTimeout(timeout);
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={isDeleting ? undefined : onClose}
            />

            <div
                className={`relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ${
                    isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'
                }`}
            >
                <header className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500">
                            <MdDeleteOutline size={22} />
                        </div>
                        <h2 className="text-lg font-bold text-[#0f1f47]">Eliminar conductor</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Cerrar"
                    >
                        <MdClose size={22} />
                    </button>
                </header>

                <p className="text-sm text-slate-600">
                    ¿Seguro que deseas eliminar
                    <span className="font-semibold text-slate-800"> {driverName || 'este conductor'}</span>?
                    Esta acción no se puede deshacer.
                </p>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
