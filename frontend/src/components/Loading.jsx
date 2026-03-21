import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div
            className={`${sizes[size]} border-purple-500 border-t-transparent rounded-full animate-spin ${className}`}
        ></div>
    );
};

export const LoadingScreen = ({ message = 'Loading...' }) => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Spinner size="lg" className="mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">{message}</p>
            </div>
        </div>
    );
};

export const LoadingCard = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" className="mb-4" />
            <p className="text-slate-600 dark:text-slate-400">{message}</p>
        </div>
    );
};

export default Spinner;
