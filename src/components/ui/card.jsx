import * as React from "react"

const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = "" }) => (
  <div className={`border-b border-slate-200 p-6 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children }) => (
  <h3 className="text-lg font-semibold text-slate-900">{children}</h3>
)

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
)

export { Card, CardHeader, CardTitle, CardContent }
