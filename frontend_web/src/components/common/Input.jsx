import React, { forwardRef } from 'react';

const Input = forwardRef(({
    id,
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    name,
    error,
    disabled = false,
    className = '',
    required = false,
    ...props
}, ref) => {
    return (
        <div className={`flex flex-col space-y-1 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-slate-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    ref={ref}
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`
                        w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors
                        ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900'}
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/20'}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
