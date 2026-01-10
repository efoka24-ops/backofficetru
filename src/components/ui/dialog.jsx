import * as React from "react"
import { X } from "lucide-react"

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

const DialogContent = ({ children, className = "" }) => (
  <div className={className}>
    {children}
  </div>
)

const DialogHeader = ({ children }) => (
  <div className="flex items-center justify-between p-6 border-b">
    {children}
  </div>
)

const DialogTitle = ({ children }) => (
  <h2 className="text-xl font-semibold">{children}</h2>
)

export { Dialog, DialogContent, DialogHeader, DialogTitle }
