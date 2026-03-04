import { useEffect } from 'react';
import { MdCheckCircle, MdInfo, MdWarning, MdError, MdClose } from 'react-icons/md';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

const iconMap = {
    success: MdCheckCircle,
    info: MdInfo,
    warning: MdWarning,
    error: MdError,
};

const colorMap = {
    success: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: 'text-emerald-600',
        text: 'text-emerald-900',
    },
    info: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        icon: 'text-indigo-600',
        text: 'text-indigo-900',
    },
    warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'text-amber-600',
        text: 'text-amber-900',
    },
    error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-600',
        text: 'text-red-900',
    },
};

export function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const Icon = iconMap[type];
    const colors = colorMap[type];

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
            <div
                className={`flex items-start gap-3 rounded-2xl border ${colors.border} ${colors.bg} px-5 py-4 shadow-xl backdrop-blur-sm min-w-[320px] max-w-[480px]`}
            >
                <Icon className={`${colors.icon} flex-shrink-0 mt-0.5`} size={24} />
                <p className={`flex-1 text-sm font-medium ${colors.text} leading-relaxed`}>{message}</p>
                <button
                    type="button"
                    onClick={onClose}
                    className={`flex-shrink-0 rounded-lg p-1 ${colors.icon} opacity-60 transition hover:opacity-100`}
                >
                    <MdClose size={18} />
                </button>
            </div>
        </div>
    );
}
