import * as React from "react"

const Switch = React.forwardRef(({ checked, onCheckedChange, ...props }, ref) => (
  <button
    ref={ref}
    onClick={() => onCheckedChange?.(!checked)}
    className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-green-600' : 'bg-gray-300'
    }`}
    {...props}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
))
Switch.displayName = "Switch"

export { Switch }
