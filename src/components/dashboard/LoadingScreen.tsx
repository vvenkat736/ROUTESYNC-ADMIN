'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

const BusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 18.99h1v.51h14v-.5h1V18c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v.99zM18 6c0-1.1-.9-2-2-2H8C6.9 6 6 6.9 6 8v5h12V8c0-1.1 0-2 0-2zM6.5 14c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S7.33 14 6.5 14zm11 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S18.33 14 17.5 14z"/>
    </svg>
);

const GpsPointerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
);


export default function LoadingScreen() {
    const [progress, setProgress] = useState(0);

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

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
            <div className="w-3/4 max-w-lg text-center">
                <div className="relative h-16 w-full mb-4">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-100" style={{ left: `calc(${progress}% - 20px)` }}>
                        <BusIcon />
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                        <GpsPointerIcon />
                    </div>
                </div>

                <Progress value={progress} className="w-full bg-gray-700 [&>div]:bg-accent" />
                
                <div className="relative mt-6 h-10 overflow-hidden">
                    <h1 
                        className="text-4xl font-headline font-bold text-accent transition-all duration-500 ease-out"
                        style={{ opacity: progress > 50 ? 1 : 0, transform: progress > 50 ? 'translateY(0)' : 'translateY(100%)' }}
                    >
                        RouteSync
                    </h1>
                </div>
                <p className="text-gray-400 mt-2">{progress}%</p>
            </div>
        </div>
    );
}
