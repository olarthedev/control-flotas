import Lottie from 'lottie-react';
import carLoadingAnimation from '../assets/car-loading.json';

interface LoadingAnimationProps {
    message?: string;
    className?: string;
    animationClassName?: string;
}

export function LoadingAnimation({
    message = 'Cargando...',
    className = 'rounded-lg border border-slate-200 bg-white py-16',
    animationClassName = 'mx-auto h-28 w-56 sm:h-32 sm:w-64',
}: LoadingAnimationProps) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="space-y-2 text-center">
                <Lottie
                    animationData={carLoadingAnimation}
                    loop
                    autoplay
                    className={animationClassName}
                />
                <p className="text-sm text-slate-500">{message}</p>
            </div>
        </div>
    );
}
