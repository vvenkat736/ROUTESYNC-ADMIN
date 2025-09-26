'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { MapPin } from 'lucide-react';

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

    const busPosition = progress;

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
            <div className="w-3/4 max-w-lg text-center">
                <div 
                    className="relative w-full h-24 mb-4 flex items-center justify-center transition-opacity duration-500 ease-in-out"
                    style={{ opacity: progress > 10 ? 1 : 0 }}
                >
                    <div className="w-full max-w-xs h-1 bg-gray-700 rounded-full"></div>
                    <div 
                        className="absolute text-6xl transition-transform duration-100 ease-linear"
                        style={{ transform: `translateX(calc(-50% + ${busPosition}% - ${busPosition/2}px))` }}
                    >
                        🚍
                    </div>
                    <MapPin className="absolute right-0 text-accent h-12 w-12" style={{ transform: 'translateX(20px)' }}/>
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
