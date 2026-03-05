import { MdLocalShipping, MdWarning, MdCheckCircle } from 'react-icons/md';

interface EmptyStateProps {
    type: 'no-vehicles' | 'no-expenses' | 'no-filters';
    message: string;
}

export function EmptyState({ type, message }: EmptyStateProps) {
    const getIcon = () => {
        switch (type) {
            case 'no-vehicles':
                return <MdLocalShipping size={48} className="mx-auto text-slate-300 mb-3" />;
            case 'no-filters':
                return <MdWarning size={48} className="mx-auto text-slate-300 mb-3" />;
            case 'no-expenses':
            default:
                return <MdCheckCircle size={48} className="mx-auto text-slate-300 mb-3" />;
        }
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
            {getIcon()}
            <p className="text-sm text-slate-600">{message}</p>
        </div>
    );
}
