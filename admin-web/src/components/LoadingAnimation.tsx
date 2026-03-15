import { useEffect, useRef } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import carLoadingAnimation from '../assets/car-loading.json';

interface LoadingAnimationProps {
    message?: string;
    className?: string;
    animationClassName?: string;
    speed?: number;
    onLoopComplete?: () => void;
}

export function LoadingAnimation({
    message = 'Cargando...',
    className = 'rounded-lg border border-slate-200 bg-white py-16',
    animationClassName = 'mx-auto h-28 w-56 sm:h-32 sm:w-64',
    speed = 1,
    onLoopComplete,
}: LoadingAnimationProps) {
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    useEffect(() => {
        lottieRef.current?.setSpeed(speed);
    }, [speed]);

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="space-y-2 text-center">
                <Lottie
                    lottieRef={lottieRef}
                    animationData={carLoadingAnimation}
                    loop
                    autoplay
                    onLoopComplete={onLoopComplete}
                    className={animationClassName}
                />
                <p className="text-sm text-slate-500">{message}</p>
            </div>
        </div>
    );
}
