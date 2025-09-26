'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

const BusPointerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v4" />
        <path d="M5 11h14" />
        <path d="M12 16.5V12" />
        <path d="M10.5 16.5h3" />
        <path d="M21.05 16.05c0-3.87-3.13-7.05-7.05-7.05s-7.05 3.18-7.05 7.05c0 2.76 1.6 5.17 4 6.32V22l3.05-2.03L14 22v-1.63c2.4-1.15 4.05-3.56 4.05-6.32z" />
        <path d="M14 16.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
    </svg>
);


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
                    <BusPointerIcon />
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
