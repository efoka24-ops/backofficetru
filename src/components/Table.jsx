import React from 'react'
import './Table.css'
import { Trash2, Edit2 } from 'lucide-react'

export default function Table({ columns, data, onEdit, onDelete, loading = false }) {
  if (loading) {
    return <div className="table-loading">Chargement...</div>
  }

  if (data.length === 0) {
    return <div className="table-empty">Aucune donnée</div>
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="table-actions">
                  {onEdit && (
                    <button className="action-btn edit-btn" onClick={() => onEdit(row)}>
                      <Edit2 size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button className="action-btn delete-btn" onClick={() => onDelete(row.id)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
