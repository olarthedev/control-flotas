interface LoadingStateProps {
    message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
    return (
        <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-16">
            <div className="space-y-2 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#5848f4]" />
                <p className="text-sm text-slate-500">{message}</p>
            </div>
        </div>
    );
}
