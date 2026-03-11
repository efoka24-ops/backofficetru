import React from 'react'
import './Form.css'

export default function Form({ onSubmit, children }) {
  return (
    <form onSubmit={onSubmit} className="form">
      {children}
    </form>
  )
}

export function FormGroup({ label, children, error }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export function FormInput({ label, ...props }) {
  return (
    <FormGroup label={label}>
      <input className="form-input" {...props} />
    </FormGroup>
  )
}

export function FormTextarea({ label, ...props }) {
  return (
    <FormGroup label={label}>
      <textarea className="form-textarea" {...props} />
    </FormGroup>
  )
}

export function FormButton({ children, loading = false, variant = 'primary', ...props }) {
  return (
    <button className={`form-button form-button-${variant}`} disabled={loading} {...props}>
      {loading ? 'Chargement...' : children}
    </button>
  )
}
