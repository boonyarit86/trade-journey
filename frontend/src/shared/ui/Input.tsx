interface InputProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'password'
}

export function Input({ label, value, onChange, type = 'text' }: InputProps) {
  return (
    <label className="stack-sm">
      <span>{label}</span>
      <input
        className="input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
