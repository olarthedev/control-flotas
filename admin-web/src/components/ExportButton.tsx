import { useState } from 'react';
import { MdDownload } from 'react-icons/md';
import { GiParachute } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportButtonProps {
    onExport: () => void;
    title?: string;
}

export function ExportButton({ onExport, title = 'Exportar CSV' }: ExportButtonProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [showParachute, setShowParachute] = useState(false);

    const handleClick = async () => {
        setIsAnimating(true);
        setShowParachute(true);

        // Ejecutar la descarga después de que el icono suba
        setTimeout(() => {
            onExport();
        }, 600);

        // Volver al estado original después de 3 segundos
        setTimeout(() => {
            setShowParachute(false);
            setIsAnimating(false);
        }, 3000);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isAnimating}
            title={title}
            className="ml-2 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-all hover:bg-slate-50 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
            <AnimatePresence mode="wait">
                {!showParachute ? (
                    <motion.div
                        key="download"
                        initial={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        <MdDownload size={16} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="parachute"
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ 
                            opacity: 1, 
                            y: 0,
                            x: [0, 3, -3, 3, 0],
                        }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{
                            duration: 0.5,
                            ease: 'easeOut',
                            x: {
                                duration: 2.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            },
                        }}
                    >
                        <GiParachute size={18} className="text-blue-500" />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
}
