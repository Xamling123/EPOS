import { Loader2 } from 'lucide-react'

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

    const variants = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:from-primary-600 hover:to-primary-700 hover:shadow-primary-500/40 rounded-xl',
        secondary: 'bg-secondary-800 text-white border border-secondary-700 hover:bg-secondary-700 rounded-xl',
        outline: 'bg-transparent text-primary-400 border-2 border-primary-500 hover:bg-primary-500/10 rounded-xl',
        ghost: 'bg-transparent text-secondary-300 hover:bg-secondary-800 hover:text-white rounded-lg',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700 rounded-xl',
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3',
        lg: 'px-8 py-4 text-lg',
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    )
}

export function Input({
    label,
    error,
    className = '',
    ...props
}) {
    return (
        <div className={className}>
            {label && <label className="label">{label}</label>}
            <input
                className={`input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        </div>
    )
}

export function Select({
    label,
    error,
    options = [],
    className = '',
    ...props
}) {
    return (
        <div className={className}>
            {label && <label className="label">{label}</label>}
            <select
                className={`input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        </div>
    )
}

export function Card({ children, className = '', ...props }) {
    return (
        <div className={`card ${className}`} {...props}>
            {children}
        </div>
    )
}

export function Badge({ children, variant = 'neutral', className = '' }) {
    const variants = {
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        info: 'badge-info',
        neutral: 'badge-neutral',
    }

    return (
        <span className={`${variants[variant]} ${className}`}>
            {children}
        </span>
    )
}

export function Loading({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary-500 ${sizes[size]}`}></div>
        </div>
    )
}

export function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative glass rounded-2xl p-6 max-w-lg w-full mx-4 animate-scale-in">
                {title && (
                    <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                )}
                {children}
            </div>
        </div>
    )
}
