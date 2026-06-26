interface ButtonProps {
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  type?: 'button' | 'submit'
}

export function Button({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
  type = 'button',
}: ButtonProps) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`btn ${variant}`}>
      {label}
    </button>
  )
}
