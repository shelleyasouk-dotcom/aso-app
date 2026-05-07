import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: ReactNode
}

const variants = {
  primary: 'bg-[#1a3a6b] hover:bg-[#2a5298] active:bg-[#132d56] text-white',
  secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-[#1a3a6b] border border-[#1a3a6b]',
  danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white',
  ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-[#1a3a6b]',
  yellow: 'bg-[#f5c518] hover:bg-[#fdd835] active:bg-[#e8b800] text-[#1a3a6b]',
}

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-6 py-4 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        font-semibold rounded-xl transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
