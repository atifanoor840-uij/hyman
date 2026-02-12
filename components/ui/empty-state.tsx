import React from "react"

type EmptyStateProps = {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-white/10 bg-white/5 p-10">
        {icon ? <div className="mb-4">{icon}</div> : null}
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>
        ) : null}
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  )
}


