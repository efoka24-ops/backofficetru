import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TeamRow({ member, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
      <div className="flex items-center gap-4 flex-1">
        {member.image && (
          <img
            src={member.image}
            alt={member.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <h3 className="font-semibold text-slate-900">{member.name}</h3>
          <p className="text-sm text-slate-600">{member.position}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(member)}
          className="gap-2"
        >
          <Pencil size={16} />
          Éditer
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(member, 'team')}
          className="gap-2"
        >
          <Trash2 size={16} />
          Supprimer
        </Button>
      </div>
    </div>
  )
}
