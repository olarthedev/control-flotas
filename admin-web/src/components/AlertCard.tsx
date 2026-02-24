import React from 'react';

interface AlertCardProps {
  message: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

export function AlertCard({ message, severity = 'info' }: AlertCardProps) {
  const colors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
  };

  return (
    <div className={`${colors[severity]} rounded-lg p-4`}> 
      <div>{message}</div>
    </div>
  );
}
