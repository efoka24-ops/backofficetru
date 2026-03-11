import * as React from "react"

const Tabs = ({ value, onValueChange, children, ...props }) => {
  return <div {...props}>{children}</div>
}

const TabsList = ({ children, ...props }) => (
  <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1" {...props}>
    {children}
  </div>
)

const TabsTrigger = ({ value, children, ...props }) => {
  const context = React.useContext(TabsContext)
  return (
    <button
      onClick={() => context?.onValueChange?.(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        context?.value === value
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children, ...props }) => {
  const context = React.useContext(TabsContext)
  return context?.value === value ? <div {...props}>{children}</div> : null
}

const TabsContext = React.createContext()

export { Tabs, TabsList, TabsTrigger, TabsContent }
