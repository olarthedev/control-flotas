interface ProgressBarProps {
  percent: number;
  label?: string;
}

export function ProgressBar({ percent, label }: ProgressBarProps) {
  const safePercent = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full">
      {label && <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-500 h-3 rounded-full"
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}
