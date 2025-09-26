'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

const BusPointerLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-32 h-32 text-accent">
        <g transform="translate(10, 0)">
            <path fill="currentColor" d="M31.3,12.9c-4.3-5.3-10.8-8.9-18.1-8.9C5.4,4,0,9.4,0,17.2c0,9.4,8.2,16.2,14.2,23.4l-0.1,0.1c0.4,0.4,0.8,0.8,1.2,1.2l0.2,0.2c0.2,0.2,0.3,0.3,0.5,0.5c0.4,0.3,0.8,0.6,1.2,0.9c0.2,0.1,0.3,0.2,0.5,0.3c0.7,0.5,1.5,0.9,2.2,1.3c0.1,0.1,0.2,0.1,0.3,0.2c0.5,0.2,1,0.4,1.5,0.6c0.3,0.1,0.6,0.2,0.9,0.2c0.1,0,0.2,0,0.3,0.1c0.8,0.2,1.6,0.4,2.5,0.5c0.1,0,0.2,0,0.3,0h0c0.2,0,0.3,0,0.5,0c0.6,0.1,1.2,0.1,1.8,0.1c1.1,0,2.2-0.2,3.3-0.5c-0.3-1-0.7-2-1.2-2.9l-1.3-2.5c-1-2-2.5-3.8-4.2-5.4c-2.4-2.2-5.2-3.8-8.1-4.7c-0.1,0-0.2-0.1-0.3-0.1c-0.1-0.1-0.2-0.1-0.2-0.2c-0.1-0.1-0.1-0.2-0.2-0.3c-0.4-0.8-0.7-1.7-0.9-2.6c0.8,0.2,1.6,0.3,2.4,0.3c3.3,0,6.4-1.1,8.9-3.2c0.1-0.1,0.2-0.2,0.3-0.2C29.9,15.6,30.7,14.3,31.3,12.9z"/>
            <path fill="currentColor" d="M13.2,17.2c0-3,2.5-5.5,5.5-5.5s5.5,2.5,5.5,5.5s-2.5,5.5-5.5,5.5S13.2,20.2,13.2,17.2z"/>
        </g>
        <g transform="translate(0, 20)">
            <path fill="currentColor" d="M53.9,21.6c-0.6-1.9-2.4-3.2-4.4-3.2H25.4c-2,0-3.8,1.3-4.4,3.2l-5.9,19.2h-4c-1.1,0-2,0.9-2,2v2h2v3c0,1.1,0.9,2,2,2h3c1.1,0,2-0.9,2-2v-3h27v3c0,1.1,0.9,2,2,2h3c1.1,0,2-0.9,2-2v-3h2v-2c0-1.1-0.9-2-2-2h-4L53.9,21.6z M21.9,40.8c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S24.1,40.8,21.9,40.8z M46.9,40.8c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S49.1,40.8,46.9,40.8z M19.8,30.8h32l4.4,14.4h-4.8c-1.1,0-2,0.9-2,2v1h-3c0-2.2-1.8-4-4-4s-4,1.8-4,4h-9c0-2.2-1.8-4-4-4s-4,1.8-4,4h-3v-1c0-1.1-0.9-2-2-2h-4.8L19.8,30.8z"/>
        </g>
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
                    <BusPointerLogo />
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
