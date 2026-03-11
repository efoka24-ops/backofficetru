import * as React from "react"

const AlertDialog = ({ open, onOpenChange, children }) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

const AlertDialogContent = ({ children }) => (
  <div className="p-6">{children}</div>
)

const AlertDialogHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
)

const AlertDialogTitle = ({ children }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
)

const AlertDialogDescription = ({ children }) => (
  <p className="text-sm text-slate-600 mt-2">{children}</p>
)

const AlertDialogFooter = ({ children }) => (
  <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
    {children}
  </div>
)

const AlertDialogCancel = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-50"
  >
    {children}
  </button>
)

const AlertDialogAction = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={className}
  >
    {children}
  </button>
)

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
}
