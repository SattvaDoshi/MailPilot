// src/components/ui/Input.jsx
import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  size = 'md',
  icon: Icon,
  ...props 
}, ref) => {
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full border rounded-md shadow-sm focus:outline-none focus:ring-1
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }
            ${Icon ? 'pl-10' : ''}
            ${sizes[size]}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
