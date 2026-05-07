export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className={`${sizes[size]} animate-spin rounded-full border-2 border-[#1a3a6b] border-t-transparent`} />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f4f6f9]">
      <Spinner size="lg" />
    </div>
  )
}
