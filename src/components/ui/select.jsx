import * as React from "react"
import { ChevronDown } from "lucide-react"

const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setOpen(!open),
            open,
            value,
            onValueChange
          })
        }
        if (child.type === SelectContent && open) {
          return React.cloneElement(child, {
            onValueChange: (val) => {
              onValueChange?.(val)
              setOpen(false)
            }
          })
        }
        return null
      })}
    </div>
  )
}

const SelectTrigger = ({ children, open, onClick, value, className = "" }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
)

const SelectValue = ({ placeholder = "Select..." }) => placeholder

const SelectContent = ({ children, onValueChange }) => (
  <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-input bg-background shadow-md">
    {React.Children.map(children, (child) =>
      React.cloneElement(child, { onValueChange })
    )}
  </div>
)

const SelectItem = ({ value, children, onValueChange }) => (
  <button
    onClick={() => onValueChange?.(value)}
    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full px-2"
  >
    {children}
  </button>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
