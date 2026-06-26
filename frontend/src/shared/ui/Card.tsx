import type { ReactNode } from 'react'

interface CardProps {
  title: string
  children: ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <article className="card">
      <h2>{title}</h2>
      {children}
    </article>
  )
}
