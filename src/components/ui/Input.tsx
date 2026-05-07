import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-semibold text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl border text-base
            ${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-[#1a3a6b]/20'}
            bg-white focus:outline-none focus:ring-2 focus:border-[#1a3a6b]
            transition-colors placeholder:text-gray-400
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: React.ReactNode
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}
      <select
        className={`
          w-full px-4 py-3 rounded-xl border text-base
          ${error ? 'border-red-400' : 'border-gray-200 focus:border-[#1a3a6b]'}
          bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20
          transition-colors
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
