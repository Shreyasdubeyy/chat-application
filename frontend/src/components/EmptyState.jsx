import React from 'react';

const EmptyState = ({ 
    icon: Icon, 
    title, 
    description, 
    action, 
    actionLabel 
}) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            {Icon && (
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-10 h-10 text-slate-400" />
                </div>
            )}
            {title && (
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {title}
                </h3>
            )}
            {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
                    {description}
                </p>
            )}
            {action && actionLabel && (
                <button
                    onClick={action}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
