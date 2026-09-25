import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'ink' | 'line' | 'text' }

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'ink', className = '', ...rest },
  ref,
) {
  const base =
    variant === 'ink'
      ? 'btn-ink h-12 px-6'
      : variant === 'line'
        ? 'btn-line h-10 px-4'
        : 'label text-ink/60 underline-offset-4 transition-colors hover:text-ink hover:underline'
  return <button ref={ref} className={`${base} ${className}`} {...rest} />
})
