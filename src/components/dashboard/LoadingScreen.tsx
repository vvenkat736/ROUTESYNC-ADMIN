'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

export default function LoadingScreen() {
    const [progress, setProgress] = useState(0);
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + 1;
            });
        }, 30);

        const textTimer = setTimeout(() => setShowText(true), 500);

        return () => {
            clearInterval(timer);
            clearTimeout(textTimer);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
            <div className="w-3/4 max-w-lg text-center">
                
                <div 
                    className="relative transition-all duration-500 ease-in-out mb-6"
                    style={{ opacity: progress > 10 ? 1 : 0, transform: `scale(${progress > 10 ? 1 : 0.8})` }}
                >
                    <span className="text-8xl" role="img" aria-label="bus">🚍</span>
                </div>
                
                <div className="relative h-10 overflow-hidden">
                    <h1 
                        className="text-4xl font-headline font-bold text-accent transition-all duration-500 ease-out"
                        style={{ opacity: showText ? 1 : 0, transform: showText ? 'translateY(0)' : 'translateY(100%)' }}
                    >
                        RouteSync
                    </h1>
                </div>

                <Progress value={progress} className="w-full h-2 mt-4 bg-gray-700 [&>div]:bg-accent" />
                <p className="text-gray-400 mt-2 text-sm">{progress}%</p>
            </div>
        </div>
    );
}
