import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TeamRow from './TeamRow'

export default function TeamList({ team, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">Chargement...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Équipe</CardTitle>
        <Button onClick={() => onEdit(null)} className="gap-2">
          <Plus size={18} />
          Ajouter un membre
        </Button>
      </CardHeader>
      <CardContent>
        {team.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Aucun membre. Ajoutez-en un pour commencer.
          </div>
        ) : (
          <div className="space-y-2">
            {team.map(member => (
              <TeamRow
                key={member.id}
                member={member}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
