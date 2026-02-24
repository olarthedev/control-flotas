import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  badge?: string;
  badgeColor?: "green" | "red" | "yellow" | "blue";
}

export function StatCard({
  title,
  value,
  icon,
  badge,
  badgeColor = "blue",
}: StatCardProps) {
  const badgeStyles = {
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center hover:shadow-md transition">
      
      <div className="flex items-center space-x-4">
        {icon && (
          <div className="bg-gray-100 p-3 rounded-lg text-xl text-blue-600">
            {icon}
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>

      {badge && (
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${badgeStyles[badgeColor]}`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}