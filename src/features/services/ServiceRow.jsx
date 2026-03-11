import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ServiceRow({ service, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
      <div className="flex-1">
        <h3 className="font-semibold text-slate-900">{service.name}</h3>
        <p className="text-sm text-slate-600">{service.description}</p>
        <div className="mt-2 text-sm font-semibold text-blue-600">
          ${service.price}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(service)}
          className="gap-2"
        >
          <Pencil size={16} />
          Éditer
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(service, 'service')}
          className="gap-2"
        >
          <Trash2 size={16} />
          Supprimer
        </Button>
      </div>
    </div>
  )
}
