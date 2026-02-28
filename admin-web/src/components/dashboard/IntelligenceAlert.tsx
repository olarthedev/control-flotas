import { FaLightbulb, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

export function IntelligenceAlert() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
          <FaLightbulb className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-0.5">
          SUGERENCIA DE INTELIGENCIA LOGÍSTICA
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          "Optimiza las rutas de la zona norte para reducir el gasto de combustible en un 12% este mes."
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors duration-200"
      >
        <FaTimes className="h-4 w-4" />
      </button>
    </div>
  );
}
